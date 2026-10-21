# Norway workshop: silicon smelting evidence pack

Research date: 21 October 2026. Status: collected for joint review; no redesign approved or implemented.

Scope: Norwegian quartz-to-metallurgical-silicon production, with separate pilot-scale and industrial references. Semiconductor-grade chemical purification belongs to the later Germany stage. N01-N08 are IDs within this pack; existing SOURCES.md records retain their IDs.

## Suggested review order

| Order | Source | Drawing or documentation to review |
|---|---|---|
| 1 | [N01: pilot schematic](sources/N01-pilot-furnace-figure1.png), [article](https://link.springer.com/article/10.1007/s40831-022-00639-0) | Actual Norwegian experimental furnace cross-section; Figures 1-3 and Table 2 |
| 2 | [N02: reaction-zone schematic](https://link.springer.com/article/10.1007/s11837-022-05431-9/figures/1) | Industrial furnace interior and chemical reactions |
| 3 | [N03: Elkem tapping paper](sources/N03-elkem-tapping-2014.pdf#page=6), [preview](previews/N03-tapping-hood.png) | Tapping-area equipment and extraction hood, Figures 6-7 |
| 4 | [N04: equipment supplier paper](sources/N04-sms-furnace-design-2015.pdf#page=6), [preview](previews/N04-industrial-furnace.png) | Modern industrial silicon smelter, Figure 10 |
| 5 | [N05: Salten casting report](sources/N05-salten-casting-report-2019.pdf#page=37), [preview](previews/N05-casting-layout.png) | Casting carousel plan, Figure 3.1 |
| 6 | [N06: ladle refining study](https://link.springer.com/article/10.1007/s11663-016-0888-2) | The process between tapping and casting |

These are published schematics, process studies, photographs and equipment illustrations. No complete construction drawing set, OEM operating manual or current Salten control-system specification was obtained.

## Annotated sources

### N01 - Documented Norwegian pilot smelting test

**Andersen et al., _Pilot-Scale Test of Flue Gas Recirculation for The Silicon Process_.** Published 20 December 2022; Journal of Sustainable Metallurgy 9, 81-92 (2023). [Article](https://link.springer.com/article/10.1007/s40831-022-00639-0), [Figure 1](https://link.springer.com/article/10.1007/s40831-022-00639-0/figures/1), [2023 correction](https://link.springer.com/article/10.1007/s40831-023-00654-9).

**Locator:** Experimental Setup; Figures 1-3; Tables 1-2. Figure 1 and Table 2: printed p.84 / PDF page 4.

**Evidence:** Trondheim single-phase pilot; 400 kVA supply, 160 kW target, 6-inch graphite electrode. Current setpoint and electrode height controlled load. High-alumina side lining, SiC bottom, carbon tapping block. Premixed feed followed tapping and crust-breaking. Approximately 1.5-hour tapping cycles; 80-hour run including startup. Table 2 allocates fixed-carbon contributions: coal 40%, charcoal 15%, coke 30%, woodchips 15%. These are not bulk feed mass percentages.

**Limits:** Specialized recirculation experiment, not a standard industrial installation. Correction replaces Figure 9 and identifies ProtIR for its NOx measurement. Full-PDF download returned HTML and is excluded; article and schematic checked online. Figure 1 was reproduced from an earlier reference; check its separate credit before reuse.

### N02 - Industrial furnace chemistry and internal zones

**Ringdalen, Einarsrud and Nordhus, _Gas Flow and Pressure Drop in Charge Material in Silicon Production_.** JOM 74, 3971-3979 (2022), published 15 August 2022. [Article](https://link.springer.com/article/10.1007/s11837-022-05431-9), [Figure 1](https://link.springer.com/article/10.1007/s11837-022-05431-9/figures/1).

**Locator:** The Silicon Processes; Gas Flow and Pressure Drop in Si Furnaces; Figures 1-4; reactions 1-7.

**Evidence:** Descending quartz/carbon charge meets rising SiO/CO gas. SiC and SiO are intermediates; overall reaction: SiO2 + 2C -> Si + 2CO. Crusts and fines affect permeability; stoking can restore flow. Gives approximately 10-13 MWh/t electrical input and discusses measurements under electrodes in a 40-MW furnace. Figure 1 maps zones and reactions.

**Limits:** Includes cold-bed experiments and modeling as well as industrial comparisons. Test-rig mixtures and sizes are not industrial feed prescriptions. Temperatures vary with zone and operation; there is no single whole-furnace temperature. Article inspected online; standalone figure download returned HTML and is excluded.

### N03 - Elkem industrial tapping documentation

**Tveit, Andersen, Berget and Jensen, Elkem AS, _The tapping process in silicon production_.** SAIMM Furnace Tapping Conference, May 2014, printed pp.147-156. [Original PDF](https://www.saimm.co.za/Conferences/FurnaceTapping/147-Jensen.pdf), [local copy](sources/N03-elkem-tapping-2014.pdf).

**Locator:** printed pp.147-152 / PDF pages 1-6; Figures 3-7. PDF page 6 visually inspected.

**Evidence:** Molten silicon drains through a taphole, continuously or intermittently. Drainage affects furnace stability and yield. Gas pressure affects liquid distribution. Figures 6-7 show tapping-fume hood development and installation at Elkem Thamshavn, Norway.

**Limits:** Covers silicon and ferrosilicon; Figure 5 explicitly depicts FeSi. Modeled liquid shapes are not universal measured silicon-bath geometry. Historical engineering evidence, not a current operating procedure.

### N04 - Industrial equipment layout

**Degel et al., SMS Siemag / Metix, _History and New Milestones in Submerged Arc Furnace Technology for Ferro Alloy and Silicon Production_.** INFACON XIV, 2015. [Original PDF](https://www.pyrometallurgy.co.za/InfaconXIV/007-Degel.pdf), [local copy](sources/N04-sms-furnace-design-2015.pdf).

**Locator:** FeSi/Silicon Application, printed p.12 / PDF page 6, Figure 10. Visually inspected.

**Evidence:** Supplier's silicon-smelter illustration shows electrode assemblies and surrounding equipment. Discusses hydraulic electrode control, electrical feeders, and prebaked/composite electrode options. Historical examples operate at tens of megawatts.

**Limits:** Not a Norwegian site plan. Figure 11 is a POSCO ferrosilicon furnace, whereas Figure 10 is the relevant silicon illustration. Historical power ranges are not current industry limits.

### N05 - Site-specific Salten casting plan

**NTNU / SINTEF HighEFF, _Heat-to-power conversion from variable surplus heat sources utilizing a thermal energy storage_.** Deliverable cover dated 26 September 2019. [Original PDF](https://www.sintef.no/globalassets/project/higheff/deliverables-2019/d3.1_2019.10-heat-to-power-conversion-from-variable-surplus-heat.pdf), [local copy](sources/N05-salten-casting-report-2019.pdf).

**Locator:** section 3.1, printed pp.19-20 / PDF pages 37-38. Figure 3.1 on PDF page 37 visually inspected.

**Evidence:** Post-refining casting at Elkem Salten. Figure 3.1 locates molds on a carousel, with ladle, pouring spout, slag bins and shielding wall. Historical case describes 9,000 kg poured every two hours, about 30 minutes pouring time, then cooling, demolding and crushing.

**Limits:** Figure credited to Borset (2015); not an as-built 2026 plan. Table 3.1 uses FeSi75 thermal properties and explicitly warns of differences from Salten product. Do not import those properties into pure-silicon simulation. Later proposed heat-recovery equipment is not proof of installation. Cooling description is not molten-metal handling guidance.

### N06 - Refining in the ladle

**Olsen, Kero, Engh and Tranell, _Model of Silicon Refining During Tapping: Removal of Ca, Al, and Other Selected Element Groups_.** Published 28 December 2016; Metallurgical and Materials Transactions B 48, 870-877 (2017). [Article](https://link.springer.com/article/10.1007/s11663-016-0888-2).

**Locator:** Introduction; Figure 2; comparison with industrial experiments; model sensitivity discussion.

**Evidence:** Describes oxidative ladle refining after carbothermic production. The tapping jet and bottom gas purging contribute to oxidation. Slag helps remove impurities, especially Ca and Al; purification competes with silicon loss. Model checked against industrial samples.

**Limits:** Not proof of a specific current Norwegian plant recipe. Metallurgical ladle refining does not produce semiconductor-grade polysilicon. Calibrated model coefficients are not universal operating settings.

### N07 - Norwegian research equipment and material testing

**SINTEF, _Silicon Production Research at SINTEF and NTNU_.** September 2012. [Fact sheet PDF](https://www.sintef.no/globalassets/upload/materialer_kjemi/brosjyrer-faktaark/faktaark/silicon-prod-ref-web.pdf). Also [Process Metallurgical Laboratories](https://www.sintef.no/en/all-laboratories/process-metallurgical-laboratories/), undated, checked 21 October 2026.

**Locator:** Production of Silicon; laboratory equipment list.

**Evidence:** Documents pilot reduction equipment with a 440 kVA supply, raw-material trials, gas measurements and SiO-reactivity testing.

**Limits:** Do not replace N01's experiment-specific 400 kVA with this facility listing's 440 kVA. Dates/scopes differ; apparatus identity or modification history has not been established.

### N08 - Norwegian industrial setting

**Elkem, _Elkem Silicon Products Salten_.** Undated, checked 21 October 2026. [Plant page](https://www.elkem.com/is/about-elkem/worldwide-presence/norway/elkem-salten/).

**Evidence:** Straumen, Norway; three furnaces; silicon and silica-fume products; historical transition from ferrosilicon toward higher-purity silicon.

**Limits:** Producer/location evidence, not a customer or shipment link to our Germany stage. Indexed company-page content inspected; internal plans and operating specifications not obtained.

## Questions for our review

These are discussion prompts, not implementation decisions:

1. **Experimental or industrial?** Choose one coherent equipment basis. Current game has three electrodes; N01's pilot apparatus has one.
2. **Which systems remain visible?** Review charge, electrode movement, lining, reaction zones, hood, taphole, runner, ladle and molds against N01-N05 at their respective scales.
3. **What should quality control teach?** Pale/dark rock sorting is not an evidenced purity assay. Review material properties and process behavior instead.
4. **How much downstream treatment?** Review whether to include ladle treatment and a separate casting operation using N03, N05 and N06.
5. **Which data can drive gameplay?** Preserve source context for each value. No numeric parameter-to-yield model has been selected or validated.

## Existing implementation baseline

Read `src/components/NorwayManufacturing.tsx` and `NorwaySmelterScene.tsx`: select three pale quartz rocks, add carbon automatically, switch on, timed smelting, direct pouring into one mold, cooling, ship a fixed 12 kg. Timers are 1.6 s loading, 5.5 s smelting, 3 s pouring and 4 s cooling. These are game assumptions, not industrial observations. No feed assay or material balance determines the output.

## Files, provenance and access

Original PDFs N03-N05 are in `sources/`; selected rendered pages are in `previews/`. N01 schematic is the publisher's image. Online-only sources retain direct original links. Invalid HTML download responses were excluded from `sources/`.

N01, N02 and N06 article pages state CC BY 4.0, subject to exceptions for separately credited third-party figures. No figure reuse license was verified for the other PDFs. Reference collection does not approve copying artwork into game assets.

Three PDFs validated with pypdf; selected pages rendered with Poppler and visually inspected. N01's schematic also visually inspected. See [HANDOFF.md](HANDOFF.md) for decisions, unresolved choices and continuation instructions.
