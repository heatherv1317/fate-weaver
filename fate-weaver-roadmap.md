# Fate Weaver — Development Roadmap (Plan, NOT yet built)

Status: PLANNING. This captures the full vision discussed so it survives across sessions.
Build it in PHASES, in order — each phase is a coherent, shippable build with its own
tests + zip. The user controls usage by choosing when to start each phase. Nothing here
is built yet except where noted. Current shipped baseline is v16 (business system, balance
fixes, audit fixes, quest/criminal rebalance from simulation).

The guiding goal the user stated: make the game MORE REACTIVE and INTERACTIVE — BitLife-style.
Life pushes cards AT the player; choices branch and have visible consequences; results appear
in place (no scrolling to a bottom banner); playing well (NPC relationships, item/vendor
knowledge) beats playing lazily.

Build process per phase mirrors prior sessions: build file-by-file, re-run build + headless
mount + logic tests + regression after each major piece, package a working zip at the end.

────────────────────────────────────────────────────────────────────────
## PHASE 1 — FOUNDATION (UI feel + the actual bugs)
The interactive *feel*, plus the bugs. Most items below share ONE root cause: results and
controls live at the bottom of long tabs and force scrolling. The core fix is a reusable
MODAL-CARD + INLINE-RESULT system, then applying it consistently.

### Core system to build first
- **Modal-card component**: BitLife-style pop-up card with title, body, and choice buttons
  ON the card, resolved in place. This is the spine everything else hangs off. Build once,
  reuse for: childhood events, life choice events, sickness, world events, quest decisions.
- **Inline-result system**: action results appear NEXT TO the button pressed (dropdown /
  expand-in-place), never as a bottom banner you scroll to.

### The twelve items
1. **Childhood events (ages 1–5) pile up "before age 0".** STILL BROKEN after two attempts.
   Real cause (confirmed by user: happens "before age 0"): the OpeningSequence hands off to
   GameScreen with the character still at age 0, and all of ages 1–5 become eligible at once
   against that initial state. Earlier fixes guarded the effect but not the handoff. FIX AT
   SOURCE: reproduce by driving start→opening→GameScreen in the headless mount FIRST, confirm
   the trigger, then fix. Events must fire one card per age, on the age-up into that year.
   (Childhood events already pinned to maxAgeSpan:0 in v16 — verify that's actually in effect.)
2. **Double-tap to confirm on ALL action buttons.** Tap once to arm → label shows "Tap again
   to confirm" → reverts after ~2s if not confirmed. Arming a second button disarms the first.
   Applies to action/commit buttons (work, buy, cast, quest, hire, crime, gift, etc.), NOT tab
   navigation or drawer toggles. Build a reusable ConfirmButton.
3. **Purchase/action confirmation banner** shown in context (inline, near the action).
4. **Age-gated world events wrongly showing.** Events not accessible at current age still
   appear. Fix the age filter on the world-event pool (and sweep for the same in other pools).
5. **Friend/relationship cards show stats, gender, race, sexuality** so the player can judge
   compatibility before pursuing friendship/romance.
6. **Health tab available from birth** (currently gated later).
7. **Wider shop inventory across rarity grades**, including higher-grade items so better goods
   are obtainable. (Ties into Phase 2 loot rarity + condition.)
8. **Arcana spam fix.** studyMagic (checks seasonActions.magic vs SEASON_LIMITS.study) and
   castSpell (checks a separate magicLeft) are tracked inconsistently → magic can be spammed.
   Route BOTH study and cast through ONE shared per-season counter.
9. **Life choice events** (currently an inline scroll-to list, LifeTab ~line 710) → convert to
   mandatory MODAL CARDS like world events.
10. **Sickness** (currently a passive red banner pointing to Health tab, LifeTab ~line 746) →
    a MODAL CARD with options (treat / rest / ignore) resolved in place.
11. **NPC talk + ALL relationship action results** (befriend, romance, gift, etc.) → inline
    DROPDOWN under the NPC tapped, not a bottom banner. User confirmed: all relationship
    actions, not just talk.
12. **Consistency sweep** ("check for similar issues"): find every other bottom-banner /
    scroll-to-result spot and every missing age-gate, fold into the same modal/inline treatment.
    User confirmed they want the inline-results principle applied GAME-WIDE.

────────────────────────────────────────────────────────────────────────
## PHASE 2 — ECONOMY DEPTH (play well vs play lazy)
Turns the economy from "press button, get gold" into a system rewarding NPC relationships and
item/vendor knowledge. Depends on Phase 1 (wider item pool, inline results, friend data).

1. **NPC affinity affects haggling.** The more an NPC likes you, the lower the price you can
   haggle them to (buying) and the better they pay (selling). Relationships become economic.

1b. **Selling goods raises vendor affinity, scaled by item value.** (CONFIRMED by user.)
   Selling to a vendor improves their opinion of you, scaled by rarity: common items give a
   small affinity increase, up to a LARGE increase for legendary items sold. This closes a
   reinforcing loop with item 1 — a loyal customer who sells valuable wares to the right vendor
   gradually earns that vendor's best haggling prices. The lazy general-store path gives only
   minimal affinity (flat-rate, no relationship built), so cultivating a specialist vendor
   (vendor-matching, item 2) pays off twice: better sale price now AND better prices later.
   Tune the per-rarity affinity gain when building (e.g. common +1 … legendary +large).
2. **Vendor-matching for sales.** Selling the RIGHT item to the RIGHT vendor pays more:
   herbs → apothecary, weapons/ore → blacksmith, gems/jewelry → jeweller, tomes → scribe, etc.
   The GENERAL STORE always buys at the current flat rate (the lazy path still works; the
   knowledgeable path rewards you). Build a vendor-affinity matrix: item category × vendor type
   → price multiplier.
3. **Source-based loot rarity.** Drops from quests / work / gathering vary in rarity depending
   on the source. A dangerous quest can drop rare/legendary loot; gathering herbs can rarely
   yield a rare flower worth a lot. Each activity defines a loot table weighted by difficulty.
4. **Item condition + rarity affect value.** Undamaged or rare items sell for far more than
   common/damaged ones. Add `condition` (e.g. pristine/good/worn/damaged) and have rarity +
   condition drive sale price. The "rare flower found while gathering sells for a large amount"
   is the canonical example.

5. **Weapons + gear degrade with use (gold sink).** (CONFIRMED by user.) Weapons, armour, and
   gear carry a rarity grade (common→legendary) AND a condition (pristine → good → worn →
   damaged → broken). Using an item wears its condition down a step over time (per quest / per
   season of use / per combat — pick a cadence when building). Worn gear performs worse
   (reduced bonus) and eventually breaks, forcing the player to REPAIR or REPLACE it — an
   ongoing gold sink so a single great weapon can't last forever.
   DESIGN DECISIONS TO CONFIRM when building this:
   - Repair vs replace: CONFIRMED REPAIRABLE. Repair is the cheaper option, offered as a
     service at the BLACKSMITH vendor; replacement (rebuy) is the fallback when an item is too
     degraded/broken to be worth repairing. Repair cost scales with how worn the item is and
     its rarity (restoring a legendary costs more than a common). This ties the blacksmith
     vendor into the upkeep loop and keeps the gold sink ongoing.
   - Suggested tuning: rarer items degrade SLOWER (a legendary blade lasts far longer than a
     common one) — rewards investing in good gear. Confirm at build time.
   - Condition modifies BOTH the item's combat/effect bonus AND its resale value (worn = worth
     less), reusing the Phase 2 rarity+condition price formula.
   - Broken items give no bonus until repaired (or are destroyed if not repairable).

Integration note: Phase 2 sale pricing should reuse/extend the business-system price helpers
(getProducePrice, RARITY_PRICE_MULT) and getBaseSellPrice so the economy stays coherent.

### Herbalism / gathering ingredient set (user-supplied content for loot tables + herbalist trade)
Use for: gathering loot tables (varying rarity; rare finds sell high → the canonical "rare
flower" example), apothecary vendor stock, and the Herbalist business produce list + raw mats.
Each herb has a part used, a preparation, and an effect. DESIGN NOTE: render the harmful /
sensitive real-world uses (abortifacient, weapon poisons, toxic henbane/monkshood) as MYTHIC
fantasy effects tied to folklore (ward magic, poison a blade), kept flavourful not instructional
— fits the dark-fantasy tone and avoids real-world how-to. Assign each a rarity tier when built.

- Althaea (marsh mallow): root → poultice, heals wounds.
- Angelica: leaves → potion, wards off disease & magic, cures disease.
- Blueweed: leaves → powder, ritually purifies.
- Borage (starflower): flowers → potion, grants courage.
- Calendula (marigold): flowers → potion, divines a future lover.
- Cowslip: flowers → potion, cures paralysis, restores strength.
- Goldenrod: leaves → poultice, stops bleeding & cures poison.
- Henbane: leaves → hung by a door, wards building/occupants against magic.
- Horsetail: leaves → powder, ritually purifies.
- Hypericum: leaves & flowers → powder, aids exorcisms & summonings.
- Juniper: berries → potion, protects from/counters fevers, hexes, curses, the Evil Eye.
- Levisticum (lovage): leaves → potion, a "love"/lust potion.
- Mallow: shoots → potion, anti-love/lust.
- Mandrake: root (rare — "from below a hanging-site") → potion of fertility. [RARE find]
- Monkshood (aconite/wolfsbane): juice → weapon poison (mythic framing).
- Mushrooms: → potion, spirit-walking / astral travel.
- Myrtle: leaves → love potion.
- Pennyroyal: leaves → (folkloric abortifacient — render mythically, e.g. "ends a curse-bond").
- Rue: leaves → potion, second sight (see spirits/magic).
- Sealwort: roots → poultice, heals incapacitated limbs.
- Scorpion (animal): body → powder/potion, wards & cures poison.
- Wormwood: branch → hung by a door, wards spirits/elementals; leaves & oil → potion, protects
  against magic.
- Yarrow: leaves → poultice, heals wounds over several days; powder → potion, reading the future.

────────────────────────────────────────────────────────────────────────
## PHASE 3 — REACTIVE CONTENT (the quests + living world)
The richest, most open-ended phase. Build on the Phase 1 modal-card system and Phase 2 loot.

### Quest engine (model, don't hand-write each quest)
Model quests as **(goal verb × target type × difficulty/rank × loot table)**. The user
supplied a full quest-goal GRAMMAR (see corpus below). The goal verb sets structure + the
decision cards; the target swaps flavour; the variation rules generate many variants cheaply:
  - **Switch sides** (player becomes the antagonist: get away with the crime vs investigate it)
  - **Reverse the goal** (smuggle/plant instead of steal; close the portal instead of open it)
  - **Swap the target type** (person / creature / item / information / location)

Each goal/target implies a loot table: bounty quests pay a bounty; retrieval drops a relic;
scavenger/gathering yields rare ingredients; tournaments can drop a legendary artifact.

### Narrative quests = SINGLE RICH CHOICE (CONFIRMED by user)
Narrative quests (Missing Noble, Cursed Relic, Political Intrigue, etc.) resolve in ONE
decision card with a weighty branch and real consequences — NOT multi-stage. Keeps the quest
engine uniform: every quest resolves in a single decision; narrative ones just carry a heavier
choice and a branching outcome (e.g. side with A vs B, spare vs kill, keep vs return the relic),
each leading to different rewards/reputation/relationship effects. Lighter to build, consistent feel.

### NPC-initiated interactions (two-way relationships)
NPCs initiate: a friend asks a favour, a rival provokes you, a lord sends a marriage invite.
Not just the player acting on NPCs.

### Yearly "what happens" beats
A few small reactive cards each year (a stranger, an opportunity, a setback) so aging up always
surfaces something — the BitLife feed feel.

### QUEST CORPUS (user-supplied — the content to draw from)

**Eight archetypes (first batch):**
- Combat: Monster Eradication (clear a cave of goblins/wolves for a village); Gladiator
  Tournament (capital, win gold/glory/legendary artifact); Bounty Hunting (track a fugitive).
- Narrative: The Missing Noble (kidnapped heir, magical faction); Cursed Relic (find source of
  dark magic in haunted forest/ruined temple, break it); Political Intrigue (broker peace
  between dwarven clans / noble houses).
- Journey/Fetch: Caravan Escort (guard treasure through dangerous territory); Retrieve an
  Ancient Artifact (sunken shipwreck or deadly mountain, relic of the gods).

**Quest-goal grammar (verbs → structure). ~40 goals, each with target variants:**
Obtain McGuffin/info; Win a competition / prevent other side winning; Seize power; Kill a
person; Kill a creature; Destroy an item; Destroy a target/location; Protect a person; Protect
a creature; Guard an item; Kidnap a person; Rescue a person; Steal item/info/creature; Invade
a location; Defend a location; Escort a person/creature; Deliver an item/info; Track/chase/
capture a person; Track/chase/capture a creature; Escape; Resolve conflict; Cause conflict;
Investigate a mystery; Uncover a conspiracy; Stealthy heist (don't get caught); Frame someone;
Infiltrate and spy; Enforce (law/debts); Clear a name; Perform a task (ritual/build/summon);
Sabotage a task; Diplomacy/influence/negotiation; Persuade groups; Run/improve an org; Explore
a dangerous location (place-as-villain: traps, cave-ins, lava, avalanche, mist, beasts, poison
flora, pits, getting lost); Survive wilderness/disaster + get home; Scavenger hunt (collect
scattered items); Win a war; Defeat a horde/swarm/infestation (often needs a ritual/destroy-
the-source, not 1-by-1); Incite/put down rebellion; Prepare ambush/traps; Train a novice;
Be an experimental subject. PLUS the three variation rules above.

**Tier One scenarios (20):** hire-away offer; grudge bounty on a member; assassinated royal
mystery; beseech an evil faction; thieves extorting a merchant; rare reagent/organ for a
wizard; bard's stolen magical instrument (+tongue); cowardly fighter wants a power item; truth-
revealing mirror/portal; unjust execution by good people; demon-possessed wizard (capture +
exorcise); party framed; noble's child loves a scoundrel/disliked race; missing noblemen tied
to a brothel (red herring?); lord/lady seeking spouse invites the party; girl accused but it's
her possessed doll; separated lovers found via divination (twist); sacred building afire (douse
it, anger a fire elemental); gnome inventor needs goblin components; evil lord takes a daughter
as bride (parents hire a kidnap to lure/deter him).

**Tier Two scenarios (20):** chaotic wizard building a deadly dungeon (you realise it'll murder
low-level adventurers); puritanical group wants you to ruin a lawful business; librarian's
unreturned tome; hired to KIDNAP a princess (not rescue); vigilantes killing a minority;
creatures using a place as a marauding base; whole party captured — escape; barroom brawl vs
another party (spoils + a map); a member ends up owning a slave (conflict); mysterious
earthquakes; an "evil" faction is just misunderstood; shipwreck treasure race; dragon hoard
rumoured unguarded — race; bandits' toll road; curse of discord (party turns chaotic/evil);
curse turns party into kill-on-sight monsters; defeat thieves holding blackmail on a corrupt
noble; noble hires you to find blackmail on another; fire destroyed a beloved inn — help
rebuild; artist cursed (paintings come alive / predict death).

**Tier Three scenarios (40):** kidnapped princess (one too many times); wounded angel needs
escort home before devils take it; evil character in love with someone good, wants to reform;
a member is revealed a doppelganger (where's the real one?); circus with strange creatures
comes to town; new member's secret past catches up; "rescued" damsel is actually an assassin/
thief; promises of gold lead to an ambush; bounty on a trope-defying target (goodhearted
pirate, vegan troll); two members swap bodies; lord building a road vs opposed landowner/
druids (escalating violence); member inherits an abandoned estate w/ odd groundskeeper +
secrets; cult reviving its lost god; artifact from a seabed shipwreck; noble's child tags along
to see the world; deliver a ransom; a mysterious egg — hatchable?; a cursed object to dispose
of ASAP; whole town vanished; someone kidnapped — rescue; a gladiator arena to enter; warlord
corrupting towns toward a capital assault (wants a marriage); chanting heard in ruins/glade; a
member afflicted with lycanthropy; undead attacking a village (evil mastermind); new cult
recruiting — genuinely bad, or framed by a rival faction; mad wizard/cleric selling harmful
potions, silencing critics; missing precious item, paid on receipt (employer may dodge
payment); racing another party to treasure — they hit disaster, help or let them die?; plague
scenario (cure vs burn it down, risk infection); pop-culture reference quest; farmer clearing
land vs nature spirits/elves (take a side / mediate); chance to build the party's own
stronghold (side quests); a member needs a hard entry quest for a holy order / assassins'
guild; a member's guild/church needs an important quest done (bring friends); eccentric chef
went missing (secret recipe reward); a member of a persecuted minority defends their people
diplomatically; hostage crisis solved by negotiation not assault; mediate to prevent a war
(dodge an assassination by pro-war agents); escort a peace-wedding bride + dowry along a
treacherous road.

**Generic templates (20):** Retrieve Lost Artifact; Rescue the Captive; Solve the Mystery;
Protect the Village; Explore the Forbidden Land; Retrieve Stolen Treasure; Defeat the Evil
Overlord; Master the Elements; Seek the Legendary Weapon; Uncover the Ancient Civilization;
Aid the Wise Sage; Lift the Curse; Restore the Sacred Relics; Help the Lost Spirit; Expose the
Conspiracy; Ascend to Godhood; Collect the Elemental Crystals; Protect the Last of a Species;
Save the Dying World; Reclaim the Lost Kingdom.

────────────────────────────────────────────────────────────────────────
## OPEN QUESTIONS — RESOLVED
- Narrative quests: SINGLE RICH CHOICE (confirmed). One decision card, weighty branch, real
  consequences. Not multi-stage.
- Double-tap confirm: "Tap again to confirm" + ~2s revert + arming-disarms-others. (Locked.)
- Inline results applied game-wide: YES. (Locked.)
- More quest/content ideas may still come; plan is structured so new archetypes, scenarios,
  herbs, monsters, and weapons drop into the inspiration section + tables without rework.

## INSPIRATION SOURCES FOR GUILD QUESTS + DROPS (build original content in-world, our own voice)
The user supplied large reference dumps as INSPIRATION for the Adventurers' Guild quest and
drop tables. IMPORTANT: some of that material is transcribed from published, copyrighted RPG
sources (Dragon Magazine articles, Occult Lore, Alchemy & Herbalists, Oathbound, Primeval
Groves) and uses proprietary creatures (beholders, mind flayers/illithids, displacer beasts,
etc.). DO NOT copy that text or those proprietary creatures/stat blocks. Build ORIGINAL
content: draw on the underlying PUBLIC-DOMAIN folklore (real plant lore) and GENERIC fantasy
archetypes anyone may use, rendered in Fate Weaver's own voice and numbers.

- **Herb/gathering palette** (Phase 2): use the genuine folk-tradition herbs already listed in
  the Phase 2 herbalism set (marsh mallow, yarrow, henbane, juniper, mandrake, etc.). Each gets
  a rarity tier and apothecary vendor match. Rare finds (e.g. mandrake) = high-value drops.
- **Monster tiers for guild quests** (Phase 3): build a generic, non-proprietary bestiary in
  three difficulty bands, scaling loot + danger with quest rank:
  - Starter (low rank): giant rats, stirges, dire wolves, goblins, kobolds, skeletons, slimes,
    giant spiders, horned rabbits.
  - Mid (mid rank): owlbears, hill giants, manticores, chimeras, hags, golems, elementals,
    wraiths, trolls, wyverns.
  - Elite (high rank): dragons, liches, vampires, krakens, hydras — apex drops (legendary loot).
  - The user likes the VARIANT idea: a base monster with a twist (e.g. metal slime = rare, high
    evasion, big reward; armoured/horned goblin variants; jackalope variants). Use as rare
    "special" spawns that drop better loot. Build our own variants, not copied ones.
- **Weapon/loot grades** (Phase 2/3): build a small ORIGINAL weapon + item set keyed to the
  rarity ladder (common iron → legendary artifact), tying which quests drop what and which
  vendor (blacksmith) pays best. Generate from our existing rarity/condition systems when built;
  no external source list needed. Legendary named artifacts = rare apex-quest drops (e.g. the
  Gladiator Tournament's legendary prize, the "relic of the gods" from artifact-retrieval).
- **Loot-rarity hook**: each quest goal/target implies its drop — bounty quests pay a bounty;
  retrieval drops a relic; gathering yields ingredients (rare flower = big payout); monster
  kills drop monster-part ingredients usable by the herbalist/alchemist trades.

## TEST PLAN (every phase, mirrors prior sessions)
- npm run build clean.
- Headless jsdom mount: rendered UI YES, runtime errors 0. (Phase 1 childhood fix: the mount
  MUST drive the real start→opening→GameScreen flow to reproduce the age-0 pile-up first.)
- Node logic tests for each new system.
- Regression: re-run business (57), audit (23), audit2 (16), childhood (20), v15 regression (27).
- Balance: re-run sim-balance.mjs after any economy/quest changes (Phase 2/3).
