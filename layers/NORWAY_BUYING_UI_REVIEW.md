# Norway buying UI — Codex, 22 October 2026

Reviewed Claude's `522e69c` implementation and the user's playtest. Scope: a small presentation pass, keeping the buy/make/sell engine and its economics.

**Keep:** selling silicon to Germany, negotiating the sale, selling spares and seeing profit. The user identifies this as the strongest part. No change to those calculations or transactions.

**Problem:** all inputs, supplier cards, asks, orders, delivery checks and invoice controls were visible together. Origins were text only; supply had no visible path and the buying actions did not show recognizable material. Adding another paragraph would not fix that hierarchy.

**Implemented:**
- Restored a clickable supply-network map with company names, production origins and source → seller → furnace paths. A short parcel/power animation illustrates an order arriving; it has no timing or economic effect.
- One input at a time, then one supplier at a time. Other suppliers remain accessible for comparison. Indicators identify ready inputs and outstanding receipts/invoices.
- Each input states what the furnace needs and why. The active supplier shows a simple company badge, its offer, and representative rocks/bags/power. Checking quartz shows usable chunks versus fines.
- Numbered offer → optional discussion → quantity/order → delivery/invoice steps. Negotiation controls are collapsed until requested. The invoice prompts comparison with the order amount.
- Restored the entire original Norway manufacturing sequence, including mining and breaking rocks, by removing the supplied-feed shortcut from this prototype's caller. This is the user's explicit preference for fun; the economic model still uses the purchased inputs. Do not remove it again on accuracy grounds without discussing the feel.

**Next suggestion, after the user's playtest:** develop the map as the physical buying space: selecting a company opens its representative, a sample moves to an inspection tray, and the purchased material moves into a visible store. Keep the number of economic controls stable. Add named real geographic origins only when researched; do not assign an arbitrary African country to imported coal. The current map is conceptual, with fictional companies and locations. The company badges are initials, not final portraits.

Checks: TypeScript exit 0; `bun test src`: **38 pass, 0 fail**; production build: **built in 618ms**, existing bundle-size warning. Later small badge/animation edits were typechecked again. No browser/playtest performed. No new external source research or factual validation of market data in this UI pass. User tests the feel; leave work uncommitted for Claude.
