# Wasteland Protocol - Task List

## Critical / Bugs

- [ ] `_setupNPCs` matches enemies by display name string (`npc.name.includes('Raider')`) which is fragile; use template IDs from map data instead
- [ ] `equipArmor` in `InteractionSystem` adds `acBonus` on equip but never subtracts it on unequip, causing AC to inflate over time
- [ ] `CoverResolver.isFlanking` logic is inverted -- it checks the same cover-candidate positions as `getCoverBetween`, so it will never return `true` when cover actually exists; rework the flank-detection angle
- [ ] `seekCover` AI action just moves away from the nearest enemy; it does not actually find or evaluate cover tiles using `CoverMap`/`CoverResolver`
- [ ] `StatusEffectSystem` is wired up but no consumable currently applies a timed debuff to enemies -- verify status effect tick-down and expiry actually works end-to-end
- [ ] Save/load restores raw component objects but does not rehydrate class instances (e.g. `Uint8Array` for visibility); confirm `visible` buffer is correctly zeroed on load

## Gameplay / Balance

- [ ] Add a reload mechanic -- weapons track `clipSize`/`currentAmmo` but nothing deducts ammo from the clip or forces a reload action
- [ ] Burst fire (`burstCount` on SMG) emits an event but the AP cost path and per-bullet hit rolls need an explicit `attemptBurst` method on `CombatSystem`
- [ ] Body-part effects from aimed shots (`disarm`, `slow`, `stun`, `blind` in `TargetedShot.js`) are defined but not applied anywhere after a hit
- [ ] AI never uses aimed shots, overwatch is rarely chosen (score 30 vs shoot 80+), and there is no flee behavior -- tune utility scores or add personality via the `AI` component's behavior field
- [ ] Only 4 enemy templates exist; add more variety (e.g., raider sniper, feral ghoul, robot sentry) in `enemy_templates.js`
- [ ] Weapon variety is thin -- no energy weapons, explosives, or big guns; extend `weapons.js` and add corresponding skill categories
- [ ] Experience from combat kills is not explicitly awarded (only quest XP via `addXP` event); add XP on `entityDied` based on enemy stats

## Content / Maps

- [ ] Only 3 maps are registered (`wasteland_outpost`, `abandoned_vault`, `trading_post`); add at least 1-2 more (e.g., raider camp interior, sewer tunnels)
- [ ] Map transition triggers are handled in `_handleInput` but there is no visual indicator on the tile map showing exit/entrance tiles to the player
- [ ] Add lootable containers with randomized contents to maps; currently containers are placed in map data but loot tables are not defined
- [ ] Quest `fix_purifier` uses a `skillUse` objective type but no interaction triggers that objective -- wire it to an interactable map object

## Quest / Dialogue

- [ ] `QuestTriggers` listens to events but kill-quest progress depends on matching `targetFaction` -- verify faction strings match between quest data and `Faction` component IDs
- [ ] Only 2 dialogue trees exist (merchant, quest_giver); add unique dialogues for other friendly NPCs
- [ ] Dialogue skill checks display `conditionLabel` but there is no visible pass/fail feedback after selecting a skill-gated response
- [ ] No quest failure conditions are wired up; `failQuest` exists but nothing calls it (e.g., key NPC death should fail related quests)

## UI / UX

- [ ] No game-over screen or restart flow -- `GameState.GAME_OVER` is defined but the render path for it is missing or minimal
- [ ] Victory screen on completing `find_vault` sets state to `VICTORY` but there is no dedicated victory render -- add an ending sequence
- [ ] Inventory screen does not show item descriptions or stat comparisons when selecting weapons/armor
- [ ] Add a minimap or automap overlay for explored areas
- [ ] HUD should show current ammo count and reload prompt
- [ ] Add a help/keybinding overlay accessible with `?` during gameplay (the controls screen is only on the main menu)
- [ ] Combat log messages scroll off-screen with no scroll-back; add scroll support or a message history view

## Technical / Architecture

- [ ] No build tool or bundler -- the project loads raw ES modules via `<script type="module">`, which is fine for dev but add a simple build step (e.g., esbuild) for production
- [ ] No tests at all -- add at least unit tests for `HitCalculation`, `DamageCalculation`, `Pathfinding`, and `QuestManager`
- [ ] `Game.js` is a 700+ line god-class; extract input handling, event wiring, and NPC setup into dedicated modules
- [ ] `EntityManager.query()` iterates all entities on every call with no indexing -- will degrade once entity count grows; consider caching query results and invalidating on add/remove
- [ ] Add `.gitignore` for common dev artifacts (node_modules, .DS_Store, dist/)
- [ ] Add a `package.json` with a dev server script so contributors do not need to know about `python3 -m http.server`
- [ ] `ParticleSystem` does not account for alpha fade in the drawn glyph color (the comment says "Fade color by reducing brightness" but the implementation just passes `p.fg` unchanged)

## Polish

- [ ] Add ambient procedural audio (wind, distant gunfire) to `AudioManager` for atmosphere
- [ ] Death animation should be more dramatic -- e.g., brief flash before corpse glyph swap
- [ ] Door opening/closing could show a brief animation frame
- [ ] Add a turn counter or clock display for immersion
- [ ] Support touch/click input for mobile browsers (canvas click to move/interact)
