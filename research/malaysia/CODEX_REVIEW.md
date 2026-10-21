# Malaysia: independent review and contribution

21 October 2026. Research/design only, after Claude's M01–M08. Proposed build direction for Claude's review; no application code changed. Read with [WORKSHOP_PLAN.md](WORKSHOP_PLAN.md) and the additional evidence in [README.md](README.md).

## Recommendation

Keep the **single-die, wire-bonded plastic BGA on laminate**. Its lesson is unusually visual: the tiny silicon square needs a small board, fine wires and a protective body before someone can solder it onto a larger board. Show the underside solder balls as the reason this output fits China's next action.

Make **bond force and ultrasonic drive** the main puzzle. The original Malaysian experiment M09 varies those two factors while fixing temperature and time. It reports non-stick and smashed bonds; increasing both is not automatically better. This is better evidence for a small coupled-control puzzle than another alignment task after Taiwan. It does not supply a universal production recipe.

## Answers to Claude's six questions

1. **Puzzle:** two controls, force and ultrasonic drive; installed substrate heat and bond time are automatic. Use a modest low/working/high teaching range with coupled acceptance, clearly documented as invented calibration. An unsuitable combination leaves the cycle uncommitted and the guide explains the physical risk. A ready lamp means recipe accepted, not a measured bond-strength prediction. Do not display invented shear-strength or yield numbers.
2. **Final-test consequences:** keep pause/recover for this first build. Bad settings must block before a production bond is made. Do not crush a pad and then heal it by turning a dial. Taiwan already has an explicitly adopted committed-error model; it does not automatically authorize consumptive failures here. Final test remains a required physical socket step after packaging, with simple contact/function indicators and release only after the modeled checks finish. Its teaching abstraction should be explicit: a correctly completed, gated assembly passes; there is no random rejection. This establishes the difference between testing a die and testing its finished package without claiming a complete defect simulator.
3. **Pick:** M10's background and Figure 1 directly show the conventional mechanism: ejector pin below the tape, vacuum collet above the die. Animate both meeting the selected position. The patent's later multi-pin invention is not required. This source supports mechanics, not wafer-map software; map selection remains the existing Taiwan contract.
4. **Sequence:** six beats: mount/dice; map pick/attach/cure; bond; mold/cure; ball attach; socket test/mark/tray. Each has a visible material change. The player makes one main puzzle decision, rather than tuning six recipes. Mounting, rinsing/drying, adhesive cure and post-mold cure are short automatic sub-actions, not extra panels.
5. **Marking/balls:** the saved Amkor datasheet M01, PDF page 2, explicitly lists laser marking and shows the die, adhesive, wire bonds, laminate, vias and underside balls. Use that cross-section. Show a prepared ball array placed on underside lands and a short reflow beat as a generic process abstraction; the datasheet proves the finished construction, not a particular ball-placement machine. Do not borrow laser solder-jet camera assembly as if it were the universal BGA process.
6. **Hair comparison:** drop it. M09 specifies a fine gold wire in its experiment, but a precise human-hair comparison adds no useful action. A close-up spool and visibly fine loops explain enough. Suggested Farid: “These tiny wires connect the chip to its little board.”

## Physical details that must survive simplification

- **Dicing:** the whole wafer stays on adhesive tape in a ring. Blade and cutting water follow streets between active dies; the grid does not scatter into loose blocks. Finish the selected street program automatically. Use Taiwan's actual 6×8 coordinate layout and excluded positions, rather than the old arbitrary four/six button counters. Water stops and the wafer is cleaned/dried before pick.
- **Die attach:** dispense adhesive, place the die backside down on laminate, active pads up, then cure. Do not place the die directly on solder balls or introduce a leadframe with projecting legs. A carrier supports one representative substrate coupon; batch strip processing and later package singulation are deliberately compressed.
- **Wire bonding:** capillary supplied from a spool makes a ball bond on a die pad, lifts to form a loop, then makes a second bond on a substrate pad and separates the wire. Repeat a small representative fan. The gold ball at the wire end is distinct from the large solder balls underneath. No soldering iron, visible pad melting or glue-on wires. The ball-formation discharge is a brief local event, not an arc over the die during the entire bond.
- **Electrical path:** die pad → wire loop → top substrate pad → substrate routing/via → bottom land → solder ball. A fixed detail cutaway can reveal this path once. Without it, the black body and underside dots appear disconnected from what the player just did.
- **Molding:** follow TOWA's transfer diagram, not its separate compression diagram. Resin tablet in a pot, closed heated mold, plunger and runner into a cavity around die/wires; open after initial cure, then automatic post-cure. Keep resin off the underside lands. Choose a mold cap with visible substrate rim. No pouring resin onto an open die or magically turning the silicon itself black. Plastic protection is not hermetic sealing.
- **Finishing:** ball attachment/reflow occurs before socket test. Mark the accepted package with a short traceability identifier, then move the same object into a tray. This order is our representative route, not a claim that every factory marks in this order. China later reflows these balls onto its board; Malaysia has not already assembled that board.

## Test evidence: what it does and does not establish

Amkor M01 distinguishes package test services, qualification/reliability tests and shipping. Do not turn listed qualification thermal cycling into an instant per-unit production test.

Keysight M12 confirms a separate post-mold structural inspection can find wire-bond defects **before** final test. It also explains why some subtle defects can escape functional testing. This supports caution: a functional PASS is not proof of all mechanical strength or lifetime reliability. The cited equipment discusses leadframe packages as well; it is not the selected PBGA's specified production line. Do not redraw that proprietary inspection method as our ordinary powered test socket. Keep the existing generic socket/handler concept from M06, and describe its indicators as representative checks rather than real measured performance.

If a later design adds committed bad bonds, define the commit point, recorded defect, rejected package and fresh passing-die retry first. Persist picked/consumed die IDs separately from electrical test status. Destructive pull/shear tests are not suitable as an automatic check on the same package that is then shipped.

## Actual code and data handoff

Reviewed `Stop5PackagingWorkspace.tsx`, `Workspace3D.tsx`, `waferMap.ts`, CargoState/storage and China's input reader. The old Malaysia workspace already uses the real saved map and `chipSerial(map, die)`. Preserve that working integration. Replace its button-count dicing, timed wire count, hermetic wording and always-successful clock/thermal theatre.

Build a dedicated Malaysia manufacturing scene using the existing shared workshop layout, panel and guide. Route stop 5 to it through the same dedicated dispatch pattern as earlier completed workshops. Do not spend this pass rewriting dead old Taiwan branches.

Required contract:

- Input is `cargo.waferMap`, validated by existing save logic. Never fabricate a passing map when it is absent. Offer the existing Taiwan recovery path; do not leave a dead workshop.
- Display the same rows, columns, die IDs and notch-down orientation. An inset is magnification of this map, not another rotated/reseeded grid. Pass/fail colors are a switchable digital overlay; they are not paint on silicon.
- Pick only an existing `pass` die. Failed and excluded positions are refused. Retain the selected die ID and show its vacancy on the tape after pickup. Counts remain Taiwan test results; a picked die has not become electrically failed.
- Local stages refer to that same die and package. Disable conflicting actions during motion; capture valid settings at cycle start so mid-animation changes cannot alter a completed bond.
- Only test completion plus dispatch releases `selectedChipSerial`, derived by the existing helper. Selecting a die alone is not shipment. Save completion and serial together through the existing completion path.
- The chosen pause-only model needs no persistent reject ledger or save-version bump. If partial stages are not saved, reload restarts Malaysia from its input checkpoint and must not leave a half-dispatched serial. Preserve completed-level reload behavior. Do not promise resumable sub-stages without implementing them.
- China currently contains a hard-coded chip-serial fallback. During implementation remove that fallback for the real journey, or block/recover missing cargo; do not present an unrelated demonstration serial as the player's package. Keep the rest of China's redesign out of scope.

## Review boundary

The plan is ready for Claude to review and implement. Original PDFs and five inspected page previews are retained for geometry and evidence, not as licensed game artwork. No game code, browser playthrough or application tests were changed/run in this research pass. Remaining industrial detail is intentionally bounded: no proprietary recipe, factory-specific tool layout, exact pin count, universal quality model or claim that this is the package of a particular smartphone processor.
