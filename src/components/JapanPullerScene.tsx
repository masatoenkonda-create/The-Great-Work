import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';

/** Waiting phases expect one action; melting and growing are driven by the panel, the rest are short animations. */
export const JAPAN_PHASES = [
  'load', 'loading', 'melt', 'melting', 'seed', 'dipping', 'growing', 'tailing',
  'cool', 'cooling', 'cut', 'cutting', 'polish', 'polishing', 'pack', 'packing', 'ship', 'shipping', 'done',
] as const;
export type JapanPhase = typeof JAPAN_PHASES[number];
export type JapanTarget = 'bag' | 'switch' | 'puller' | 'saw' | 'polisher' | 'box';

interface Props {
  phase: JapanPhase;
  progress: number;
  /** How much of the charge has melted, 0..1. */
  melted: number;
  /** Crystal body length grown, 0..1; kept when growth pauses. */
  body: number;
  /** Heater glow 0..1. */
  heat: number;
  rotating: boolean;
  /** 'thin' or 'wide' while the pull speed is off; drives the interface cue. */
  trend: 'thin' | 'wide' | null;
  target: JapanTarget | null;
  onAct: (target: JapanTarget) => void;
}

const ANCHORS: Record<JapanTarget, [number, number, number]> = {
  bag: [-7.5, 1.7, 0.6], switch: [-1.5, 1.9, 2.2], puller: [-3.4, 5.9, 0],
  saw: [2.6, 2.7, 0], polisher: [4.7, 1.6, 0.2], box: [6.9, 2.0, 0.4],
};

const ease = (t: number) => t * t * (3 - 2 * t);
const clamp01 = (t: number) => Math.min(1, Math.max(0, t));
const span = (t: number, a: number, b: number) => clamp01((t - a) / (b - a));

/**
 * Fixed isometric workcell, left to right: Germany's polysilicon bag and the quartz crucible ->
 * Czochralski puller with its front cut away (research J03 Fig. 1) -> cradle with grinder ->
 * multi-wire saw -> polisher -> inspection lamp and front-opening shipping box (J09 slide 14, J05).
 */
export function JapanPullerScene(props: Props) {
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
    renderer.domElement.setAttribute('aria-label', 'Crystal puller cutaway, grinder, wire saw, polisher and wafer shipping box');
    renderer.domElement.setAttribute('role', 'img');
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const pmrem = new THREE.PMREMGenerator(renderer);
    const environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environment = environment;
    scene.environmentIntensity = 0.6;
    const camera = new THREE.OrthographicCamera(-8, 8, 5, -5, 0.1, 80);
    camera.position.set(9, 9.5, 14);
    camera.lookAt(0, 1.9, 0);
    scene.add(new THREE.HemisphereLight(0xc8e5ff, 0x3a2e28, 1.4));
    const sun = new THREE.DirectionalLight(0xfff0dd, 2.2);
    sun.position.set(-5, 12, 8);
    sun.castShadow = true;
    sun.shadow.mapSize.set(2048, 2048);
    Object.assign(sun.shadow.camera, { left: -10, right: 10, top: 8, bottom: -8 });
    scene.add(sun);
    const meltGlow = new THREE.PointLight(0xffb060, 0, 6);
    meltGlow.position.set(-3.0, 1.6, 0.9);
    scene.add(meltGlow);
    const inspectLight = new THREE.SpotLight(0xffffff, 0, 4, 0.5, 0.4);
    inspectLight.position.set(5.9, 2.4, 0.4);
    inspectLight.target.position.set(5.9, 0.6, 0.4);
    scene.add(inspectLight, inspectLight.target);

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
    const cylinder = (r: number, h: number, mat: THREE.Material, x = 0, y = 0, z = 0, parent: THREE.Object3D = scene, segments = 28) =>
      mesh(new THREE.CylinderGeometry(r, r, h, segments), mat, x, y, z, parent);
    const group = (x = 0, y = 0, z = 0, target?: JapanTarget, parent: THREE.Object3D = scene) => {
      const result = new THREE.Group();
      result.position.set(x, y, z);
      if (target) result.userData.target = target;
      parent.add(result);
      return result;
    };

    const floor = material(0x3b4a52, { roughness: 0.95 });
    const steel = material(0x7d8f99, { metalness: 0.65, roughness: 0.38, side: THREE.DoubleSide });
    const darkSteel = material(0x29343b, { metalness: 0.5, roughness: 0.5 });
    const cutFace = material(0xb7c3c9, { metalness: 0.3, roughness: 0.5 });
    const graphite = material(0x2c2c30, { roughness: 0.85, side: THREE.DoubleSide });
    const insulation = material(0x9b9488, { roughness: 1, side: THREE.DoubleSide });
    const quartz = material(0xf4f3ee, { roughness: 0.25, transparent: true, opacity: 0.92, side: THREE.DoubleSide });
    const heaterMaterial = material(0x3a2a24, { emissive: 0xff5a10, emissiveIntensity: 0, side: THREE.DoubleSide });
    const melt = material(0xfff1c8, { emissive: 0xffa040, emissiveIntensity: 1, roughness: 0.15, metalness: 0.2 });
    const chunkMaterial = material(0xa7b0b8, { metalness: 0.85, roughness: 0.28 });
    const crystalMaterial = material(0x9aa4ad, { metalness: 0.75, roughness: 0.3, emissive: 0xff7020, emissiveIntensity: 0 });
    const groundMaterial = material(0x8c949b, { metalness: 0.5, roughness: 0.6 });
    const roughWafer = material(0x868d94, { metalness: 0.4, roughness: 0.85, flatShading: false });
    const mirrorWafer = material(0xd8dee4, { metalness: 1, roughness: 0.06, flatShading: false });
    const bagCloth = material(0xeaf6fb, { transparent: true, opacity: 0.55, roughness: 0.2, side: THREE.DoubleSide, depthWrite: false });
    const wire = material(0xd9d2b8, { metalness: 0.8, roughness: 0.3 });
    const pad = material(0x3d6b8a, { roughness: 0.9 });
    const boxShell = material(0xb9d4e6, { transparent: true, opacity: 0.45, roughness: 0.2, side: THREE.DoubleSide, depthWrite: false });
    const red = material(0xc8332b, { roughness: 0.5 });
    const marker = material(0xfcd34d, { emissive: 0xfcd34d, emissiveIntensity: 0.4 });
    const indicator = material(0x2a3a2a, { emissive: 0x33ff66, emissiveIntensity: 0 });
    const meniscus = new THREE.MeshBasicMaterial({ color: 0xfffbe6, transparent: true, opacity: 0.9, depthWrite: false });
    const slurry = new THREE.MeshBasicMaterial({ color: 0xc9c2a8 });
    const beamMaterial = new THREE.MeshBasicMaterial({ color: 0xfff7d6, transparent: true, opacity: 0, depthWrite: false });
    const arrowMaterial = new THREE.MeshBasicMaterial({ color: 0xfcd34d });
    materials.push(meniscus, slurry, beamMaterial, arrowMaterial);
    const noShadow = new Set<THREE.Material>([bagCloth, boxShell, meniscus, slurry, beamMaterial, arrowMaterial, quartz]);

    box(17.4, 0.2, 7, floor, 0, -0.1, 0).receiveShadow = true;

    // 1. Germany's clean double bag of polysilicon chunks; the quartz crucible waits on a stand.
    const bagHome = new THREE.Vector3(-7.5, 0, 0.6);
    const bag = group(bagHome.x, 0, bagHome.z, 'bag');
    box(0.9, 0.12, 0.9, darkSteel, 0, 0.06, 0, bag);
    mesh(new THREE.BoxGeometry(0.72, 0.78, 0.72), bagCloth, 0, 0.51, 0, bag);
    const chunkSpots = [[-0.18, -0.15], [0.16, -0.18], [0, 0.15], [-0.2, 0.18], [0.2, 0.14], [0, -0.02]].map(([x, z], i) => new THREE.Vector3(bagHome.x + x, 0.28 + (i > 3 ? 0.2 : 0), bagHome.z + z));
    const chunks = chunkSpots.map((spot, i) => {
      const chunk = mesh(new THREE.DodecahedronGeometry(0.13, 0), chunkMaterial, spot.x, spot.y, spot.z);
      chunk.rotation.set(i, i * 1.7, 0.2);
      return chunk;
    });
    const stand = group(-6.3, 0, 1.6, 'bag');
    box(0.8, 0.5, 0.8, darkSteel, 0, 0.25, 0, stand);

    // 2. Czochralski puller: lower hot-zone chamber and narrow upper chamber, front wedge cut away.
    const pullerX = -3.4;
    const puller = group(pullerX, 0, 0, 'puller');
    const cameraAngle = Math.atan2(camera.position.x, camera.position.z);
    const thetaStart = cameraAngle + 0.85;
    const thetaLength = Math.PI * 2 - 1.7;
    const R = 1.45, lowerTop = 2.4;
    cylinder(R + 0.25, 0.3, darkSteel, 0, 0.15, 0, puller, 40);
    mesh(new THREE.CylinderGeometry(R, R, lowerTop - 0.3, 40, 1, true, thetaStart, thetaLength), steel, 0, 0.3 + (lowerTop - 0.3) / 2, 0, puller);
    mesh(new THREE.SphereGeometry(R, 40, 10, thetaStart + Math.PI / 2, thetaLength, 0, Math.PI / 2), steel, 0, lowerTop, 0, puller).scale.y = 0.4;
    for (const theta of [thetaStart, thetaStart + thetaLength]) {
      const face = box(0.08, lowerTop - 0.3, 0.03, cutFace, Math.sin(theta) * (R - 0.04), 0.3 + (lowerTop - 0.3) / 2, Math.cos(theta) * (R - 0.04), puller);
      face.rotation.y = theta - Math.PI / 2;
    }
    const upperR = 0.62, upperBottom = lowerTop + 0.5, upperTop = 5.4;
    cylinder(0.75, 0.25, darkSteel, 0, upperBottom - 0.1, 0, puller);
    box(0.7, 0.18, 0.35, darkSteel, upperR + 0.35, upperBottom - 0.1, 0, puller);
    mesh(new THREE.CylinderGeometry(upperR, upperR, upperTop - upperBottom, 28, 1, true, thetaStart, thetaLength), steel, 0, (upperTop + upperBottom) / 2, 0, puller);
    cylinder(upperR + 0.08, 0.2, darkSteel, 0, upperTop, 0, puller);
    cylinder(0.14, 0.6, darkSteel, 0, upperTop + 0.4, 0, puller);
    // Hot zone: insulation, heater, graphite susceptor on its pedestal, quartz crucible.
    mesh(new THREE.CylinderGeometry(1.22, 1.22, 1.5, 32, 1, true, thetaStart, thetaLength), insulation, 0, 1.15, 0, puller);
    mesh(new THREE.CylinderGeometry(1.0, 1.0, 1.0, 32, 1, true, thetaStart, thetaLength), heaterMaterial, 0, 1.1, 0, puller);
    cylinder(0.12, 0.45, darkSteel, 0, 0.5, 0, puller, 12);
    const crucibleSeat = 0.75;
    const crucibleGroup = group(0, 0, 0, undefined, puller);
    mesh(new THREE.CylinderGeometry(0.86, 0.82, 0.72, 32, 1, true), graphite, 0, crucibleSeat + 0.36, 0, crucibleGroup);
    cylinder(0.82, 0.06, graphite, 0, crucibleSeat, 0, crucibleGroup);
    box(0.1, 0.08, 0.14, marker, 0, crucibleSeat + 0.72, 0.84, crucibleGroup);
    // The quartz crucible moves from its stand into the susceptor during loading.
    const crucible = new THREE.Group();
    scene.add(crucible);
    mesh(new THREE.CylinderGeometry(0.78, 0.74, 0.68, 32, 1, true), quartz, 0, 0.34, 0, crucible);
    cylinder(0.74, 0.04, quartz, 0, 0.02, 0, crucible);
    const crucibleOnStand = new THREE.Vector3(-6.3, 0.5, 1.6);
    const crucibleSeated = new THREE.Vector3(pullerX, crucibleSeat + 0.03, 0);
    const meltMesh = cylinder(0.72, 1, melt, 0, 0, 0, crucible, 32);
    const chargeChunks = Array.from({ length: 9 }, (_, i) => {
      const angle = i * 2.3;
      const chunk = mesh(new THREE.DodecahedronGeometry(0.14, 0), chunkMaterial, Math.sin(angle) * (0.15 + (i % 3) * 0.17), 0.18 + Math.floor(i / 4) * 0.14, Math.cos(angle) * (0.15 + (i % 3) * 0.17), crucible);
      chunk.rotation.set(i, i * 1.3, 0.4);
      return chunk;
    });
    const crucibleRim = new THREE.Vector3(pullerX, 1.9, 0);

    // Crystal hanging from the seed chuck: seed, neck, shoulder cone, body, tail cone.
    const crystal = group(pullerX, 0, 0);
    const cable = cylinder(0.02, 1, darkSteel, 0, 0, 0, crystal, 6);
    const chuck = box(0.16, 0.14, 0.16, darkSteel, 0, 0, 0, crystal);
    box(0.06, 0.05, 0.1, marker, 0.08, 0, 0, chuck);
    const seed = cylinder(0.045, 0.3, crystalMaterial, 0, 0, 0, crystal, 8);
    const neck = cylinder(0.025, 0.35, crystalMaterial, 0, 0, 0, crystal, 8);
    const BODY_R = 0.5, BODY_MAX = 1.6, SHOULDER_H = 0.32, TAIL_H = 0.3;
    const shoulder = mesh(new THREE.CylinderGeometry(0.025, BODY_R, SHOULDER_H, 24), crystalMaterial, 0, 0, 0, crystal);
    const bodyMesh = mesh(new THREE.CylinderGeometry(BODY_R, BODY_R, 1, 24), crystalMaterial, 0, 0, 0, crystal);
    const ridges = [0, 1, 2, 3].map(i => {
      const ridge = box(0.03, 1, 0.03, crystalMaterial, Math.sin(i * Math.PI / 2 + 0.4) * BODY_R, 0, Math.cos(i * Math.PI / 2 + 0.4) * BODY_R, crystal);
      return ridge;
    });
    const tail = mesh(new THREE.CylinderGeometry(BODY_R, 0.04, TAIL_H, 24), crystalMaterial, 0, 0, 0, crystal);
    const ring = mesh(new THREE.TorusGeometry(BODY_R + 0.04, 0.035, 8, 40), meniscus, pullerX, 0, 0);
    ring.rotation.x = Math.PI / 2;

    // Heater switch box.
    const switchBox = group(-1.5, 0, 2.2, 'switch');
    box(0.15, 1, 0.15, darkSteel, 0, 0.5, 0, switchBox);
    box(0.6, 0.6, 0.3, steel, 0, 1.15, 0, switchBox);
    const lever = box(0.08, 0.4, 0.08, red, 0, 1.15, 0.2, switchBox);
    lever.geometry.translate(0, 0.18, 0);
    mesh(new THREE.SphereGeometry(0.07, 10, 8), indicator, 0.18, 1.35, 0.16, switchBox);

    // 3. Cradle with grinding wheel; crown and tail drop into a scrap bin.
    const cradleX = 0.3;
    box(1.2, 0.5, 2.2, darkSteel, cradleX, 0.25, 0);
    const wheel = cylinder(0.32, 0.12, material(0xc9a66b, { roughness: 1 }), cradleX + 0.75, 1.0, 0, scene, 20);
    wheel.rotation.z = Math.PI / 2;
    const scrapBin = new THREE.Vector3(cradleX - 1.0, 0, 1.6);
    box(0.6, 0.35, 0.6, darkSteel, scrapBin.x, 0.18, scrapBin.z);
    // The horizontal ingot (axis along z) that is ground, sawn and becomes wafers.
    const ingot = new THREE.Group();
    scene.add(ingot);
    const ingotLength = 1.4;
    const ingotBody = mesh(new THREE.CylinderGeometry(BODY_R, BODY_R, ingotLength, 28), crystalMaterial, 0, 0, 0, ingot);
    ingotBody.rotation.x = Math.PI / 2;
    const crown = mesh(new THREE.CylinderGeometry(0.03, BODY_R, SHOULDER_H, 24), crystalMaterial, 0, 0, -ingotLength / 2 - SHOULDER_H / 2, scene);
    crown.rotation.x = -Math.PI / 2;
    const tailEnd = mesh(new THREE.CylinderGeometry(BODY_R, 0.04, TAIL_H, 24), crystalMaterial, 0, 0, 0, scene);
    tailEnd.rotation.x = -Math.PI / 2;
    const beam = box(0.3, 0.14, ingotLength, darkSteel, 0, BODY_R + 0.07, 0, ingot);
    const cradleSpot = new THREE.Vector3(cradleX, 0.5 + BODY_R, 0);

    // 4. Multi-wire saw: guide rollers with a web of parallel wires; slurry drips from the nozzle above.
    const sawX = 2.6;
    const saw = group(sawX, 0, 0, 'saw');
    for (const x of [-0.9, 0.9]) {
      box(0.18, 1.2, 1.9, darkSteel, x, 0.6, 0, saw);
      const roller = cylinder(0.2, 1.7, steel, x * 0.8, 0.95, 0, saw, 16);
      roller.rotation.x = Math.PI / 2;
    }
    const WIRES = 11;
    const wireZ = (i: number) => -0.62 + (i * 1.24) / (WIRES - 1);
    for (let i = 0; i < WIRES; i++) box(1.44, 0.02, 0.02, wire, 0, 1.16, wireZ(i), saw);
    box(0.5, 0.12, 1.6, steel, 0, 2.55, 0, saw);
    for (const z of [-0.85, 0.85]) box(0.1, 1.5, 0.1, darkSteel, 0.3, 1.8, z, saw);
    const drips = Array.from({ length: 8 }, () => mesh(new THREE.SphereGeometry(0.035, 6, 4), slurry));

    // 5. Polisher: rotating pad under a carrier; a rack holds the wafers on edge.
    const polishX = 4.7;
    const polisher = group(polishX, 0, 0.2, 'polisher');
    box(1.5, 0.7, 1.5, steel, 0, 0.35, 0, polisher);
    const padMesh = cylinder(0.68, 0.06, pad, 0, 0.73, 0, polisher, 32);
    const carrier = cylinder(0.3, 0.12, darkSteel, 0.25, 1.15, 0.1, polisher, 20);
    const rackSpot = new THREE.Vector3(polishX, 0, -1.4);
    box(1.6, 0.08, 0.5, darkSteel, rackSpot.x, 0.04, rackSpot.z);
    const WAFERS = 10;
    const wafers = Array.from({ length: WAFERS }, () => {
      const wafer = mesh(new THREE.CylinderGeometry(BODY_R, BODY_R, 0.04, 32), roughWafer);
      return wafer;
    });

    // 6. Inspection lamp and the front-opening shipping box.
    const lampPost = group(5.9, 0, 0.4);
    box(0.1, 2.5, 0.1, darkSteel, -0.5, 1.25, 0, lampPost);
    box(0.6, 0.1, 0.1, darkSteel, -0.2, 2.5, 0, lampPost);
    cylinder(0.16, 0.18, darkSteel, 0, 2.42, 0, lampPost, 12);
    const beamCone = mesh(new THREE.ConeGeometry(0.55, 1.8, 20, 1, true), beamMaterial, 5.9, 1.45, 0.4);
    const boxHome = new THREE.Vector3(7.0, 0, 0.4);
    const shipBox = group(boxHome.x, 0, boxHome.z, 'box');
    box(1.1, 0.1, 1.2, darkSteel, 0, 0.05, 0, shipBox);
    mesh(new THREE.BoxGeometry(1.0, 1.25, 0.9), boxShell, 0, 0.72, 0, shipBox);
    for (let i = 0; i < 6; i++) box(0.04, 0.06, 0.8, darkSteel, -0.42 + i * 0.17, 0.2, 0, shipBox);
    const door = box(1.02, 1.27, 0.05, material(0x5c87a3, { metalness: 0.2, roughness: 0.4 }), 0, 0.72, 0.48, shipBox);
    door.geometry.translate(0.51, 0, 0);
    door.position.x = -0.51;
    const slot = (i: number) => new THREE.Vector3(boxHome.x - 0.41 + i * 0.091, 0.75, boxHome.z);

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
    const targetAt = (event: PointerEvent): JapanTarget | null => {
      const rect = renderer.domElement.getBoundingClientRect();
      raycaster.setFromCamera(new THREE.Vector2((event.clientX - rect.left) / rect.width * 2 - 1, -(event.clientY - rect.top) / rect.height * 2 + 1), camera);
      for (const hit of raycaster.intersectObjects(scene.children, true)) {
        if (!hit.object.visible || hit.object === arrow) continue;
        if (hit.object instanceof THREE.Mesh && (hit.object.material === beamMaterial || hit.object.material === meniscus)) continue;
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

    const order = (phase: JapanPhase) => JAPAN_PHASES.indexOf(phase);
    const arc = (from: THREE.Vector3, to: THREE.Vector3, t: number, height: number, out: THREE.Vector3) =>
      out.copy(from).lerp(to, t).setY(from.y + (to.y - from.y) * t + Math.sin(t * Math.PI) * height);
    const sawTop = new THREE.Vector3(sawX, 2.0, 0);
    const sawBottom = new THREE.Vector3(sawX, 0.55, 0);
    const clock = new THREE.Clock();
    let frame = 0;
    let spin = 0;
    let padSpin = 0;
    let last = 0;

    const animate = () => {
      const { phase, progress: p, melted, body, heat, rotating, trend, target } = current.current;
      const t = clock.getElapsedTime();
      const dt = Math.min(0.1, t - last);
      last = t;
      const now = order(phase);
      const after = (other: JapanPhase) => now > order(other);
      const from = (other: JapanPhase) => now >= order(other);

      // Loading: the crucible seats in the susceptor, then the chunks hop in.
      if (phase === 'load') crucible.position.copy(crucibleOnStand);
      else if (phase === 'loading') arc(crucibleOnStand, crucibleSeated, ease(span(p, 0, 0.35)), 1.6, crucible.position);
      else crucible.position.copy(crucibleSeated);
      chunks.forEach((chunk, i) => {
        if (phase === 'loading') {
          const k = span(p, 0.35 + i * 0.08, 0.6 + i * 0.08);
          arc(chunkSpots[i], crucibleRim, ease(k), 1.2, chunk.position);
          chunk.visible = k < 1;
        } else {
          chunk.position.copy(chunkSpots[i]);
          chunk.visible = phase === 'load';
        }
      });
      const chargeIn = phase === 'loading' ? span(p, 0.45, 1) : from('melt') ? 1 : 0;
      chargeChunks.forEach((chunk, i) => {
        chunk.visible = i < chargeIn * chargeChunks.length && melted < 0.98;
        chunk.scale.setScalar(Math.max(0.05, 1 - melted));
      });

      // Melt level: rises as the charge melts, falls as the crystal body grows.
      const meltLevel = from('cool') ? 0.08 : melted * (0.55 - 0.42 * body);
      meltMesh.visible = meltLevel > 0.01;
      meltMesh.scale.y = Math.max(0.01, meltLevel);
      meltMesh.position.y = 0.04 + meltMesh.scale.y / 2;
      const meltY = crucible.position.y + 0.04 + meltLevel;
      melt.emissiveIntensity = 0.6 + heat * 0.8;
      heaterMaterial.emissiveIntensity = heat * 1.6;
      meltGlow.intensity = heat * 10 * (melted > 0.05 ? 1 : 0.4);

      // Rotation: crystal one way, crucible the other.
      if (rotating && (phase === 'growing' || phase === 'dipping' || phase === 'tailing')) spin += dt * 1.2;
      crystal.rotation.y = spin;
      crucibleGroup.rotation.y = -spin * 0.6;
      crucible.rotation.y = -spin * 0.6;

      // Crystal stack, built bottom-up from the melt surface while growing.
      const dip = phase === 'dipping' ? p : from('growing') ? 1 : 0;
      const neckLen = 0.35 * span(dip, 0.35, 0.6);
      const shoulderScale = span(dip, 0.6, 1);
      const bodyLen = from('growing') ? 0.02 + BODY_MAX * body : 0;
      const tailScale = phase === 'tailing' ? span(p, 0, 0.7) : from('cool') ? 1 : 0;
      const seedDrop = phase === 'dipping' ? ease(span(p, 0, 0.35)) : from('growing') ? 1 : 0;
      let lift = 0;
      if (phase === 'tailing') lift = span(p, 0.7, 1) * 0.3;
      if (phase === 'cool') lift = 0.3;
      if (phase === 'cooling') lift = 0.3 + ease(span(p, 0, 0.4)) * 1.2;
      let y = meltY + lift;
      const showCrystal = !(phase === 'cooling' && p > 0.45) && !after('cooling');
      crystal.visible = showCrystal;
      tail.visible = tailScale > 0.01;
      tail.scale.set(1, Math.max(0.01, tailScale), 1);
      tail.position.y = y + (TAIL_H * tailScale) / 2;
      y += TAIL_H * tailScale;
      bodyMesh.visible = bodyLen > 0;
      bodyMesh.scale.y = Math.max(0.01, bodyLen);
      bodyMesh.position.y = y + bodyLen / 2;
      ridges.forEach(ridge => {
        ridge.visible = bodyLen > 0.05;
        ridge.scale.y = Math.max(0.01, bodyLen);
        ridge.position.y = y + bodyLen / 2;
      });
      y += bodyLen;
      shoulder.visible = shoulderScale > 0.01;
      shoulder.scale.set(Math.max(0.05, shoulderScale), Math.max(0.01, shoulderScale), Math.max(0.05, shoulderScale));
      shoulder.position.y = y + (SHOULDER_H * shoulderScale) / 2;
      y += SHOULDER_H * shoulderScale;
      neck.visible = neckLen > 0.01;
      neck.scale.y = Math.max(0.01, neckLen / 0.35);
      neck.position.y = y + neckLen / 2;
      y += neckLen;
      // Before dipping the seed hangs high in the upper chamber.
      const seedBottom = from('growing') || phase === 'dipping' ? y + (1 - seedDrop) * 2.2 : upperBottom + 0.4;
      seed.position.y = seedBottom + 0.15;
      chuck.position.y = seedBottom + 0.37;
      const cableTop = upperTop + 0.1;
      cable.scale.y = Math.max(0.01, cableTop - (seedBottom + 0.44));
      cable.position.y = (cableTop + seedBottom + 0.44) / 2;
      crystalMaterial.emissiveIntensity = phase === 'cooling' ? 0.5 * (1 - span(p, 0, 0.4)) : from('growing') && !after('tailing') ? 0.35 * heat : 0;

      // Meniscus: a bright ring at the growth interface; it pulses when the pull is off target.
      const growingNow = phase === 'growing' || (phase === 'tailing' && p < 0.7);
      ring.visible = growingNow && bodyLen > 0;
      ring.position.set(pullerX, meltY + 0.01, 0);
      const ringScale = trend === 'thin' ? 0.82 + Math.sin(t * 6) * 0.04 : trend === 'wide' ? 1.15 + Math.sin(t * 6) * 0.04 : 1;
      ring.scale.set(ringScale, ringScale, 1);
      meniscus.color.setHex(trend ? 0xfcd34d : 0xfffbe6);

      // Cooling and transfer: the crystal leaves the puller; the body section lies on the cradle,
      // the crown and tail are cropped into the scrap bin and the body is ground round.
      const onCradle = (phase === 'cooling' && p > 0.45) || phase === 'cut';
      const cropping = phase === 'cooling' ? span(p, 0.55, 0.8) : 1;
      ingot.visible = onCradle || phase === 'cutting';
      crown.visible = phase === 'cooling' && p > 0.45 && cropping < 1;
      tailEnd.visible = crown.visible;
      if (onCradle) ingot.position.copy(cradleSpot);
      if (phase === 'cooling') {
        const dropTo = new THREE.Vector3(scrapBin.x, 0.5, scrapBin.z);
        arc(new THREE.Vector3(cradleX, cradleSpot.y, -ingotLength / 2 - SHOULDER_H / 2), dropTo, ease(cropping), 0.6, crown.position);
        arc(new THREE.Vector3(cradleX, cradleSpot.y, ingotLength / 2 + TAIL_H / 2), dropTo, ease(cropping), 0.6, tailEnd.position);
      }
      const ground = phase === 'cooling' ? span(p, 0.8, 1) : from('cut') ? 1 : 0;
      ingotBody.material = ground > 0.5 ? groundMaterial : crystalMaterial;
      wheel.rotation.x = phase === 'cooling' && ground > 0 && ground < 1 ? t * 20 : 0;
      wheel.position.y = phase === 'cooling' && ground > 0 && ground < 1 ? cradleSpot.y : 1.0;

      // Saw: the ingot, glued to its beam, is lowered through the moving wire web.
      if (phase === 'cutting') {
        const k = ease(span(p, 0, 0.15));
        if (k < 1) arc(cradleSpot, sawTop, k, 0.4, ingot.position);
        else ingot.position.copy(sawTop).lerp(sawBottom, ease(span(p, 0.15, 0.9)));
        ingot.visible = p < 0.9;
      }
      beam.visible = true;
      drips.forEach((drip, i) => {
        const fall = (t * 1.4 + i / drips.length) % 1;
        drip.visible = phase === 'cutting' && p > 0.15 && p < 0.9;
        drip.position.set(sawX + Math.sin(i * 2.7) * 0.15, 2.45 - fall * 1.3, wireZ(i % WIRES));
      });

      // Wafers: appear in the saw, move to the rack, one is polished, all turn mirror-bright,
      // one is inspected, then all slide into the shipping box.
      const mirror = phase === 'polishing' ? p > 0.8 : from('pack');
      wafers.forEach((wafer, i) => {
        wafer.material = mirror ? mirrorWafer : roughWafer;
        const inSaw = new THREE.Vector3(sawX, 0.55, wireZ(i));
        const inRack = new THREE.Vector3(rackSpot.x - 0.67 + i * 0.15, 0.55, rackSpot.z);
        wafer.visible = (phase === 'cutting' && p > 0.88) || (from('polish') && phase !== 'done');
        wafer.rotation.set(Math.PI / 2, 0, 0);
        if (phase === 'cutting' || phase === 'polish') {
          wafer.position.copy(inSaw);
        } else if (phase === 'polishing') {
          const k = ease(span(p, 0, 0.2));
          wafer.position.copy(inSaw).lerp(inRack, k);
          wafer.rotation.set(Math.PI / 2, 0, Math.PI / 2 * k);
          if (i === 0 && p > 0.2 && p < 0.85) {
            wafer.position.set(polishX + 0.25, 0.79, 0.3);
            wafer.rotation.set(0, padSpin, 0);
          }
        } else if (phase === 'pack') {
          wafer.position.copy(inRack);
          wafer.rotation.set(Math.PI / 2, 0, Math.PI / 2);
        } else if (phase === 'packing') {
          wafer.rotation.set(Math.PI / 2, 0, Math.PI / 2);
          if (i === 0 && p < 0.35) {
            wafer.position.copy(inRack).lerp(new THREE.Vector3(5.9, 0.75, 0.4), ease(span(p, 0, 0.12)));
          } else {
            const k = ease(span(p, 0.35 + i * 0.04, 0.55 + i * 0.04));
            const start = i === 0 ? new THREE.Vector3(5.9, 0.75, 0.4) : inRack;
            arc(start, slot(i), k, 0.5, wafer.position);
          }
        } else if (phase === 'ship' || phase === 'shipping') {
          wafer.rotation.set(Math.PI / 2, 0, Math.PI / 2);
          wafer.position.copy(slot(i));
          if (phase === 'shipping') wafer.position.x += ease(p) * 4;
        }
      });
      if (phase === 'polishing' && p > 0.2 && p < 0.85) padSpin += dt * 6;
      padMesh.rotation.y = padSpin;
      carrier.rotation.y = -padSpin * 0.7;
      carrier.position.y = phase === 'polishing' && p > 0.2 && p < 0.85 ? 0.88 : 1.15;

      const inspecting = phase === 'packing' && p > 0.1 && p < 0.35;
      beamMaterial.opacity = inspecting ? 0.25 : 0;
      beamCone.visible = inspecting;
      inspectLight.intensity = inspecting ? 30 : 0;
      door.rotation.y = phase === 'packing' ? -Math.PI / 2 * (1 - span(p, 0.85, 1)) : from('ship') ? 0 : -Math.PI / 2;
      shipBox.visible = phase !== 'done';
      shipBox.position.copy(boxHome);
      if (phase === 'shipping') shipBox.position.x += ease(p) * 4;
      lever.rotation.x = from('melting') && !after('tailing') ? 0.9 : -0.9;
      indicator.emissiveIntensity = heat > 0.05 && !after('tailing') ? 2 : 0;

      arrow.visible = Boolean(target);
      if (target) {
        const [x, ay, z] = ANCHORS[target];
        arrow.position.set(x, ay + 0.35 + Math.sin(t * 4) * 0.12, z);
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
