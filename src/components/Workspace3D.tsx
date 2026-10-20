import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RouteStop, StopId, CargoState, ROUTE_STOPS } from '../types/route';
import { Stop1SmelterWorkspace } from './Stop1SmelterWorkspace';
import { Stop2PurifyWorkspace } from './Stop2PurifyWorkspace';
import { Stop3WaferWorkspace } from './Stop3WaferWorkspace';
import { Stop4CircuitWorkspace } from './Stop4CircuitWorkspace';
import { Stop5PackagingWorkspace } from './Stop5PackagingWorkspace';
import { Stop6AssemblyWorkspace } from './Stop6AssemblyWorkspace';
import { sound } from '../services/audio';
import { ASSETS } from '../content/assets';
import { STAGE_INTROS } from '../content/dialogues';
import { StageIntro } from './StageIntro';
import { NorwayManufacturing } from './NorwayManufacturing';
import {
  RotateCcw,
  Eye,
  Camera,
  Layers,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Maximize2,
  Smartphone,
  Sparkles,
  Globe,
  Package,
  Power,
  AppWindow,
  Cpu
} from 'lucide-react';

interface Workspace3DProps {
  stop: RouteStop;
  cargo: CargoState;
  onComplete: (isPlaceholder: boolean, updatedCargo: Partial<CargoState>) => void;
  onReturnToMap: () => void;
}

export const Workspace3D: React.FC<Workspace3DProps> = ({
  stop,
  cargo,
  onComplete,
  onReturnToMap
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  // Arrival scene on the stage backdrop first (when scripted), then the 3D workshop
  const backdrop = ASSETS.stages[stop.id];
  const introScript = STAGE_INTROS[stop.id];
  const [phase, setPhase] = useState<'intro' | 'work'>(backdrop && introScript ? 'intro' : 'work');
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const animIdRef = useRef<number | null>(null);

  // Dynamic 3D model references
  const dynamicIngotRef = useRef<THREE.Mesh | null>(null);
  const dynamicWaferRef = useRef<THREE.Mesh | null>(null);
  const dynamicPackageRef = useRef<THREE.Mesh | null>(null);
  const dynamicPhoneRef = useRef<THREE.Mesh | null>(null);

  // Camera views
  const [viewAngle, setViewAngle] = useState<'isometric' | 'inspection'>('isometric');
  const [showCrossSection, setShowCrossSection] = useState<boolean>(false);

  // Stop 1 states (Norway)
  const [stop1Ready, setStop1Ready] = useState<boolean>(false);
  const [stop1SiliconBatchKg, setStop1SiliconBatchKg] = useState<number>(12);

  // Stop 2 states (Germany)
  const [stop2Ready, setStop2Ready] = useState<boolean>(false);
  const [stop2PolysiliconBatchKg, setStop2PolysiliconBatchKg] = useState<number>(10);

  // Stop 3 state
  const [stop3Ready, setStop3Ready] = useState<boolean>(false);
  const [stop3WafersCount, setStop3WafersCount] = useState<number>(25);

  // Stop 4 state
  const [stop4Ready, setStop4Ready] = useState<boolean>(false);
  const [stop4GoodDies, setStop4GoodDies] = useState<number>(44);
  const [stop4TotalDies, setStop4TotalDies] = useState<number>(48);

  // Stop 5 state
  const [stop5Ready, setStop5Ready] = useState<boolean>(false);
  const [stop5ChipSerial, setStop5ChipSerial] = useState<string>('CHIP-LOT26-D28');

  // Stop 6 state
  const [stop6Ready, setStop6Ready] = useState<boolean>(false);
  const [stop6PhoneSerial, setStop6PhoneSerial] = useState<string>('PHONE-A18-8842');

  // Stop 7 Ending states
  const [unboxStep, setUnboxStep] = useState<'box' | 'unboxed' | 'booting' | 'home' | 'app'>('box');

  // Initialize Three.js scene
  useEffect(() => {
    if (phase !== 'work' || stop.id === 1) return;
    if (!mountRef.current) return;
    const container = mountRef.current;
    const width = container.clientWidth || 800;
    const height = container.clientHeight || 500;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf1efe9);
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 100);
    cameraRef.current = camera;
    updateCameraPosition(viewAngle, camera);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    rendererRef.current = renderer;

    container.replaceChildren(renderer.domElement);

    // OrbitControls for smooth interactive inspection
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.target.set(0, 1.2, 0);
    controls.maxPolarAngle = Math.PI / 2 - 0.05;
    controls.minDistance = 3;
    controls.maxDistance = 28;
    controlsRef.current = controls;

    // Studio lighting & environment
    const pmrem = new THREE.PMREMGenerator(renderer);
    scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    pmrem.dispose();

    const hemi = new THREE.HemisphereLight(0xfffdfa, 0xccd4db, 0.8);
    scene.add(hemi);

    const keyLight = new THREE.DirectionalLight(0xfff8ee, 1.6);
    keyLight.position.set(12, 18, 10);
    keyLight.castShadow = true;
    scene.add(keyLight);

    // Build the 3D workspace models for this stop
    buildWorkspaceStage(scene, stop.id, dynamicIngotRef, dynamicWaferRef, dynamicPackageRef, dynamicPhoneRef);

    // Render loop
    const animate = () => {
      animIdRef.current = requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    const onResize = () => {
      if (!container || !renderer || !camera) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', onResize);

    return () => {
      if (animIdRef.current) cancelAnimationFrame(animIdRef.current);
      window.removeEventListener('resize', onResize);
      controls.dispose();
      renderer.dispose();
    };
  }, [stop.id, phase]);

  // Global Escape key listener to return to map per GUIDELINES
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        sound.playClick();
        onReturnToMap();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onReturnToMap]);

  const updateCameraPosition = (view: 'isometric' | 'inspection', cam: THREE.PerspectiveCamera) => {
    if (view === 'isometric') {
      cam.position.set(14, 12, 14);
      cam.lookAt(0, 1.2, 0);
      if (controlsRef.current) {
        controlsRef.current.target.set(0, 1.2, 0);
      }
    } else {
      cam.position.set(0, 3.5, 6.5);
      cam.lookAt(0, 1.5, 0);
      if (controlsRef.current) {
        controlsRef.current.target.set(0, 1.5, 0);
      }
    }
  };

  const handleToggleCamera = (newView: 'isometric' | 'inspection') => {
    sound.playSelect();
    setViewAngle(newView);
    if (cameraRef.current) {
      updateCameraPosition(newView, cameraRef.current);
    }
  };

  const handleResetCamera = () => {
    sound.playSelect();
    if (cameraRef.current) {
      updateCameraPosition(viewAngle, cameraRef.current);
    }
  };

  if (phase === 'intro' && backdrop && introScript) {
    return (
      <StageIntro
        stop={stop}
        lotId={cargo.lotId}
        backdrop={backdrop}
        script={introScript}
        onDone={() => setPhase('work')}
        onReturnToMap={onReturnToMap}
      />
    );
  }

  if (Number(stop.id) === 1) {
    return <NorwayManufacturing onComplete={onComplete} onReturnToMap={onReturnToMap} />;
  }

  return (
    <div className="flex flex-col h-full bg-[#f8f6f0] text-stone-900 select-none overflow-hidden font-sans">
      {/* Top Bar: Stop Identification & Areas */}
      <div className="px-6 py-3 bg-[#ece8de] border-b border-stone-300 flex flex-wrap items-center justify-between gap-3 shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-stone-900 text-white rounded">
              STAGE 0{stop.id}
            </span>
            <span className="text-xs text-stone-600 font-bold">
              {stop.location} — {stop.name}
            </span>
            <span className="text-xs text-stone-400 font-mono">Lot #{cargo.lotId}</span>
          </div>
          <div className="text-xs text-stone-600 mt-0.5">
            <strong>Input:</strong> {stop.inputDescription} → <strong>Output:</strong> {stop.outputDescription}
          </div>
        </div>

        {/* Camera controls & Return */}
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-white border border-stone-300 rounded-lg p-0.5 text-xs">
            <button
              onClick={() => handleToggleCamera('isometric')}
              className={`px-2.5 py-1 rounded transition cursor-pointer ${
                viewAngle === 'isometric' ? 'bg-stone-800 text-white font-bold' : 'text-stone-700 hover:bg-stone-100'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => handleToggleCamera('inspection')}
              className={`px-2.5 py-1 rounded transition cursor-pointer ${
                viewAngle === 'inspection' ? 'bg-stone-800 text-white font-bold' : 'text-stone-700 hover:bg-stone-100'
              }`}
            >
              Inspection
            </button>
          </div>

          <button
            onClick={handleResetCamera}
            className="p-1.5 bg-white hover:bg-stone-100 text-stone-700 border border-stone-300 rounded-lg transition cursor-pointer"
            title="Reset Camera"
          >
            <Camera className="w-4 h-4" />
          </button>

          <button
            onClick={() => {
              sound.playSelect();
              onReturnToMap();
            }}
            className="px-3 py-1.5 text-xs font-semibold bg-white hover:bg-stone-100 text-stone-800 border border-stone-300 rounded-lg shadow-2xs transition cursor-pointer"
          >
            Back to Map
          </button>
        </div>
      </div>

      {/* Main Workspace Body */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden relative">
        {/* Left: 3D Viewport with labeled physical areas (Input -> Tool -> Output) */}
        <div className="flex-1 relative h-64 md:h-full bg-[#f1efe9]">
          <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

          {/* Overlay Labels for Visible Areas as required by Section 3 of Guidelines */}
          <div className="absolute top-3 inset-x-4 pointer-events-none flex justify-between text-xs font-mono font-bold text-stone-700">
            <span className="px-2.5 py-1 bg-white/90 rounded border border-stone-300 shadow-2xs">
              1. INPUT AREA
            </span>
            <span className="px-2.5 py-1 bg-white/90 rounded border border-stone-300 shadow-2xs">
              2. TOOL WORKSPACE
            </span>
            <span className="px-2.5 py-1 bg-white/90 rounded border border-stone-300 shadow-2xs">
              3. OUTPUT AREA
            </span>
          </div>

          {/* Cross-section / Magnified Toggle when applicable */}
          {(stop.id === 4 || stop.id === 5) && (
            <button
              onClick={() => {
                sound.playSelect();
                setShowCrossSection(!showCrossSection);
              }}
              className="absolute bottom-4 left-4 flex items-center gap-1.5 px-3 py-1.5 bg-white/95 text-stone-800 border border-stone-300 rounded-lg shadow-md text-xs font-bold transition hover:bg-stone-50 cursor-pointer"
            >
              <Layers className="w-4 h-4 text-stone-600" />
              <span>{showCrossSection ? 'Hide Cross-Section' : 'Show Microscopic Cross-Section'}</span>
            </button>
          )}

          {/* Cross-section popup overlay */}
          {showCrossSection && (
            <div className="absolute inset-x-6 bottom-16 bg-stone-900/95 text-white p-4 rounded-xl border border-stone-700 shadow-xl space-y-2 text-xs font-mono">
              <div className="flex justify-between items-center text-amber-400 font-bold">
                <span>MICROSCOPIC CROSS-SECTION (Scale: ~2000x)</span>
                <button
                  onClick={() => setShowCrossSection(false)}
                  className="text-stone-400 hover:text-white"
                >
                  ✕
                </button>
              </div>
              {stop.id === 4 ? (
                <div className="space-y-1 text-stone-300 text-[11px]">
                  <div>[Surface Passivation Layer SiO2]</div>
                  <div>[Etched Polysilicon Transistor Gates] ── ── ──</div>
                  <div>[Gate Dielectric Oxide (Atomic thickness)]</div>
                  <div>[Bulk Silicon Substrate Base]</div>
                </div>
              ) : (
                <div className="space-y-1 text-stone-300 text-[11px]">
                  <div>[Protective Epoxy Mold Compound Encapsulation]</div>
                  <div>[Silicon Die Pad with Gold Wire Bonds]</div>
                  <div>[Organic Package Substrate / Leadframe]</div>
                  <div>[BGA Solder Balls Array]</div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right: Interaction Panel */}
        <div className="w-full md:w-96 bg-[#f7f5ef] border-t md:border-t-0 md:border-l border-stone-300 p-5 flex flex-col justify-between overflow-y-auto">
          <div className="space-y-4">
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-stone-500">
                TASK CONTROLS
              </span>
              <h3 className="text-base font-bold text-stone-900 mt-0.5">
                {stop.purpose}
              </h3>
            </div>

            {/* STOP 1: NORWAY SMELTER (Rich Hands-on Implementation) */}
            {stop.id === 1 && (
              <Stop1SmelterWorkspace
                cargo={cargo}
                onSmeltingCompleted={(batchKg) => {
                  setStop1Ready(true);
                  setStop1SiliconBatchKg(batchKg);
                }}
                onStepChange={() => {}}
              />
            )}

            {/* STOP 2: GERMANY PURIFICATION (Rich Hands-on Implementation) */}
            {stop.id === 2 && (
              <Stop2PurifyWorkspace
                cargo={cargo}
                onPurificationCompleted={(batchKg) => {
                  setStop2Ready(true);
                  setStop2PolysiliconBatchKg(batchKg);
                }}
                onStepChange={() => {}}
              />
            )}

            {/* STOP 3: JAPAN WAFERS */}
            {stop.id === 3 && (
              <Stop3WaferWorkspace
                cargo={cargo}
                onSubstepChange={(substep) => {
                  if (substep === 'polish' && dynamicWaferRef.current) {
                    (dynamicWaferRef.current.material as THREE.MeshStandardMaterial).roughness = 0.08;
                  }
                }}
                onWaferBatchReady={(count) => {
                  setStop3Ready(true);
                  setStop3WafersCount(count);
                }}
              />
            )}

            {/* STOP 4: TAIWAN CIRCUITS */}
            {stop.id === 4 && (
              <Stop4CircuitWorkspace
                cargo={cargo}
                onStepChange={(stepIdx) => {
                  if (dynamicWaferRef.current) {
                    const mat = dynamicWaferRef.current.material as THREE.MeshStandardMaterial;
                    if (stepIdx === 1) mat.color.setHex(0x10b981);
                    if (stepIdx === 2) mat.color.setHex(0xf59e0b);
                    if (stepIdx === 3) mat.color.setHex(0x3b82f6);
                    if (stepIdx >= 5) mat.color.setHex(0x0f766e);
                  }
                }}
                onProbeCompleted={(total, good) => {
                  setStop4Ready(true);
                  setStop4TotalDies(total);
                  setStop4GoodDies(good);
                }}
              />
            )}

            {/* STOP 5: MALAYSIA PACKAGING (Rich Hands-on Implementation) */}
            {stop.id === 5 && (
              <Stop5PackagingWorkspace
                cargo={cargo}
                onPackagingCompleted={(serial) => {
                  setStop5Ready(true);
                  setStop5ChipSerial(serial);
                }}
                onStepChange={(step) => {
                  if (dynamicPackageRef.current) {
                    const mat = dynamicPackageRef.current.material as THREE.MeshStandardMaterial;
                    if (step === 'wire') mat.color.setHex(0xd97706);
                    if (step === 'mold' || step === 'test') mat.color.setHex(0x18181b);
                  }
                }}
              />
            )}

            {/* STOP 6: CHINA MAINLAND PHONE ASSEMBLY (Rich Hands-on Implementation) */}
            {stop.id === 6 && (
              <Stop6AssemblyWorkspace
                cargo={cargo}
                onAssemblyCompleted={(serial) => {
                  setStop6Ready(true);
                  setStop6PhoneSerial(serial);
                }}
                onStepChange={() => {}}
              />
            )}

            {/* STOP 7: USER (FINAL DESTINATION & REPLAY) */}
            {stop.id === 7 && (
              <div className="space-y-4">
                <div className="bg-white p-4 rounded-xl border border-stone-200 text-xs space-y-3">
                  <div className="text-center space-y-1">
                    <span className="px-2 py-0.5 bg-stone-900 text-white text-[10px] font-bold rounded uppercase">
                      FINAL DESTINATION
                    </span>
                    <h4 className="font-bold text-stone-900 text-sm">
                      Deliver & Use: The Complete Life Cycle
                    </h4>
                    <p className="text-stone-500 text-[11px]">
                      Your generic silicon chip, now running daily software in someone&apos;s hands.
                    </p>
                  </div>

                  {/* Interactive Phone Simulation */}
                  <div className="bg-stone-950 text-white rounded-2xl p-4 flex flex-col items-center space-y-3 shadow-inner">
                    {/* Phone Screen Mockup */}
                    <div className="w-40 h-64 bg-stone-900 border-4 border-stone-700 rounded-3xl p-3 flex flex-col justify-between relative overflow-hidden shadow-2xl">
                      {/* Top speaker notch */}
                      <div className="w-12 h-2.5 bg-stone-950 rounded-full mx-auto" />

                      {/* Screen content based on unboxStep */}
                      <div className="flex-1 flex flex-col items-center justify-center text-center p-2">
                        {unboxStep === 'box' && (
                          <div className="space-y-1 text-stone-400">
                            <Package className="w-8 h-8 mx-auto text-stone-500" />
                            <span className="text-[10px] font-mono">Retail Box Sealed</span>
                          </div>
                        )}

                        {unboxStep === 'unboxed' && (
                          <div className="space-y-1 text-stone-400">
                            <Power className="w-8 h-8 mx-auto text-amber-400" />
                            <span className="text-[10px] font-mono">Ready to Power On</span>
                          </div>
                        )}

                        {unboxStep === 'booting' && (
                          <div className="space-y-2 text-center animate-pulse">
                            <div className="w-8 h-8 rounded-full bg-white mx-auto flex items-center justify-center text-stone-950 font-bold text-xs">
                              
                            </div>
                            <span className="text-[9px] font-mono text-stone-400">Booting Kernel...</span>
                          </div>
                        )}

                        {unboxStep === 'home' && (
                          <div className="w-full space-y-3">
                            <div className="text-[9px] font-mono text-stone-400">9:41 AM · 100%</div>
                            <button
                              onClick={() => setUnboxStep('app')}
                              className="w-12 h-12 bg-red-600 rounded-2xl mx-auto flex flex-col items-center justify-center text-white shadow-md hover:scale-105 transition cursor-pointer"
                              title="Open Silicon Monitor App"
                            >
                              <Cpu className="w-5 h-5" />
                              <span className="text-[7px] font-bold mt-0.5">CHIP</span>
                            </button>
                            <span className="text-[9px] text-stone-300 font-medium block">
                              Tap Chip Monitor
                            </span>
                          </div>
                        )}

                        {unboxStep === 'app' && (
                          <div className="w-full bg-stone-800 p-2 rounded-xl text-left font-mono text-[9px] space-y-1">
                            <div className="text-emerald-400 font-bold">CHIP MONITOR v1.0</div>
                            <div className="text-stone-300">Lot: {cargo.lotId}</div>
                            <div className="text-stone-300">Serial: {cargo.selectedChipSerial || 'CHIP-LOT26-D28'}</div>
                            <div className="text-stone-300">Phone: {cargo.phoneSerial || 'PHONE-A18-8842'}</div>
                            <div className="text-amber-300 font-bold pt-1 border-t border-stone-700">
                              STATUS: ACTIVE 60 FPS
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Bottom home bar */}
                      <div className="w-16 h-1 bg-stone-600 rounded-full mx-auto" />
                    </div>

                    {/* Stage 7 User Actions */}
                    <div className="w-full space-y-1.5">
                      {unboxStep === 'box' && (
                        <button
                          onClick={() => {
                            sound.playSelect();
                            setUnboxStep('unboxed');
                          }}
                          className="w-full py-2 bg-stone-800 hover:bg-stone-700 text-white font-bold text-xs rounded-xl transition cursor-pointer"
                        >
                          1. Unbox Phone
                        </button>
                      )}

                      {unboxStep === 'unboxed' && (
                        <button
                          onClick={() => {
                            sound.playBootChime();
                            setUnboxStep('booting');
                            setTimeout(() => {
                              sound.playSelect();
                              setUnboxStep('home');
                            }, 1100);
                          }}
                          className="w-full py-2 bg-stone-800 hover:bg-stone-700 text-white font-bold text-xs rounded-xl transition cursor-pointer"
                        >
                          2. Press Power Button
                        </button>
                      )}

                      {unboxStep === 'home' && (
                        <button
                          onClick={() => {
                            sound.playSelect();
                            setUnboxStep('app');
                          }}
                          className="w-full py-2 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl transition cursor-pointer"
                        >
                          3. Launch Silicon App
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* The 7-Stop Journey Recap Table */}
                {unboxStep === 'app' && (
                  <div className="bg-white p-4 rounded-xl border border-stone-200 text-xs space-y-3">
                    <div className="flex items-center gap-1.5 font-bold text-stone-900">
                      <Globe className="w-4 h-4 text-red-600" />
                      <span>The Worldwide Journey Complete</span>
                    </div>

                    <div className="space-y-1.5 text-[11px]">
                      {ROUTE_STOPS.map((s) => (
                        <div key={s.id} className="flex justify-between items-center p-1.5 bg-stone-50 rounded">
                          <span className="font-bold text-stone-800">{s.id}. {s.location}</span>
                          <span className="text-stone-500 font-mono text-[10px]">{s.name}</span>
                        </div>
                      ))}
                    </div>

                    <button
                      onClick={() => {
                        sound.playSelect();
                        onReturnToMap();
                      }}
                      className="w-full py-2.5 bg-red-700 hover:bg-red-800 text-white font-bold rounded-xl transition cursor-pointer"
                    >
                      Return to Map & Review Route
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Action completion buttons: Real action vs Skeleton Placeholder */}
          {stop.id !== 7 && (
            <div className="pt-4 border-t border-stone-300 space-y-2">
              {/* Primary Earned Advance Button */}
              <button
                onClick={() => {
                  sound.playSelect();
                  let updates: Partial<CargoState> = {};
                  if (stop.id === 1) updates = { siliconMetalBatchKg: stop1SiliconBatchKg };
                  if (stop.id === 2) updates = { polysiliconBatchKg: stop2PolysiliconBatchKg };
                  if (stop.id === 3) updates = { wafersProducedCount: stop3WafersCount };
                  if (stop.id === 4) updates = { diesOnWaferCount: stop4TotalDies, goodDiesCount: stop4GoodDies };
                  if (stop.id === 5) updates = { selectedChipSerial: stop5ChipSerial };
                  if (stop.id === 6) updates = { phoneSerial: stop6PhoneSerial, isPhoneOperational: true };

                  onComplete(false, updates);
                }}
                disabled={
                  (stop.id === 1 && !stop1Ready) ||
                  (stop.id === 2 && !stop2Ready) ||
                  (stop.id === 3 && !stop3Ready) ||
                  (stop.id === 4 && !stop4Ready) ||
                  (stop.id === 5 && !stop5Ready) ||
                  (stop.id === 6 && !stop6Ready)
                }
                className="w-full py-3 bg-red-700 hover:bg-red-800 disabled:bg-stone-300 disabled:text-stone-500 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>
                  Release Output & Advance to Stop {stop.id + 1}
                </span>
              </button>

              {/* Explicit Placeholder Button as specified in GUIDELINES.md Section 7 & 9 */}
              <button
                onClick={() => {
                  sound.playSelect();
                  let demoUpdates: Partial<CargoState> = {};
                  if (stop.id === 1) demoUpdates = { siliconMetalBatchKg: 12 };
                  if (stop.id === 2) demoUpdates = { polysiliconBatchKg: 10 };
                  if (stop.id === 3) demoUpdates = { wafersProducedCount: 25 };
                  if (stop.id === 4) demoUpdates = { diesOnWaferCount: 48, goodDiesCount: 42 };
                  if (stop.id === 5) demoUpdates = { selectedChipSerial: 'CHIP-DEMO-D14' };
                  if (stop.id === 6) demoUpdates = { phoneSerial: 'PHONE-DEMO-001', isPhoneOperational: true };

                  onComplete(true, demoUpdates);
                }}
                className="w-full py-2 bg-stone-200 hover:bg-stone-300 text-stone-700 text-[11px] font-mono rounded-lg transition border border-stone-300 cursor-pointer"
                title="Fast-forward using labeled demonstration output"
              >
                Complete Placeholder (Demo Output)
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ----------------------------------------------------------------------------------
// 3D Procedural Workspaces Generator for Stops 1–7
// ----------------------------------------------------------------------------------
function buildWorkspaceStage(
  scene: THREE.Scene,
  stopId: StopId,
  dynamicIngotRef: React.MutableRefObject<THREE.Mesh | null>,
  dynamicWaferRef: React.MutableRefObject<THREE.Mesh | null>,
  dynamicPackageRef: React.MutableRefObject<THREE.Mesh | null>,
  dynamicPhoneRef: React.MutableRefObject<THREE.Mesh | null>
) {
  while (scene.children.length > 0) {
    scene.remove(scene.children[0]);
  }

  const hemi = new THREE.HemisphereLight(0xfffdfa, 0xccd4db, 0.8);
  scene.add(hemi);

  const keyLight = new THREE.DirectionalLight(0xfff8ee, 1.6);
  keyLight.position.set(12, 18, 10);
  keyLight.castShadow = true;
  scene.add(keyLight);

  const floorGeo = new THREE.BoxGeometry(22, 0.4, 14);
  const floorMat = new THREE.MeshStandardMaterial({ color: 0xe6e3db, roughness: 0.5 });
  const floor = new THREE.Mesh(floorGeo, floorMat);
  floor.position.y = -0.2;
  floor.receiveShadow = true;
  scene.add(floor);

  const inputTable = new THREE.Mesh(
    new THREE.BoxGeometry(4.5, 0.8, 4),
    new THREE.MeshStandardMaterial({ color: 0xd3cebf, roughness: 0.4 })
  );
  inputTable.position.set(-6, 0.4, 0);
  inputTable.castShadow = true;
  inputTable.receiveShadow = true;
  scene.add(inputTable);

  const toolBase = new THREE.Mesh(
    new THREE.BoxGeometry(5.5, 1.2, 5.5),
    new THREE.MeshStandardMaterial({ color: 0x3d4451, roughness: 0.3, metalness: 0.7 })
  );
  toolBase.position.set(0, 0.6, 0);
  toolBase.castShadow = true;
  scene.add(toolBase);

  const outputTable = new THREE.Mesh(
    new THREE.BoxGeometry(4.5, 0.8, 4),
    new THREE.MeshStandardMaterial({ color: 0xd3cebf, roughness: 0.4 })
  );
  outputTable.position.set(6, 0.4, 0);
  outputTable.castShadow = true;
  outputTable.receiveShadow = true;
  scene.add(outputTable);

  if (stopId === 1) {
    for (let i = 0; i < 6; i++) {
      const rock = new THREE.Mesh(
        new THREE.DodecahedronGeometry(0.35 + (i % 3) * 0.1),
        new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.8 })
      );
      rock.position.set(-6 + (i % 3) * 0.6 - 0.6, 1.1, (Math.floor(i / 3) - 0.5) * 0.8);
      scene.add(rock);
    }
    const furnace = new THREE.Mesh(
      new THREE.CylinderGeometry(1.6, 1.8, 3.2, 24),
      new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.4, metalness: 0.8 })
    );
    furnace.position.set(0, 2.4, 0);
    scene.add(furnace);
    const tap = new THREE.Mesh(
      new THREE.CylinderGeometry(0.4, 0.4, 0.2, 16),
      new THREE.MeshBasicMaterial({ color: 0xf97316 })
    );
    tap.position.set(0, 1.5, 1.7);
    scene.add(tap);
    const ingot = new THREE.Mesh(
      new THREE.BoxGeometry(1.8, 0.5, 1.2),
      new THREE.MeshStandardMaterial({ color: 0x64748b, roughness: 0.3, metalness: 0.9 })
    );
    ingot.position.set(6, 1.05, 0);
    scene.add(ingot);
  } else if (stopId === 2) {
    const reactor = new THREE.Mesh(
      new THREE.CylinderGeometry(1.4, 1.4, 4, 32),
      new THREE.MeshStandardMaterial({ color: 0x94a3b8, roughness: 0.2, metalness: 0.85 })
    );
    reactor.position.set(0, 2.8, 0);
    scene.add(reactor);
    const dome = new THREE.Mesh(
      new THREE.SphereGeometry(1.3, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2),
      new THREE.MeshPhysicalMaterial({ color: 0xbae6fd, transmission: 0.7, roughness: 0.1, transparent: true })
    );
    dome.position.set(0, 4.8, 0);
    scene.add(dome);
    const poly = new THREE.Mesh(
      new THREE.CylinderGeometry(0.8, 0.8, 1.2, 16),
      new THREE.MeshStandardMaterial({ color: 0xcbd5e1, roughness: 0.2, metalness: 0.9 })
    );
    poly.position.set(6, 1.4, 0);
    scene.add(poly);
  } else if (stopId === 3) {
    const puller = new THREE.Mesh(
      new THREE.CylinderGeometry(1.2, 1.5, 3.5, 24),
      new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.3, metalness: 0.8 })
    );
    puller.position.set(0, 2.6, 0);
    scene.add(puller);

    const ingot = new THREE.Mesh(
      new THREE.CylinderGeometry(0.45, 0.45, 2.2, 32),
      new THREE.MeshStandardMaterial({ color: 0x94a3b8, roughness: 0.1, metalness: 0.95 })
    );
    ingot.position.set(0, 3.8, 0);
    scene.add(ingot);
    dynamicIngotRef.current = ingot;

    for (let w = 0; w < 4; w++) {
      const wafer = new THREE.Mesh(
        new THREE.CylinderGeometry(1.2, 1.2, 0.04, 32),
        new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.25, metalness: 0.95 })
      );
      wafer.position.set(6, 0.85 + w * 0.08, 0);
      scene.add(wafer);
      if (w === 3) dynamicWaferRef.current = wafer;
    }
  } else if (stopId === 4) {
    const scanner = new THREE.Mesh(
      new THREE.BoxGeometry(3, 4, 3),
      new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.25, metalness: 0.7 })
    );
    scanner.position.set(0, 2.8, 0);
    scene.add(scanner);

    const lens = new THREE.Mesh(
      new THREE.CylinderGeometry(0.5, 0.8, 1.2, 24),
      new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.1, metalness: 0.9 })
    );
    lens.position.set(0, 1.0, 0);
    scene.add(lens);

    const wafer = new THREE.Mesh(
      new THREE.CylinderGeometry(1.4, 1.4, 0.06, 32),
      new THREE.MeshStandardMaterial({ color: 0x0f766e, roughness: 0.2, metalness: 0.8 })
    );
    wafer.position.set(6, 0.85, 0);
    scene.add(wafer);
    dynamicWaferRef.current = wafer;
  } else if (stopId === 5) {
    const bonder = new THREE.Mesh(
      new THREE.BoxGeometry(2.8, 2.8, 2.8),
      new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.3 })
    );
    bonder.position.set(0, 2.2, 0);
    scene.add(bonder);

    const chip = new THREE.Mesh(
      new THREE.BoxGeometry(1.4, 0.2, 1.4),
      new THREE.MeshStandardMaterial({ color: 0x18181b, roughness: 0.5 })
    );
    chip.position.set(6, 0.9, 0);
    scene.add(chip);
    dynamicPackageRef.current = chip;
  } else if (stopId === 6) {
    const mounter = new THREE.Mesh(
      new THREE.BoxGeometry(3.2, 2.4, 3.2),
      new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.3 })
    );
    mounter.position.set(0, 2.0, 0);
    scene.add(mounter);

    const phone = new THREE.Mesh(
      new THREE.BoxGeometry(1.2, 0.1, 2.2),
      new THREE.MeshStandardMaterial({ color: 0x09090b, roughness: 0.2, metalness: 0.8 })
    );
    phone.position.set(6, 0.88, 0);
    scene.add(phone);
    dynamicPhoneRef.current = phone;
  } else if (stopId === 7) {
    const box = new THREE.Mesh(
      new THREE.BoxGeometry(2.2, 0.6, 3.2),
      new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.2 })
    );
    box.position.set(0, 1.5, 0);
    scene.add(box);

    const phone = new THREE.Mesh(
      new THREE.BoxGeometry(1.3, 0.12, 2.4),
      new THREE.MeshStandardMaterial({ color: 0x1e1e24, roughness: 0.15, metalness: 0.9 })
    );
    phone.position.set(0, 2.0, 0);
    scene.add(phone);
  }
}
