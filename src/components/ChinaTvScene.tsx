import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';

/** Waiting phases expect one action; the -ing phases are short animations. */
export const CHINA_PHASES = [
  'print', 'printing', 'place', 'placing', 'feed', 'reflowing', 'xray', 'xraying',
  'assemble', 'assembling', 'check', 'checking', 'ship', 'shipping', 'done',
] as const;
export type ChinaPhase = typeof CHINA_PHASES[number];
export type ChinaTarget = 'printer' | 'placer' | 'oven' | 'xray' | 'fixture' | 'carton';

interface Props {
  phase: ChinaPhase;
  progress: number;
  target: ChinaTarget | null;
  onAct: (target: ChinaTarget) => void;
}

const ANCHORS: Record<ChinaTarget, [number, number, number]> = {
  printer: [-5.6, 2.3, 0], placer: [-3.0, 2.9, 0], oven: [0.4, 1.9, 0], xray: [3.4, 2.4, 0],
  fixture: [6.0, 1.6, 0], carton: [6.0, 3.2, 0],
};

const ease = (t: number) => t * t * (3 - 2 * t);
const clamp01 = (t: number) => Math.min(1, Math.max(0, t));
const span = (t: number, a: number, b: number) => clamp01((t - a) / (b - a));

/**
 * Fixed isometric workcell, left to right: board loader -> stencil printer -> placement machine with
 * Malaysia's chip in its tray -> reflow tunnel oven (preheat, reflow, cooling) -> X-ray cabinet ->
 * TV fixture where the board goes onto the back of the display module, then the TV stands up and plays.
 * Construction follows research C13, C17 and the plan's modular LED-backlit LCD TV.
 */
export function ChinaTvScene(props: Props) {
  const host = useRef<HTMLDivElement>(null);
  const current = useRef(props);
  current.current = props;
  const [unavailable, setUnavailable] = useState(false);

  useEffect(() => {
    const container = host.current;
    if (!container) return;
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    } catch {
      setUnavailable(true);
      return;
    }
    renderer.setPixelRatio(Math.min(globalThis.devicePixelRatio ?? 1, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.setClearColor(0x000000, 0);
    renderer.domElement.setAttribute('aria-label', 'Stencil printer, placement machine, reflow oven, X-ray cabinet and TV assembly fixture');
    renderer.domElement.setAttribute('role', 'img');
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const pmrem = new THREE.PMREMGenerator(renderer);
    const environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environment = environment;
    scene.environmentIntensity = 0.6;
    const camera = new THREE.OrthographicCamera(-8, 8, 5, -5, 0.1, 80);
    camera.position.set(9, 9.5, 14);
    camera.lookAt(0, 1.4, 0);
    scene.add(new THREE.HemisphereLight(0xc8e5ff, 0x3a2e28, 1.4));
    const sun = new THREE.DirectionalLight(0xfff0dd, 2.2);
    sun.position.set(-5, 12, 8);
    sun.castShadow = true;
    sun.shadow.mapSize.set(2048, 2048);
    Object.assign(sun.shadow.camera, { left: -10, right: 10, top: 8, bottom: -8 });
    scene.add(sun);
    const ovenLight = new THREE.PointLight(0xff8a3a, 0, 3);
    scene.add(ovenLight);

    const geometries: THREE.BufferGeometry[] = [];
    const materials: THREE.Material[] = [];
    const material = (color: number, options: THREE.MeshStandardMaterialParameters = {}) => {
      const result = new THREE.MeshStandardMaterial({ color, roughness: 0.7, flatShading: true, ...options });
      materials.push(result);
      return result;
    };
    const mesh = (geometry: THREE.BufferGeometry, mat: THREE.Material | THREE.Material[], x = 0, y = 0, z = 0, parent: THREE.Object3D = scene) => {
      geometries.push(geometry);
      const result = new THREE.Mesh(geometry, mat);
      result.position.set(x, y, z);
      parent.add(result);
      return result;
    };
    const box = (w: number, h: number, d: number, mat: THREE.Material | THREE.Material[], x = 0, y = 0, z = 0, parent: THREE.Object3D = scene) =>
      mesh(new THREE.BoxGeometry(w, h, d), mat, x, y, z, parent);
    const cylinder = (r: number, h: number, mat: THREE.Material, x = 0, y = 0, z = 0, parent: THREE.Object3D = scene, segments = 16) =>
      mesh(new THREE.CylinderGeometry(r, r, h, segments), mat, x, y, z, parent);
    const group = (x = 0, y = 0, z = 0, target?: ChinaTarget) => {
      const result = new THREE.Group();
      result.position.set(x, y, z);
      if (target) result.userData.target = target;
      scene.add(result);
      return result;
    };

    const floor = material(0x3b4a52, { roughness: 0.95 });
    const panelWhite = material(0xdfe3e6, { roughness: 0.5 });
    const steel = material(0x7d8f99, { metalness: 0.6, roughness: 0.4 });
    const darkSteel = material(0x29343b, { metalness: 0.5, roughness: 0.5 });
    const stencil = material(0xc9d0d4, { metalness: 0.9, roughness: 0.25 });
    const pasteMat = material(0x8f9499, { roughness: 0.9 });
    const chipMat = material(0x161618, { roughness: 0.5 });
    const partMat = material(0x2a2a2e, { roughness: 0.6 });
    const capMat = material(0xb08a5a, { roughness: 0.6 });
    const glass = material(0x1a2730, { transparent: true, opacity: 0.55, roughness: 0.1, depthWrite: false });
    const cableMat = material(0xe8e8e8, { roughness: 0.7 });
    const cardboard = material(0xb88a55, { roughness: 1 });
    const padding = material(0x3a4a5a, { roughness: 1 });
    const zoneMats = [0xffb050, 0xff6020, 0x5fb0ff].map(c => material(0x222222, { emissive: c, emissiveIntensity: 0.15 }));
    const scanMat = new THREE.MeshBasicMaterial({ color: 0x9fe8ff, transparent: true, opacity: 0.7, depthWrite: false });
    const arrowMaterial = new THREE.MeshBasicMaterial({ color: 0xfcd34d });
    materials.push(scanMat, arrowMaterial);
    const noShadow = new Set<THREE.Material>([glass, scanMat, arrowMaterial]);

    box(17.4, 0.2, 7, floor, 0, -0.1, 0).receiveShadow = true;

    // The main board's top face: copper pads, then grey paste on them, then shiny solder.
    const canvas = document.createElement('canvas');
    canvas.width = 256; canvas.height = 180;
    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    const drawBoard = (stage: number) => {
      const ctx = canvas.getContext('2d')!;
      ctx.fillStyle = '#1f6b3a'; ctx.fillRect(0, 0, 256, 180);
      ctx.strokeStyle = 'rgba(200,170,90,0.45)'; ctx.lineWidth = 2;
      for (let i = 0; i < 14; i++) { ctx.beginPath(); ctx.moveTo(10 + i * 17, 10); ctx.lineTo(10 + i * 17, 40 + (i % 3) * 20); ctx.lineTo(128, 90); ctx.stroke(); }
      const pad = stage === 0 ? '#c9a24a' : stage === 1 ? '#9aa0a6' : '#dfe3e6';
      ctx.fillStyle = pad;
      for (let r = 0; r < 6; r++) for (let c = 0; c < 6; c++) { ctx.beginPath(); ctx.arc(98 + c * 12, 60 + r * 12, 3.6, 0, Math.PI * 2); ctx.fill(); }
      for (const [x, y, w, h] of [[30, 120, 40, 20], [180, 50, 30, 16], [190, 120, 14, 8], [210, 120, 14, 8], [40, 50, 10, 6], [60, 50, 10, 6]]) {
        ctx.fillRect(x, y, 4, h); ctx.fillRect(x + w - 4, y, 4, h);
      }
      texture.needsUpdate = true;
    };
    const boardTop = material(0xffffff, { map: texture, roughness: 0.5, flatShading: false });
    const boardEdge = material(0x1f6b3a, { roughness: 0.6 });
    const board = new THREE.Group();
    scene.add(board);
    box(1.0, 0.05, 0.7, [boardEdge, boardEdge, boardTop, boardEdge, boardEdge, boardEdge], 0, 0, 0, board);
    const chip = box(0.26, 0.05, 0.26, chipMat);
    box(0.12, 0.002, 0.03, material(0xcfcfcf), 0, 0.026, 0.06, chip);
    const parts = [[-0.27, 0.15, 0.3, 0.16, partMat], [0.36, -0.14, 0.2, 0.12, partMat], [0.38, 0.15, 0.06, 0.04, capMat], [0.44, 0.15, 0.06, 0.04, capMat], [-0.3, -0.14, 0.05, 0.03, capMat], [-0.22, -0.14, 0.05, 0.03, capMat]]
      .map(([x, z, w, d, m]) => box(w as number, 0.04, d as number, m as THREE.Material, x as number, 0.045, z as number, board));

    // 1. Board loader (bare boards) and stencil printer.
    const loaderP = new THREE.Vector3(-7.4, 0.95, 0.4);
    box(1.2, 0.85, 1.0, darkSteel, -7.4, 0.42, 0.4);
    for (let i = 0; i < 3; i++) box(1.0, 0.05, 0.7, boardEdge, -7.4, 0.88 - i * 0.12 - 0.1, 0.4);
    const printerP = new THREE.Vector3(-5.6, 0.9, 0);
    const printer = group(-5.6, 0, 0, 'printer');
    box(1.8, 0.85, 1.6, panelWhite, 0, 0.42, 0, printer);
    for (const x of [-0.85, 0.85]) box(0.1, 1.2, 1.4, darkSteel, x, 1.45, 0, printer);
    const stencilPlate = box(1.4, 0.015, 1.1, stencil, 0, 1.3, 0, printer);
    const squeegee = new THREE.Group();
    printer.add(squeegee);
    box(1.2, 0.18, 0.04, darkSteel, 0, 0, 0, squeegee);
    const pasteRoll = cylinder(0.035, 1.0, pasteMat, 0, -0.08, 0.05, squeegee, 10);
    pasteRoll.rotation.z = Math.PI / 2;

    // 2. Placement machine: gantry and vacuum head; the chip waits in Malaysia's tray.
    const placerP = new THREE.Vector3(-3.0, 0.9, 0);
    const placer = group(-3.0, 0, 0, 'placer');
    box(1.8, 0.85, 1.6, panelWhite, 0, 0.42, 0, placer);
    for (const x of [-0.85, 0.85]) box(0.1, 1.6, 0.1, darkSteel, x, 1.65, -0.7, placer);
    box(1.8, 0.12, 0.12, darkSteel, 0, 2.45, -0.7, placer);
    const head = new THREE.Group();
    scene.add(head);
    box(0.24, 0.3, 0.24, steel, 0, 0.25, 0, head);
    cylinder(0.025, 0.25, darkSteel, 0, 0, 0, head, 8);
    const trayP = new THREE.Vector3(-3.0 + 0.55, 0.9, 0.95);
    box(0.7, 0.06, 0.5, material(0x1f3a5a), trayP.x, 0.87, trayP.z);
    const cameraFlash = mesh(new THREE.SphereGeometry(0.06, 8, 6), new THREE.MeshBasicMaterial({ color: 0xffffff }));
    materials.push(cameraFlash.material as THREE.Material);

    // 3. Reflow oven: a conveyor tunnel with preheat, reflow and cooling zones and a side window.
    const ovenX = 0.4, ovenL = 3.2;
    const oven = group(ovenX, 0, 0, 'oven');
    box(ovenL, 0.55, 1.4, darkSteel, 0, 0.27, 0, oven);
    box(ovenL, 0.5, 1.4, steel, 0, 1.25, 0, oven);
    box(ovenL, 0.45, 0.06, glass, 0, 0.78, 0.68, oven);
    box(ovenL, 0.45, 0.06, steel, 0, 0.78, -0.68, oven);
    zoneMats.forEach((m, i) => box(ovenL / 3 - 0.1, 0.05, 1.0, m, -ovenL / 3 + i * ovenL / 3, 1.0, 0, oven));
    box(ovenL + 1.4, 0.03, 0.8, darkSteel, 0, 0.57, 0, oven);
    const ovenIn = new THREE.Vector3(ovenX - ovenL / 2 - 0.6, 0.62, 0);
    const ovenOut = new THREE.Vector3(ovenX + ovenL / 2 + 0.6, 0.62, 0);

    // 4. X-ray cabinet: enclosed, with a shielded window; a scan line moves inside.
    const xrayP = new THREE.Vector3(3.4, 0.9, 0);
    const xray = group(3.4, 0, 0, 'xray');
    box(1.7, 0.85, 1.5, panelWhite, 0, 0.42, 0, xray);
    box(1.7, 1.2, 0.08, panelWhite, 0, 1.45, -0.71, xray);
    box(0.08, 1.2, 1.5, panelWhite, -0.81, 1.45, 0, xray);
    box(0.08, 1.2, 1.5, panelWhite, 0.81, 1.45, 0, xray);
    box(1.7, 0.08, 1.5, panelWhite, 0, 2.05, 0, xray);
    box(1.5, 1.0, 0.04, glass, 0, 1.4, 0.73, xray);
    const scan = box(1.4, 0.02, 0.06, scanMat, 0, 1.0, 0, xray);

    // 5. TV fixture: padded table; the display module lies face-down, boards and cables go on its back.
    const fixtureX = 6.0;
    const fixture = group(fixtureX, 0, 0, 'fixture');
    box(2.9, 0.6, 1.9, darkSteel, 0, 0.3, 0, fixture);
    box(2.8, 0.05, 1.8, padding, 0, 0.62, 0, fixture);
    const tv = new THREE.Group();
    tv.position.set(fixtureX, 0.68, 0);
    scene.add(tv);
    const screenCanvas = document.createElement('canvas');
    screenCanvas.width = 256; screenCanvas.height = 144;
    const screenTex = new THREE.CanvasTexture(screenCanvas);
    screenTex.colorSpace = THREE.SRGBColorSpace;
    const screenMat = material(0x050608, { emissive: 0xffffff, emissiveMap: screenTex, emissiveIntensity: 0, roughness: 0.15, metalness: 0.2, flatShading: false });
    const bezel = material(0x111114, { roughness: 0.4 });
    // Local frame: the screen faces -y (down) while the TV lies face-down on the fixture.
    box(2.5, 0.05, 1.45, [bezel, bezel, bezel, screenMat, bezel, bezel], 0, 0.025, 0, tv);
    const powerBoard = box(0.7, 0.04, 0.45, material(0x2a6a8a), -0.6, 0.075, 0.2, tv);
    const boardSlot = new THREE.Vector3(0.45, 0.08, 0.15);
    const cables = [[[0.45, -0.25], [0.45, -0.6]], [[-0.25, 0.2], [0.15, 0.15]], [[-0.6, -0.05], [-0.9, -0.5]], [[0.75, 0.3], [1.1, 0.55]]]
      .map(([[x1, z1], [x2, z2]]) => {
        const len = Math.hypot(x2 - x1, z2 - z1);
        const cable = box(len, 0.012, 0.06, cableMat, (x1 + x2) / 2, 0.11, (z1 + z2) / 2, tv);
        cable.rotation.y = -Math.atan2(z2 - z1, x2 - x1);
        return cable;
      });
    const cover = box(2.2, 0.08, 1.2, material(0x2b2f36, { roughness: 0.6 }), 0, 0.16, 0, tv);
    const stand = box(0.9, 0.05, 0.3, material(0x2b2f36), 0, 0, 0);
    const carton = box(2.8, 1.8, 0.5, cardboard, fixtureX, 1.0, 0);
    carton.userData.target = 'carton';

    const drawScreen = (mode: 'off' | 'bars' | 'show', t: number) => {
      const ctx = screenCanvas.getContext('2d')!;
      if (mode === 'off') { ctx.fillStyle = '#000'; ctx.fillRect(0, 0, 256, 144); }
      else if (mode === 'bars') {
        ['#fff', '#ff0', '#0ff', '#0f0', '#f0f', '#f00', '#00f', '#111'].forEach((c, i) => { ctx.fillStyle = c; ctx.fillRect(i * 32, 0, 32, 144); });
      } else {
        const sky = ctx.createLinearGradient(0, 0, 0, 144);
        sky.addColorStop(0, '#2b6cb0'); sky.addColorStop(1, '#f6ad55');
        ctx.fillStyle = sky; ctx.fillRect(0, 0, 256, 144);
        ctx.fillStyle = '#fde68a';
        ctx.beginPath(); ctx.arc(60 + (t * 20) % 160, 50, 16, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#2f855a'; ctx.fillRect(0, 105, 256, 39);
        ctx.fillStyle = '#fff'; ctx.font = 'bold 14px monospace'; ctx.fillText('IT WORKS!', 90, 132);
      }
      screenTex.needsUpdate = true;
    };
    drawScreen('off', 0);

    const arrow = mesh(new THREE.ConeGeometry(0.22, 0.45, 12), arrowMaterial);
    arrow.rotation.x = Math.PI;

    scene.traverse(object => {
      if (object instanceof THREE.Mesh && !noShadow.has(object.material as THREE.Material)) {
        object.castShadow = true;
        object.receiveShadow = true;
      }
    });

    const resize = () => {
      const width = container.clientWidth;
      const height = container.clientHeight;
      if (!width || !height) return;
      const aspect = width / height;
      const halfHeight = Math.max(4.1, 8.4 / aspect);
      camera.left = -halfHeight * aspect;
      camera.right = halfHeight * aspect;
      camera.top = halfHeight;
      camera.bottom = -halfHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };
    const observer = new ResizeObserver(resize);
    observer.observe(container);
    resize();

    const raycaster = new THREE.Raycaster();
    const targetAt = (event: PointerEvent): ChinaTarget | null => {
      const rect = renderer.domElement.getBoundingClientRect();
      raycaster.setFromCamera(new THREE.Vector2((event.clientX - rect.left) / rect.width * 2 - 1, -(event.clientY - rect.top) / rect.height * 2 + 1), camera);
      for (const hit of raycaster.intersectObjects(scene.children, true)) {
        if (!hit.object.visible || hit.object === arrow) continue;
        for (let object: THREE.Object3D | null = hit.object; object; object = object.parent) {
          if (object.userData.target) return object.userData.target;
        }
      }
      return null;
    };
    const onPointerDown = (event: PointerEvent) => {
      const hit = targetAt(event);
      if (hit) current.current.onAct(hit);
    };
    const onPointerMove = (event: PointerEvent) => {
      const target = current.current.target;
      renderer.domElement.style.cursor = target && targetAt(event) === target ? 'pointer' : 'default';
    };
    renderer.domElement.addEventListener('pointerdown', onPointerDown);
    renderer.domElement.addEventListener('pointermove', onPointerMove);

    const order = (phase: ChinaPhase) => CHINA_PHASES.indexOf(phase);
    const hop = (from: THREE.Vector3, to: THREE.Vector3, t: number, height: number, out: THREE.Vector3) =>
      out.copy(from).lerp(to, t).setY(from.y + (to.y - from.y) * t + Math.sin(t * Math.PI) * height);
    const clock = new THREE.Clock();
    let frame = 0;
    let drawnStage = -1;
    let screenMode = '';

    const animate = () => {
      const { phase, progress: p, target } = current.current;
      const t = clock.getElapsedTime();
      const from = (other: ChinaPhase) => order(phase) >= order(other);
      const after = (other: ChinaPhase) => order(phase) > order(other);

      // Board artwork: bare copper, then paste, then shiny joints after reflow.
      const stage = from('xray') || (phase === 'reflowing' && p > 0.55) ? 2 : (phase === 'printing' && p > 0.6) || from('place') ? 1 : 0;
      if (stage !== drawnStage) { drawBoard(stage); drawnStage = stage; }

      // Where the board is.
      const boardOnTv = tv.localToWorld(boardSlot.clone());
      switch (phase) {
        case 'print': board.position.copy(loaderP); break;
        case 'printing': hop(loaderP, printerP, ease(span(p, 0, 0.2)), 0.5, board.position); break;
        case 'place': board.position.copy(printerP); break;
        case 'placing': hop(printerP, placerP, ease(span(p, 0, 0.15)), 0.5, board.position); break;
        case 'feed': board.position.copy(ovenIn); break;
        case 'reflowing': board.position.copy(ovenIn).lerp(ovenOut, ease(p)); break;
        case 'xray': board.position.copy(ovenOut); break;
        case 'xraying': hop(ovenOut, xrayP, ease(span(p, 0, 0.2)), 0.5, board.position); break;
        case 'assemble': board.position.copy(xrayP); break;
        default: board.position.copy(boardOnTv);
      }
      if (phase === 'assembling') {
        const k = ease(span(p, 0, 0.25));
        if (k < 1) hop(xrayP, boardOnTv, k, 1.2, board.position);
      }
      board.rotation.set(0, 0, 0);
      if (from('assembling') && !(phase === 'assembling' && p < 0.25)) board.quaternion.copy(tv.quaternion);
      board.visible = phase !== 'done' && !(from('checking') && tv.rotation.x < -0.3);
      // After placement the board moves on to wait at the oven mouth.
      if (phase === 'placing' && p > 0.9) board.position.lerp(ovenIn, span(p, 0.9, 1));

      // Printer: stencil lowers, squeegee sweeps the paste across, stencil lifts.
      const printing = phase === 'printing';
      stencilPlate.position.y = printing && p > 0.2 && p < 0.85 ? 0.95 : 1.3;
      squeegee.position.set(0, 1.05, printing ? -0.5 + span(p, 0.3, 0.75) * 1.0 : -0.5);
      squeegee.visible = printing && p > 0.25 && p < 0.8;
      pasteRoll.rotation.x = printing ? t * 8 : 0;

      // Placement: head goes to the tray, picks the chip, camera flash, places it balls-down; small parts follow.
      const placing = phase === 'placing';
      const headRest = new THREE.Vector3(-3.0, 1.9, -0.2);
      const above = (v: THREE.Vector3) => v.clone().setY(v.y + 0.15);
      if (placing) {
        if (p < 0.3) head.position.copy(headRest).lerp(above(trayP), ease(span(p, 0.1, 0.3)));
        else if (p < 0.6) hop(above(trayP), above(placerP), ease(span(p, 0.35, 0.6)), 0.5, head.position);
        else head.position.copy(above(placerP)).lerp(headRest, ease(span(p, 0.62, 0.8)));
      } else head.position.copy(headRest);
      cameraFlash.visible = placing && p > 0.42 && p < 0.47;
      cameraFlash.position.set(-3.0, 0.95, 0.4);
      chip.visible = phase !== 'done' && !(from('checking') && tv.rotation.x < -0.3);
      if (phase === 'print' || phase === 'printing' || phase === 'place' || (placing && p < 0.3)) chip.position.copy(trayP).setY(0.93);
      else if (placing && p < 0.6) chip.position.copy(head.position).setY(head.position.y - 0.1);
      else chip.position.copy(board.position).add(new THREE.Vector3(0, 0.05, 0).applyQuaternion(board.quaternion));
      chip.quaternion.copy(board.quaternion);
      // Self-alignment: placed a hair off, the chip slides straight as the solder melts (C13 §3.3).
      if (phase === 'feed' || (phase === 'reflowing' && p < 0.5)) chip.position.x += 0.02;
      else if (phase === 'reflowing' && p < 0.6) chip.position.x += 0.02 * (1 - span(p, 0.5, 0.6));
      parts.forEach((part, i) => { part.visible = (placing && p > 0.65 + i * 0.04) || after('placing'); });

      // Oven zones glow; the board warms as it passes the middle zone.
      const reflowing = phase === 'reflowing';
      zoneMats.forEach((m, i) => { m.emissiveIntensity = from('feed') && !after('reflowing') ? (reflowing && Math.abs(p - (i + 0.5) / 3) < 0.2 ? 1.6 : 0.6) : 0.15; });
      ovenLight.position.copy(board.position).setY(1.0);
      ovenLight.intensity = reflowing && p > 0.3 && p < 0.7 ? 5 : 0;
      boardEdge.emissive.setHex(0xff6020);
      boardEdge.emissiveIntensity = reflowing ? Math.max(0, 1 - Math.abs(p - 0.5) / 0.2) * 0.6 : 0;

      // X-ray: the scan line sweeps over the board inside the cabinet.
      scan.visible = phase === 'xraying' && p > 0.2;
      scan.position.z = -0.6 + ((t * 0.8) % 1) * 1.2;

      // TV assembly: board and power board on the back, cables, cover; then it stands up.
      const assembling = phase === 'assembling';
      powerBoard.visible = from('assemble');
      cables.forEach((cable, i) => { cable.visible = (assembling && p > 0.35 + i * 0.08) || after('assembling'); });
      cover.visible = (assembling && p > 0.8) || after('assembling');
      const upright = phase === 'checking' ? ease(span(p, 0, 0.25)) : after('checking') ? 1 : 0;
      // Turning about x by -90° brings the screen (local -y) round to face the viewer (+z).
      tv.rotation.set(-Math.PI / 2 * upright, 0, 0);
      tv.position.set(fixtureX, 0.68 + upright * 0.74, upright * -0.3);
      stand.visible = upright > 0.9;
      stand.position.set(fixtureX, 0.65, -0.3);

      // Power on: warm-up, colour bars, then a moving picture.
      const mode = phase === 'checking' ? (p < 0.35 ? 'off' : p < 0.65 ? 'bars' : 'show') : from('ship') && phase !== 'done' ? 'show' : 'off';
      if (mode === 'show' || mode !== screenMode) { drawScreen(mode as 'off' | 'bars' | 'show', t); screenMode = mode; }
      screenMat.emissiveIntensity = mode === 'off' ? 0 : 1.1;

      // Pack and ship: the carton slides over the TV and leaves.
      const packing = phase === 'shipping';
      carton.visible = packing;
      carton.position.set(fixtureX + (packing ? ease(span(p, 0.5, 1)) * 4 : 0), packing ? 1.0 + (1 - ease(span(p, 0, 0.4))) * 1.5 : 1.0, -0.3);
      if (packing && p > 0.4) tv.visible = false;
      else tv.visible = phase !== 'done';

      arrow.visible = Boolean(target);
      if (target) {
        const [x, y, z] = ANCHORS[target];
        arrow.position.set(x, y + 0.35 + Math.sin(t * 4) * 0.12, z);
      }
      renderer.render(scene, camera);
      frame = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      renderer.domElement.removeEventListener('pointerdown', onPointerDown);
      renderer.domElement.removeEventListener('pointermove', onPointerMove);
      geometries.forEach(geometry => geometry.dispose());
      materials.forEach(mat => mat.dispose());
      texture.dispose();
      screenTex.dispose();
      environment.dispose();
      pmrem.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-b from-[#1b2f3b] to-[#0c1821]">
      <div ref={host} className="absolute inset-0" />
      {unavailable && <p className="absolute inset-0 flex items-center justify-center p-8 text-center text-white">3D view unavailable in this browser. Use the control panel to run each step.</p>}
    </div>
  );
}
