# Build Notes — One Chip, One Road

Date: 20 October 2026  
Status: Iteration 6 complete (Audio engine syntax fix, OrbitControls interactive 3D inspection, and tactile procedural sound integration across all 7 stops)  
Spec: [GUIDELINES.md](GUIDELINES.md)

---

## 1. What Works Across All 7 Stops

- **App Build and Startup**: Clean compilation, zero TypeScript linter errors, clean build verification.
- **The 7-Stop World Route**:
  `Norway → Germany → Japan → Taiwan → Malaysia → China mainland → User`
  with continuous animated path tracking, numbered stations, and stage status (active, completed, locked).
- **SNES 16-Bit Style World Map**:
  - Pixel terrain outlines and water wave grid texture inspired by *Super Mario World* and *Donkey Kong Country*.
  - Pixel landmark badges for all 7 stops:
    * ⛰️ Stop 1: Norway (Quarry & Smelter)
    * 🧪 Stop 2: Germany (Chemical Tower)
    * ⛩️ Stop 3: Japan (Wafer Cleanroom)
    * ⚡ Stop 4: Taiwan (Advanced Fab)
    * 📦 Stop 5: Malaysia (OSAT Packaging)
    * 🏭 Stop 6: China mainland (Phone Assembly)
    * 📱 Stop 7: User (Smartphone in Use)
  - Animated bouncing marker indicating the active stage.
- **3D Workspace Navigation & OrbitControls**:
  - Full interactive orbit/drag controls with inertia damping (`dampingFactor: 0.05`), distance constraints, and floor boundary clipping prevention.
  - One-click camera buttons for **Overview** (isometric default) and **Inspection** (close-up tool focus), with camera reset.
  - Microscopic cross-section view toggle for Stops 4 and 5.
- **Procedural Web Audio Engine (100% Zero-Dependency)**:
  - Ambient pentatonic chime soundscape with global header toggle.
  - 16-bit UI select blips on all controls and tabs.
  - "STAGE CLEAR!" retro four-note major arpeggio fanfare on stage completion.
  - Tactile procedural sound effects hooked to real actions:
    * **Stop 1**: Quartz rock sorting clink (`playClink`), electrical arc hum (`playCrystalHum`), tapping sound.
    * **Stop 2**: Fluidized bed reaction & fractional distillation bubbling (`playBubble`), Siemens bell jar deposition (`playCrystalHum`).
    * **Stop 3**: Czochralski monocrystalline crystal pull hum (`playCrystalHum`), diamond wire slicing (`playClink`), CMP polishing and ultrasonic inspection ping (`playProbePing`).
    * **Stop 4**: Reticle exposure laser pulse (`playExposure`), 48-die electrical wafer probe pin sweep with pass/defect frequencies (`playProbePing`).
    * **Stop 5**: Dicing blade clinks (`playClink`), pick-and-place select, ultrasonic wire bonding clicks, mold resin bubbling, final package ATE test ping.
    * **Stop 6**: SMT solder reflow, chassis torque screws, automated three-tier factory bus diagnostics pings.
    * **Stop 7**: Retail unbox chime, power button boot chime (`playBootChime` with Cmaj7 chord envelope), and Silicon App monitor launch.
- **Mandatory Map Legend**:
  *"This is a representative teaching scenario grounded in real regional activities. It is not a documented supplier itinerary for an actual iPhone chip."*
- **Sources & Evidence Register**: Full citation list for R01–R08, R11, R13–R15, R18 from `SOURCES.md`.
- **State Persistence**:
  - Consistent lot identity (`LOT-2026-X1`), tracking quantity transformations throughout the whole world trip.
  - Stage-boundary `localStorage` save/resume and full run reset.
  - Dual advancement options: earned hands-on tasks vs. clearly labeled `Complete Placeholder (Demo Output)`.

---

## 2. Design & Scope Boundaries Checked

- **Sound**: Procedural Web Audio API only; zero external audio files. Includes persistent mute toggle.
- **Naming**: The product is strictly called **"chip"**; no tech nodes or nanometer specifications.
- **Single Road**: Exactly one road with seven stops; no side quests or branches.
- **Sources**: Directly linked to `SOURCES.md` evidence register.
- **Input/Tool/Output Discipline**: Labeled physical zones in every 3D workspace.
- **Pre-Conditions**: Pre-made designs, masks, tools, chemicals, and phone modules clearly identified as arrived ready-made without creating extra playable supplier branches.
