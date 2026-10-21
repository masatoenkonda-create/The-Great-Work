/**
 * Arrival scenes: the player walks into the stage backdrop, a local guide introduces the
 * materials for the next level (each one joins the side panel as it is mentioned), then the
 * player walks the hall and gathers them. Played before the detailed workshop.
 * Stops without an entry go straight to the workshop.
 */
import { StopId } from '../types/route';

export type Speaker = 'player' | 'guide';

export interface DialogueLine {
  speaker: Speaker;
  text: string;
  /** Item id that appears in the side panel (and in the hall) when this line starts */
  reveal?: string;
}

export interface ArrivalItem {
  id: string;
  name: string;
  note: string;
  /** Placeholder colour until real item art arrives */
  color: string;
  /** Floor position in backdrop pixels (1376x768) */
  x: number;
}

export interface StageIntroScript {
  guideName: string;
  /** One-line goal shown in the top bar */
  goal: string;
  /** Floor line the characters and items stand on, in backdrop pixels */
  feetY: number;
  /** Screen edge the player walks in from, and where they stop */
  enterFrom: 'left' | 'right';
  playerEndX: number;
  /** Guide's floor position in backdrop pixels */
  guideX: number;
  items: ArrivalItem[];
  lines: DialogueLine[];
  /** Guide's line once everything is gathered */
  readyLine: string;
}

export const PLAYER_NAME = 'YOU';

const WALK_HINT = 'Walk with ← →, press Space to pick things up.';

export const STAGE_INTROS: Partial<Record<StopId, StageIntroScript>> = {
  1: {
    guideName: 'SIGURD',
    goal: 'meet Sigurd and gather what the furnace needs',
    feetY: 700,
    enterFrom: 'right',
    playerEndX: 980,
    guideX: 780,
    items: [
      { id: 'quartz', name: 'Quartz', note: 'Pale, hard rock: silicon and oxygen locked together.', color: '#e7e5e4', x: 250 },
      { id: 'coal', name: 'Coal', note: 'Carbon that pulls the oxygen out of the quartz.', color: '#292524', x: 560 },
      { id: 'woodchips', name: 'Wood chips', note: 'Keep the mix loose so furnace gas can flow through.', color: '#b45309', x: 1130 }
    ],
    lines: [
      { speaker: 'player', text: "Hi! I'm here to build a chip for a smartphone. Where do you keep the chips?" },
      { speaker: 'guide', text: 'Chips? Ha! This is Norway, friend. Here we start with rocks.' },
      { speaker: 'guide', text: 'First, quartz. Pale, hard stone. Silicon and oxygen, locked together.', reveal: 'quartz' },
      { speaker: 'guide', text: 'Second, coal. Its carbon steals the oxygen out of the quartz inside the furnace.', reveal: 'coal' },
      { speaker: 'guide', text: 'Third, wood chips. They keep the mix loose so the hot gas can flow through it.', reveal: 'woodchips' },
      { speaker: 'player', text: 'And why do all this here?' },
      { speaker: 'guide', text: 'See that waterfall? Smelting eats electricity like a troll eats goats. We have rivers of it.' },
      { speaker: 'guide', text: `${WALK_HINT} Bring me all three.` }
    ],
    readyLine: "That's the full feed. Now let's fill the furnace. And don't lick anything glowing."
  },

  2: {
    guideName: 'GRETA',
    goal: 'meet Greta and gather what the purification line needs',
    feetY: 690,
    enterFrom: 'right',
    playerEndX: 1060,
    guideX: 820,
    items: [
      { id: 'silicon', name: 'Silicon metal', note: 'Your silicon lumps from Norway. We mill them to powder here.', color: '#78716c', x: 200 },
      { id: 'hcl', name: 'Hydrogen chloride', note: 'Reacts with the powder to make a liquid compound we can purify.', color: '#bef264', x: 560 },
      { id: 'hydrogen', name: 'Hydrogen', note: 'Carries pure silicon back out onto hot rods, layer by layer.', color: '#7dd3fc', x: 1240 }
    ],
    lines: [
      { speaker: 'player', text: 'I brought silicon from Norway! Fresh from the furnace!' },
      { speaker: 'guide', text: 'Wunderbar. Good for the smelter. For a chip? Still far too dirty.' },
      { speaker: 'player', text: 'How clean does it have to be?' },
      { speaker: 'guide', text: 'So clean we count the dirt in parts per trillion. First, your silicon metal. We mill it to powder.', reveal: 'silicon' },
      { speaker: 'guide', text: 'Second, hydrogen chloride. With the powder it makes trichlorosilane, a liquid compound. Not melted silicon!', reveal: 'hcl' },
      { speaker: 'guide', text: 'A liquid we can distill, like the finest schnapps, until the impurities are separated out.' },
      { speaker: 'guide', text: 'Third, hydrogen. With it, pure silicon grows back onto hot rods, layer by layer.', reveal: 'hydrogen' },
      { speaker: 'guide', text: `${WALK_HINT} Bring all three to the reactor.` }
    ],
    readyLine: 'Alles klar! Now we purify. Mind the rods: they glow at about 1,100 °C.'
  },

  3: {
    guideName: 'AIKO',
    goal: 'meet Aiko and gather what the crystal puller needs',
    feetY: 700,
    enterFrom: 'left',
    playerEndX: 260,
    guideX: 640,
    items: [
      { id: 'poly', name: 'Polysilicon chunks', note: 'Ultra-pure silicon from Germany, melted at over 1,400 °C.', color: '#cbd5e1', x: 420 },
      { id: 'crucible', name: 'Quartz crucible', note: 'The bowl that holds the molten silicon. Quartz again!', color: '#f5f5f4', x: 900 },
      { id: 'seed', name: 'Seed crystal', note: 'Dipped into the melt and pulled slowly; atoms line up behind it.', color: '#a5b4fc', x: 1120 }
    ],
    lines: [
      { speaker: 'player', text: 'Ultra-pure silicon, straight from Germany!' },
      { speaker: 'guide', text: 'Good. But chunks are no use to a chip. We need one single crystal, then thin slices.' },
      { speaker: 'guide', text: 'First, your polysilicon chunks. We melt them at over 1,400 °C.', reveal: 'poly' },
      { speaker: 'guide', text: 'Second, a quartz crucible to hold the melt. Quartz again! Norway would be proud.', reveal: 'crucible' },
      { speaker: 'guide', text: 'Third, a seed crystal. We dip it in and pull slowly. The atoms line up behind it.', reveal: 'seed' },
      { speaker: 'player', text: 'Like pulling a candle out of wax?' },
      { speaker: 'guide', text: 'Very slowly, and spinning. A big crystal takes patience. (And snacks.)' },
      { speaker: 'guide', text: `${WALK_HINT} Bring me all three.` }
    ],
    readyLine: 'Perfect. Next: grow the ingot, slice it with wire, and polish it to a mirror.'
  },

  4: {
    guideName: 'MEI',
    goal: 'meet Mei and gather what the lithography line needs',
    feetY: 710,
    enterFrom: 'right',
    playerEndX: 1040,
    guideX: 840,
    items: [
      { id: 'wafers', name: 'Blank wafers', note: 'Mirror-polished discs from Japan. Hold them by the edge only.', color: '#e2e8f0', x: 200 },
      { id: 'resist', name: 'Photoresist', note: 'Light-sensitive coating, spun onto the wafer.', color: '#f59e0b', x: 560 },
      { id: 'mask', name: 'Photomask set', note: 'One pattern per layer; light projects it onto the resist.', color: '#0f766e', x: 1250 }
    ],
    lines: [
      { speaker: 'player', text: 'Mirror-polished wafers from Japan!' },
      { speaker: 'guide', text: 'Beautiful. Now we build the circuits on them, one patterned layer at a time.' },
      { speaker: 'guide', text: 'First, the blank wafers. Handle them by the edge, never the face.', reveal: 'wafers' },
      { speaker: 'guide', text: 'Second, photoresist. A light-sensitive coating, spun onto the wafer.', reveal: 'resist' },
      { speaker: 'guide', text: "Third, the photomasks. Each holds one layer's pattern, which light projects onto the resist.", reveal: 'mask' },
      { speaker: 'player', text: "So it's... photography?" },
      { speaker: 'guide', text: 'Like photography, then chemistry. And a lot of repetition.' },
      { speaker: 'guide', text: `${WALK_HINT} Bring all three to the line.` }
    ],
    readyLine: 'Ready. Pattern the wafer, then we probe every chip to see which ones work.'
  },

  5: {
    guideName: 'FARID',
    goal: 'meet Farid and gather what the packaging line needs',
    feetY: 690,
    enterFrom: 'left',
    playerEndX: 300,
    guideX: 520,
    items: [
      { id: 'wafer', name: 'Tested wafer', note: 'Its die map shows which chips passed the probe test.', color: '#0f766e', x: 120 },
      { id: 'substrate', name: 'Substrate', note: 'The tiny board each chip sits on, with pads to the outside world.', color: '#16a34a', x: 760 },
      { id: 'wire', name: 'Gold wire', note: 'Tiny wires that connect the chip to its little board.', color: '#facc15', x: 1000 },
      { id: 'resin', name: 'Mold resin', note: 'Seals everything into the black package.', color: '#1c1917', x: 1230 }
    ],
    lines: [
      { speaker: 'player', text: 'One wafer full of chips, fresh from Taiwan!' },
      { speaker: 'guide', text: 'Selamat datang! Those chips are naked. Too tiny and fragile for a phone. We dress them.' },
      { speaker: 'guide', text: 'First, your tested wafer. The die map tells us which chips passed.', reveal: 'wafer' },
      { speaker: 'guide', text: "Second, the substrate. It's the little board each chip sits on.", reveal: 'substrate' },
      { speaker: 'guide', text: 'Third, gold wire. These tiny wires connect the chip to its little board.', reveal: 'wire' },
      { speaker: 'guide', text: 'And last, mold resin. It seals everything into the black package you know.', reveal: 'resin' },
      { speaker: 'guide', text: `${WALK_HINT} Bring me all four.` }
    ],
    readyLine: 'Bagus! Saw the wafer, pick a good chip, bond it and seal it.'
  },

  6: {
    guideName: 'XIAO LIN',
    goal: 'meet Xiao Lin and gather the phone parts',
    feetY: 730,
    enterFrom: 'left',
    playerEndX: 300,
    guideX: 720,
    items: [
      { id: 'chip', name: 'Packaged chip', note: 'Your chip from Penang, ready for the main board.', color: '#18181b', x: 120 },
      { id: 'board', name: 'Logic board', note: 'Solder paste, then the chip, then through the reflow oven.', color: '#15803d', x: 500 },
      { id: 'display', name: 'Display', note: 'The part everyone will touch.', color: '#38bdf8', x: 960 },
      { id: 'battery', name: 'Battery', note: 'Powers it all. Goes in before the case is closed.', color: '#a3a3a3', x: 1220 }
    ],
    lines: [
      { speaker: 'player', text: "One packaged chip from Penang. Careful, it's precious." },
      { speaker: 'guide', text: 'Welcome! Today it becomes a phone. It is one of hundreds of parts on this line.' },
      { speaker: 'guide', text: "Your chip, of course. It's going onto the main circuit board.", reveal: 'chip' },
      { speaker: 'guide', text: 'The logic board. Solder paste, then the chip, then through the reflow oven.', reveal: 'board' },
      { speaker: 'guide', text: 'The display. The part everyone will touch.', reveal: 'display' },
      { speaker: 'guide', text: 'And the battery. Then the case, then testing, testing, testing.', reveal: 'battery' },
      { speaker: 'guide', text: `${WALK_HINT} Bring all four to the bench.` }
    ],
    readyLine: "All parts here. Let's build a phone. Then it flies to America."
  },

  7: {
    guideName: 'SAM',
    goal: 'deliver the phone to Sam and gather what it needs',
    feetY: 700,
    enterFrom: 'left',
    playerEndX: 400,
    guideX: 780,
    items: [
      { id: 'box', name: 'Phone box', note: 'Seven countries, one box.', color: '#f8fafc', x: 180 },
      { id: 'cable', name: 'Charging cable', note: 'The phone needs power before anything else.', color: '#e5e5e5', x: 620 },
      { id: 'sim', name: 'SIM card', note: 'Connects the phone to Sam’s mobile network.', color: '#eab308', x: 1150 }
    ],
    lines: [
      { speaker: 'player', text: 'Package for Sam? One smartphone, all the way from Norway. Sort of.' },
      { speaker: 'guide', text: 'Finally! Wait, Norway? I thought phones came from the store.' },
      { speaker: 'player', text: 'It started as a rock in Norway. Then Germany, Japan, Taiwan, Malaysia, China...' },
      { speaker: 'guide', text: 'Wow. Okay, can you grab the box? You left it by the door.', reveal: 'box' },
      { speaker: 'guide', text: 'And the charging cable. Somewhere on the shelf.', reveal: 'cable' },
      { speaker: 'guide', text: "And my SIM card, next to the desk. Don't lose it.", reveal: 'sim' },
      { speaker: 'guide', text: `${WALK_HINT} Then let's turn this thing on.` }
    ],
    readyLine: "That's everything. Seven countries for this? Let's see if it boots."
  }
};
