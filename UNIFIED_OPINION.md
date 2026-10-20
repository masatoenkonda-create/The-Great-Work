# Unified opinion: Kyushu Silicon Craft

Merged 2026-10-20 from [`CLAUDE_OPINION.md`](CLAUDE_OPINION.md) and [`CODEX_OPINION.md`](CODEX_OPINION.md). Both reviewed revision `95f1cb2`.

This is the single working document for rebuilding the game. The two original opinions stay in the repo as the record of how we got here. Where they disagreed, the resolution is stated in §8.

**Status tags used below**

- **Agreed**: both reviews reached the same finding independently.
- **Claude** or **Codex**: only one review raised it. It was checked by the other side while merging and is kept unless §8 says otherwise.
- **Sourced**: backed by a source listed in §10.
- **Illustrative**: fine as a game assumption, but it must be labelled as one and must not be taught as fact.
- **Unverified**: do not teach it until a primary source is found.

This document is a review, **not the factual reference**. The reference will be a separate, versioned data file that the game reads (§7).

---

## 1. Shared verdict

Keep the project. Learning by handling a visible process suits Max's learning style, and the five-stage flow is a sound skeleton:

> wafers & materials → front-end fab → wafer test & die prep → packaging → final test & customers

Today, though, the game is an **interactive factory exhibit**, not a simulation of supply chain work. It also teaches several wrong relationships with great confidence. Fixing the underlying model matters more than visual polish or more technical vocabulary.

The next version should combine two things:

- a simple **manufacturing explorer** (what happens to the product), and
- a small, consequential **supply chain mission**: an order, a qualified input, a deadline, limited stock, a disruption, and a decision whose effects you can see.

## 2. What to keep

- The five-stage overview and the concrete objects: ingot, wafer, die, substrate, package, tester.
- The company explorer and the Kyushu regional inset.
- The distinction between ABF (a material) and the package substrate (a product), which the text already makes in places.
- The deposit → pattern → etch → clean loop, repeated across layers. It is the most important front-end idea.
- The strategic framing: "Who owns the qualified input, the process knowledge, and the customer relationship?", and the split between capex-driven tools and recurring consumables.
- The global-interdependence callouts (ASML, Zeiss, fabless customers, overseas assembly and test).
- Free navigation as an *explorer* mode. It must be kept clearly separate from completing a guided mission.

## 3. Repair the mental model (Priority 1)

### 3.1 Separate the process view from the supplier network (Codex, agreed)
The whole chain sits in one pavilion and the HUD says "JASM FAB 2 · KUMAMOTO CLEANROOM". A beginner would conclude that every company works inside one JASM factory. Use two linked views:

- **Process view**: what happens to the product.
- **Network view**: which kind of organization supplies what to whom, from which site.

Label the pavilion as an illustrative exhibit. Treat company links as examples of capability unless a real customer/supplier relationship is sourced. Proximity and equity ownership are not proof of a supply contract. Show three kinds of input differently:

- **Equipment and spare parts** enable production.
- **Wafers and chemicals** are consumed.
- **Designs and specifications** are information.

### 3.2 Move resist coating into the fab loop (Agreed, sourced S1)
Resist makers (JSR, TOK, Shin-Etsu, Fujifilm, Sumitomo Chemical…) **make and ship** the chemical. The **fab** coats, bakes and develops it on a coater/developer track before each exposure. TEL dominates that track market, and TEL Kyushu in Koshi develops and builds tracks (S10). Beginner loop, with a note that real flows vary:

> deposit → **coat** → expose → **bake/develop** → etch → **strip/clean**, repeated, plus implant and CMP between layers

Inspection and metrology must give **feedback** inside the loop, not only appear at the end. Candidate players: KLA, Hitachi High-Tech, and Lasertec for EUV mask inspection (Claude, unverified shares).

### 3.3 Not every layer is EUV (Agreed, sourced S2)
EUV is used for critical layers and DUV for the rest. JASM Fab 1 (12–28 nm class) does not need EUV at all. DUV competitors include Nikon and Canon (Japan). ASML is the sole EUV maker (13.5 nm, tin plasma, Zeiss optics); that part is correct.

### 3.4 Separate substrate manufacture from package assembly (Agreed, sourced S3, S4)
The real chain has three tiers:

> Ajinomoto (ABF film) → substrate maker, e.g. IBIDEN or Shinko (build-up layers with copper wiring and vias) → assembler, i.e. an OSAT or the fab's back end (die attach, underfill, lid or mold)

- The 3D model calls a metallic roll "ABF Copper Film" (`ThreeCanvas.tsx:702`) and shows ABF as a slab above the substrate. ABF is the **dielectric between copper layers inside** the substrate.
- "Inject ceramic mold resin" (`StageMinigames.tsx:1012`) mixes up ceramic packages with resin (silica-filled epoxy) encapsulation. High-end flip-chip CPU/GPU packages usually use underfill and a lid with TIM rather than full molding. **Pick one illustrative package route** and verify its steps. Present other package families as alternatives.
- The "Kyocera Ceramics" tag on the reflow step is misplaced. Kyocera belongs under components and ceramic packages.

### 3.5 Choose a product before choosing a customer (Agreed)
The fictional "Kyushu-3N AI Accelerator" can be shipped to servers, phones *or* vehicles. Product design, package, customer specification and qualification constrain where a chip can go. Binning splits *compatible* devices into grades; it does not convert a product from one end market to another. For the first mission, use **one fictional product and one fictional customer**, labelled fictional.

### 3.6 Keep plans separate from operations (Agreed, sourced S5, S12, S13)
"JASM Fab 2: 3nm, target 2028" is supported as a **company plan**. TSMC announced the switch to 3 nm in Feb 2026, Taiwan's MOEA approved it on 31 Mar 2026, and TSMC's 15 Oct 2026 call reiterated 2028. **Do not "correct" it back to the older 6–12 nm plan.** Label it a dated announcement everywhere, including the always-visible HUD. Its yield and device numbers are game assumptions, not JASM data.

## 4. Factual corrections (Priority 2)

| # | In the game now | Treatment | Status |
|---|---|---|---|
| F1 | "11N (99.9999999%)" (HUD, stage 1) | That number is **9N**. 11N = 99.999999999%. Decide which material and spec is meant. | Agreed |
| F2 | ABF researcher "Shigeo Mori" (`SupplyChainMapModal.tsx:355`) | **Shigeo Nakamura** (Ajinomoto's own history). Work began in 1996. Fix the name or drop the anecdote. | Agreed, sourced S7 |
| F3 | ABF "born from umami seasoning chemistry", "essential to every advanced CPU/GPU" | ABF grew out of amino-acid chemistry know-how, not a repurposed flavoring. "Every" is overbroad: teach its role in build-up substrates. | Agreed, sourced S3 |
| F4 | JASM = TSMC / Sony / Denso | **Toyota** joined in 2024 (≈ TSMC 86.5%, Sony 6.0%, Denso 5.5%, Toyota 2.0% post-investment). Sony is a minority shareholder. Don't reuse the 2024 announcement's old fab schedule. | Agreed, sourced S6 |
| F5 | JASM and Sony listed as *final test* companies | They are fabs, so they belong to the front-end stage. | Claude |
| F6 | SUMCO under the "Kagoshima / Kirishima" hub; "Imari & Saga" | Imari is in Saga, in **northern** Kyushu. Regroup the inset, and don't list a city next to its own prefecture. SUMCO "Nagasaki" site: unverified. | Agreed |
| F7 | "Advantest wafer prober & probe card", "Advantest probe pins" | Separate the three things. The **tester (ATE)** is Advantest's core (duopoly with Teradyne). **Wafer probers** come mainly from Tokyo Electron and Tokyo Seimitsu (Accretech). **Probe cards** come from e.g. FormFactor, Technoprobe and Micronics Japan. Advantest does sell a die-level prober (S8), so don't say it "never makes probers". | Resolved, see §8 |
| F8 | "JSR & Shin-Etsu supply >80% of EUV resist" | Japanese firms *collectively* lead. The commonly cited ~90% is spread across TOK, JSR, Shin-Etsu, Fujifilm and Sumitomo Chemical. TOK is missing from the game. Keep company share, production location, and "all resist" vs "EUV resist" separate. | Agreed (figure needs source) |
| F9 | "TEL world monopoly on coater/developer" | "Dominant" (SCREEN also sells tracks). Any % needs a source. | Agreed |
| F10 | TEL "ALD" with "silane + oxygen plasma"; TEL "Deep Reactive Ion Etch" | Silane + O₂ plasma is PECVD, not ALD. DRIE usually means MEMS/TSV etching; logic uses plasma/RIE etch. Lam and Applied Materials are the main etch competitors. | Claude |
| F11 | Overlay "±0.4 nm" | Too optimistic. Mark it illustrative or use a sourced spec. | Claude |
| F12 | "Burn-in (−40 °C to +125 °C)"; thermal cycling shown as an ATE pass; "DPPM < 1" as the automotive rule | Burn-in is high-temperature stress. −40/+125 °C is temperature cycling / tri-temp test. Production test, screening and reliability qualification are different activities. No single DPPM number is universal; source any standard (e.g. AEC-Q100) and its scope. | Agreed |
| F13 | Kyocera Kirishima "makes chucks, chambers, packages, expanding capacity" | The plant integration and rename (effective Apr 2026) is sourced, as are its broad product categories. Site-specific products and expansion are not. Keep group capabilities and site evidence separate. | Codex, sourced S9 |
| F14 | Photoresist qualification "9–18 months, millions in scrap, unalterable constant" | Qualification and change control are the right lesson. The universal timeline and cost are unsourced. Use an explicitly hypothetical delay in gameplay. | Agreed |
| F15 | Consumables are "recession-resistant"; ABF "recurs with every wafer start" | Wrong flow model. Wafer starts, package output, inventory and demand are different drivers. Treat resilience as a question to analyze, not a fact. | Codex |
| F16 | JASM location chosen for "groundwater, reliable nuclear/green power…" | Plausible discussion topics, but attribute them to a source or mark them as analysis. Add the downsides too: groundwater concerns, labour, housing and traffic around Kikuyo. | Agreed |
| F17 | Shin-Etsu "high-purity silane gas" | Not a known Shin-Etsu product. Use photomask blanks, synthetic quartz and silicon wafers. | Claude, unverified |
| F18 | DISCO "70–80%" in one place and "~75%" in another; DISCO "Kyushu Support" | Use one sourced, dated figure. Main plants are in Hiroshima and Nagano. Kyushu presence is unverified. | Agreed |
| F19 | Sony locations "Kumamoto / Kagoshima" | Add **Nagasaki** (Isahaya), its largest image-sensor fab, and Oita. Verify before adding. | Claude |

**Mark as illustrative, not fact (Agreed):** "3nm circuit mask" (a node name is not a literal dimension), "48 layers", 775→30 µm thinning (775 µm start is standard; the final thickness depends on the product), Czochralski temperature and pull speed, RPM, RF power, cleaning recipes, the 24-die wafer, and all yield numbers.

**Rule for every number (Agreed):** a market share needs a source, a year and a market definition. A Japanese company's share is not the same as production located in Japan. The "Checked 20 Oct 2026" banner does not cover claims the game added beyond the original map notes. The map notes were careful; the game layer re-added unsourced statistics.

## 5. Content gaps to research for the reference (Claude, all unverified until sourced)

These are candidates, not facts yet:

- **Kyushu power semiconductors:** Mitsubishi Electric (Kumamoto, Fukuoka), ROHM/Lapis SiC (Chikugo, Fukuoka), Renesas Kawashiri (Kumamoto), Oita sites.
- **Wider Japan picture:** Rapidus (Hokkaido, 2 nm), Kioxia (memory).
- **Materials:** photomasks and blanks (Toppan/Tekscend, DNP, Hoya, AGC, Shin-Etsu); high-purity HF (Stella Chemifa, Morita); packaging materials (Resonac, Sumitomo Bakelite, Namics); substrates (Shinko).
- **Equipment:** Kokusai Electric, Ebara (CMP), Hitachi High-Tech, Lasertec, Tokyo Seimitsu.
- **Advanced packaging** (2.5D/CoWoS, HBM) as the current AI bottleneck.
- **Assembly and test in Asia:** ASE, Amkor, and the Malaysia and Vietnam hubs. Relevant to "jobs in Asia".

## 6. Code defects (Priority 3)

The project **builds** (`vite build`) and **typechecks** (`tsc --noEmit`) cleanly; Claude verified this with Bun. Codex could not install dependencies in its environment. Neither review has done a browser playtest yet.

| # | Defect | Where | Severity | Fix direction |
|---|---|---|---|---|
| D1 | **Camera never follows stage/view changes.** The animation loop is created once with an empty dependency list and calls `calculateCameraTarget(currentStage, viewMode, …)` with the *initial* props (stale closure). | `ThreeCanvas.tsx:43–267`, line 247 | High | Mirror `currentStage` and `viewMode` into refs read by the loop. Don't rebuild the renderer. *(Codex found it; Claude confirmed it in the code.)* |
| D2 | **Reset doesn't reset; minimizing loses progress.** Reset clears `chipSpec` only; each stage's local state survives. Hiding the panel unmounts it and discards local progress while the parent counters stay. | `App.tsx:68–72, 124–133`; `StageMinigames.tsx` | High | One authoritative session state, lifted up. Reset everything together; hiding must preserve state; cancel timers on reset/unmount. |
| D3 | **Goods appear from nowhere.** The game starts with 21 packaged and shipped units; `\|\| 21` replaces a real zero; dispatch never consumes stock or checks test release. | `App.tsx` `INITIAL_CHIP_SPEC`; `StageMinigames.tsx:207–215, 243–248, 276–282`; `HUD.tsx` | High | Start missions at truthful zero and enforce *shipped ≤ released ≤ packaged ≤ good dies*, with remaining stock shown. |
| D4 | **Controls have no consequence.** Etch power is unused; spin RPM is clamped to 28–32 nm; alignment is a fixed picture; ATE always returns 3.95 GHz; probe results are random and "Auto-Probe All" re-rolls a tested lot; yield rises after cleaning regardless. | `StageMinigames.tsx` | High (learning) | Either label them demonstrations, or build a small model where choices change outcomes. Never silently re-roll a physical lot. |
| D5 | **Guided completion can be bypassed.** Stage 2 transfer is ungated, stage 3 checks only cuts, stage 4 can reflow without bonding, keys 1–5 jump anywhere, and the final "Restart" doesn't start a fresh session. | `StageMinigames.tsx`; `App.tsx` | Medium | Explicit mission prerequisites; keep free navigation as explorer mode. |
| D6 | **Escape toggles the map open**; the modal has no dialog semantics or focus trap; stage cards are clickable divs; range inputs lack labels; the control panel has no bounded height on short screens. | `App.tsx`; `SupplyChainMapModal.tsx`; `StageMinigames.tsx` | Medium | Escape only closes; add `role="dialog"`, focus management, labels and a scroll region. Confirm in a browser. |
| D7 | **Timers and side effects.** Polish/backgrind intervals stack on double-click and aren't cleaned up; `onUpdateSpec` runs inside state updaters (double-applies under StrictMode); the ingot interval is rebuilt every tick. | `StageMinigames.tsx` | Medium | Guard and clean up intervals; move side effects out of updaters. |
| D8 | **Leftovers and structure.** Package name `react-example`; unused `@google/genai`, `express`, `dotenv`, `tsx`; `GEMINI_API_KEY` that nothing reads; unused `'glossary'`, `'strategy_modal'`, `'victory'` types; a 1,150-line `StageMinigames`; facts hard-coded in JSX across six files; three.js canvas not removed and geometries not disposed on unmount; 865 KB bundle and 2.2 MB PNG; no README; no tests. | various | Low | Split into one component per stage. Move content to the reference file (§7). Remove the template leftovers. Add a README and a test that every claim has a source. |

## 7. Target design

### 7.1 The factual reference (Agreed)
A separate, versioned data file (e.g. `src/content/reference.json`) that the game reads. No facts left in JSX strings. It contains four kinds of record:

- **Entities:** company, site, geography, function, inputs/outputs, product family.
- **Relationships:** material flow, equipment/service support, information flow, and *verified* commercial links only.
- **Claims:** exact statement, source URL, source date, checked date, scope, and status (`fact` / `company_plan` / `interpretation` / `hypothetical`).
- **Scenarios:** starting stock, consumption, lead times, qualification constraints, costs, player authority and consequences. Every invented number is marked as a game assumption.

Keep source-backed knowledge separate from game balance. The game should be able to show the source of a claim on hover.

### 7.2 The first mission: a qualified input arrives late (Codex's design; all numbers fictional)
A fab uses 10 containers of a qualified material per day and has 30 usable containers. The qualified delivery arrives in 5 days. An expedited shipment can arrive in 2 days at extra cost. Another supplier has stock today, but it is **not qualified** for this process.

1. **Inspect:** the player looks at the lot, the delivery confirmation, the consumption rate, the quality-release status and the order deadline.
2. **Decide:** expedite, request an approved inventory transfer, coordinate a production-plan change, or propose the substitute for engineering/quality review.
3. **Advance the clock:** see when stock runs out, what can still run, which delivery commitments slip, and what it costs. Physical arrival ≠ quality release.
4. **Roles are realistic:** the coordinator requests and coordinates. Engineering/quality approves process changes. Spending and customer commitments may need sign-off. Reward good escalation and accurate information, not magic unilateral control.
5. **Debrief:** a short cause-and-effect replay plus an optional spoken debrief: what stopped, when, what bought time, who could approve, and why the fastest-looking option did or didn't work. This feeds interview answers directly.

**Later missions:**

- a critical spare part delays a tool's recovery;
- allocate scarce qualified stock between customer orders;
- customs and trade details, added only after researching a specific route.

### 7.3 Real-world events to base later missions on (Claude; each needs a source before use)
- 2016 Kumamoto earthquakes (Sony and Renesas Kumamoto disruption)
- 2019 Japan → South Korea export controls (EUV resist, high-purity HF, fluorinated polyimide)
- 2021 Renesas Naka fab fire and the automotive MCU shortage
- 2021–23 ABF substrate shortage
- 2022 neon supply risk (Ukraine)
- Kumamoto groundwater constraints as the cluster grows
- Photoresist cold-chain and shelf-life logistics

## 8. Where the reviews disagreed, and the resolution

| Topic | Claude | Codex | Resolution |
|---|---|---|---|
| Advantest and probers | "Advantest makes testers, not wafer probers" | Advantest lists a die-level prober, so a blanket "never" is wrong | **Both partly right.** Wafer probers come mainly from TEL and Tokyo Seimitsu; Advantest's core is ATE, plus a die-level prober product. Name the specific product when attributing (F7). |
| Several numbers Claude marked ✅ (DPPM, cleaning steps, DISCO share, JASM site reasons) | "Plausible, needs a source" | "Unsourced, don't teach" | **Codex's stricter rule wins** for the reference: anything without a source is `interpretation` or `hypothetical` until sourced. |
| Build status | Builds and typechecks | Not verified (install failed) | **Builds and typechecks**, verified by Claude. Still no browser playtest. |
| Camera stale closure (D1) | Missed | Found | **Confirmed** by reading `ThreeCanvas.tsx:247`. |
| Scope of missing content (§5) | Long list of Japan/Kyushu gaps | Start small: one route, one role, one mission | **Both:** build the first slice small (Codex), and use §5 as the research backlog for the reference (Claude). |

## 9. Agreed next steps

1. **Agree on scope:** one product route, one coordinator role, one mission (7.2), and the inventory and progression invariants (D3, D5).
2. **Build the factual reference** (7.1) for that route only. Every claim gets a status and a source.
3. **Fix the foundations:** camera (D1), session state (D2), stock accounting (D3), timers (D7).
4. **Revise the process route** to match the reference (§3, §4).
5. **Build the first mission** and playtest it with Max: can he explain the consequences in his own words?
6. Only then add more stations, the §5 content, and later missions.

## 10. Sources

All checked 2026-10-20. Company statements are attributed, not independent audits.

- **S1** ASML 2025 Annual Report, chipmaking process diagram (coat, expose, bake/develop, etch, implant, strip): https://ourbrand.asml.com/m/8ab959d4926657b/original/asml-2025-annual-report-strategic-report-section.pdf
- **S2** ASML, How microchips are made (EUV for critical layers, DUV for the rest; foundry/fabless/IDM): https://www.asml.com/en/technology/all-about-microchips/how-microchips-are-made
- **S3** Ajinomoto, ABF innovation story: https://www.ajinomoto.com/innovation/our_innovation/buildupfilm
- **S4** IBIDEN, Flip Chip PKG: https://www.ibiden.com/product/electronics/merchandise/fliptippkg/
- **S5** TSMC 3Q26 earnings-call transcript, 15 Oct 2026, p. 5 (Japan fab 2, 3 nm, 2028): https://investor.tsmc.com/english/encrypt/files/encrypt_file/reports/2026-10/eba4fac72873bf546b669bd2b5d973df5c93215d/TSMC%203Q26%20Transcript.pdf
- **S6** TSMC, JASM Set to Expand in Kumamoto Japan, 6 Feb 2024 (Toyota, equity split; historical schedule): https://pr.tsmc.com/english/news/3105, also Toyota: https://global.toyota/en/newsroom/corporate/40410568.html
- **S7** Ajinomoto, ABF history naming Shigeo Nakamura: https://www.ajinomoto.com/stories/sprinting-a-marathon-the-pioneering-technology-behind-todays-computer-brains
- **S8** Advantest, Component Test Systems, Prober: https://www.advantest.com/en/products/component-test-system/prober/
- **S9** Kyocera, Kagoshima Kirishima Plant integration, 5 Jan 2026: https://global.kyocera.com/newsroom/news/2026/001151.html
- **S10** Tokyo Electron Kyushu (Koshi): https://www.tel.com/about/locations/tkl.html
- **S11** SUMCO, Production Processes: https://www.sumcosi.com/english/products/process/
- **S12** Fab 2 switch to 3 nm and MOEA approval (news): https://www.taipeitimes.com/News/biz/archives/2026/04/01/2003854797 and https://ocacnews.net/article/419427
- **S13** Wafer prober makers (Tokyo Seimitsu / Accretech): https://www.accretech.com/en/product/
- **S14** Photoresist market leaders (market-research page, indicative only): https://www.marketsandmarkets.com/ResearchInsight/photoresist-market.asp
- The repo's own map notes: `public/assets/aistudio/japan-supply-chain-map-sources_44bbe62c.md`
