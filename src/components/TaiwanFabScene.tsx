import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { COLUMNS, ROWS, isActive, FieldId, FIELDS } from '../content/waferMap';

/** Waiting phases expect one action; the -ing phases are short animations. */
export const TAIWAN_PHASES = [
  'load', 'loading', 'first', 'firstLayer', 'align', 'exposing', 'finish', 'finishing',
  'probe', 'probing', 'release', 'retrying', 'shipping', 'done',
] as const;
export type TaiwanPhase = typeof TAIWAN_PHASES[number];
export type TaiwanTarget = 'carrier' | 'track' | 'scanner' | 'etcher' | 'prober' | 'output';

interface Props {
  phase: TaiwanPhase;
  progress: number;
  field: FieldId;
  dx: number;
  dy: number;
  /** 0 blank, 1 first layer patterned, 2 all layers built. Patterns only; pass/fail is never painted on the wafer. */
  detail: number;
  /** Index into the active dies the probe is touching, or -1. */
  probeIndex: number;
  target: TaiwanTarget | null;
  onAct: (target: TaiwanTarget) => void;
}

const ANCHORS: Record<TaiwanTarget, [number, number, number]> = {
  carrier: [-7.4, 1.9, 0.5], track: [-5.0, 2.0, 0], scanner: [-1.6, 4.6, 0.2],
  etcher: [1.6, 2.6, 0], prober: [4.3, 2.4, 0], output: [6.8, 2.1, 0.4],
};

const ease = (t: number) => t * t * (3 - 2 * t);
const clamp01 = (t: number) => Math.min(1, Math.max(0, t));
const span = (t: number, a: number, b: number) => clamp01((t - a) / (b - a));

const WAFER_R = 0.75;
/** Game die pitch on the 3D wafer: the 4.3-unit teaching radius scaled to the disc. */
const PITCH = WAFER_R / 4.3;
export const ACTIVE_DIES: { row: number; col: number }[] = [];
for (let row = 0; row < ROWS; row++) for (let col = 0; col < COLUMNS; col++) if (isActive(row, col)) ACTIVE_DIES.push({ row, col });
const dieCenter = (row: number, col: number) => new THREE.Vector2((col - 3.5) * PITCH, (row - 2.5) * PITCH);
const FIELD_CENTER: Record<FieldId, THREE.Vector2> = {
  A: new THREE.Vector2(-2 * PITCH, -1.5 * PITCH), B: new THREE.Vector2(2 * PITCH, -1.5 * PITCH),
  C: new THREE.Vector2(-2 * PITCH, 1.5 * PITCH), D: new THREE.Vector2(2 * PITCH, 1.5 * PITCH),
};

/**
 * Fixed isometric workcell, left to right: Japan's wafer box -> coat/develop track ->
 * DUV scanner cutaway (reticle, lens column, light, wafer stage) -> etch chamber ->
 * probe station -> output carrier. The wafer itself travels between the stations.
 */
export function TaiwanFabScene(props: Props) {
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
    renderer.domElement.setAttribute('aria-label', 'Wafer box, coat and develop track, lithography scanner cutaway, etch chamber, probe station and output carrier');
    renderer.domElement.setAttribute('role', 'img');
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const pmrem = new THREE.PMREMGenerator(renderer);
    const environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environment = environment;
    scene.environmentIntensity = 0.6;
    const camera = new THREE.OrthographicCamera(-8, 8, 5, -5, 0.1, 80);
    camera.position.set(9, 9.5, 14);
    camera.lookAt(0, 1.7, 0);
    // Amber task lighting: photoresist reacts to blue and UV light (research T05).
    scene.add(new THREE.HemisphereLight(0xffe2b0, 0x3a2e28, 1.3));
    const sun = new THREE.DirectionalLight(0xffe6c0, 2.1);
    sun.position.set(-5, 12, 8);
    sun.castShadow = true;
    sun.shadow.mapSize.set(2048, 2048);
    Object.assign(sun.shadow.camera, { left: -10, right: 10, top: 8, bottom: -8 });
    scene.add(sun);
    const plasmaLight = new THREE.PointLight(0xa070ff, 0, 4);
    plasmaLight.position.set(1.6, 1.1, 0.9);
    scene.add(plasmaLight);

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
    const cylinder = (r: number, h: number, mat: THREE.Material, x = 0, y = 0, z = 0, parent: THREE.Object3D = scene, segments = 28) =>
      mesh(new THREE.CylinderGeometry(r, r, h, segments), mat, x, y, z, parent);
    const group = (x = 0, y = 0, z = 0, target?: TaiwanTarget) => {
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
    const glassLens = material(0x9fb8c8, { metalness: 0.2, roughness: 0.1, transparent: true, opacity: 0.8 });
    const boxShell = material(0xb9d4e6, { transparent: true, opacity: 0.45, roughness: 0.2, side: THREE.DoubleSide, depthWrite: false });
    const reticleA = material(0x274a7a, { metalness: 0.3, roughness: 0.2, emissive: 0x112244, emissiveIntensity: 0.3 });
    const reticleB = material(0x2a7a5c, { metalness: 0.3, roughness: 0.2, emissive: 0x114433, emissiveIntensity: 0.3 });
    const plasma = material(0x2a1d40, { emissive: 0xa070ff, emissiveIntensity: 0 });
    const resistDrop = material(0xf0a830, { emissive: 0xf0a830, emissiveIntensity: 0.3 });
    const red = material(0xc8332b, { roughness: 0.5 });
    const needle = material(0xd8c070, { metalness: 0.9, roughness: 0.2 });
    const beamMaterial = new THREE.MeshBasicMaterial({ color: 0xb48cff, transparent: true, opacity: 0, depthWrite: false, side: THREE.DoubleSide });
    const highlight = new THREE.MeshBasicMaterial({ color: 0xfff3b0, transparent: true, opacity: 0.85, depthWrite: false });
    const arrowMaterial = new THREE.MeshBasicMaterial({ color: 0xfcd34d });
    materials.push(beamMaterial, highlight, arrowMaterial);
    const noShadow = new Set<THREE.Material>([boxShell, beamMaterial, highlight, arrowMaterial, glassLens]);

    box(17.4, 0.2, 7, floor, 0, -0.1, 0).receiveShadow = true;

    // The wafer: a disc whose top face is a canvas showing its pattern stage.
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = 256;
    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    const drawWafer = (detail: number) => {
      const ctx = canvas.getContext('2d')!;
      const c = 128, r = 124;
      ctx.clearRect(0, 0, 256, 256);
      const base = ctx.createRadialGradient(c - 40, c - 40, 10, c, c, r);
      base.addColorStop(0, detail >= 2 ? '#c7b8e8' : '#e9eef3');
      base.addColorStop(0.5, detail >= 2 ? '#8fc7c2' : '#b9c4cc');
      base.addColorStop(1, detail >= 2 ? '#c99a6a' : '#8d99a3');
      ctx.fillStyle = base;
      ctx.beginPath(); ctx.arc(c, c, r, 0, Math.PI * 2); ctx.fill();
      if (detail > 0) {
        const px = r / 4.3;
        for (const { row, col } of ACTIVE_DIES) {
          const x = c + (col - 4) * px, y = c + (row - 3) * px;
          ctx.strokeStyle = detail >= 2 ? 'rgba(40,30,60,0.55)' : 'rgba(40,60,90,0.35)';
          ctx.lineWidth = 2;
          ctx.strokeRect(x + 1, y + 1, px - 2, px - 2);
          if (detail >= 2) {
            ctx.fillStyle = 'rgba(60,40,90,0.25)';
            for (let k = 0; k < 4; k++) ctx.fillRect(x + 5 + k * (px - 10) / 4, y + 5, (px - 10) / 8, px - 10);
          } else {
            ctx.fillStyle = 'rgba(40,70,110,0.25)';
            ctx.fillRect(x + px / 2 - 2, y + 5, 4, px - 10);
          }
        }
      }
      ctx.fillStyle = '#334';
      ctx.beginPath(); ctx.arc(c, c + r, 6, 0, Math.PI * 2); ctx.fill();
      texture.needsUpdate = true;
    };
    drawWafer(0);
    const waferTop = material(0xffffff, { map: texture, metalness: 0.7, roughness: 0.15, flatShading: false });
    const waferEdge = material(0x9aa4ad, { metalness: 0.8, roughness: 0.3 });
    const wafer = mesh(new THREE.CylinderGeometry(WAFER_R, WAFER_R, 0.03, 48), [waferEdge, waferTop, waferEdge]);
    const resistFilm = cylinder(WAFER_R * 0.995, 0.012, material(0xf0a830, { transparent: true, opacity: 0.55, roughness: 0.3 }), 0, 0.022, 0, wafer, 48);
    const probeMark = mesh(new THREE.PlaneGeometry(PITCH * 0.9, PITCH * 0.9), highlight, 0, 0.025, 0, wafer);
    probeMark.rotation.x = -Math.PI / 2;

    // 1. Japan's front-opening box with blank wafers.
    const carrierP = new THREE.Vector3(-7.4, 0.75, 0.5);
    const carrier = group(-7.4, 0, 0.5, 'carrier');
    box(1.2, 0.1, 1.2, darkSteel, 0, 0.05, 0, carrier);
    mesh(new THREE.BoxGeometry(1.1, 1.3, 1.1), boxShell, 0, 0.75, 0, carrier);
    const spareWafers = [0, 1, 2, 3].map(i => cylinder(0.5, 0.02, waferEdge, 0, 0.35 + i * 0.22, 0, carrier, 32));

    // 2. Coat/develop track: spin chuck under a dispense nozzle, bake plate beside it.
    const trackP = new THREE.Vector3(-5.0, 1.02, 0);
    const track = group(-5.0, 0, 0, 'track');
    box(1.9, 0.9, 1.6, panelWhite, 0, 0.45, 0, track);
    cylinder(0.85, 0.12, darkSteel, 0, 0.92, 0, track, 32);
    const chuck = cylinder(0.25, 0.1, steel, 0, 0.97, 0, track, 20);
    const nozzleArm = new THREE.Group();
    nozzleArm.position.set(-0.85, 1.4, -0.6);
    track.add(nozzleArm);
    box(0.08, 0.6, 0.08, darkSteel, 0, -0.1, 0, nozzleArm);
    box(0.9, 0.06, 0.06, darkSteel, 0.45, 0.2, 0, nozzleArm);
    cylinder(0.04, 0.2, darkSteel, 0.9, 0.08, 0, nozzleArm, 8);
    const drop = mesh(new THREE.SphereGeometry(0.05, 8, 6), resistDrop, 0.9, -0.1, 0, nozzleArm);
    box(0.5, 0.15, 0.5, material(0x8a5a40, { roughness: 0.8 }), 0.6, 0.98, 0.45, track);

    // 3. DUV scanner, front cut away: light source, reticle stage, lens column, wafer stage.
    const scannerX = -1.6;
    const scanner = group(scannerX, 0, 0, 'scanner');
    box(2.6, 0.5, 2.0, darkSteel, 0, 0.25, 0, scanner);
    box(2.6, 3.8, 0.12, panelWhite, 0, 2.2, -1.0, scanner);
    box(0.12, 3.8, 2.0, panelWhite, -1.3, 2.2, 0, scanner);
    box(2.6, 0.12, 2.0, panelWhite, 0, 4.15, 0, scanner);
    box(0.9, 0.5, 0.6, steel, 0.5, 3.8, -0.6, scanner);
    const reticle = box(0.8, 0.05, 0.8, reticleA, 0, 3.55, 0.2, scanner);
    box(1.2, 0.08, 1.0, darkSteel, 0, 3.47, 0.2, scanner);
    [[0.42, 0.3, 3.2], [0.36, 0.3, 2.85], [0.3, 0.3, 2.5], [0.26, 0.3, 2.15], [0.2, 0.25, 1.8]].forEach(([r, h, y]) => cylinder(r, h, glassLens, 0, y, 0.2, scanner, 24));
    const lensBottom = new THREE.Vector3(scannerX, 1.62, 0.2);
    const stage = box(1.5, 0.35, 1.5, steel, 0, 0.67, 0.2, scanner);
    const beam = mesh(new THREE.CylinderGeometry(0.08, 0.16, 1, 16, 1, true), beamMaterial);
    const scannerP = new THREE.Vector3(scannerX, 0.88, 0.2);

    // 4. Etch chamber with a plasma window.
    const etchP = new THREE.Vector3(1.6, 0.95, 0);
    const etcher = group(1.6, 0, 0, 'etcher');
    box(1.6, 0.5, 1.6, darkSteel, 0, 0.25, 0, etcher);
    cylinder(0.75, 1.2, steel, 0, 1.1, -0.15, etcher, 28);
    mesh(new THREE.SphereGeometry(0.75, 28, 10, 0, Math.PI * 2, 0, Math.PI / 2), steel, 0, 1.7, -0.15, etcher);
    const etchWindow = cylinder(0.32, 0.06, plasma, 0, 1.15, 0.6, etcher, 24);
    etchWindow.rotation.x = Math.PI / 2;
    box(1.0, 0.1, 0.6, darkSteel, 0, 0.55, 0.85, etcher);

    // 5. Probe station: chuck, probe card ring with needles, tester head.
    const probeP = new THREE.Vector3(4.3, 0.95, 0);
    const prober = group(4.3, 0, 0, 'prober');
    box(1.7, 0.75, 1.7, panelWhite, 0, 0.375, 0, prober);
    cylinder(0.8, 0.12, darkSteel, 0, 0.82, 0, prober, 32);
    const card = new THREE.Group();
    card.position.set(0, 1.35, 0);
    prober.add(card);
    const ring = mesh(new THREE.TorusGeometry(0.35, 0.06, 8, 24), darkSteel, 0, 0, 0, card);
    ring.rotation.x = Math.PI / 2;
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2;
      const n = cylinder(0.012, 0.3, needle, Math.sin(a) * 0.2, -0.12, Math.cos(a) * 0.2, card, 6);
      n.rotation.set(Math.cos(a) * 0.5, 0, -Math.sin(a) * 0.5);
    }
    box(0.1, 1.3, 0.1, darkSteel, 0.8, 1.4, -0.7, prober);
    box(1.0, 0.45, 0.9, steel, 0.4, 2.05, -0.5, prober);
    const testerLamp = mesh(new THREE.SphereGeometry(0.06, 10, 8), material(0x2a3a2a, { emissive: 0x33ff66, emissiveIntensity: 0 }), 0.75, 2.3, -0.04, prober);

    // 6. Output carrier for the tested wafer, and a scrap slot for retried wafers.
    const outHome = new THREE.Vector3(6.8, 0, 0.4);
    const output = group(outHome.x, 0, outHome.z, 'output');
    box(1.2, 0.1, 1.2, darkSteel, 0, 0.05, 0, output);
    mesh(new THREE.BoxGeometry(1.1, 1.2, 1.1), material(0x7b8a96, { transparent: true, opacity: 0.55, side: THREE.DoubleSide, depthWrite: false }), 0, 0.7, 0, output);
    const outP = new THREE.Vector3(6.8, 0.8, 0.4);
    const scrapP = new THREE.Vector3(5.3, 0.35, 1.9);
    box(0.9, 0.3, 0.9, red, scrapP.x, 0.15, scrapP.z);

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
      const halfHeight = Math.max(4.3, 8.4 / aspect);
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
    const targetAt = (event: PointerEvent): TaiwanTarget | null => {
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

    /** Position along a list of [time, point] keys, easing between them with a small hop. */
    const path = (keys: [number, THREE.Vector3][], t: number, out: THREE.Vector3) => {
      if (t <= keys[0][0]) return out.copy(keys[0][1]);
      for (let i = 1; i < keys.length; i++) {
        if (t <= keys[i][0]) {
          const k = ease((t - keys[i - 1][0]) / (keys[i][0] - keys[i - 1][0]));
          out.copy(keys[i - 1][1]).lerp(keys[i][1], k);
          if (!keys[i - 1][1].equals(keys[i][1])) out.y += Math.sin(k * Math.PI) * 0.6;
          return out;
        }
      }
      return out.copy(keys[keys.length - 1][1]);
    };
    const atField = (field: FieldId, dx = 0, dy = 0) =>
      scannerP.clone().add(new THREE.Vector3(-FIELD_CENTER[field].x + dx * 0.05, 0, -FIELD_CENTER[field].y + dy * 0.05));
    const order = (phase: TaiwanPhase) => TAIWAN_PHASES.indexOf(phase);
    const clock = new THREE.Clock();
    let frame = 0;
    let drawnDetail = -1;
    let spin = 0;
    let last = 0;

    const animate = () => {
      const { phase, progress: p, field, dx, dy, detail, probeIndex, target } = current.current;
      const t = clock.getElapsedTime();
      const dt = Math.min(0.1, t - last);
      last = t;
      const from = (other: TaiwanPhase) => order(phase) >= order(other);
      if (detail !== drawnDetail) { drawWafer(detail); drawnDetail = detail; }

      // Where the wafer is.
      let flash = false;
      let flashField: FieldId = field;
      let plasmaOn = false;
      let spinning = false;
      let coated = false;
      switch (phase) {
        case 'load': wafer.position.copy(carrierP); break;
        case 'loading': path([[0, carrierP], [1, trackP]], p, wafer.position); break;
        case 'first': wafer.position.copy(trackP); break;
        case 'firstLayer': {
          // deposit+coat at the track, expose four fields, develop, etch and strip, recoat, back to the scanner.
          path([[0.28, trackP], [0.38, atField('A')], [0.43, atField('A')], [0.47, atField('B')], [0.51, atField('C')], [0.55, atField('D')],
            [0.62, trackP], [0.66, trackP], [0.72, etchP], [0.84, etchP], [0.9, trackP], [0.95, trackP], [1, atField('A')]], p, wafer.position);
          spinning = (p > 0.12 && p < 0.28) || (p > 0.9 && p < 0.95);
          coated = (p > 0.15 && p < 0.62) || p > 0.9;
          const step = FIELDS.findIndex((_, i) => p > 0.4 + i * 0.04 && p < 0.42 + i * 0.04);
          if (step >= 0) { flash = true; flashField = FIELDS[step]; }
          plasmaOn = p > 0.72 && p < 0.84;
          break;
        }
        case 'align': wafer.position.copy(atField(field, dx, dy)); coated = true; break;
        case 'exposing': wafer.position.copy(atField(field, dx, dy)); coated = true; flash = p < 0.7; break;
        case 'finish': wafer.position.copy(atField('D')); coated = true; break;
        case 'finishing':
          path([[0, atField('D')], [0.1, trackP], [0.2, trackP], [0.3, etchP], [0.45, etchP], [0.55, scannerP], [0.6, scannerP], [0.7, etchP], [0.8, etchP], [0.9, trackP], [1, trackP]], p, wafer.position);
          coated = p < 0.2;
          spinning = p > 0.1 && p < 0.2;
          plasmaOn = (p > 0.3 && p < 0.45) || (p > 0.7 && p < 0.8);
          flash = p > 0.55 && p < 0.6;
          break;
        case 'probe': wafer.position.copy(trackP); break;
        case 'probing': path([[0, trackP], [0.12, probeP]], p, wafer.position); break;
        case 'release': wafer.position.copy(probeP); break;
        case 'retrying': path([[0, probeP], [0.35, scrapP], [0.5, carrierP], [1, trackP]], p, wafer.position); break;
        case 'shipping': path([[0, probeP], [0.5, outP]], p, wafer.position); wafer.position.x += p > 0.5 ? ease(span(p, 0.5, 1)) * 4 : 0; break;
        case 'done': wafer.visible = false; break;
      }
      wafer.visible = phase !== 'done';
      if (spinning) spin += dt * 25;
      wafer.rotation.y = spinning ? spin : 0;
      resistFilm.visible = coated;
      drop.visible = spinning;
      drop.position.y = -0.1 - ((t * 3) % 1) * 0.25;
      nozzleArm.rotation.y = spinning ? -0.6 : 0;
      chuck.rotation.y = spinning ? spin : 0;

      // The wafer stage carries the wafer under the lens; the reticle swaps before the second layer.
      const onScanner = Math.abs(wafer.position.x - scannerX) < 0.6 && wafer.position.y < 1.2;
      stage.position.x = onScanner ? wafer.position.x - scannerX : 0;
      stage.position.z = onScanner ? wafer.position.z : 0.2;
      const swap = phase === 'firstLayer' ? span(p, 0.86, 1) : 0;
      reticle.position.x = Math.sin(swap * Math.PI) * 1.2;
      reticle.material = (phase === 'firstLayer' && swap < 0.5) || !from('firstLayer') ? reticleA : reticleB;

      // Light through the reticle and lenses onto one field at a time.
      beam.visible = flash;
      if (flash) {
        const spot = phase === 'firstLayer' ? atField(flashField) : wafer.position.clone();
        const top = lensBottom.y, bottom = spot.y + 0.03;
        beam.position.set(lensBottom.x, (top + bottom) / 2, lensBottom.z);
        beam.scale.set(1, top - bottom, 1);
        beamMaterial.opacity = 0.55 + Math.sin(t * 40) * 0.15;
      }
      (etchWindow.material as THREE.MeshStandardMaterial).emissiveIntensity = plasmaOn ? 2.2 + Math.sin(t * 25) * 0.4 : 0;
      plasmaLight.intensity = plasmaOn ? 8 : 0;

      // Probe: the card comes down and a highlight steps over the active dies.
      const probing = phase === 'probing' && p > 0.12;
      card.position.y = probing ? 1.12 : 1.35;
      probeMark.visible = probing && probeIndex >= 0 && probeIndex < ACTIVE_DIES.length;
      if (probeMark.visible) {
        const { row, col } = ACTIVE_DIES[probeIndex];
        const c = dieCenter(row, col);
        probeMark.position.set(c.x, 0.025, c.y);
      }
      (testerLamp.material as THREE.MeshStandardMaterial).emissiveIntensity = probing && Math.sin(t * 20) > 0 ? 2 : 0;

      spareWafers.forEach((spare, i) => { spare.visible = i < 3; });
      output.position.copy(outHome);
      if (phase === 'shipping') output.position.x += ease(span(p, 0.5, 1)) * 4;
      output.visible = phase !== 'done';

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
    <div className="absolute inset-0 overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-b from-[#2b2a1f] to-[#14140f]">
      <div ref={host} className="absolute inset-0" />
      {unavailable && <p className="absolute inset-0 flex items-center justify-center p-8 text-center text-white">3D view unavailable in this browser. Use the control panel to run each step.</p>}
    </div>
  );
}
