import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { ASSETS } from '../content/assets';

export type SmelterPhase = 'sort' | 'loading' | 'loaded' | 'smelting' | 'molten' | 'pouring' | 'cooling' | 'ready';
export const NORWAY_ROCKS = [
  { name: 'Quartz 1', quartz: true }, { name: 'Dark waste rock', quartz: false },
  { name: 'Quartz 2', quartz: true }, { name: 'Quartz 3', quartz: true },
  { name: 'Dark waste rock', quartz: false }, { name: 'Quartz 4', quartz: true },
];

interface Props {
  phase: SmelterPhase;
  progress: number;
  selected: number[];
  onPick: (index: number) => void;
  onOperate: () => void;
}

/** A deliberately fixed cutaway: feed at left, furnace in the middle, casting mold at right. */
export function NorwaySmelterScene(props: Props) {
  const host = useRef<HTMLDivElement>(null);
  const labels = useRef<(HTMLSpanElement | null)[]>([]);
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
    renderer.setClearColor(0x000000, 0);
    renderer.domElement.setAttribute('aria-label', 'Interactive cutaway: quartz tray, electric furnace, and silicon casting mold');
    renderer.domElement.setAttribute('role', 'img');
    container.appendChild(renderer.domElement);
    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-8, 8, 5, -5, 0.1, 80);
    camera.position.set(9, 8, 14);
    camera.lookAt(0, 1, 0);
    scene.add(new THREE.HemisphereLight(0xc8e5ff, 0x413128, 2.5));
    const light = new THREE.DirectionalLight(0xffe2bb, 3);
    light.position.set(-4, 10, 8);
    scene.add(light);
    const glow = new THREE.PointLight(0xff7c21, 0, 10);
    glow.position.set(0, 1.2, 1);
    scene.add(glow);

    const geometries: THREE.BufferGeometry[] = [];
    const materials: THREE.MeshStandardMaterial[] = [];
    const material = (color: number, metalness = 0, roughness = 0.65) => {
      const result = new THREE.MeshStandardMaterial({ color, metalness, roughness, flatShading: true });
      materials.push(result);
      return result;
    };
    const steel = material(0x44616a, 0.5);
    const dark = material(0x202c34, 0.4);
    const brick = material(0x9e7055);
    const quartz = material(0xf1efdf, 0.1);
    const coal = material(0x29252b);
    const liquidMaterial = material(0xffa52c, 0.25);
    liquidMaterial.emissive.setHex(0xff5c08);
    const castMaterial = material(0xffa52c, 0.65, 0.3);
    castMaterial.emissive.setHex(0xff5c08);
    const box = (w: number, h: number, d: number, x: number, y: number, z: number, mat = steel) => {
      const geo = new THREE.BoxGeometry(w, h, d);
      geometries.push(geo);
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(x, y, z);
      scene.add(mesh);
      return mesh;
    };
    // One grounded workbench, not an unexplained floating collection of machines.
    box(12.4, 0.3, 4.5, 0, -0.1, 0, dark);
    for (const x of [-5.4, 5.4]) box(0.3, 0.65, 3.7, x, -0.55, 0, steel);
    box(3.3, 0.2, 2.6, -4.1, 0.15, 0, steel);
    for (const z of [-1.3, 1.3]) box(3.3, 0.25, 0.1, -4.1, 0.35, z, dark);

    const pickables: THREE.Object3D[] = [];
    const rocks = NORWAY_ROCKS.map((rock, index) => {
      const geo = new THREE.DodecahedronGeometry(0.36, 0);
      geometries.push(geo);
      const mesh = new THREE.Mesh(geo, rock.quartz ? quartz : coal);
      mesh.position.set(-5 + (index % 3) * 0.85, 0.62, -0.52 + Math.floor(index / 3) * 1.1);
      mesh.rotation.set(index * 0.4, index, 0.2);
      mesh.userData.rock = index;
      scene.add(mesh);
      pickables.push(mesh);
      return { mesh, origin: mesh.position.clone() };
    });

    // Furnace front is deliberately open so the contents and the electrodes stay visible.
    box(3.4, 0.45, 2.8, 0, 0.3, 0, steel);
    box(3.4, 1.65, 0.25, 0, 1.2, -1.2, brick);
    for (const x of [-1.55, 1.55]) box(0.25, 1.65, 2.5, x, 1.2, 0, brick);
    box(3.4, 0.35, 0.22, 0, 0.65, 1.2, brick);
    box(4, 0.25, 0.75, 0, 3.5, -0.5, steel);
    box(0.18, 3.3, 0.18, -1.8, 1.8, -1, steel);
    const electrodes = [-0.85, 0, 0.85].map(x => box(0.24, 1.9, 0.24, x, 2.55, -0.25, dark));
    const liquid = box(2.85, 0.12, 2, 0, 0.65, 0, liquidMaterial);
    const charge = new THREE.Group();
    scene.add(charge);
    for (let i = 0; i < 14; i++) {
      const geo = new THREE.DodecahedronGeometry(i % 3 ? 0.23 : 0.18, 0);
      geometries.push(geo);
      const lump = new THREE.Mesh(geo, i % 3 ? quartz : coal);
      lump.position.set(-1 + (i % 5) * 0.48, 0.85 + Math.floor(i / 5) * 0.2, -0.65 + (i % 3) * 0.55);
      charge.add(lump);
    }
    // A visible tap chute into an open rectangular casting mold.
    const chute = box(2.1, 0.12, 0.5, 2.35, 0.6, 0.7, dark);
    chute.rotation.z = -0.15;
    box(2.4, 0.15, 1.8, 4.35, 0.2, 0.7, dark);
    for (const z of [-0.2, 1.6]) box(2.4, 0.5, 0.12, 4.35, 0.45, z, steel);
    for (const x of [3.15, 5.55]) box(0.12, 0.5, 1.8, x, 0.45, 0.7, steel);
    const cast = box(2.1, 0.42, 1.5, 4.35, 0.48, 0.7, castMaterial);
    const stream = box(2.45, 0.08, 0.24, 2.5, 0.74, 0.7, liquidMaterial);
    stream.rotation.z = -0.16;
    const tap = box(0.14, 0.7, 0.14, 1.8, 1.1, 0.7, steel);
    box(0.6, 0.12, 0.12, 1.8, 1.45, 0.7, material(0xd39f43));
    tap.userData.operate = true;
    pickables.push(tap, liquid, ...electrodes);
    liquid.userData.operate = true;
    electrodes.forEach(mesh => { mesh.userData.operate = true; });
    const bubbles = Array.from({ length: 7 }, (_, i) => {
      const geo = new THREE.IcosahedronGeometry(0.07, 0);
      geometries.push(geo);
      const mesh = new THREE.Mesh(geo, material(0xd3c3a9));
      scene.add(mesh);
      return mesh;
    });

    const anchors = [new THREE.Vector3(-4.1, 1.55, 0), new THREE.Vector3(0, 4, 0), new THREE.Vector3(4.35, 1.3, 0.7)];
    const resize = () => {
      const width = container.clientWidth;
      const height = container.clientHeight;
      if (!width || !height) return;
      const aspect = width / height;
      const halfHeight = Math.max(4, 7.8 / aspect);
      camera.left = -halfHeight * aspect;
      camera.right = halfHeight * aspect;
      camera.top = halfHeight;
      camera.bottom = -halfHeight;
      camera.updateProjectionMatrix();
      camera.updateMatrixWorld();
      renderer.setSize(width, height);
      anchors.forEach((anchor, i) => {
        const position = anchor.clone().project(camera);
        const label = labels.current[i];
        if (label) {
          label.style.left = `${(position.x + 1) * 50}%`;
          label.style.top = `${(1 - position.y) * 50}%`;
        }
      });
    };
    const observer = new ResizeObserver(resize);
    observer.observe(container);
    resize();
    const raycaster = new THREE.Raycaster();
    const hitAt = (event: PointerEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      raycaster.setFromCamera(new THREE.Vector2((event.clientX - rect.left) / rect.width * 2 - 1, -(event.clientY - rect.top) / rect.height * 2 + 1), camera);
      return raycaster.intersectObjects(pickables).find(hit => hit.object.visible)?.object;
    };
    const pick = (event: PointerEvent) => {
      const hit = hitAt(event);
      if (hit?.userData.rock !== undefined) current.current.onPick(hit.userData.rock);
      else if (hit?.userData.operate) current.current.onOperate();
    };
    const hover = (event: PointerEvent) => { renderer.domElement.style.cursor = hitAt(event) ? 'pointer' : 'default'; };
    renderer.domElement.addEventListener('pointerdown', pick);
    renderer.domElement.addEventListener('pointermove', hover);
    let frame = 0;
    const clock = new THREE.Clock();
    const cold = new THREE.Color(0xa5b7c9);
    const hot = new THREE.Color(0xffa52c);
    const animate = () => {
      const { phase, progress, selected } = current.current;
      const t = clock.getElapsedTime();
      const heated = ['smelting', 'molten', 'pouring'].includes(phase);
      const melt = phase === 'smelting' ? progress : ['molten', 'pouring', 'cooling', 'ready'].includes(phase) ? 1 : 0;
      rocks.forEach(({ mesh, origin }, i) => {
        mesh.visible = phase === 'sort' || (phase === 'loading' && selected.includes(i));
        mesh.position.copy(origin);
        if (phase === 'sort' && selected.includes(i)) mesh.position.y += 0.25;
        if (phase === 'loading') {
          mesh.position.lerp(new THREE.Vector3((i % 3 - 1) * 0.6, 1, 0), progress);
          mesh.position.y += Math.sin(progress * Math.PI) * 1.7;
          mesh.scale.setScalar(1 - progress * 0.45);
        }
      });
      charge.visible = ['loaded', 'smelting'].includes(phase);
      charge.scale.y = Math.max(0.01, 1 - melt);
      liquid.visible = heated;
      liquid.scale.y = Math.max(0.02, melt * (phase === 'pouring' ? 1 - progress : 1));
      liquidMaterial.emissiveIntensity = heated ? 0.7 + Math.sin(t * 9) * 0.12 : 0;
      electrodes.forEach(mesh => { mesh.position.y = phase === 'smelting' ? 2.25 : 2.55; });
      glow.intensity = heated ? 18 * Math.max(0.1, melt) : phase === 'cooling' ? 8 * (1 - progress) : 0;
      stream.visible = phase === 'pouring';
      stream.scale.z = 0.8 + Math.sin(t * 15) * 0.15;
      cast.visible = ['pouring', 'cooling', 'ready'].includes(phase);
      cast.scale.y = phase === 'pouring' ? Math.max(0.01, progress) : 1;
      const cooled = phase === 'ready' ? 1 : phase === 'cooling' ? progress : 0;
      castMaterial.color.copy(hot).lerp(cold, cooled);
      castMaterial.emissiveIntensity = 1 - cooled;
      bubbles.forEach((mesh, i) => {
        mesh.visible = phase === 'smelting';
        mesh.position.set(Math.sin(i * 7) * 0.9, 1.2 + ((t * 0.6 + i * 0.19) % 1) * 1.7, Math.cos(i * 3) * 0.5);
      });
      renderer.render(scene, camera);
      frame = requestAnimationFrame(animate);
    };
    animate();
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      renderer.domElement.removeEventListener('pointerdown', pick);
      renderer.domElement.removeEventListener('pointermove', hover);
      geometries.forEach(geometry => geometry.dispose());
      materials.forEach(mat => mat.dispose());
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden rounded-2xl border border-white/10 bg-[#12212b]">
      <img src={ASSETS.stages[1]} alt="" className="absolute inset-0 w-full h-full object-cover opacity-25" style={{ filter: 'blur(3px)' }} />
      <div className="absolute inset-0 bg-gradient-to-t from-[#0c1821] via-[#10202c]/50 to-[#10202c]/20" />
      <div ref={host} className="absolute inset-0" />
      {['QUARTZ FEED', 'ELECTRIC FURNACE · CUTAWAY', props.phase === 'ready' ? 'SOLID SILICON' : 'CASTING MOLD'].map((text, i) => (
        <span key={i} ref={element => { labels.current[i] = element; }} className="absolute pointer-events-none -translate-x-1/2 -translate-y-full whitespace-nowrap rounded border border-white/15 bg-[#0c1821]/90 px-2 py-1 text-[9px] sm:text-[11px] font-bold tracking-wider text-amber-100">{text}</span>
      ))}
      {unavailable && <p className="absolute inset-0 flex items-center justify-center p-8 text-center text-white">3D view unavailable in this browser. Use the controls below to run the process.</p>}
      <span className="absolute bottom-3 left-4 text-[10px] text-slate-300">Simplified cutaway · process time shortened</span>
    </div>
  );
}
