import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { COLUMNS, ROWS, isActive } from '../content/waferMap';

/** Waiting phases expect one action; the -ing phases are short animations. */
export const MALAYSIA_PHASES = [
  'saw', 'sawing', 'pick', 'picking', 'bond', 'bonding', 'mold', 'molding',
  'balls', 'balling', 'test', 'testing', 'ship', 'shipping', 'done',
] as const;
export type MalaysiaPhase = typeof MALAYSIA_PHASES[number];
export type MalaysiaTarget = 'saw' | 'bonder' | 'wirebonder' | 'press' | 'baller' | 'socket' | 'tray';

interface Props {
  phase: MalaysiaPhase;
  progress: number;
  /** The die picked from Taiwan's map, or null before picking. */
  picked: { row: number; col: number } | null;
  target: MalaysiaTarget | null;
  onAct: (target: MalaysiaTarget) => void;
}

const ANCHORS: Record<MalaysiaTarget, [number, number, number]> = {
  saw: [-6.3, 2.4, 0], bonder: [-3.4, 2.6, 0], wirebonder: [-0.4, 2.7, 0], press: [2.0, 3.0, 0],
  baller: [4.2, 2.0, 0], socket: [6.0, 2.1, 0], tray: [7.6, 1.4, 0.6],
};

const ease = (t: number) => t * t * (3 - 2 * t);
const clamp01 = (t: number) => Math.min(1, Math.max(0, t));
const span = (t: number, a: number, b: number) => clamp01((t - a) / (b - a));

const WAFER_R = 0.95;
const PITCH = WAFER_R / 4.3;
const WIRES = 8;

/**
 * Fixed isometric workcell, left to right: dicing saw (wafer on tape in a ring frame) -> die bonder
 * (ejector pin below, vacuum collet above, adhesive, substrate) -> wire bonder -> transfer-mold press ->
 * ball attach and reflow -> test socket with laser marker -> tray. Package anatomy follows research M01.
 */
export function MalaysiaPackageScene(props: Props) {
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
    renderer.domElement.setAttribute('aria-label', 'Dicing saw, die bonder, wire bonder, mold press, ball attach, test socket and tray');
    renderer.domElement.setAttribute('role', 'img');
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const pmrem = new THREE.PMREMGenerator(renderer);
    const environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environment = environment;
    scene.environmentIntensity = 0.6;
    const camera = new THREE.OrthographicCamera(-8, 8, 5, -5, 0.1, 80);
    camera.position.set(9, 9.5, 14);
    camera.lookAt(0, 1.5, 0);
    scene.add(new THREE.HemisphereLight(0xc8e5ff, 0x3a2e28, 1.4));
    const sun = new THREE.DirectionalLight(0xfff0dd, 2.2);
    sun.position.set(-5, 12, 8);
    sun.castShadow = true;
    sun.shadow.mapSize.set(2048, 2048);
    Object.assign(sun.shadow.camera, { left: -10, right: 10, top: 8, bottom: -8 });
    scene.add(sun);
    const heatLight = new THREE.PointLight(0xff8a3a, 0, 3);
    scene.add(heatLight);

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
    const box = (w: number, h: number, d: number, mat: THREE.Material, x = 0, y = 0, z = 0, parent: THREE.Object3D = scene) =>
      mesh(new THREE.BoxGeometry(w, h, d), mat, x, y, z, parent);
    const cylinder = (r: number, h: number, mat: THREE.Material, x = 0, y = 0, z = 0, parent: THREE.Object3D = scene, segments = 24) =>
      mesh(new THREE.CylinderGeometry(r, r, h, segments), mat, x, y, z, parent);
    const group = (x = 0, y = 0, z = 0, target?: MalaysiaTarget) => {
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
    const tape = material(0xbfd7e6, { transparent: true, opacity: 0.6, roughness: 0.3, depthWrite: false });
    const blade = material(0xd0d6da, { metalness: 0.9, roughness: 0.2 });
    const laminate = material(0x2f8a4a, { roughness: 0.6 });
    const dieMat = material(0x8f96b8, { metalness: 0.7, roughness: 0.2 });
    const adhesive = material(0xd8d2b0, { roughness: 0.6, emissive: 0xff7a20, emissiveIntensity: 0 });
    const gold = material(0xe6b84a, { metalness: 0.95, roughness: 0.2 });
    const moldBlack = material(0x161618, { roughness: 0.55 });
    const resin = material(0x2a2a2e, { roughness: 0.8 });
    const solder = material(0xd0d4d8, { metalness: 0.9, roughness: 0.25 });
    const red = material(0xc8332b, { roughness: 0.5 });
    const okLamp = material(0x1d2a1d, { emissive: 0x33ff66, emissiveIntensity: 0 });
    const water = new THREE.MeshBasicMaterial({ color: 0xbfe9ff, transparent: true, opacity: 0.8, depthWrite: false });
    const spark = new THREE.MeshBasicMaterial({ color: 0xfff6c0 });
    const laser = new THREE.MeshBasicMaterial({ color: 0xff3030, transparent: true, opacity: 0.8 });
    const arrowMaterial = new THREE.MeshBasicMaterial({ color: 0xfcd34d });
    materials.push(water, spark, laser, arrowMaterial);
    const noShadow = new Set<THREE.Material>([tape, water, spark, laser, arrowMaterial]);

    box(17.4, 0.2, 7, floor, 0, -0.1, 0).receiveShadow = true;

    // The wafer's top face: Taiwan's die grid, streets cut by the saw, and the picked die's empty spot.
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = 256;
    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    const drawWafer = (cut: number, picked: { row: number; col: number } | null) => {
      const ctx = canvas.getContext('2d')!;
      const c = 128, r = 124, px = r / 4.3;
      ctx.clearRect(0, 0, 256, 256);
      const base = ctx.createRadialGradient(c - 40, c - 40, 10, c, c, r);
      base.addColorStop(0, '#c7b8e8'); base.addColorStop(0.5, '#8fc7c2'); base.addColorStop(1, '#c99a6a');
      ctx.fillStyle = base;
      ctx.beginPath(); ctx.arc(c, c, r, 0, Math.PI * 2); ctx.fill();
      for (let row = 0; row < ROWS; row++) {
        for (let col = 0; col < COLUMNS; col++) {
          if (!isActive(row, col)) continue;
          const x = c + (col - 4) * px, y = c + (row - 3) * px;
          if (picked && picked.row === row && picked.col === col) {
            ctx.fillStyle = '#9fc1d4';
            ctx.fillRect(x + 2, y + 2, px - 4, px - 4);
            continue;
          }
          ctx.strokeStyle = 'rgba(40,30,60,0.55)';
          ctx.lineWidth = 2;
          ctx.strokeRect(x + 1, y + 1, px - 2, px - 2);
        }
      }
      // Sawn streets: dark lines between the rows, then the columns.
      ctx.strokeStyle = '#2a3238';
      ctx.lineWidth = 3;
      const lines = [...Array.from({ length: ROWS + 1 }, (_, i) => ['h', i] as const), ...Array.from({ length: COLUMNS + 1 }, (_, i) => ['v', i] as const)];
      lines.slice(0, Math.floor(cut * lines.length)).forEach(([dir, i]) => {
        ctx.beginPath();
        if (dir === 'h') { ctx.moveTo(c - r, c + (i - 3) * px); ctx.lineTo(c + r, c + (i - 3) * px); }
        else { ctx.moveTo(c + (i - 4) * px, c - r); ctx.lineTo(c + (i - 4) * px, c + r); }
        ctx.stroke();
      });
      ctx.globalCompositeOperation = 'destination-in';
      ctx.beginPath(); ctx.arc(c, c, r, 0, Math.PI * 2); ctx.fill();
      ctx.globalCompositeOperation = 'source-over';
      texture.needsUpdate = true;
    };
    const waferTop = material(0xffffff, { map: texture, metalness: 0.6, roughness: 0.2, flatShading: false });
    const waferEdge = material(0x9aa4ad, { metalness: 0.8, roughness: 0.3 });

    // The ring frame (tape + wafer) travels from the saw to the die bonder.
    const ringFrame = new THREE.Group();
    scene.add(ringFrame);
    const ring = mesh(new THREE.TorusGeometry(1.3, 0.07, 6, 40), steel, 0, 0, 0, ringFrame);
    ring.rotation.x = Math.PI / 2;
    cylinder(1.28, 0.01, tape, 0, -0.01, 0, ringFrame, 40);
    mesh(new THREE.CylinderGeometry(WAFER_R, WAFER_R, 0.03, 48), [waferEdge, waferTop, waferEdge], 0, 0.02, 0, ringFrame);
    const sawP = new THREE.Vector3(-6.3, 0.95, 0);
    const bonderFrameP = new THREE.Vector3(-3.9, 0.95, -0.6);

    // 1. Dicing saw: chuck, spindle with blade, water nozzle.
    const saw = group(-6.3, 0, 0, 'saw');
    box(2.2, 0.8, 2.2, panelWhite, 0, 0.4, 0, saw);
    cylinder(1.0, 0.12, darkSteel, 0, 0.86, 0, saw, 32);
    const spindle = new THREE.Group();
    saw.add(spindle);
    box(0.5, 0.35, 0.5, steel, 0, 1.6, 0, spindle);
    const sawBlade = cylinder(0.32, 0.02, blade, 0, 1.25, 0, spindle, 32);
    sawBlade.rotation.z = Math.PI / 2;
    box(0.12, 1.4, 0.12, darkSteel, -1.0, 1.4, -0.9, saw);
    box(1.1, 0.12, 0.12, darkSteel, -0.5, 2.05, -0.9, saw);
    const drops = Array.from({ length: 10 }, () => mesh(new THREE.SphereGeometry(0.03, 6, 4), water));

    // 2. Die bonder: ejector under the frame, collet arm above, substrate coupon on its carrier.
    const bonder = group(-3.4, 0, 0, 'bonder');
    box(2.4, 0.8, 2.2, panelWhite, 0, 0.4, 0, bonder);
    const ejector = cylinder(0.03, 0.4, steel, -0.5, 0.75, -0.6, bonder, 8);
    const collet = new THREE.Group();
    scene.add(collet);
    cylinder(0.05, 0.6, darkSteel, 0, 0.3, 0, collet, 10);
    box(0.12, 0.08, 0.12, darkSteel, 0, 0, 0, collet);
    box(0.1, 1.6, 0.1, darkSteel, 0.9, 1.6, -0.9, bonder);
    const dispenser = cylinder(0.04, 0.4, darkSteel, 0.6, 1.4, 0.55, bonder, 8);

    // The package being built: one laminate coupon carrying everything.
    const pkg = new THREE.Group();
    scene.add(pkg);
    box(0.9, 0.06, 0.9, laminate, 0, 0, 0, pkg);
    const padPositions = Array.from({ length: WIRES }, (_, i) => {
      const side = i < 4 ? -1 : 1;
      return new THREE.Vector3(side * 0.36, 0.035, -0.24 + (i % 4) * 0.16);
    });
    padPositions.forEach(p => box(0.06, 0.01, 0.06, gold, p.x, p.y, p.z, pkg));
    const glue = box(0.24, 0.02, 0.24, adhesive, 0, 0.04, 0, pkg);
    const die = box(PITCH * 0.95, 0.04, PITCH * 0.95, dieMat);
    const diePads = Array.from({ length: WIRES }, (_, i) => {
      const side = i < 4 ? -1 : 1;
      return new THREE.Vector3(side * 0.07, 0.08, -0.12 + (i % 4) * 0.08);
    });
    const wires = diePads.map((from, i) => {
      const to = padPositions[i];
      const mid = from.clone().lerp(to, 0.3).setY(0.22);
      const curve = new THREE.QuadraticBezierCurve3(from, mid, to);
      return mesh(new THREE.TubeGeometry(curve, 12, 0.006, 5), gold, 0, 0, 0, pkg);
    });
    const cap = box(0.72, 0.16, 0.72, moldBlack, 0, 0.11, 0, pkg);
    const balls = Array.from({ length: 16 }, (_, i) => mesh(new THREE.SphereGeometry(0.035, 8, 6), solder, -0.33 + (i % 4) * 0.22, -0.055, -0.33 + Math.floor(i / 4) * 0.22, pkg));
    const mark = box(0.4, 0.002, 0.05, material(0xcfcfcf, { roughness: 0.4 }), 0, 0.192, 0.15, pkg);

    // Stations the package visits.
    const attachP = new THREE.Vector3(-2.75, 0.85, 0.55);
    const bondP = new THREE.Vector3(-0.4, 0.85, 0);
    const moldP = new THREE.Vector3(2.0, 0.85, 0);
    const ballP = new THREE.Vector3(4.2, 0.85, 0);
    const socketP = new THREE.Vector3(6.0, 0.9, 0);
    const trayP = new THREE.Vector3(7.6, 0.4, 0.6);

    // 3. Wire bonder: spool and capillary.
    const wirebonder = group(-0.4, 0, 0, 'wirebonder');
    box(1.8, 0.8, 1.8, panelWhite, 0, 0.4, 0, wirebonder);
    box(0.12, 1.5, 0.12, darkSteel, -0.7, 1.55, -0.7, wirebonder);
    const spool = cylinder(0.14, 0.12, gold, -0.7, 2.35, -0.7, wirebonder, 16);
    spool.rotation.x = Math.PI / 2;
    const capillary = mesh(new THREE.ConeGeometry(0.05, 0.3, 10), steel);
    capillary.rotation.x = Math.PI;
    const flameOff = mesh(new THREE.SphereGeometry(0.04, 6, 4), spark);

    // 4. Transfer-mold press: lower platen, upper mold, resin pot and plunger (research M11).
    const press = group(2.0, 0, 0, 'press');
    box(1.8, 0.8, 1.8, darkSteel, 0, 0.4, 0, press);
    for (const [x, z] of [[-0.75, -0.75], [0.75, -0.75], [-0.75, 0.75], [0.75, 0.75]]) cylinder(0.06, 2.0, steel, x, 1.8, z, press, 10);
    const upperMold = box(1.6, 0.35, 1.6, steel, 0, 2.2, 0, press);
    cylinder(0.14, 0.3, darkSteel, 0.75, 0.95, 0, press, 12);
    const plunger = cylinder(0.11, 0.5, steel, 0.75, 1.3, 0, press, 12);
    const tablet = cylinder(0.1, 0.12, resin, 0.75, 1.0, 0, press, 12);

    // 5. Ball attach and reflow.
    const baller = group(4.2, 0, 0, 'baller');
    box(1.6, 0.8, 1.6, panelWhite, 0, 0.4, 0, baller);
    const reflow = box(1.2, 0.3, 1.0, material(0x3a2a24, { emissive: 0xff5a10, emissiveIntensity: 0 }), 0, 0.82, -0.2, baller);

    // 6. Test socket with lid, status lamp and laser marker; tray beside it.
    const socket = group(6.0, 0, 0, 'socket');
    box(1.4, 0.85, 1.4, steel, 0, 0.425, 0, socket);
    const lid = box(1.0, 0.12, 1.0, darkSteel, 0, 1.6, 0, socket);
    mesh(new THREE.SphereGeometry(0.07, 10, 8), okLamp, 0.55, 1.0, 0.6, socket);
    box(0.1, 1.6, 0.1, darkSteel, -0.6, 1.6, -0.6, socket);
    const beam = cylinder(0.01, 1, laser, 0, 0, 0, scene, 6);
    const tray = group(7.6, 0, 0.6, 'tray');
    box(1.2, 0.1, 1.2, darkSteel, 0, 0.05, 0, tray);
    for (let i = 0; i < 4; i++) box(0.5, 0.05, 0.5, material(0x1f3a5a), -0.3 + (i % 2) * 0.6, 0.12, -0.3 + Math.floor(i / 2) * 0.6, tray);

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
    const targetAt = (event: PointerEvent): MalaysiaTarget | null => {
      const rect = renderer.domElement.getBoundingClientRect();
      raycaster.setFromCamera(new THREE.Vector2((event.clientX - rect.left) / rect.width * 2 - 1, -(event.clientY - rect.top) / rect.height * 2 + 1), camera);
      for (const hit of raycaster.intersectObjects(scene.children, true)) {
        if (!hit.object.visible || hit.object === arrow || hit.object === beam) continue;
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

    const order = (phase: MalaysiaPhase) => MALAYSIA_PHASES.indexOf(phase);
    const hop = (from: THREE.Vector3, to: THREE.Vector3, t: number, height: number, out: THREE.Vector3) =>
      out.copy(from).lerp(to, t).setY(from.y + (to.y - from.y) * t + Math.sin(t * Math.PI) * height);
    const dieOnFrame = (row: number, col: number) => new THREE.Vector3((col - 3.5) * PITCH, 0.05, (row - 2.5) * PITCH);
    const clock = new THREE.Clock();
    let frame = 0;
    let drawnKey = '';

    const animate = () => {
      const { phase, progress: p, picked, target } = current.current;
      const t = clock.getElapsedTime();
      const from = (other: MalaysiaPhase) => order(phase) >= order(other);
      const after = (other: MalaysiaPhase) => order(phase) > order(other);

      // Wafer artwork: how many streets are cut, and whether the picked die has left.
      const cut = phase === 'sawing' ? span(p, 0.05, 0.85) : from('pick') ? 1 : 0;
      const gone = picked && ((phase === 'picking' && p > 0.3) || after('picking')) ? picked : null;
      const key = `${cut.toFixed(2)}-${gone ? `${gone.row}${gone.col}` : ''}`;
      if (key !== drawnKey) { drawWafer(cut, gone); drawnKey = key; }

      // Ring frame: at the saw, then carried to the die bonder.
      if (from('picking') || phase === 'pick') ringFrame.position.copy(bonderFrameP);
      else ringFrame.position.copy(sawP);
      ringFrame.visible = !after('picking');

      // Saw: blade steps along the streets with water spray.
      const sawing = phase === 'sawing' && p > 0.05 && p < 0.85;
      const k = span(p, 0.05, 0.85);
      const rows = k < 0.45;
      const line = rows ? Math.floor(span(k, 0, 0.45) * (ROWS + 1)) : Math.floor(span(k, 0.45, 1) * (COLUMNS + 1));
      const sweep = Math.sin(t * 6) * WAFER_R;
      spindle.position.set(sawing ? (rows ? sweep : (line - 4) * PITCH) : 0, 0, sawing ? (rows ? (line - 3) * PITCH : sweep) : -0.9);
      spindle.rotation.y = sawing && !rows ? Math.PI / 2 : 0;
      sawBlade.rotation.x = sawing ? t * 30 : 0;
      drops.forEach((drop, i) => {
        drop.visible = sawing;
        const f = (t * 2 + i / drops.length) % 1;
        drop.position.set(-6.3 + spindle.position.x + Math.sin(i * 2.3) * 0.15, 1.5 - f * 0.55, spindle.position.z + Math.cos(i * 1.7) * 0.15);
      });

      // Pick: ejector pin up under the die, collet comes down, lifts it, carries it to the glued substrate.
      const dieHome = picked ? dieOnFrame(picked.row, picked.col).add(bonderFrameP) : bonderFrameP.clone();
      const colletRest = new THREE.Vector3(-3.4, 1.9, -0.2);
      ejector.position.y = phase === 'picking' && p > 0.12 && p < 0.35 ? 0.88 : 0.75;
      if (picked) ejector.position.set(dieHome.x + 3.4, ejector.position.y, dieHome.z);
      die.visible = from('picking') && phase !== 'done';
      if (phase === 'picking') {
        if (p < 0.2) collet.position.copy(colletRest).lerp(dieHome.clone().setY(dieHome.y + 0.08), ease(span(p, 0, 0.2)));
        else if (p < 0.6) hop(dieHome.clone().setY(dieHome.y + 0.08), attachP.clone().setY(attachP.y + 0.12), ease(span(p, 0.3, 0.6)), 0.6, collet.position);
        else collet.position.copy(colletRest).lerp(attachP.clone().setY(attachP.y + 0.12), 1 - ease(span(p, 0.65, 0.85)));
        die.position.copy(p < 0.3 ? dieHome.clone().setY(dieHome.y + 0.02) : p < 0.6 ? collet.position.clone().setY(collet.position.y - 0.05) : attachP.clone().setY(attachP.y + 0.065));
      } else collet.position.copy(colletRest);
      dispenser.position.y = phase === 'picking' && p > 0.05 && p < 0.25 ? 1.05 : 1.4;
      glue.visible = (phase === 'picking' && p > 0.15) || after('picking');
      (glue.material as THREE.MeshStandardMaterial).emissiveIntensity = phase === 'picking' && p > 0.65 ? 1.5 * (1 - span(p, 0.85, 1)) : 0;

      // The package moves station to station; the die rides on it once attached.
      const route: [MalaysiaPhase, THREE.Vector3, THREE.Vector3][] = [
        ['bonding', attachP, bondP], ['molding', bondP, moldP], ['balling', moldP, ballP], ['testing', ballP, socketP], ['shipping', socketP, trayP],
      ];
      pkg.position.copy(attachP);
      for (const [stage, start, end] of route) {
        if (phase === stage) hop(start, end, ease(span(p, 0, 0.15)), 0.5, pkg.position);
        else if (after(stage)) pkg.position.copy(end);
      }
      if (from('bond') || (phase === 'picking' && p >= 0.6)) die.position.copy(pkg.position).add(new THREE.Vector3(0, 0.065, 0));
      if (phase === 'balling') {
        const flip = Math.sin(span(p, 0.15, 0.85) * Math.PI);
        pkg.rotation.x = flip * Math.PI;
        die.visible = flip < 0.5;
      } else pkg.rotation.x = 0;

      // Wire bonding: the capillary visits each die pad, then its substrate pad.
      const bonding = phase === 'bonding' && p > 0.15;
      const wireDone = phase === 'bonding' ? Math.floor(span(p, 0.15, 0.95) * WIRES) : from('mold') ? WIRES : 0;
      wires.forEach((wire, i) => { wire.visible = i < wireDone; });
      capillary.visible = bonding && wireDone < WIRES;
      if (capillary.visible) {
        const local = (span(p, 0.15, 0.95) * WIRES) % 1;
        const a = diePads[wireDone].clone().add(pkg.position);
        const b = padPositions[wireDone].clone().add(pkg.position);
        capillary.position.copy(a).lerp(b, ease(local)).setY(a.y + 0.2 + Math.sin(local * Math.PI) * 0.15);
      } else capillary.position.set(-0.4, 1.8, 0);
      flameOff.visible = bonding && capillary.visible && ((span(p, 0.15, 0.95) * WIRES) % 1) < 0.08;
      flameOff.position.copy(capillary.position).setY(capillary.position.y - 0.17);

      // Molding: mold closes, plunger pushes the resin tablet in, the black cap is there when it opens.
      const molding = phase === 'molding';
      upperMold.position.y = molding ? 2.2 - Math.sin(span(p, 0.15, 0.95) * Math.PI) * 1.2 : 2.2;
      plunger.position.y = molding ? 1.3 - span(p, 0.35, 0.65) * 0.25 : 1.3;
      tablet.visible = !after('molding') && !(molding && p > 0.5);
      cap.visible = (molding && p > 0.6) || after('molding');
      heatLight.position.copy(pkg.position).setY(pkg.position.y + 0.5);
      heatLight.intensity = (molding && p > 0.3 && p < 0.9) || (phase === 'balling' && p > 0.55 && p < 0.85) ? 6 : 0;

      // Balls: placed on the underside lands while flipped, then reflowed.
      balls.forEach((ball, i) => { ball.visible = (phase === 'balling' && p > 0.3 + i * 0.012) || after('balling'); });
      (reflow.material as THREE.MeshStandardMaterial).emissiveIntensity = phase === 'balling' && p > 0.55 && p < 0.85 ? 1.6 : 0;

      // Test: lid closes, lamp lights, laser marks the cap, then to the tray.
      const testing = phase === 'testing';
      lid.position.y = testing && p > 0.2 && p < 0.7 ? 1.05 : 1.6;
      okLamp.emissiveIntensity = (testing && p > 0.5) || after('testing') ? 2 : 0;
      mark.visible = (testing && p > 0.8) || after('testing');
      beam.visible = testing && p > 0.72 && p < 0.88;
      if (beam.visible) {
        beam.position.set(socketP.x + Math.sin(t * 30) * 0.15, socketP.y + 0.8, socketP.z + 0.15);
        beam.scale.y = 1.4;
      }
      pkg.visible = from('picking') && phase !== 'done';
      tray.position.set(7.6, 0, 0.6);
      if (phase === 'shipping') {
        tray.position.x += ease(span(p, 0.5, 1)) * 4;
        if (p > 0.5) pkg.position.x = trayP.x + ease(span(p, 0.5, 1)) * 4;
      }
      tray.visible = phase !== 'done';

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
