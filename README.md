# Wasteland Protocol

An ASCII tactical RPG inspired by Fallout and XCOM, playable in the browser.

## Play

```bash
python3 -m http.server 8080
```

Then open `http://localhost:8080` in your browser.

## Controls

### Exploration
| Key | Action |
|-----|--------|
| `hjkl` / Arrow Keys / Numpad | Move |
| `yubn` / `7 9 1 3` | Diagonal movement |
| `.` or `5` | Wait |
| `g` | Pick up item |
| `i` | Inventory |
| `c` | Character sheet |
| `q` | Quest log |
| `S` | Save game |
| `L` | Load game |

### Combat
| Key | Action |
|-----|--------|
| `f` | Fire weapon |
| `a` | Aimed shot (body parts) |
| `m` | Melee attack |
| `o` | Overwatch |
| `Tab` | Cycle targets |
| `Space` | End turn |

## Features

- **Turn-based tactical combat** with AP costs, cover, flanking, and overwatch
- **Aimed shots** targeting specific body parts with unique effects
- **SPECIAL stats** (Strength, Perception, Endurance, Charisma, Intelligence, Agility, Luck)
- **Skills and perks** with a level-up system
- **Dialogue system** with skill checks and branching conversations
- **Quest system** with kill, fetch, location, and talk objectives
- **Inventory management** with weapons, armor, consumables, and ammo
- **FOV and exploration** with fog of war
- **Particle effects** for blood, explosions, and sparks
- **Save/load** with auto-save after combat

## Architecture

```
src/
  core/        Game loop, event bus, input, camera, save/load
  ecs/         Entity-component system and component definitions
  systems/     Combat, movement, AI, FOV, rendering, interactions
  combat/      Hit calculation, damage, cover, overwatch, turn manager
  render/      ASCII renderer, glyph atlas, particles, animations
  map/         Tile maps, pathfinding, map loader
  ui/          HUD, menus, inventory, dialogue, quest log
  dialogue/    Dialogue engine, conditions, effects
  quest/       Quest manager, objectives, triggers
  rpg/         Character creation, perks, skills, derived stats
  data/        Maps, items, NPCs, quests, dialogue trees
  audio/       Sound effect manager
```
