import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';

/** Waiting phases expect one object action; the -ing phases are short animations between them. */
export const SMELTER_PHASES = [
  'mine', 'mining', 'break', 'breaking', 'loadQuartz', 'loadingQuartz', 'loadCarbon', 'loadingCarbon',
  'power', 'smelting', 'tap', 'pouring', 'cooling', 'breakCast', 'breakingCast', 'bag', 'bagging',
  'ship', 'shipping', 'done',
] as const;
export type SmelterPhase = typeof SMELTER_PHASES[number];
export type SmelterTarget = 'outcrop' | 'bigRock' | 'quartzBin' | 'carbonBin' | 'furnace' | 'switch' | 'tap' | 'cast' | 'lumps' | 'bag';

interface Props {
  phase: SmelterPhase;
  progress: number;
  /** The object the player should use next, or null while an animation runs. */
  target: SmelterTarget | null;
  onAct: (target: SmelterTarget) => void;
}

const ANCHORS: Record<SmelterTarget, [number, number, number]> = {
  outcrop: [-7, 2.3, 0], bigRock: [-5, 1.5, 0], quartzBin: [-3.1, 1.3, 1], carbonBin: [-3.1, 1.3, -0.8],
  furnace: [0, 5.2, 0], switch: [-2.5, 1.7, 2.1], tap: [2.7, 1.6, 0.9], cast: [4, 1.2, -0.8], lumps: [4, 1.2, -0.8], bag: [6.1, 2.2, -0.8],
};

const ease = (t: number) => t * t * (3 - 2 * t);
const clamp01 = (t: number) => Math.min(1, Math.max(0, t));
/** Local 0..1 progress of a sub-interval [a, b] of the phase. */
const span = (t: number, a: number, b: number) => clamp01((t - a) / (b - a));

/**
 * Fixed isometric workcell, left to right: quartz outcrop -> breaking pad -> feed bins ->
 * three-electrode furnace (front wedge cut away) -> runner and mould -> shipping bag.
 */
export function NorwaySmelterScene(props: Props) {
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
    renderer.domElement.setAttribute('aria-label', 'Quartz outcrop, electric furnace cutaway, casting mould and shipping bag');
    renderer.domElement.setAttribute('role', 'img');
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const pmrem = new THREE.PMREMGenerator(renderer);
    const environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environment = environment;
    scene.environmentIntensity = 0.55;
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
    const furnaceGlow = new THREE.PointLight(0xff7a1f, 0, 7);
    furnaceGlow.position.set(0.6, 1.1, 1.2);
    scene.add(furnaceGlow);
    const mouldGlow = new THREE.PointLight(0xff7a1f, 0, 5);
    mouldGlow.position.set(4, 1.2, -0.3);
    scene.add(mouldGlow);

    const geometries: THREE.BufferGeometry[] = [];
    const materials: THREE.Material[] = [];
    const material = (color: number, options: THREE.MeshStandardMaterialParameters = {}) => {
      const result = new THREE.MeshStandardMaterial({ color, roughness: 0.7, flatShading: true, ...options });
      materials.push(result);
      return result;
    };
    const geo = <G extends THREE.BufferGeometry>(geometry: G) => { geometries.push(geometry); return geometry; };
    const mesh = (geometry: THREE.BufferGeometry, mat: THREE.Material, x = 0, y = 0, z = 0, parent: THREE.Object3D = scene) => {
      const result = new THREE.Mesh(geo(geometry), mat);
      result.position.set(x, y, z);
      parent.add(result);
      return result;
    };
    const box = (w: number, h: number, d: number, mat: THREE.Material, x = 0, y = 0, z = 0, parent: THREE.Object3D = scene) =>
      mesh(new THREE.BoxGeometry(w, h, d), mat, x, y, z, parent);
    const tag = <T extends THREE.Object3D>(object: T, target: SmelterTarget) => { object.userData.target = target; return object; };

    const floor = material(0x3b4a52, { roughness: 0.95 });
    const steel = material(0x5d717b, { metalness: 0.6, roughness: 0.45 });
    const darkSteel = material(0x29343b, { metalness: 0.5, roughness: 0.5 });
    const lining = material(0xa0573c, { roughness: 0.9 });
    const cutFace = material(0xc98e6a, { roughness: 0.9 });
    const bedrock = material(0x7d838a, { roughness: 1 });
    const quartz = material(0xeeeadf, { roughness: 0.55 });
    const carbon = material(0x1f1c1e, { roughness: 1 });
    const wood = material(0x8a5a32, { roughness: 0.9, flatShading: false });
    const electrode = material(0x1b1d20, { roughness: 0.6 });
    const electrodeTips: THREE.MeshStandardMaterial[] = [];
    const liquid = material(0xffa43a, { emissive: 0xff5a00, emissiveIntensity: 1.2, roughness: 0.3 });
    const cast = material(0xb7c0c9, { metalness: 0.9, roughness: 0.25, emissive: 0xff5a00 });
    const silicon = material(0xb7c0c9, { metalness: 0.9, roughness: 0.22 });
    const bagCloth = material(0xe9e4d6, { roughness: 1 });
    const red = material(0xc8332b, { roughness: 0.5 });
    const indicator = material(0x2a3a2a, { emissive: 0x33ff66, emissiveIntensity: 0 });
    const glowMaterial = new THREE.MeshBasicMaterial({ color: 0xff7a1f, transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending });
    const gasMaterial = new THREE.MeshStandardMaterial({ color: 0xb9b4ad, transparent: true, opacity: 0.55, roughness: 1, depthWrite: false });
    const arrowMaterial = new THREE.MeshBasicMaterial({ color: 0xfcd34d });
    materials.push(glowMaterial, gasMaterial, arrowMaterial);

    // Ground.
    box(17, 0.2, 7, floor, 0, -0.1, 0).receiveShadow = true;

    // 1. Outcrop: grey bedrock with pale quartz showing through, and one block the pickaxe frees.
    const outcrop = new THREE.Group();
    outcrop.position.set(-7.1, 0, 0);
    scene.add(outcrop);
    const mound = mesh(new THREE.DodecahedronGeometry(1.3, 0), bedrock, 0, 0.7, -0.2, outcrop);
    mound.scale.set(1.1, 0.85, 0.9);
    for (const [x, y, z, s] of [[-0.5, 1.3, 0.3, 0.45], [0.35, 1.45, -0.4, 0.5], [-0.2, 0.6, 0.85, 0.4]]) {
      mesh(new THREE.DodecahedronGeometry(s, 0), quartz, x, y, z, outcrop).rotation.set(x, y, z);
    }
    tag(outcrop, 'outcrop');
    const freeBlock = mesh(new THREE.DodecahedronGeometry(0.5, 0), quartz);
    freeBlock.scale.set(1.15, 0.85, 1);
    const blockOnOutcrop = new THREE.Vector3(-6.3, 1.1, 0.55);
    const blockOnPad = new THREE.Vector3(-5, 0.68, 0);
    tag(freeBlock, 'bigRock');

    const pickaxe = new THREE.Group();
    scene.add(pickaxe);
    mesh(new THREE.CylinderGeometry(0.06, 0.06, 1.6, 8), wood, 0, 0.8, 0, pickaxe);
    box(1.1, 0.12, 0.14, darkSteel, 0, 1.55, 0, pickaxe);
    tag(pickaxe, 'outcrop');

    // 2. Breaking pad with hammer.
    tag(box(1.8, 0.24, 1.6, darkSteel, -5, 0.12, 0), 'bigRock');
    const makeHammer = () => {
      const hammer = new THREE.Group();
      scene.add(hammer);
      mesh(new THREE.CylinderGeometry(0.05, 0.05, 1.1, 8), wood, 0, 0.55, 0, hammer);
      box(0.22, 0.22, 0.45, darkSteel, 0, 1.12, 0, hammer);
      return hammer;
    };
    const rockHammer = makeHammer();
    tag(rockHammer, 'bigRock');

    // Quartz chunks from the broken block; positions are filled in per frame.
    const chunkSpots = [[-0.35, -0.3], [0.3, -0.25], [0, 0.25], [-0.4, 0.35], [0.4, 0.35]].map(([x, z]) => new THREE.Vector3(-5 + x, 0.42, z));
    const quartzChunks = chunkSpots.map((_, i) => {
      const chunk = mesh(new THREE.DodecahedronGeometry(0.2 + (i % 2) * 0.04, 0), quartz);
      chunk.rotation.set(i, i * 2, 0.3);
      return tag(chunk, 'quartzBin');
    });

    // 3. Feed bins (prepared portions) beside the furnace.
    const makeBin = (z: number, target: SmelterTarget) => {
      const bin = new THREE.Group();
      bin.position.set(-3.1, 0, z);
      scene.add(bin);
      box(1.1, 0.1, 1.1, steel, 0, 0.05, 0, bin);
      for (const [w, d, x, zz] of [[1.1, 0.08, 0, 0.51], [1.1, 0.08, 0, -0.51], [0.08, 1.1, 0.51, 0], [0.08, 1.1, -0.51, 0]]) box(w, 0.6, d, steel, x, 0.35, zz, bin);
      return tag(bin, target);
    };
    const quartzBin = makeBin(1, 'quartzBin');
    const carbonBin = makeBin(-0.8, 'carbonBin');
    const binSpots = (bin: THREE.Group) => [[-0.25, -0.2], [0.22, -0.22], [0, 0.18], [-0.24, 0.24], [0.25, 0.2]].map(([x, z], i) => new THREE.Vector3(bin.position.x + x, 0.32 + (i % 2) * 0.08, bin.position.z + z));
    const quartzBinSpots = binSpots(quartzBin);
    const carbonBinSpots = binSpots(carbonBin);
    const carbonChunks = carbonBinSpots.map((spot, i) => {
      const chunk = mesh(new THREE.DodecahedronGeometry(0.19, 0), carbon, spot.x, spot.y, spot.z);
      chunk.rotation.set(i * 1.3, i, 0.5);
      return tag(chunk, 'carbonBin');
    });
    const feedOpening = new THREE.Vector3(0.3, 3.9, 0.2);

    // 4. Furnace: round lined shell with the wedge facing the camera removed.
    const R = 1.9, r = 1.6, H = 2.6, base = 0.3;
    const cameraAngle = Math.atan2(camera.position.x, camera.position.z);
    const thetaStart = cameraAngle + 0.95;
    const thetaLength = Math.PI * 2 - 1.9;
    const furnace = new THREE.Group();
    scene.add(furnace);
    tag(furnace, 'furnace');
    mesh(new THREE.CylinderGeometry(R + 0.2, R + 0.25, base, 40), darkSteel, 0, base / 2, 0, furnace);
    const sector = (radius: number, height: number, y: number, mat: THREE.Material, open: boolean) => {
      const part = mesh(new THREE.CylinderGeometry(radius, radius, height, 40, 1, open, thetaStart, thetaLength), mat, 0, y, 0, furnace);
      if (open) (mat as THREE.MeshStandardMaterial).side = THREE.DoubleSide;
      return part;
    };
    sector(R, H, base + H / 2, steel, true);
    sector(r, H, base + H / 2, lining, true);
    sector(r, 0.35, base + 0.175, lining, false);
    // Cut faces show the wall thickness, so the vessel reads as sectioned rather than open.
    for (const theta of [thetaStart, thetaStart + thetaLength]) {
      const face = box(R - r, H, 0.03, cutFace, Math.sin(theta) * (R + r) / 2, base + H / 2, Math.cos(theta) * (R + r) / 2, furnace);
      face.rotation.y = theta - Math.PI / 2;
    }
    // Hood with a central feed opening and one exhaust duct.
    const hood = mesh(new THREE.CylinderGeometry(0.95, R + 0.1, 0.7, 40, 1, true, thetaStart, thetaLength), steel, 0, base + H + 0.45, 0, furnace);
    (hood.material as THREE.MeshStandardMaterial).side = THREE.DoubleSide;
    const duct = mesh(new THREE.CylinderGeometry(0.32, 0.32, 2.6, 16), darkSteel, -1.2, base + H + 1.4, -1.3, furnace);
    duct.rotation.set(-0.5, 0, 0.45);
    // Three round electrodes in a triangle, held by clamps under a support beam.
    const electrodeAngles = [Math.PI, Math.PI + 2.1, Math.PI - 2.1].map(a => a + cameraAngle);
    const electrodes = electrodeAngles.map(angle => {
      const group = new THREE.Group();
      group.position.set(Math.sin(angle) * 0.75, 0, Math.cos(angle) * 0.75);
      furnace.add(group);
      mesh(new THREE.CylinderGeometry(0.28, 0.28, 3.4, 20), electrode, 0, 2.95, 0, group);
      const tipMaterial = material(0x1b1d20, { emissive: 0xff6a10, emissiveIntensity: 0 });
      electrodeTips.push(tipMaterial);
      mesh(new THREE.CylinderGeometry(0.28, 0.24, 0.35, 20), tipMaterial, 0, 1.1, 0, group);
      mesh(new THREE.CylinderGeometry(0.38, 0.38, 0.3, 16), steel, 0, 3.95, 0, group);
      return group;
    });
    box(3.2, 0.3, 0.4, darkSteel, 0, 4.85, -0.2, furnace);
    for (const x of [-1.5, 1.5]) box(0.25, 4.85, 0.25, darkSteel, x, 2.42, -2.3, furnace);

    // Charge inside the vessel: lumps only in the part that is not cut away.
    const insideAngle = () => thetaStart + 0.15 + Math.random() * (thetaLength - 0.3);
    const chargeGroup = new THREE.Group();
    furnace.add(chargeGroup);
    const placeCharge = (count: number, mat: THREE.Material, size: number) => Array.from({ length: count }, (_, i) => {
      const angle = insideAngle();
      const radius = 0.35 + Math.random() * 1.05;
      const lump = mesh(new THREE.DodecahedronGeometry(size * (0.8 + Math.random() * 0.4), 0), mat, Math.sin(angle) * radius, 0.75 + (i / count) * 1.6 + Math.random() * 0.2, Math.cos(angle) * radius, chargeGroup);
      lump.rotation.set(Math.random() * 3, Math.random() * 3, 0);
      return lump;
    });
    const quartzCharge = placeCharge(26, quartz, 0.22);
    const carbonCharge = placeCharge(18, carbon, 0.2);
    // Reaction zone low in the charge, under the electrode tips.
    const reactionGlow = mesh(new THREE.SphereGeometry(1.1, 24, 12), glowMaterial, 0, 0.95, 0, furnace);
    reactionGlow.scale.set(1.2, 0.45, 1.2);
    const pool = mesh(new THREE.CylinderGeometry(r - 0.03, r - 0.03, 1, 40, 1, false, thetaStart, thetaLength), liquid, 0, base + 0.35, 0, furnace);
    const gas = Array.from({ length: 10 }, () => mesh(new THREE.SphereGeometry(0.12, 8, 6), gasMaterial));

    // Power switch box beside the furnace.
    const switchBox = new THREE.Group();
    switchBox.position.set(-2.5, 0, 2.1);
    scene.add(switchBox);
    box(0.15, 1, 0.15, darkSteel, 0, 0.5, 0, switchBox);
    box(0.6, 0.6, 0.3, steel, 0, 1.15, 0, switchBox);
    const lever = box(0.08, 0.4, 0.08, red, 0, 1.15, 0.2, switchBox);
    lever.geometry.translate(0, 0.18, 0);
    mesh(new THREE.SphereGeometry(0.07, 10, 8), indicator, 0.18, 1.35, 0.16, switchBox);
    tag(switchBox, 'switch');

    // 5. Low side taphole, runner and remote tapping control.
    const tapAngle = thetaStart + 0.55;
    const taphole = new THREE.Vector3(Math.sin(tapAngle) * R, base + 0.3, Math.cos(tapAngle) * R);
    const mouldCenter = new THREE.Vector3(4, 0, -0.8);
    box(0.3, 0.3, 0.3, darkSteel, taphole.x, taphole.y, taphole.z);
    const runnerStart = taphole.clone().add(new THREE.Vector3(0.1, 0, 0));
    const runnerEnd = new THREE.Vector3(mouldCenter.x - 0.7, 0.42, mouldCenter.z);
    const runnerLength = runnerStart.distanceTo(runnerEnd);
    const runner = new THREE.Group();
    runner.position.copy(runnerStart).lerp(runnerEnd, 0.5);
    runner.lookAt(runnerEnd);
    scene.add(runner);
    box(0.36, 0.08, runnerLength, darkSteel, 0, -0.06, 0, runner);
    for (const x of [-0.17, 0.17]) box(0.04, 0.14, runnerLength, darkSteel, x, 0, 0, runner);
    const stream = box(0.2, 0.05, runnerLength, liquid, 0, 0, 0, runner);
    const tapControl = new THREE.Group();
    tapControl.position.set(2.7, 0, 0.9);
    scene.add(tapControl);
    box(0.4, 0.9, 0.4, steel, 0, 0.45, 0, tapControl);
    const tapButton = mesh(new THREE.CylinderGeometry(0.13, 0.13, 0.12, 16), red, 0, 0.95, 0, tapControl);
    tag(tapControl, 'tap');

    // 6. Mould, casting and the second hammer.
    box(1.8, 0.12, 1.3, darkSteel, mouldCenter.x, 0.06, mouldCenter.z);
    for (const [w, d, x, z] of [[1.8, 0.1, 0, 0.6], [1.8, 0.1, 0, -0.6], [0.1, 1.3, 0.85, 0], [0.1, 1.3, -0.85, 0]]) box(w, 0.42, d, darkSteel, mouldCenter.x + x, 0.27, mouldCenter.z + z);
    const casting = box(1.6, 0.3, 1.1, cast, mouldCenter.x, 0.27, mouldCenter.z);
    tag(casting, 'cast');
    const castHammer = makeHammer();
    tag(castHammer, 'cast');
    const castHammerRest = new THREE.Vector3(4.2, 0, 0.6);
    const lumpSpots = [[-0.5, -0.3], [0, -0.35], [0.5, -0.25], [-0.45, 0.25], [0.05, 0.2], [0.5, 0.3], [0, 0]].map(([x, z], i) => new THREE.Vector3(mouldCenter.x + x, 0.32 + (i === 6 ? 0.18 : 0), mouldCenter.z + z));
    const lumps = lumpSpots.map((_, i) => {
      const lump = mesh(new THREE.DodecahedronGeometry(0.24 + (i % 3) * 0.04, 0), silicon);
      lump.scale.set(1, 0.75 + (i % 2) * 0.2, 1.1);
      lump.rotation.set(i * 0.9, i * 1.7, 0.4);
      return tag(lump, 'lumps');
    });

    // 7. Bulk bag on a pallet.
    const bag = new THREE.Group();
    const bagHome = new THREE.Vector3(6.1, 0, -0.8);
    bag.position.copy(bagHome);
    scene.add(bag);
    box(1.2, 0.14, 1.2, wood, 0, 0.07, 0, bag);
    mesh(new THREE.BoxGeometry(1, 1.1, 1, 2, 2, 2), bagCloth, 0, 0.7, 0, bag);
    const bagTie = mesh(new THREE.ConeGeometry(0.45, 0.4, 4), bagCloth, 0, 1.45, 0, bag);
    bagTie.rotation.y = Math.PI / 4;
    for (const [x, z] of [[-0.4, -0.4], [0.4, -0.4], [-0.4, 0.4], [0.4, 0.4]]) box(0.06, 0.3, 0.06, bagCloth, x, 1.35, z, bag);
    tag(bag, 'bag');

    // Highlight for the next object.
    const arrow = mesh(new THREE.ConeGeometry(0.22, 0.45, 12), arrowMaterial);
    arrow.rotation.x = Math.PI;

    scene.traverse(object => {
      if (object instanceof THREE.Mesh && object.material !== glowMaterial && object.material !== gasMaterial && object.material !== arrowMaterial) {
        object.castShadow = true;
        object.receiveShadow = true;
      }
    });

    const resize = () => {
      const width = container.clientWidth;
      const height = container.clientHeight;
      if (!width || !height) return;
      const aspect = width / height;
      const halfHeight = Math.max(3.9, 8 / aspect);
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
    const targetAt = (event: PointerEvent): SmelterTarget | null => {
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
      renderer.domElement.style.cursor = targetAt(event) === current.current.target && current.current.target ? 'pointer' : 'default';
    };
    renderer.domElement.addEventListener('pointerdown', onPointerDown);
    renderer.domElement.addEventListener('pointermove', onPointerMove);

    const order = (phase: SmelterPhase) => SMELTER_PHASES.indexOf(phase);
    const arc = (from: THREE.Vector3, to: THREE.Vector3, t: number, height: number, out: THREE.Vector3) =>
      out.copy(from).lerp(to, t).setY(from.y + (to.y - from.y) * t + Math.sin(t * Math.PI) * height);
    const hotColor = new THREE.Color(0xffa43a);
    const coldColor = new THREE.Color(0xb7c0c9);
    const clock = new THREE.Clock();
    let frame = 0;

    const animate = () => {
      const { phase, progress: p, target } = current.current;
      const t = clock.getElapsedTime();
      const now = order(phase);
      const after = (other: SmelterPhase) => now > order(other);
      const from = (other: SmelterPhase) => now >= order(other);

      // Pickaxe: two strikes, then the freed block arcs onto the pad.
      pickaxe.position.set(-6.1, 0, 1);
      pickaxe.rotation.set(0, 0.3, -0.25);
      if (phase === 'mining') {
        const swing = Math.abs(Math.sin(span(p, 0, 0.6) * Math.PI * 2));
        pickaxe.position.set(-5.9, 0.2, 0.9);
        pickaxe.rotation.set(0, 0.3, 0.9 * swing - 0.2);
      }
      freeBlock.visible = !after('breaking') && !(phase === 'breaking' && p > 0.4);
      if (phase === 'mine') freeBlock.position.copy(blockOnOutcrop);
      else if (phase === 'mining') {
        const shake = p < 0.6 ? Math.sin(t * 60) * 0.02 * span(p, 0.2, 0.6) : 0;
        arc(blockOnOutcrop, blockOnPad, ease(span(p, 0.6, 1)), 1, freeBlock.position).x += shake;
      } else freeBlock.position.copy(blockOnPad);

      // Rock hammer: one strike splits the block into chunks, which then hop into the quartz bin.
      rockHammer.position.set(-4.4, 0, 0.9);
      rockHammer.rotation.set(0, 0, -1.4);
      if (phase === 'breaking') {
        const lift = p < 0.4 ? Math.sin(span(p, 0, 0.4) * Math.PI / 2) : 1 - span(p, 0.4, 0.5);
        rockHammer.position.set(-4.3, 0.35, 0);
        rockHammer.rotation.set(0, 0, 0.6 + lift * 0.7);
      }
      quartzChunks.forEach((chunk, i) => {
        const binSpot = quartzBinSpots[i];
        chunk.visible = (phase === 'breaking' && p > 0.4) || phase === 'loadQuartz' || phase === 'loadingQuartz';
        if (phase === 'breaking') {
          if (p < 0.65) chunk.position.copy(blockOnPad).lerp(chunkSpots[i], ease(span(p, 0.4, 0.55)));
          else arc(chunkSpots[i], binSpot, ease(span(p, 0.65 + i * 0.05, 0.85 + i * 0.03)), 0.9, chunk.position);
        } else if (phase === 'loadQuartz') chunk.position.copy(binSpot);
        else if (phase === 'loadingQuartz') {
          const k = span(p, i * 0.12, 0.4 + i * 0.12);
          arc(binSpot, feedOpening, ease(k), 1.4, chunk.position);
          chunk.visible = k < 1;
        }
      });
      carbonChunks.forEach((chunk, i) => {
        chunk.visible = !after('loadingCarbon');
        if (phase === 'loadingCarbon') {
          const k = span(p, i * 0.12, 0.4 + i * 0.12);
          arc(carbonBinSpots[i], feedOpening, ease(k), 1.6, chunk.position);
          chunk.visible = k < 1;
        } else chunk.position.copy(carbonBinSpots[i]);
      });
      quartzBin.rotation.x = phase === 'loadingQuartz' ? -Math.sin(p * Math.PI) * 0.35 : 0;
      carbonBin.rotation.x = phase === 'loadingCarbon' ? -Math.sin(p * Math.PI) * 0.35 : 0;

      // Charge builds as material lands, then settles and the carbon is used up while it reacts.
      const reacted = phase === 'smelting' ? p : after('smelting') ? 1 : 0;
      const quartzIn = phase === 'loadingQuartz' ? span(p, 0.3, 1) : from('loadCarbon') ? 1 : 0;
      const carbonIn = phase === 'loadingCarbon' ? span(p, 0.3, 1) : from('power') ? 1 : 0;
      quartzCharge.forEach((lump, i) => { lump.visible = i < quartzIn * quartzCharge.length; lump.scale.setScalar(1 - reacted * 0.25); });
      carbonCharge.forEach((lump, i) => { lump.visible = i < carbonIn * carbonCharge.length && reacted < 0.97; lump.scale.setScalar(1 - reacted * 0.75); });
      chargeGroup.position.y = -reacted * 0.45;

      const heat = phase === 'smelting' ? ease(span(p, 0, 0.3)) : phase === 'tap' || phase === 'pouring' ? 1 : phase === 'cooling' ? 0.5 * (1 - p) : 0;
      glowMaterial.opacity = heat * (0.45 + Math.sin(t * 7) * 0.05);
      reactionGlow.visible = heat > 0;
      electrodeTips.forEach(tip => { tip.emissiveIntensity = heat * 1.6; });
      electrodes.forEach(group => { group.position.y = from('smelting') ? -0.12 : 0; });
      furnaceGlow.intensity = heat * 25;
      const poolLevel = phase === 'smelting' ? span(p, 0.25, 1) : phase === 'tap' ? 1 : phase === 'pouring' ? 1 - p * 0.85 : 0;
      pool.visible = poolLevel > 0.01;
      pool.scale.y = Math.max(0.01, poolLevel * 0.35);
      pool.position.y = base + 0.35 + pool.scale.y / 2;
      liquid.emissiveIntensity = 1.1 + Math.sin(t * 9) * 0.15;
      gas.forEach((puff, i) => {
        const rise = (t * 0.5 + i / gas.length) % 1;
        const angle = cameraAngle + Math.PI + (i - 5) * 0.35;
        puff.visible = phase === 'smelting' || phase === 'tap';
        puff.position.set(Math.sin(angle) * 0.6 * (1 - rise), 2.4 + rise * 1.9, Math.cos(angle) * 0.6 * (1 - rise));
        puff.scale.setScalar(0.6 + rise * 1.4);
      });
      lever.rotation.x = from('smelting') ? 0.9 : -0.9;
      indicator.emissiveIntensity = from('smelting') && !after('pouring') ? 2 : 0;
      tapButton.position.y = phase === 'pouring' ? 0.9 : 0.95;

      // Pour: the stream runs down the runner and the casting rises in the mould.
      stream.visible = phase === 'pouring' && p < 0.95;
      stream.scale.x = 0.85 + Math.sin(t * 18) * 0.15;
      casting.visible = (from('pouring') && !after('breakingCast')) && !(phase === 'breakingCast' && p > 0.45);
      const fill = phase === 'pouring' ? Math.max(0.02, span(p, 0.1, 1)) : 1;
      casting.scale.y = fill;
      casting.position.y = 0.12 + 0.15 * fill;
      const cooled = phase === 'cooling' ? ease(p) : after('cooling') ? 1 : 0;
      cast.color.copy(hotColor).lerp(coldColor, cooled);
      cast.emissiveIntensity = (1 - cooled) * 1.3;
      mouldGlow.intensity = from('pouring') ? (1 - cooled) * 14 * (phase === 'pouring' ? p : 1) : 0;

      castHammer.position.copy(castHammerRest);
      castHammer.rotation.set(0, 0, -1.4);
      if (phase === 'breakingCast') {
        const lift = p < 0.4 ? Math.sin(span(p, 0, 0.4) * Math.PI / 2) : 1 - span(p, 0.4, 0.5);
        castHammer.position.set(4.7, 0.4, -0.8);
        castHammer.rotation.set(0, 0, 0.6 + lift * 0.7);
      }
      lumps.forEach((lump, i) => {
        lump.visible = (phase === 'breakingCast' && p > 0.45) || phase === 'bag' || phase === 'bagging';
        if (phase === 'breakingCast') {
          lump.position.copy(mouldCenter).setY(0.3).lerp(lumpSpots[i], ease(span(p, 0.45, 0.7)));
          lump.position.y += Math.sin(span(p, 0.45, 0.7) * Math.PI) * 0.35;
        } else if (phase === 'bagging') {
          const k = span(p, i * 0.08, 0.35 + i * 0.08);
          arc(lumpSpots[i], new THREE.Vector3(bagHome.x, 1.5, bagHome.z), ease(k), 1.2, lump.position);
          lump.visible = k < 1;
        } else lump.position.copy(lumpSpots[i]);
      });

      bagTie.visible = from('ship') || (phase === 'bagging' && p > 0.9);
      bag.visible = phase !== 'done';
      bag.position.copy(bagHome);
      if (phase === 'shipping') bag.position.x += ease(p) * 4;

      // Arrow over the next object.
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
      {unavailable && <p className="absolute inset-0 flex items-center justify-center p-8 text-center text-white">3D view unavailable in this browser. Use the button below to run each step.</p>}
    </div>
  );
}
