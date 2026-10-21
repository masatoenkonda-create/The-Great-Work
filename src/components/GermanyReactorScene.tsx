import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';

/** Waiting phases expect one action; the -ing phases are short animations (growing is driven by the panel). */
export const GERMANY_PHASES = [
  'mill', 'milling', 'convert', 'converting', 'distill', 'distilling', 'grow', 'growing',
  'open', 'opening', 'break', 'breaking', 'clean', 'cleaning', 'ship', 'shipping', 'done',
] as const;
export type GermanyPhase = typeof GERMANY_PHASES[number];
export type GermanyTarget = 'mill' | 'converter' | 'columns' | 'switch' | 'reactor' | 'crusher' | 'cleaner' | 'pack';

interface Props {
  phase: GermanyPhase;
  progress: number;
  /** Rod thickness 0..1; keeps its value when growth pauses. */
  growth: number;
  /** Rod glow 0..1 from the panel's rod temperature. */
  heat: number;
  /** Too much precursor: silicon dust forms in the gas. */
  dust: boolean;
  /** Gas flowing into the reactor. */
  feeding: boolean;
  target: GermanyTarget | null;
  onAct: (target: GermanyTarget) => void;
}

const ANCHORS: Record<GermanyTarget, [number, number, number]> = {
  mill: [-6.1, 2.2, 0.6], converter: [-3.6, 2.3, 0.6], columns: [-1.15, 4.4, -0.5], switch: [0.9, 1.9, 2.2],
  reactor: [2.7, 4.6, 0], crusher: [5.1, 2.1, -0.7], cleaner: [6.3, 1.9, 0.9], pack: [7.6, 2.1, 0.9],
};

const ease = (t: number) => t * t * (3 - 2 * t);
const clamp01 = (t: number) => Math.min(1, Math.max(0, t));
const span = (t: number, a: number, b: number) => clamp01((t - a) / (b - a));

/**
 * Fixed isometric workcell, left to right: Norway's silicon -> mill -> converter with HCl ->
 * two distillation columns with reject drums -> Siemens reactor (front cut away) -> crusher ->
 * cleaning tunnel -> double-bagged chunks. Reactor geometry follows research G08 Figure 1.
 */
export function GermanyReactorScene(props: Props) {
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
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.setClearColor(0x000000, 0);
    renderer.domElement.setAttribute('aria-label', 'Mill, converter, distillation columns, deposition reactor cutaway, crusher, cleaning line and shipping bag');
    renderer.domElement.setAttribute('role', 'img');
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const pmrem = new THREE.PMREMGenerator(renderer);
    const environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environment = environment;
    scene.environmentIntensity = 0.55;
    const camera = new THREE.OrthographicCamera(-8, 8, 5, -5, 0.1, 80);
    camera.position.set(9, 9.5, 14);
    camera.lookAt(0, 1.6, 0);
    scene.add(new THREE.HemisphereLight(0xc8e5ff, 0x3a2e28, 1.4));
    const sun = new THREE.DirectionalLight(0xfff0dd, 2.2);
    sun.position.set(-5, 12, 8);
    sun.castShadow = true;
    sun.shadow.mapSize.set(2048, 2048);
    Object.assign(sun.shadow.camera, { left: -10, right: 10, top: 8, bottom: -8 });
    scene.add(sun);
    const rodGlow = new THREE.PointLight(0xff8a2a, 0, 6);
    rodGlow.position.set(2.7, 1.8, 0.9);
    scene.add(rodGlow);

    const geometries: THREE.BufferGeometry[] = [];
    const materials: THREE.Material[] = [];
    const material = (color: number, options: THREE.MeshStandardMaterialParameters = {}) => {
      const result = new THREE.MeshStandardMaterial({ color, roughness: 0.7, flatShading: true, ...options });
      materials.push(result);
      return result;
    };
    const mesh = (geometry: THREE.BufferGeometry, mat: THREE.Material, x = 0, y = 0, z = 0, parent: THREE.Object3D = scene) => {
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
    const group = (x = 0, y = 0, z = 0, target?: GermanyTarget) => {
      const result = new THREE.Group();
      result.position.set(x, y, z);
      if (target) result.userData.target = target;
      scene.add(result);
      return result;
    };
    /** A straight pipe between two points. */
    const pipe = (from: THREE.Vector3, to: THREE.Vector3, mat: THREE.Material, r = 0.06) => {
      const length = from.distanceTo(to);
      const result = mesh(new THREE.CylinderGeometry(r, r, length, 10), mat);
      result.position.copy(from).lerp(to, 0.5);
      result.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), to.clone().sub(from).normalize());
      return result;
    };

    const floor = material(0x3b4a52, { roughness: 0.95 });
    const steel = material(0x6b7f89, { metalness: 0.6, roughness: 0.4 });
    const darkSteel = material(0x29343b, { metalness: 0.5, roughness: 0.5 });
    const shell = material(0x8a9aa3, { metalness: 0.7, roughness: 0.35, side: THREE.DoubleSide });
    const inner = material(0x4b5961, { metalness: 0.4, roughness: 0.6, side: THREE.DoubleSide });
    const cutFace = material(0xb7c3c9, { metalness: 0.3, roughness: 0.5 });
    const bagCloth = material(0xe9e4d6, { roughness: 1 });
    const silicon = material(0xa7b0b8, { metalness: 0.85, roughness: 0.28 });
    const powder = material(0x80868d, { roughness: 1 });
    const hclTank = material(0x6fae3f, { metalness: 0.3, roughness: 0.5 });
    const h2Tank = material(0x3f7fc8, { metalness: 0.3, roughness: 0.5 });
    const red = material(0xc8332b, { roughness: 0.5 });
    const indicator = material(0x2a3a2a, { emissive: 0x33ff66, emissiveIntensity: 0 });
    const glass = material(0xd8eef7, { transparent: true, opacity: 0.25, roughness: 0.1, metalness: 0, side: THREE.DoubleSide, depthWrite: false });
    const liquid = material(0xbfe9ff, { transparent: true, opacity: 0.75, roughness: 0.15, emissive: 0x2a5a6a, emissiveIntensity: 0.3 });
    const rodMaterial = material(0x8f989f, { metalness: 0.6, roughness: 0.45, emissive: 0xff6a10, emissiveIntensity: 0 });
    const columnWindow = material(0x0f1a20, { emissive: 0x5fd4c8, emissiveIntensity: 0.15, roughness: 0.3 });
    const sightGlass = material(0x1a0f08, { emissive: 0xff7a1f, emissiveIntensity: 0 });
    const reject = material(0x3b2f2a, { roughness: 1 });
    const vapour = new THREE.MeshBasicMaterial({ color: 0xd9f6ff, transparent: true, opacity: 0.8, depthWrite: false });
    const dirt = new THREE.MeshBasicMaterial({ color: 0x6b4a2f });
    const dustMaterial = new THREE.MeshBasicMaterial({ color: 0xf2f2f2, transparent: true, opacity: 0.85, depthWrite: false });
    const gasMaterial = new THREE.MeshBasicMaterial({ color: 0xcfe8ff, transparent: true, opacity: 0.35, depthWrite: false });
    const arrowMaterial = new THREE.MeshBasicMaterial({ color: 0xfcd34d });
    materials.push(vapour, dirt, dustMaterial, gasMaterial, arrowMaterial);
    const noShadow = new Set<THREE.Material>([glass, liquid, vapour, dirt, dustMaterial, gasMaterial, arrowMaterial]);

    box(17.4, 0.2, 7, floor, 0, -0.1, 0).receiveShadow = true;

    // 1. Norway's silicon lumps arrive in their bag; the enclosed mill grinds them to powder.
    const bagHome = new THREE.Vector3(-7.5, 0, 0.6);
    box(1, 0.12, 1, darkSteel, bagHome.x, 0.06, bagHome.z);
    box(0.85, 0.7, 0.85, bagCloth, bagHome.x, 0.47, bagHome.z);
    const lumpSpots = [[-0.2, -0.15], [0.18, -0.2], [0, 0.18], [-0.22, 0.2], [0.2, 0.15]].map(([x, z]) => new THREE.Vector3(bagHome.x + x, 0.9, bagHome.z + z));
    const lumps = lumpSpots.map((spot, i) => {
      const lump = mesh(new THREE.DodecahedronGeometry(0.17, 0), silicon, spot.x, spot.y, spot.z);
      lump.rotation.set(i, i * 2, 0.4);
      return lump;
    });
    const mill = group(-6.1, 0, 0.6, 'mill');
    for (const [x, z] of [[-0.4, -0.4], [0.4, -0.4], [-0.4, 0.4], [0.4, 0.4]]) box(0.1, 0.6, 0.1, darkSteel, x, 0.3, z, mill);
    const millBody = box(1.05, 0.9, 1.05, steel, 0, 1.05, 0, mill);
    mesh(new THREE.CylinderGeometry(0.55, 0.22, 0.5, 4, 1, true), darkSteel, 0, 1.75, 0, mill).rotation.y = Math.PI / 4;
    const millTop = new THREE.Vector3(-6.1, 2.1, 0.6);
    box(0.25, 0.08, 0.7, darkSteel, 0.7, 0.62, 0, mill).rotation.z = -0.4;
    const powderBin = group(-5.0, 0, 0.6, 'mill');
    box(0.8, 0.08, 0.8, darkSteel, 0, 0.04, 0, powderBin);
    for (const [w, d, x, z] of [[0.8, 0.06, 0, 0.37], [0.8, 0.06, 0, -0.37], [0.06, 0.8, 0.37, 0], [0.06, 0.8, -0.37, 0]]) box(w, 0.5, d, steel, x, 0.29, z, powderBin);
    const powderPile = box(0.68, 1, 0.68, powder, 0, 0.08, 0, powderBin);

    // 2. Converter: powder + hydrogen chloride gas -> liquid compound, collected in a receiver.
    const converter = group(-3.6, 0, 0.6, 'converter');
    cylinder(0.48, 1.5, steel, 0, 0.85, 0, converter);
    mesh(new THREE.SphereGeometry(0.48, 20, 10, 0, Math.PI * 2, 0, Math.PI / 2), steel, 0, 1.6, 0, converter);
    cylinder(0.55, 0.1, darkSteel, 0, 0.05, 0, converter);
    const hcl = group(-3.6, 0, 1.95, 'converter');
    cylinder(0.24, 1.3, hclTank, 0, 0.65, 0, hcl);
    mesh(new THREE.SphereGeometry(0.24, 14, 8, 0, Math.PI * 2, 0, Math.PI / 2), hclTank, 0, 1.3, 0, hcl);
    const hclValve = cylinder(0.08, 0.12, red, 0, 1.6, 0, hcl);
    pipe(new THREE.Vector3(-3.6, 1.5, 1.95), new THREE.Vector3(-3.6, 1.2, 1.05), darkSteel);
    pipe(new THREE.Vector3(-5.0, 0.45, 0.6), new THREE.Vector3(-4.05, 0.45, 0.6), darkSteel, 0.08);
    const condenserFrom = new THREE.Vector3(-3.35, 1.95, 0.6);
    const condenserTo = new THREE.Vector3(-2.55, 1.15, 1.3);
    pipe(condenserFrom, condenserTo, steel, 0.09);
    const receiverA = new THREE.Vector3(-2.55, 0, 1.3);
    mesh(new THREE.CylinderGeometry(0.32, 0.32, 1, 20, 1, true), glass, receiverA.x, 0.55, receiverA.z);
    cylinder(0.34, 0.06, darkSteel, receiverA.x, 0.03, receiverA.z);
    const liquidA = cylinder(0.29, 1, liquid, receiverA.x, 0.06, receiverA.z);

    // 3. Distillation: two columns separate light and heavy fractions; product condenses into receiver B.
    const columns = group(0, 0, 0, 'columns');
    const columnXs = [-1.65, -0.65];
    const columnZ = -0.5;
    for (const x of columnXs) {
      cylinder(0.33, 3.6, steel, x, 1.8, columnZ, columns);
      mesh(new THREE.SphereGeometry(0.33, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2), steel, x, 3.6, columnZ, columns);
      box(0.12, 2.9, 0.02, columnWindow, x + 0.13, 1.9, columnZ + 0.31, columns).rotation.y = 0.4;
      cylinder(0.4, 0.1, darkSteel, x, 0.05, columnZ, columns);
    }
    box(1.3, 0.25, 0.3, darkSteel, -1.15, 3.95, columnZ, columns);
    pipe(new THREE.Vector3(-2.55, 0.35, 1.3), new THREE.Vector3(-1.65, 0.35, columnZ + 0.3), darkSteel);
    const lightDrum = new THREE.Vector3(-2.45, 0, -1.6);
    const heavyDrum = new THREE.Vector3(-0.95, 0, -1.75);
    for (const drum of [lightDrum, heavyDrum]) cylinder(0.3, 0.7, reject, drum.x, 0.35, drum.z);
    pipe(new THREE.Vector3(-1.65, 3.4, columnZ), new THREE.Vector3(lightDrum.x, 0.75, lightDrum.z), darkSteel, 0.05);
    pipe(new THREE.Vector3(-0.65, 0.3, columnZ), new THREE.Vector3(heavyDrum.x, 0.5, heavyDrum.z), darkSteel, 0.05);
    const receiverB = new THREE.Vector3(0.35, 0, -0.75);
    pipe(new THREE.Vector3(-0.6, 3.95, columnZ), new THREE.Vector3(receiverB.x, 1.15, receiverB.z), steel, 0.06);
    mesh(new THREE.CylinderGeometry(0.34, 0.34, 1.1, 20, 1, true), glass, receiverB.x, 0.6, receiverB.z);
    cylinder(0.36, 0.06, darkSteel, receiverB.x, 0.03, receiverB.z);
    const liquidB = cylinder(0.31, 1, liquid, receiverB.x, 0.06, receiverB.z);

    // 4. Siemens reactor: baseplate, electrode holders, two inverted-U rod pairs, steel bell with the front cut away.
    const R = 1.5, H = 2.9, reactorX = 2.7;
    const reactor = group(reactorX, 0, 0, 'reactor');
    cylinder(R + 0.2, 0.3, darkSteel, 0, 0.15, 0, reactor, 40);
    const cameraAngle = Math.atan2(camera.position.x, camera.position.z);
    const thetaStart = cameraAngle + 0.9;
    const thetaLength = Math.PI * 2 - 1.8;
    const dome = new THREE.Group();
    reactor.add(dome);
    mesh(new THREE.CylinderGeometry(R, R, H, 40, 1, true, thetaStart, thetaLength), shell, 0, 0.3 + H / 2, 0, dome);
    mesh(new THREE.CylinderGeometry(R - 0.1, R - 0.1, H, 40, 1, true, thetaStart, thetaLength), inner, 0, 0.3 + H / 2, 0, dome);
    mesh(new THREE.SphereGeometry(R, 40, 12, thetaStart + Math.PI / 2, thetaLength, 0, Math.PI / 2), shell, 0, 0.3 + H, 0, dome);
    for (const theta of [thetaStart, thetaStart + thetaLength]) {
      const face = box(0.1, H, 0.03, cutFace, Math.sin(theta) * (R - 0.05), 0.3 + H / 2, Math.cos(theta) * (R - 0.05), dome);
      face.rotation.y = theta - Math.PI / 2;
    }
    cylinder(0.12, 0.35, darkSteel, 0, 0.3 + H + R + 0.1, 0, dome);
    const sightAngle = thetaStart + thetaLength - 0.5;
    const sight = mesh(new THREE.CylinderGeometry(0.16, 0.16, 0.08, 16), sightGlass, Math.sin(sightAngle) * (R + 0.02), 1.9, Math.cos(sightAngle) * (R + 0.02), dome);
    sight.rotation.order = 'YXZ';
    sight.rotation.set(Math.PI / 2, sightAngle, 0);
    const legXs = [-0.85, -0.3, 0.3, 0.85];
    const legTop = 2.55;
    const rods: { mesh: THREE.Mesh; bridge: boolean }[] = [];
    const rodGroup = new THREE.Group();
    reactor.add(rodGroup);
    for (const x of legXs) {
      cylinder(0.13, 0.25, darkSteel, x, 0.42, 0, reactor, 12);
      const leg = mesh(new THREE.CylinderGeometry(1, 1, legTop - 0.5, 14), rodMaterial, x, 0.5 + (legTop - 0.5) / 2, 0, rodGroup);
      rods.push({ mesh: leg, bridge: false });
    }
    for (const [a, b] of [[legXs[0], legXs[1]], [legXs[2], legXs[3]]]) {
      const bridge = mesh(new THREE.CylinderGeometry(1, 1, 1, 14), rodMaterial, (a + b) / 2, legTop, 0, rodGroup);
      bridge.rotation.z = Math.PI / 2;
      bridge.userData.length = b - a;
      rods.push({ mesh: bridge, bridge: true });
    }
    const nozzles = [-0.58, 0, 0.58].map(x => mesh(new THREE.ConeGeometry(0.07, 0.18, 8), darkSteel, x, 0.39, 0.35, reactor));
    const gasPuffs = Array.from({ length: 14 }, () => mesh(new THREE.SphereGeometry(0.05, 6, 4), gasMaterial));
    const dust = Array.from({ length: 22 }, () => mesh(new THREE.SphereGeometry(0.035, 5, 4), dustMaterial));
    // Feed: purified liquid from receiver B and hydrogen from its bottle, piped to the baseplate.
    pipe(new THREE.Vector3(receiverB.x + 0.3, 0.2, receiverB.z), new THREE.Vector3(reactorX - 0.6, 0.2, -1.1), darkSteel);
    const h2 = group(1.15, 0, 1.6);
    cylinder(0.24, 1.3, h2Tank, 0, 0.65, 0, h2);
    mesh(new THREE.SphereGeometry(0.24, 14, 8, 0, Math.PI * 2, 0, Math.PI / 2), h2Tank, 0, 1.3, 0, h2);
    pipe(new THREE.Vector3(1.15, 0.2, 1.6), new THREE.Vector3(reactorX - 1.1, 0.2, 1.0), darkSteel);
    // Power switch box (same family as Norway's).
    const switchBox = group(0.9, 0, 2.5, 'switch');
    box(0.15, 1, 0.15, darkSteel, 0, 0.5, 0, switchBox);
    box(0.6, 0.6, 0.3, steel, 0, 1.15, 0, switchBox);
    const lever = box(0.08, 0.4, 0.08, red, 0, 1.15, 0.2, switchBox);
    lever.geometry.translate(0, 0.18, 0);
    mesh(new THREE.SphereGeometry(0.07, 10, 8), indicator, 0.18, 1.35, 0.16, switchBox);

    // 5. Enclosed crusher and the tray that catches the chunks.
    const crusher = group(5.1, 0, -0.7, 'crusher');
    box(1.3, 1.3, 1.1, steel, 0, 0.65, 0, crusher);
    box(0.9, 0.12, 0.2, darkSteel, 0, 1.25, 0.56, crusher);
    const crusherHead = box(1.0, 0.25, 0.8, darkSteel, 0, 1.55, 0, crusher);
    const trayHome = new THREE.Vector3(5.1, 0, 0.8);
    const tray = new THREE.Group();
    scene.add(tray);
    box(1.0, 0.08, 0.7, steel, 0, 0.3, 0, tray);
    for (const [w, d, x, z] of [[1.0, 0.05, 0, 0.33], [1.0, 0.05, 0, -0.33], [0.05, 0.7, 0.48, 0], [0.05, 0.7, -0.48, 0]]) box(w, 0.14, d, steel, x, 0.39, z, tray);
    box(1.1, 0.3, 0.1, darkSteel, 5.1, 0.15, 0.45);
    const chunkSpots = [[-0.3, -0.15], [0, -0.18], [0.3, -0.12], [-0.25, 0.14], [0.08, 0.15], [0.3, 0.12]].map(([x, z]) => new THREE.Vector3(x, 0.48, z));
    const chunks = chunkSpots.map((spot, i) => {
      const chunk = mesh(new THREE.DodecahedronGeometry(0.13 + (i % 3) * 0.03, 0), silicon, spot.x, spot.y, spot.z, tray);
      chunk.rotation.set(i * 0.8, i * 1.4, 0.3);
      chunk.scale.set(1, 0.75, 1.15);
      return chunk;
    });
    tray.userData.target = 'crusher';

    // 6. Cleaning tunnel (enclosed: acid etch, rinse, dry) and the double bag.
    const cleaner = group(6.35, 0, 0.8, 'cleaner');
    box(1.3, 1.1, 1.0, steel, 0, 0.55, 0, cleaner);
    box(1.32, 0.12, 1.02, darkSteel, 0, 1.15, 0, cleaner);
    for (const x of [-0.66, 0.66]) box(0.02, 0.55, 0.75, darkSteel, x, 0.45, 0, cleaner);
    const cleanerLight = material(0x2a3a2a, { emissive: 0x33ff66, emissiveIntensity: 0 });
    mesh(new THREE.SphereGeometry(0.07, 10, 8), cleanerLight, 0.4, 1.3, 0.3, cleaner);
    const packHome = new THREE.Vector3(7.6, 0, 0.8);
    const pack = group(packHome.x, packHome.y, packHome.z, 'pack');
    box(0.9, 0.12, 0.9, darkSteel, 0, 0.06, 0, pack);
    const innerBag = mesh(new THREE.BoxGeometry(0.62, 0.7, 0.62), glass, 0, 0.47, 0, pack);
    const outerBag = mesh(new THREE.BoxGeometry(0.72, 0.78, 0.72), material(0xeaf6fb, { transparent: true, opacity: 0.55, roughness: 0.2, side: THREE.DoubleSide, depthWrite: false }), 0, 0.51, 0, pack);
    const seal = box(0.74, 0.06, 0.74, material(0x2f7f6f), 0, 0.92, 0, pack);
    const bagChunks = Array.from({ length: 5 }, (_, i) => {
      const chunk = mesh(new THREE.DodecahedronGeometry(0.12, 0), silicon, ((i % 3) - 1) * 0.16, 0.25 + Math.floor(i / 3) * 0.18, (i % 2) * 0.14 - 0.07, pack);
      chunk.rotation.set(i, i * 1.7, 0.2);
      return chunk;
    });

    const arrow = mesh(new THREE.ConeGeometry(0.22, 0.45, 12), arrowMaterial);
    arrow.rotation.x = Math.PI;

    // Particles reused by the conversion and distillation animations.
    const drops = Array.from({ length: 10 }, () => mesh(new THREE.SphereGeometry(0.06, 8, 6), vapour));
    const specks = Array.from({ length: 8 }, () => mesh(new THREE.SphereGeometry(0.05, 6, 4), dirt));

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
    const targetAt = (event: PointerEvent): GermanyTarget | null => {
      const rect = renderer.domElement.getBoundingClientRect();
      raycaster.setFromCamera(new THREE.Vector2((event.clientX - rect.left) / rect.width * 2 - 1, -(event.clientY - rect.top) / rect.height * 2 + 1), camera);
      for (const hit of raycaster.intersectObjects(scene.children, true)) {
        if (!hit.object.visible || hit.object === arrow || (hit.object instanceof THREE.Mesh && noShadow.has(hit.object.material as THREE.Material))) continue;
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

    const order = (phase: GermanyPhase) => GERMANY_PHASES.indexOf(phase);
    const arc = (from: THREE.Vector3, to: THREE.Vector3, t: number, height: number, out: THREE.Vector3) =>
      out.copy(from).lerp(to, t).setY(from.y + (to.y - from.y) * t + Math.sin(t * Math.PI) * height);
    const along = (points: THREE.Vector3[], t: number, out: THREE.Vector3) => {
      const scaled = clamp01(t) * (points.length - 1);
      const i = Math.min(points.length - 2, Math.floor(scaled));
      return out.copy(points[i]).lerp(points[i + 1], scaled - i);
    };
    const level = (fluid: THREE.Mesh, base: number, height: number, fill: number) => {
      fluid.visible = fill > 0.01;
      fluid.scale.y = Math.max(0.01, fill * height);
      fluid.position.y = base + fluid.scale.y / 2;
    };
    const condensePath = [condenserFrom, condenserTo, new THREE.Vector3(receiverA.x, 0.4, receiverA.z)];
    const lightPath = [new THREE.Vector3(-1.65, 0.6, columnZ), new THREE.Vector3(-1.65, 3.4, columnZ), new THREE.Vector3(lightDrum.x, 0.8, lightDrum.z)];
    const heavyPath = [new THREE.Vector3(-0.65, 1.2, columnZ), new THREE.Vector3(-0.65, 0.3, columnZ), new THREE.Vector3(heavyDrum.x, 0.7, heavyDrum.z)];
    const productPath = [new THREE.Vector3(-1.65, 0.6, columnZ), new THREE.Vector3(-1.65, 3.7, columnZ), new THREE.Vector3(-0.65, 3.95, columnZ), new THREE.Vector3(receiverB.x, 1.1, receiverB.z), new THREE.Vector3(receiverB.x, 0.4, receiverB.z)];
    const clock = new THREE.Clock();
    let frame = 0;

    const animate = () => {
      const { phase, progress: p, growth, heat, dust: dusty, feeding, target } = current.current;
      const t = clock.getElapsedTime();
      const now = order(phase);
      const after = (other: GermanyPhase) => now > order(other);
      const from = (other: GermanyPhase) => now >= order(other);

      // Mill: lumps hop from the bag into the mill; powder piles up in the bin.
      lumps.forEach((lump, i) => {
        if (phase === 'milling') {
          const k = span(p, i * 0.08, 0.3 + i * 0.08);
          arc(lumpSpots[i], millTop, ease(k), 0.9, lump.position);
          lump.visible = k < 1;
        } else {
          lump.position.copy(lumpSpots[i]);
          lump.visible = phase === 'mill';
        }
      });
      millBody.position.x = phase === 'milling' && p > 0.3 ? Math.sin(t * 60) * 0.02 : 0;
      const powderLevel = phase === 'milling' ? span(p, 0.35, 1) : phase === 'convert' ? 1 : phase === 'converting' ? 1 - span(p, 0, 0.6) : 0;
      level(powderPile, 0.08, 0.4, powderLevel);

      // Converter: HCl valve opens, liquid compound condenses into receiver A.
      hclValve.rotation.y = phase === 'converting' ? t * 6 : 0;
      const liquidALevel = phase === 'converting' ? span(p, 0.3, 1) : phase === 'distill' ? 1 : phase === 'distilling' ? 1 - span(p, 0, 0.8) : 0;
      level(liquidA, 0.06, 0.85, liquidALevel);

      // Distillation: lighter rejects leave at the top, heavier at the bottom, product condenses into B.
      const liquidBLevel = phase === 'distilling' ? span(p, 0.2, 1) : phase === 'grow' ? 1 : phase === 'growing' ? 1 - 0.7 * growth : after('growing') ? 0.3 : 0;
      level(liquidB, 0.06, 0.95, liquidBLevel);
      drops.forEach((drop, i) => {
        const cycle = (t * 0.45 + i / drops.length) % 1;
        if (phase === 'converting' && p > 0.2) {
          drop.visible = true;
          along(condensePath, cycle, drop.position);
        } else if (phase === 'distilling') {
          drop.visible = true;
          along(productPath, cycle, drop.position);
        } else drop.visible = false;
      });
      specks.forEach((speck, i) => {
        const cycle = (t * 0.4 + i / specks.length) % 1;
        speck.visible = phase === 'distilling';
        along(i % 2 ? lightPath : heavyPath, cycle, speck.position);
      });
      columnWindow.emissiveIntensity = phase === 'distilling' ? 0.6 + Math.sin(t * 5) * 0.1 : 0.15;

      // Reactor: rods thicken with growth; glow follows rod temperature; gas and dust cues.
      const radius = 0.05 + 0.2 * growth;
      rods.forEach(({ mesh: rod, bridge }) => {
        if (bridge) rod.scale.set(radius, rod.userData.length + radius * 2, radius);
        else rod.scale.set(radius, 1, radius);
      });
      const glow = phase === 'grow' || phase === 'growing' || phase === 'open' ? heat : phase === 'opening' ? heat * (1 - span(p, 0, 0.5)) : 0;
      rodMaterial.emissiveIntensity = glow * 1.4;
      sightGlass.emissiveIntensity = glow * 2;
      rodGlow.intensity = glow * 14;
      gasPuffs.forEach((puff, i) => {
        const rise = (t * 0.6 + i / gasPuffs.length) % 1;
        puff.visible = feeding;
        const nozzle = nozzles[i % nozzles.length].position;
        puff.position.set(reactorX + nozzle.x + Math.sin(i * 3 + t) * 0.15, 0.5 + rise * 2.4, nozzle.z - rise * 0.3);
        puff.scale.setScalar(0.8 + rise);
      });
      dust.forEach((speck, i) => {
        speck.visible = dusty && feeding;
        speck.position.set(reactorX + Math.sin(i * 2.1 + t * 0.7) * 1.0, 1.0 + ((i * 0.37 + t * 0.15) % 1) * 2.0, Math.cos(i * 1.3 + t * 0.5) * 0.5);
      });
      lever.rotation.x = from('growing') && !after('growing') ? 0.9 : -0.9;
      indicator.emissiveIntensity = phase === 'growing' && heat > 0 ? 2 : 0;
      dome.position.y = phase === 'opening' ? ease(span(p, 0.45, 1)) * 2.6 : from('break') ? 2.6 : 0;

      // Crusher: rods slide in, chunks drop into the tray, the tray rides through the cleaner.
      rodGroup.visible = !after('breaking') && !(phase === 'breaking' && p > 0.55);
      rodGroup.position.set(0, 0, 0);
      rodGroup.scale.setScalar(1);
      if (phase === 'breaking') {
        const k = ease(span(p, 0, 0.5));
        rodGroup.position.set((5.1 - reactorX) * k, 0.3 * k, -0.7 * k);
        rodGroup.scale.setScalar(1 - 0.6 * k);
      }
      crusherHead.position.y = phase === 'breaking' && p > 0.45 && p < 0.8 ? 1.4 + Math.abs(Math.sin(t * 20)) * 0.12 : 1.55;
      const chunksInTray = (phase === 'breaking' && p > 0.55) || phase === 'clean' || phase === 'cleaning';
      chunks.forEach((chunk, i) => {
        chunk.visible = chunksInTray && !(phase === 'cleaning' && p > 0.6 + i * 0.05);
        chunk.position.copy(chunkSpots[i]);
        if (phase === 'breaking') chunk.position.y += (1 - ease(span(p, 0.55 + i * 0.04, 0.75 + i * 0.04))) * 1.0;
      });
      tray.position.copy(trayHome);
      if (phase === 'cleaning') tray.position.x += ease(span(p, 0, 0.45)) * 1.25;
      cleanerLight.emissiveIntensity = phase === 'cleaning' && p > 0.15 && p < 0.6 ? 2 : 0;

      // Pack: chunks fill the inner bag, then the outer bag and seal appear; the pack leaves.
      bagChunks.forEach((chunk, i) => { chunk.visible = (phase === 'cleaning' && p > 0.62 + i * 0.05) || from('ship'); });
      innerBag.visible = true;
      outerBag.visible = from('ship') || (phase === 'cleaning' && p > 0.88);
      seal.visible = outerBag.visible;
      pack.visible = phase !== 'done';
      pack.position.copy(packHome);
      if (phase === 'shipping') pack.position.x += ease(p) * 4;

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
