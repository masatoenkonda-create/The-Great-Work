import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { StageId } from '../types/game';

interface ThreeCanvasProps {
  currentStage: StageId;
  viewMode: 'iso' | 'focus_station' | 'macro_chip';
  onStationClick?: (stage: StageId) => void;
}

// Reusable math vectors to ensure zero GC in animation loop
const _vec3 = new THREE.Vector3();
const _targetCamPos = new THREE.Vector3();
const _targetLookAt = new THREE.Vector3();
const _currLookAt = new THREE.Vector3(0, 1.5, 0);

export const ThreeCanvas: React.FC<ThreeCanvasProps> = ({
  currentStage,
  viewMode,
  onStationClick
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const animFrameRef = useRef<number | null>(null);

  // Animated elements refs
  const rotatingIngotRef = useRef<THREE.Mesh | null>(null);
  const ohtPodRef = useRef<THREE.Group | null>(null);
  const waferRef = useRef<THREE.Group | null>(null);
  const cutawayPackageRef = useRef<THREE.Group | null>(null);
  const bladeSawRef = useRef<THREE.Mesh | null>(null);
  const laserBeamRef = useRef<THREE.Mesh | null>(null);
  const stationsRef = useRef<{ id: StageId; group: THREE.Group }[]>([]);

  // Drag interaction
  const isDraggingRef = useRef(false);
  const prevMouseRef = useRef({ x: 0, y: 0 });
  const orbitAngleRef = useRef({ theta: Math.PI / 4, phi: Math.PI / 6 });

  useEffect(() => {
    if (!mountRef.current) return;
    const container = mountRef.current;
    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;

    // 1. Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf5f3ee); // Warm ivory background matching infographic briefing
    scene.fog = new THREE.Fog(0xf5f3ee, 28, 55);
    sceneRef.current = scene;

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 100);
    camera.position.set(22, 20, 22);
    camera.lookAt(0, 1.5, 0);
    cameraRef.current = camera;

    // 3. Renderer with PBR & ACESFilmicToneMapping
    const isHeadless = navigator.webdriver || /HeadlessChrome/i.test(navigator.userAgent);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(isHeadless ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    renderer.shadowMap.enabled = !isHeadless;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    rendererRef.current = renderer;

    container.replaceChildren(renderer.domElement);

    // 4. Studio Environment Reflection (RoomEnvironment)
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
    pmremGenerator.dispose();

    // 5. Studio Lighting Rig: Warm Key + Cool Hemisphere + Soft Accent
    const hemiLight = new THREE.HemisphereLight(0xfff8f0, 0xd0e0ea, 0.7);
    hemiLight.position.set(0, 25, 0);
    scene.add(hemiLight);

    const keyLight = new THREE.DirectionalLight(0xfffaed, 1.8);
    keyLight.position.set(16, 26, 12);
    keyLight.castShadow = !isHeadless;
    keyLight.shadow.mapSize.width = 2048;
    keyLight.shadow.mapSize.height = 2048;
    keyLight.shadow.camera.near = 5;
    keyLight.shadow.camera.far = 60;
    const d = 18;
    keyLight.shadow.camera.left = -d;
    keyLight.shadow.camera.right = d;
    keyLight.shadow.camera.top = d;
    keyLight.shadow.camera.bottom = -d;
    keyLight.shadow.bias = -0.0004;
    keyLight.shadow.normalBias = 0.02;
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0xbadcf5, 0.6);
    rimLight.position.set(-15, 18, -15);
    scene.add(rimLight);

    // Warm amber safe-light accent for the litho bay
    const lithoLight = new THREE.PointLight(0xffa834, 2.2, 10, 1.2);
    lithoLight.position.set(0, 3.5, 0);
    scene.add(lithoLight);

    // 6. Architectural Elements: Cleanroom Pavilion & Kyushu backdrop
    buildCleanroomPavilion(scene);

    // 7. Equipment Stations (5 stages matching the diagram)
    stationsRef.current = [];
    buildStage1Station(scene, stationsRef.current);
    buildStage2Station(scene, stationsRef.current, laserBeamRef);
    buildStage3Station(scene, stationsRef.current, bladeSawRef);
    buildStage4Station(scene, stationsRef.current);
    buildStage5Station(scene, stationsRef.current);

    // 8. Overhead OHT (Automated Material Handling Track with moving FOUP carrier)
    buildOHTTrack(scene, ohtPodRef);

    // 9. Floating Wafer & Cutaway Package (for macro / stage inspection)
    const waferGroup = buildFloatingWafer();
    scene.add(waferGroup);
    waferRef.current = waferGroup;

    const cutawayGroup = buildCutawayPackage();
    scene.add(cutawayGroup);
    cutawayPackageRef.current = cutawayGroup;

    // Contact shadow plane
    const shadowGeo = new THREE.PlaneGeometry(36, 36);
    const shadowMat = new THREE.MeshBasicMaterial({
      color: 0x989085,
      transparent: true,
      opacity: 0.18,
      depthWrite: false
    });
    const shadowPlane = new THREE.Mesh(shadowGeo, shadowMat);
    shadowPlane.rotation.x = -Math.PI / 2;
    shadowPlane.position.y = 0.01;
    scene.add(shadowPlane);

    // Resize handler
    const handleResize = () => {
      if (!container || !rendererRef.current || !cameraRef.current) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      cameraRef.current.aspect = w / h;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    // Raycaster for station clicks
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const handleClick = (e: MouseEvent) => {
      if (!mountRef.current || !cameraRef.current || !onStationClick) return;
      const rect = mountRef.current.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(mouse, cameraRef.current);

      const hitList = raycaster.intersectObjects(scene.children, true);
      for (const hit of hitList) {
        let parent: THREE.Object3D | null = hit.object;
        while (parent) {
          const match = stationsRef.current.find(s => s.group === parent);
          if (match) {
            onStationClick(match.id);
            return;
          }
          parent = parent.parent;
        }
      }
    };
    container.addEventListener('click', handleClick);

    // Orbit drag controls
    const onMouseDown = (e: MouseEvent) => {
      isDraggingRef.current = true;
      prevMouseRef.current = { x: e.clientX, y: e.clientY };
    };
    const onMouseMove = (e: MouseEvent) => {
      if (!isDraggingRef.current) return;
      const dx = e.clientX - prevMouseRef.current.x;
      const dy = e.clientY - prevMouseRef.current.y;
      prevMouseRef.current = { x: e.clientX, y: e.clientY };
      orbitAngleRef.current.theta -= dx * 0.005;
      orbitAngleRef.current.phi = Math.max(0.2, Math.min(Math.PI / 2 - 0.1, orbitAngleRef.current.phi - dy * 0.005));
    };
    const onMouseUp = () => {
      isDraggingRef.current = false;
    };

    container.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);

    // Prewarm shader compilation
    renderer.compile(scene, camera);

    // Animation Loop
    let clock = new THREE.Clock();
    const animate = () => {
      animFrameRef.current = requestAnimationFrame(animate);
      const delta = Math.min(clock.getDelta(), 0.05);
      const time = clock.getElapsedTime();

      // Animate OHT Pod along ceiling track
      if (ohtPodRef.current) {
        const t = (time * 0.3) % 1;
        const ohtRadius = 11;
        ohtPodRef.current.position.x = Math.sin(t * Math.PI * 2) * ohtRadius;
        ohtPodRef.current.position.z = Math.cos(t * Math.PI * 2) * 5;
        ohtPodRef.current.rotation.y = t * Math.PI * 2 + Math.PI / 2;
      }

      // Animate Dicing Blade Saw
      if (bladeSawRef.current) {
        bladeSawRef.current.rotation.z += delta * 25;
      }

      // Animate EUV Laser Pulse
      if (laserBeamRef.current) {
        const pulse = Math.sin(time * 8) * 0.5 + 0.5;
        (laserBeamRef.current.material as THREE.MeshBasicMaterial).opacity = 0.3 + pulse * 0.5;
      }

      // Gentle floating wafer rotation & shimmer
      if (waferRef.current) {
        waferRef.current.rotation.y += delta * 0.4;
        waferRef.current.position.y = 2.4 + Math.sin(time * 1.5) * 0.12;
      }

      // Gentle package cutaway float
      if (cutawayPackageRef.current) {
        cutawayPackageRef.current.rotation.y += delta * 0.35;
        cutawayPackageRef.current.position.y = 2.4 + Math.sin(time * 1.5 + 1) * 0.1;
      }

      // Smooth camera interpolation based on stage and viewMode
      calculateCameraTarget(currentStage, viewMode, orbitAngleRef.current, _targetCamPos, _targetLookAt);
      if (cameraRef.current) {
        cameraRef.current.position.lerp(_targetCamPos, 0.06);
        _currLookAt.lerp(_targetLookAt, 0.06);
        cameraRef.current.lookAt(_currLookAt);
      }

      renderer.render(scene, camera);
    };
    animate();

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      window.removeEventListener('resize', handleResize);
      container.removeEventListener('click', handleClick);
      container.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      renderer.dispose();
    };
  }, []);

  // Update target on prop change
  useEffect(() => {
    // Stage or viewMode changed, trigger visibility of macro inspection models
    if (waferRef.current && cutawayPackageRef.current) {
      if (viewMode === 'macro_chip') {
        if (currentStage === 'package_assemble' || currentStage === 'final_test_systems') {
          waferRef.current.visible = false;
          cutawayPackageRef.current.visible = true;
        } else {
          waferRef.current.visible = true;
          cutawayPackageRef.current.visible = false;
        }
      } else {
        // In full cleanroom view, place them as cleanroom display models in background
        waferRef.current.visible = true;
        cutawayPackageRef.current.visible = false;
        waferRef.current.position.set(0, 2.2, 0);
      }
    }
  }, [currentStage, viewMode]);

  return (
    <div
      ref={mountRef}
      className="w-full h-full cursor-grab active:cursor-grabbing select-none"
      title="Drag to orbit · Click stations to inspect"
    />
  );
};

// ----------------------------------------------------------------------------------
// Camera View Positioning Logic
// ----------------------------------------------------------------------------------
function calculateCameraTarget(
  stage: StageId,
  mode: 'iso' | 'focus_station' | 'macro_chip',
  orbit: { theta: number; phi: number },
  outCamPos: THREE.Vector3,
  outLookAt: THREE.Vector3
) {
  if (mode === 'macro_chip') {
    // Close macro zoom on the wafer/package model
    outLookAt.set(0, 2.4, 0);
    const dist = 5.2;
    outCamPos.set(
      Math.sin(orbit.theta) * Math.cos(orbit.phi) * dist,
      2.4 + Math.sin(orbit.phi) * dist,
      Math.cos(orbit.theta) * Math.cos(orbit.phi) * dist
    );
    return;
  }

  if (mode === 'focus_station') {
    const stationPositions: Record<StageId, [number, number, number]> = {
      wafers_chemistry: [-10, 1.5, 0],
      front_end_fab: [-5, 1.8, 0],
      probe_die_prep: [0, 1.6, 0],
      package_assemble: [5, 1.6, 0],
      final_test_systems: [10, 1.8, 0]
    };
    const [sx, sy, sz] = stationPositions[stage];
    outLookAt.set(sx, sy, sz);
    outCamPos.set(sx + 7, sy + 6, sz + 7);
    return;
  }

  // Default: Isometric high overview of the entire Japanese cleanroom
  outLookAt.set(0, 1.2, 0);
  const dist = 30;
  outCamPos.set(
    Math.sin(orbit.theta) * Math.cos(orbit.phi) * dist,
    Math.sin(orbit.phi) * dist + 12,
    Math.cos(orbit.theta) * Math.cos(orbit.phi) * dist
  );
}

// ----------------------------------------------------------------------------------
// Procedural 3D Model Builders (3–12 parts each, grounded pivots, rich PBR finishes)
// ----------------------------------------------------------------------------------

function buildCleanroomPavilion(scene: THREE.Scene) {
  // Main antistatic cleanroom floor (warm off-white/ivory epoxy with subtle reflection)
  const floorGeo = new THREE.BoxGeometry(32, 0.4, 18);
  const floorMat = new THREE.MeshStandardMaterial({
    color: 0xefede6,
    roughness: 0.22,
    metalness: 0.08
  });
  const floor = new THREE.Mesh(floorGeo, floorMat);
  floor.position.set(0, -0.2, 0);
  floor.receiveShadow = true;
  scene.add(floor);

  // Raised pathway with cedar wood border trim (warm Japanese architecture accent)
  const trimGeo = new THREE.BoxGeometry(32.4, 0.12, 0.4);
  const woodMat = new THREE.MeshStandardMaterial({
    color: 0x8a5d3b,
    roughness: 0.65,
    metalness: 0.05
  });
  const northTrim = new THREE.Mesh(trimGeo, woodMat);
  northTrim.position.set(0, 0.04, -8.9);
  scene.add(northTrim);
  const southTrim = new THREE.Mesh(trimGeo, woodMat);
  southTrim.position.set(0, 0.04, 8.9);
  scene.add(southTrim);

  // Background Cleanroom Wall with Japanese lattice (Shoji style cleanroom air diffusers)
  const wallGeo = new THREE.BoxGeometry(32, 7, 0.4);
  const wallMat = new THREE.MeshStandardMaterial({
    color: 0xe6e4db,
    roughness: 0.7,
    metalness: 0.05
  });
  const backWall = new THREE.Mesh(wallGeo, wallMat);
  backWall.position.set(0, 3.5, -9);
  backWall.receiveShadow = true;
  scene.add(backWall);

  // Glass observation window showing Kyushu landscape (Mount Aso silhouette in the distance)
  const windowGeo = new THREE.BoxGeometry(24, 3.2, 0.1);
  const windowMat = new THREE.MeshPhysicalMaterial({
    color: 0xd8eaf7,
    roughness: 0.1,
    transmission: 0.85,
    thickness: 0.5,
    transparent: true,
    opacity: 0.65
  });
  const obsWindow = new THREE.Mesh(windowGeo, windowMat);
  obsWindow.position.set(0, 4.2, -8.8);
  scene.add(obsWindow);

  // Subtle mountain silhouette behind the window (Kyushu volcano / Mount Aso green ridge)
  const mtnGeo = new THREE.ConeGeometry(8, 5, 4);
  const mtnMat = new THREE.MeshStandardMaterial({ color: 0x829c8e, roughness: 0.9 });
  const mtn1 = new THREE.Mesh(mtnGeo, mtnMat);
  mtn1.position.set(-6, 3.5, -16);
  mtn1.rotation.y = Math.PI / 4;
  scene.add(mtn1);

  const mtn2 = new THREE.Mesh(new THREE.ConeGeometry(12, 7, 4), new THREE.MeshStandardMaterial({ color: 0x6e8a7c, roughness: 0.9 }));
  mtn2.position.set(4, 4, -20);
  mtn2.rotation.y = Math.PI / 3;
  scene.add(mtn2);

  // Cleanroom Ceiling filter beams (HEPA filter fan units)
  for (let i = -14; i <= 14; i += 7) {
    const beamGeo = new THREE.BoxGeometry(0.35, 0.5, 18);
    const beamMat = new THREE.MeshStandardMaterial({ color: 0xbac3c7, roughness: 0.4, metalness: 0.7 });
    const beam = new THREE.Mesh(beamGeo, beamMat);
    beam.position.set(i, 7.5, 0);
    scene.add(beam);
  }
}

// Stage 1: SUMCO Ingot Puller & JSR/Shin-Etsu Photoresist Formulation
function buildStage1Station(scene: THREE.Scene, stationList: { id: StageId; group: THREE.Group }[]) {
  const g = new THREE.Group();
  g.position.set(-10, 0, 0);

  // Base platform
  const base = new THREE.Mesh(
    new THREE.BoxGeometry(4.2, 0.3, 4.2),
    new THREE.MeshStandardMaterial({ color: 0xd9d7ce, roughness: 0.4, metalness: 0.2 })
  );
  base.position.y = 0.15;
  base.castShadow = true;
  base.receiveShadow = true;
  g.add(base);

  // 1. Czochralski Furnace Chamber (SUMCO)
  const furnaceHull = new THREE.Mesh(
    new THREE.CylinderGeometry(1.0, 1.1, 2.4, 24),
    new THREE.MeshStandardMaterial({ color: 0xd1d5db, roughness: 0.25, metalness: 0.85 })
  );
  furnaceHull.position.set(-0.8, 1.5, -0.6);
  furnaceHull.castShadow = true;
  g.add(furnaceHull);

  // Molten quartz crucible viewing port (warm glow)
  const port = new THREE.Mesh(
    new THREE.CylinderGeometry(0.3, 0.3, 0.1, 16),
    new THREE.MeshBasicMaterial({ color: 0xff7b24 })
  );
  port.rotation.x = Math.PI / 2;
  port.position.set(-0.8, 1.4, 0.45);
  g.add(port);

  // Single-crystal silicon ingot (reflective silvery cylinder pulled from the melt)
  const ingot = new THREE.Mesh(
    new THREE.CylinderGeometry(0.35, 0.35, 1.8, 32),
    new THREE.MeshStandardMaterial({
      color: 0x939ba5,
      roughness: 0.15,
      metalness: 0.95
    })
  );
  ingot.position.set(-0.8, 2.5, -0.6);
  ingot.castShadow = true;
  g.add(ingot);

  // 2. Wire Slicing Station (cutting ingot into 300mm wafers)
  const slicerTable = new THREE.Mesh(
    new THREE.BoxGeometry(1.6, 0.8, 1.4),
    new THREE.MeshStandardMaterial({ color: 0x3b4252, roughness: 0.3, metalness: 0.8 })
  );
  slicerTable.position.set(0.9, 0.7, -0.6);
  slicerTable.castShadow = true;
  g.add(slicerTable);

  // Diamond wire saw guides
  for (let w = -0.4; w <= 0.4; w += 0.15) {
    const wire = new THREE.Mesh(
      new THREE.CylinderGeometry(0.015, 0.015, 1.2),
      new THREE.MeshStandardMaterial({ color: 0xe5e9f0, roughness: 0.2, metalness: 0.9 })
    );
    wire.rotation.z = Math.PI / 2;
    wire.position.set(0.9, 1.15, -0.6 + w);
    g.add(wire);
  }

  // 3. JSR & Shin-Etsu Photoresist chemical canisters
  const canGeo = new THREE.CylinderGeometry(0.2, 0.2, 0.6, 16);
  const resistMatAmber = new THREE.MeshStandardMaterial({ color: 0xc47820, roughness: 0.3, metalness: 0.3 });
  const resistMatClean = new THREE.MeshStandardMaterial({ color: 0x3b82f6, roughness: 0.3, metalness: 0.5 });

  const bottle1 = new THREE.Mesh(canGeo, resistMatAmber);
  bottle1.position.set(0.8, 0.6, 1.0);
  bottle1.castShadow = true;
  g.add(bottle1);

  const bottle2 = new THREE.Mesh(canGeo, resistMatClean);
  bottle2.position.set(1.3, 0.6, 1.0);
  bottle2.castShadow = true;
  g.add(bottle2);

  // Stage Badge Label Stand
  addStationBadge(g, '01: WAFERS & CHEMISTRY', 'SUMCO · JSR · Shin-Etsu');

  scene.add(g);
  stationList.push({ id: 'wafers_chemistry', group: g });
}

// Stage 2: FRONT-END FAB (TEL Coater/Developer + ASML EUV Scanner + Etcher + SCREEN Cleaner)
function buildStage2Station(
  scene: THREE.Scene,
  stationList: { id: StageId; group: THREE.Group }[],
  laserRef: React.MutableRefObject<THREE.Mesh | null>
) {
  const g = new THREE.Group();
  g.position.set(-5, 0, 0);

  // Base platform
  const base = new THREE.Mesh(
    new THREE.BoxGeometry(4.2, 0.3, 4.2),
    new THREE.MeshStandardMaterial({ color: 0xd9d7ce, roughness: 0.4, metalness: 0.2 })
  );
  base.position.y = 0.15;
  base.castShadow = true;
  base.receiveShadow = true;
  g.add(base);

  // Amber safe-light tinted glass chamber (Photolithography Bay)
  const lithoGlass = new THREE.Mesh(
    new THREE.BoxGeometry(4.0, 3.2, 4.0),
    new THREE.MeshPhysicalMaterial({
      color: 0xffbe3b,
      roughness: 0.1,
      transmission: 0.7,
      thickness: 0.4,
      transparent: true,
      opacity: 0.35,
      depthWrite: false
    })
  );
  lithoGlass.position.y = 1.9;
  g.add(lithoGlass);

  // ASML EUV Lithography Column (Veldhoven, Netherlands interdependence)
  const scannerColumn = new THREE.Mesh(
    new THREE.CylinderGeometry(0.65, 0.8, 2.6, 24),
    new THREE.MeshStandardMaterial({ color: 0x2e3440, roughness: 0.25, metalness: 0.9 })
  );
  scannerColumn.position.set(0, 1.8, -0.7);
  scannerColumn.castShadow = true;
  g.add(scannerColumn);

  // EUV 13.5nm laser aperture beam
  const laserBeam = new THREE.Mesh(
    new THREE.CylinderGeometry(0.04, 0.25, 0.8, 16),
    new THREE.MeshBasicMaterial({ color: 0x93c5fd, transparent: true, opacity: 0.7 })
  );
  laserBeam.position.set(0, 0.8, -0.7);
  g.add(laserBeam);
  laserRef.current = laserBeam;

  // Tokyo Electron Coater / Developer track module (TEL)
  const telTrack = new THREE.Mesh(
    new THREE.BoxGeometry(1.2, 1.2, 1.4),
    new THREE.MeshStandardMaterial({ color: 0xd8dee9, roughness: 0.2, metalness: 0.6 })
  );
  telTrack.position.set(-1.2, 0.9, 0.6);
  telTrack.castShadow = true;
  g.add(telTrack);

  // SCREEN Cleaning chamber (megasonic rinse)
  const screenCleaner = new THREE.Mesh(
    new THREE.CylinderGeometry(0.5, 0.5, 1.1, 20),
    new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.25, metalness: 0.7 })
  );
  screenCleaner.position.set(1.2, 0.85, 0.6);
  screenCleaner.castShadow = true;
  g.add(screenCleaner);

  // Small wafer chuck in center
  const chuck = new THREE.Mesh(
    new THREE.CylinderGeometry(0.45, 0.45, 0.1, 32),
    new THREE.MeshStandardMaterial({ color: 0x4c566a, roughness: 0.3, metalness: 0.8 })
  );
  chuck.position.set(0, 0.45, -0.7);
  g.add(chuck);

  addStationBadge(g, '02: FRONT-END FAB', 'TEL · ASML · SCREEN (Deposit ➔ Pattern ➔ Etch ➔ Clean)');

  scene.add(g);
  stationList.push({ id: 'front_end_fab', group: g });
}

// Stage 3: PROBE & DIE PREP (Advantest Wafer Prober + DISCO Grinding & Dicing)
function buildStage3Station(
  scene: THREE.Scene,
  stationList: { id: StageId; group: THREE.Group }[],
  bladeRef: React.MutableRefObject<THREE.Mesh | null>
) {
  const g = new THREE.Group();
  g.position.set(0, 0, 0);

  // Base platform
  const base = new THREE.Mesh(
    new THREE.BoxGeometry(4.2, 0.3, 4.2),
    new THREE.MeshStandardMaterial({ color: 0xd9d7ce, roughness: 0.4, metalness: 0.2 })
  );
  base.position.y = 0.15;
  base.castShadow = true;
  base.receiveShadow = true;
  g.add(base);

  // Advantest Wafer Prober Station
  const proberBase = new THREE.Mesh(
    new THREE.BoxGeometry(1.6, 1.2, 1.6),
    new THREE.MeshStandardMaterial({ color: 0x434c5e, roughness: 0.3, metalness: 0.7 })
  );
  proberBase.position.set(-1.0, 0.9, -0.5);
  proberBase.castShadow = true;
  g.add(proberBase);

  // Probe card & needle cantilever arm
  const probeHead = new THREE.Mesh(
    new THREE.BoxGeometry(0.6, 0.4, 0.6),
    new THREE.MeshStandardMaterial({ color: 0xd08770, roughness: 0.4, metalness: 0.8 })
  );
  probeHead.position.set(-1.0, 1.7, -0.5);
  g.add(probeHead);

  // DISCO Dicing Saw & Backgrinder Station
  const discoCabinet = new THREE.Mesh(
    new THREE.BoxGeometry(1.6, 1.4, 1.8),
    new THREE.MeshStandardMaterial({ color: 0xe5e9f0, roughness: 0.2, metalness: 0.4 })
  );
  discoCabinet.position.set(1.0, 1.0, -0.4);
  discoCabinet.castShadow = true;
  g.add(discoCabinet);

  // Circular high-speed diamond dicing saw blade
  const bladeGeo = new THREE.CylinderGeometry(0.32, 0.32, 0.03, 32);
  const bladeMat = new THREE.MeshStandardMaterial({
    color: 0x00d2d3, // high-tech cyan diamond finish
    roughness: 0.2,
    metalness: 0.95
  });
  const blade = new THREE.Mesh(bladeGeo, bladeMat);
  blade.rotation.x = Math.PI / 2;
  blade.position.set(1.0, 1.5, 0.2);
  g.add(blade);
  bladeRef.current = blade;

  // Wafer chuck under the blade
  const dicingChuck = new THREE.Mesh(
    new THREE.CylinderGeometry(0.5, 0.5, 0.08, 32),
    new THREE.MeshStandardMaterial({ color: 0x4c566a, roughness: 0.3, metalness: 0.8 })
  );
  dicingChuck.position.set(1.0, 1.15, 0.2);
  g.add(dicingChuck);

  // Diced wafer with blue UV tape underneath
  const tapeWafer = new THREE.Mesh(
    new THREE.CylinderGeometry(0.42, 0.42, 0.02, 32),
    new THREE.MeshStandardMaterial({ color: 0x38bdf8, roughness: 0.4, metalness: 0.3 })
  );
  tapeWafer.position.set(1.0, 1.2, 0.2);
  g.add(tapeWafer);

  addStationBadge(g, '03: PROBE & DIE PREP', 'Advantest (Wafer Test) · DISCO (Grind & Dice)');

  scene.add(g);
  stationList.push({ id: 'probe_die_prep', group: g });
}

// Stage 4: PACKAGE & ASSEMBLE (Ajinomoto ABF + IBIDEN Substrates + Flip-Chip)
function buildStage4Station(scene: THREE.Scene, stationList: { id: StageId; group: THREE.Group }[]) {
  const g = new THREE.Group();
  g.position.set(5, 0, 0);

  // Base platform
  const base = new THREE.Mesh(
    new THREE.BoxGeometry(4.2, 0.3, 4.2),
    new THREE.MeshStandardMaterial({ color: 0xd9d7ce, roughness: 0.4, metalness: 0.2 })
  );
  base.position.y = 0.15;
  base.castShadow = true;
  base.receiveShadow = true;
  g.add(base);

  // Ajinomoto ABF Film Vacuum Laminator
  const laminator = new THREE.Mesh(
    new THREE.BoxGeometry(1.5, 1.2, 1.5),
    new THREE.MeshStandardMaterial({ color: 0x2e3440, roughness: 0.3, metalness: 0.7 })
  );
  laminator.position.set(-1.0, 0.9, -0.6);
  laminator.castShadow = true;
  g.add(laminator);

  // ABF Copper Film Roll (representing the world-famous Ajinomoto Build-up Film)
  const roll = new THREE.Mesh(
    new THREE.CylinderGeometry(0.25, 0.25, 0.8, 24),
    new THREE.MeshStandardMaterial({ color: 0xb87333, roughness: 0.25, metalness: 0.85 })
  );
  roll.rotation.z = Math.PI / 2;
  roll.position.set(-1.0, 1.7, -0.6);
  g.add(roll);

  // IBIDEN Package Substrate Station & Flip-Chip Bonder
  const bonderStation = new THREE.Mesh(
    new THREE.BoxGeometry(1.6, 1.1, 1.8),
    new THREE.MeshStandardMaterial({ color: 0x166534, roughness: 0.35, metalness: 0.4 }) // dark circuit green
  );
  bonderStation.position.set(1.0, 0.85, -0.4);
  bonderStation.castShadow = true;
  g.add(bonderStation);

  // Placement suction nozzle head
  const nozzle = new THREE.Mesh(
    new THREE.CylinderGeometry(0.08, 0.12, 0.6, 16),
    new THREE.MeshStandardMaterial({ color: 0xd1d5db, roughness: 0.2, metalness: 0.9 })
  );
  nozzle.position.set(1.0, 1.6, 0.1);
  g.add(nozzle);

  // Solder reflow chamber tunnel (with internal warm convection glow)
  const reflow = new THREE.Mesh(
    new THREE.BoxGeometry(2.4, 0.6, 0.9),
    new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.3, metalness: 0.7 })
  );
  reflow.position.set(0, 0.6, 1.1);
  g.add(reflow);

  addStationBadge(g, '04: PACKAGE & ASSEMBLE', 'Ajinomoto (ABF Film) · IBIDEN (Substrates)');

  scene.add(g);
  stationList.push({ id: 'package_assemble', group: g });
}

// Stage 5: FINAL TEST -> SYSTEMS (Advantest ATE & AI Servers / Phones / Vehicles)
function buildStage5Station(scene: THREE.Scene, stationList: { id: StageId; group: THREE.Group }[]) {
  const g = new THREE.Group();
  g.position.set(10, 0, 0);

  // Base platform
  const base = new THREE.Mesh(
    new THREE.BoxGeometry(4.2, 0.3, 4.2),
    new THREE.MeshStandardMaterial({ color: 0xd9d7ce, roughness: 0.4, metalness: 0.2 })
  );
  base.position.y = 0.15;
  base.castShadow = true;
  base.receiveShadow = true;
  g.add(base);

  // Advantest Final ATE Tester Tower (high-performance digital testing)
  const testRack = new THREE.Mesh(
    new THREE.BoxGeometry(1.6, 2.4, 1.4),
    new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.3, metalness: 0.8 })
  );
  testRack.position.set(-1.0, 1.5, -0.6);
  testRack.castShadow = true;
  g.add(testRack);

  // LED status displays on rack
  for (let row = 0; row < 3; row++) {
    const led = new THREE.Mesh(
      new THREE.PlaneGeometry(0.8, 0.18),
      new THREE.MeshBasicMaterial({ color: row === 0 ? 0x22c55e : 0x06b6d4 })
    );
    led.position.set(-1.0, 2.2 - row * 0.3, 0.12);
    g.add(led);
  }

  // Finished Systems Showcase:
  // 1. Data Center AI Server Blade
  const serverBlade = new THREE.Mesh(
    new THREE.BoxGeometry(0.5, 1.6, 0.9),
    new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.3, metalness: 0.85 })
  );
  serverBlade.position.set(0.6, 1.1, -0.8);
  g.add(serverBlade);

  // 2. Smartphone Logic Board
  const phone = new THREE.Mesh(
    new THREE.BoxGeometry(0.4, 0.8, 0.05),
    new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.2, metalness: 0.9 })
  );
  phone.position.set(0.6, 0.7, 0.2);
  g.add(phone);

  // 3. Autonomous Electric Vehicle ECU Module
  const ecu = new THREE.Mesh(
    new THREE.BoxGeometry(0.8, 0.35, 0.6),
    new THREE.MeshStandardMaterial({ color: 0x94a3b8, roughness: 0.4, metalness: 0.7 })
  );
  ecu.position.set(0.7, 0.5, 1.0);
  g.add(ecu);

  addStationBadge(g, '05: FINAL TEST ➔ SYSTEMS', 'Advantest · Servers · Phones · Vehicles');

  scene.add(g);
  stationList.push({ id: 'final_test_systems', group: g });
}

// Overhead automated material handling system (AMHS / OHT track) with moving FOUP carrier
function buildOHTTrack(scene: THREE.Scene, ohtPodRef: React.MutableRefObject<THREE.Group | null>) {
  // Track rails running above the cleanroom bays
  const trackGeo = new THREE.TorusGeometry(11, 0.08, 12, 48);
  const trackMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, roughness: 0.3, metalness: 0.8 });
  const track = new THREE.Mesh(trackGeo, trackMat);
  track.rotation.x = Math.PI / 2;
  track.position.set(0, 6.2, 0);
  scene.add(track);

  // OHT Automated Wafer FOUP Carrier Pod
  const pod = new THREE.Group();
  pod.position.set(0, 6.0, 0);

  // Carrier arm
  const hanger = new THREE.Mesh(
    new THREE.CylinderGeometry(0.04, 0.04, 0.5),
    new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.4, metalness: 0.8 })
  );
  hanger.position.y = 0.25;
  pod.add(hanger);

  // Semi-translucent FOUP enclosure (cleanroom sealed wafer cassette)
  const foup = new THREE.Mesh(
    new THREE.BoxGeometry(0.7, 0.6, 0.7),
    new THREE.MeshPhysicalMaterial({
      color: 0x38bdf8,
      roughness: 0.2,
      transmission: 0.6,
      thickness: 0.3,
      transparent: true,
      opacity: 0.8
    })
  );
  foup.position.y = -0.2;
  pod.add(foup);

  scene.add(pod);
  ohtPodRef.current = pod;
}

// Build floating 300mm Silicon Wafer with realistic multi-layer iridescent circuit diffraction
function buildFloatingWafer(): THREE.Group {
  const g = new THREE.Group();
  g.position.set(0, 2.2, 0);

  // 300mm silicon wafer disk
  const waferGeo = new THREE.CylinderGeometry(1.6, 1.6, 0.04, 64);

  // Procedural canvas texture simulating the grid of dies and thin-film optical interference
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    // Mirror silicon base
    ctx.fillStyle = '#1e242c';
    ctx.fillRect(0, 0, 1024, 1024);

    // Die grid
    const dieSize = 36;
    const gap = 3;
    const center = 512;
    const radius = 480;

    for (let x = 32; x < 992; x += dieSize + gap) {
      for (let y = 32; y < 992; y += dieSize + gap) {
        const dx = x + dieSize / 2 - center;
        const dy = y + dieSize / 2 - center;
        if (Math.hypot(dx, dy) < radius) {
          // Iridescent subtle rainbow tint across wafer surface
          const angle = Math.atan2(dy, dx);
          const hue = Math.floor((angle / Math.PI + 1) * 180 + (Math.hypot(dx, dy) / radius) * 60) % 360;
          ctx.fillStyle = `hsl(${hue}, 45%, 48%)`;
          ctx.fillRect(x, y, dieSize, dieSize);

          // Internal circuit tracks
          ctx.fillStyle = `hsl(${hue}, 50%, 65%)`;
          ctx.fillRect(x + 4, y + 4, dieSize - 8, dieSize - 8);
          ctx.fillStyle = '#0f172a';
          ctx.fillRect(x + 10, y + 10, dieSize - 20, dieSize - 20);
        }
      }
    }
  }

  const waferTex = new THREE.CanvasTexture(canvas);
  waferTex.colorSpace = THREE.SRGBColorSpace;

  const waferMat = new THREE.MeshStandardMaterial({
    map: waferTex,
    roughness: 0.12,
    metalness: 0.95
  });

  const waferMesh = new THREE.Mesh(waferGeo, waferMat);
  waferMesh.castShadow = true;
  g.add(waferMesh);

  return g;
}

// Build authentic 3D Cutaway of the Packaged Semiconductor matching the infographic diagram:
// Mold compound, Silicon Chip (die), Package Substrate, ABF dielectric layers, Interconnects, Solder balls!
function buildCutawayPackage(): THREE.Group {
  const g = new THREE.Group();
  g.position.set(0, 2.2, 0);

  // 1. Epoxy Mold Compound (cutaway on one half to reveal the internal die)
  const moldGeo = new THREE.BoxGeometry(2.4, 0.45, 2.4);
  const moldMat = new THREE.MeshStandardMaterial({
    color: 0x334155, // dark protective resin
    roughness: 0.6,
    metalness: 0.15
  });
  const mold = new THREE.Mesh(moldGeo, moldMat);
  mold.position.y = 0.55;
  g.add(mold);

  // 2. Silicon Chip (Die) inside
  const dieGeo = new THREE.BoxGeometry(1.4, 0.2, 1.4);
  const dieMat = new THREE.MeshStandardMaterial({
    color: 0x94a3b8, // shiny silicon die
    roughness: 0.15,
    metalness: 0.95
  });
  const die = new THREE.Mesh(dieGeo, dieMat);
  die.position.y = 0.28;
  g.add(die);

  // 3. ABF Dielectric Layers (Ajinomoto Build-up Film thermoset insulation)
  const abfGeo = new THREE.BoxGeometry(1.8, 0.08, 1.8);
  const abfMat = new THREE.MeshStandardMaterial({
    color: 0xd97706, // golden amber dielectric film
    roughness: 0.3,
    metalness: 0.6
  });
  const abf = new THREE.Mesh(abfGeo, abfMat);
  abf.position.y = 0.14;
  g.add(abf);

  // 4. Package Substrate (IBIDEN multi-layer circuit carrier)
  const subGeo = new THREE.BoxGeometry(2.8, 0.22, 2.8);
  const subMat = new THREE.MeshStandardMaterial({
    color: 0x15803d, // iconic high-density green substrate
    roughness: 0.4,
    metalness: 0.3
  });
  const substrate = new THREE.Mesh(subGeo, subMat);
  substrate.position.y = -0.01;
  g.add(substrate);

  // 5. BGA Solder Balls Array underneath
  const ballGeo = new THREE.SphereGeometry(0.08, 16, 16);
  const ballMat = new THREE.MeshStandardMaterial({
    color: 0xe2e8f0,
    roughness: 0.15,
    metalness: 0.95
  });

  const step = 0.4;
  for (let x = -1.0; x <= 1.0; x += step) {
    for (let z = -1.0; z <= 1.0; z += step) {
      const ball = new THREE.Mesh(ballGeo, ballMat);
      ball.position.set(x, -0.22, z);
      g.add(ball);
    }
  }

  return g;
}

// Cleanroom Station Badge
function addStationBadge(group: THREE.Group, title: string, subtitle: string) {
  // Little wooden stand with ivory plate
  const stand = new THREE.Mesh(
    new THREE.BoxGeometry(2.4, 0.5, 0.1),
    new THREE.MeshStandardMaterial({ color: 0xfffcf7, roughness: 0.4, metalness: 0.1 })
  );
  stand.position.set(0, 0.4, 1.8);
  group.add(stand);

  // Red Japanese seal accent (vermilion square)
  const seal = new THREE.Mesh(
    new THREE.BoxGeometry(0.18, 0.18, 0.02),
    new THREE.MeshBasicMaterial({ color: 0xd93829 })
  );
  seal.position.set(-1.0, 0.4, 1.86);
  group.add(seal);
}
