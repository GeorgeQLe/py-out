import { GameState } from './Constants.js';
import { EventBus } from './EventBus.js';
import { Input } from './Input.js';
import { Camera } from './Camera.js';
import { SaveLoad } from './SaveLoad.js';
import { EntityManager } from '../ecs/EntityManager.js';
import { AsciiRenderer } from '../render/AsciiRenderer.js';
import { AnimationManager } from '../render/Animation.js';
import { ParticleSystem } from '../render/ParticleSystem.js';
import { MapLoader } from '../map/MapLoader.js';
import { Pathfinding } from '../map/Pathfinding.js';
import { RenderSystem } from '../systems/RenderSystem.js';
import { MovementSystem } from '../systems/MovementSystem.js';
import { FOVSystem } from '../systems/FOVSystem.js';
import { CombatSystem } from '../systems/CombatSystem.js';
import { AISystem } from '../systems/AISystem.js';
import { InteractionSystem } from '../systems/InteractionSystem.js';
import { LevelUpSystem } from '../systems/LevelUpSystem.js';
import { StatusEffectSystem } from '../systems/StatusEffectSystem.js';
import { TurnManager } from '../combat/TurnManager.js';
import { HitCalculation } from '../combat/HitCalculation.js';
import { DamageCalculation } from '../combat/DamageCalculation.js';
import { CoverResolver } from '../combat/CoverResolver.js';
import { Overwatch } from '../combat/Overwatch.js';
import { DialogueEngine } from '../dialogue/DialogueEngine.js';
import { DialogueConditions } from '../dialogue/DialogueConditions.js';
import { DialogueEffects } from '../dialogue/DialogueEffects.js';
import { QuestManager } from '../quest/QuestManager.js';
import { QuestTriggers } from '../quest/QuestTriggers.js';
import { PerkSystem } from '../rpg/PerkSystem.js';
import { DerivedStats } from '../rpg/DerivedStats.js';
import { AudioManager } from '../audio/AudioManager.js';
import { UIManager } from '../ui/UIManager.js';
import { HUD } from '../ui/HUD.js';
import { CombatLog } from '../ui/CombatLog.js';
import { TargetingUI } from '../ui/TargetingUI.js';
import { MainMenu } from '../ui/MainMenu.js';
import { CharCreationUI } from '../ui/CharCreationUI.js';
import { CharacterSheet } from '../ui/CharacterSheet.js';
import { InventoryScreen } from '../ui/InventoryScreen.js';
import { DialoguePanel } from '../ui/DialoguePanel.js';
import { QuestLog } from '../ui/QuestLog.js';
import { Position } from '../ecs/components/Position.js';
import { Renderable } from '../ecs/components/Renderable.js';
import { Stats } from '../ecs/components/Stats.js';
import { CombatState } from '../ecs/components/CombatState.js';
import { Faction, Factions } from '../ecs/components/Faction.js';
import { AI } from '../ecs/components/AI.js';
import { Inventory } from '../ecs/components/Inventory.js';
import { Colors } from '../render/Colors.js';
import { wastelandOutpost } from '../data/maps/wasteland_outpost.js';
import { weapons } from '../data/items/weapons.js';
import { merchantDialogue } from '../data/dialogue/merchant_dialogue.js';
import { questGiverDialogue } from '../data/dialogue/quest_giver_dialogue.js';
import { mainQuest } from '../data/quests/main_quest.js';
import { sideQuests } from '../data/quests/side_quests.js';

export class Game {
    constructor(canvas) {
        this.canvas = canvas;
        this.state = GameState.MAIN_MENU;
        this.eventBus = new EventBus();
        this.input = new Input(canvas, this.eventBus);
        this.camera = new Camera();
        this.renderer = new AsciiRenderer(canvas);
        this.em = new EntityManager();
        this.audio = new AudioManager();
        this.particleSystem = new ParticleSystem();
        this.animationManager = new AnimationManager();

        // Dialogue trees
        this.dialogueTrees = {
            merchant: merchantDialogue,
            quest_giver: questGiverDialogue,
        };

        // Quest system
        this.questManager = new QuestManager(this.eventBus);
        this.questManager.registerQuest(mainQuest);
        for (const q of sideQuests) this.questManager.registerQuest(q);
        this.questTriggers = new QuestTriggers(this.questManager, this.eventBus, this.em);

        // Dialogue system
        this.dialogueConditions = new DialogueConditions(this.em, this.questManager);
        this.dialogueEffects = new DialogueEffects(this.em, this.eventBus, this.questManager);
        this.dialogueEngine = new DialogueEngine(this.dialogueConditions, this.dialogueEffects);

        // Save/Load (pass after init)
        this.saveLoad = new SaveLoad(this);

        // UI - main menu first
        this.uiManager = new UIManager(this.renderer, this.eventBus);
        this.mainMenu = new MainMenu(this.eventBus, this.saveLoad);
        this.charCreationUI = new CharCreationUI(this.eventBus);
        this.uiManager.addPanel(this.mainMenu);

        // These get initialized after game starts
        this.playerId = null;
        this.tileMap = null;

        // Handle resize
        window.addEventListener('resize', () => {
            this.renderer.resize();
            this.camera.resize(this.canvas.width, this.canvas.height);
        });
        this.camera.resize(this.canvas.width, this.canvas.height);

        // Input handling
        this.eventBus.on('keydown', (e) => this._handleInput(e));

        // Game lifecycle events
        this.eventBus.on('newGame', () => this._startCharCreation());
        this.eventBus.on('loadGame', (data) => this._loadGame(data.slot));
        this.eventBus.on('charCreationComplete', (data) => this._initGame(data));
        this.eventBus.on('charCreationCancelled', () => {
            this.state = GameState.MAIN_MENU;
            this.mainMenu.visible = true;
        });

        // Combat events
        this.eventBus.on('aimedShotConfirmed', (data) => {
            this.combatSystem.attemptShot(data.attackerId, data.targetId, data.bodyPart);
            this._updateFOV();
        });

        this.eventBus.on('turnStarted', (data) => {
            if (this.playerId && !this.em.has(data.entityId, 'Player') && this.turnManager && this.turnManager.active) {
                setTimeout(() => {
                    if (this.state !== GameState.COMBAT || !this.turnManager?.active) return;
                    const stats = this.em.get(data.entityId, 'Stats');
                    if (!stats || stats.hp <= 0) return;
                    if (this.statusEffectSystem) this.statusEffectSystem.processTurn(data.entityId);
                    this.aiSystem.executeTurn(data.entityId);
                    this._updateFOV();
                }, 300);
            }
        });

        this.eventBus.on('combatEnded', () => {
            this.state = GameState.EXPLORING;
            this._targetingMode = false;
            this.combatLog.add('Combat has ended.', Colors.uiHighlight);
            this.saveLoad.save('auto');
        });

        this.eventBus.on('entityDied', (data) => {
            const ren = this.em.get(data.entityId, 'Renderable');
            if (ren) { ren.glyph = '%'; ren.fg = '#661111'; }
            const blocker = this.em.get(data.entityId, 'Blocker');
            if (blocker) blocker.blocksMove = false;
            this.audio.playDeath();
            this.particleSystem.emitBlood(
                this.em.get(data.entityId, 'Position')?.x || 0,
                this.em.get(data.entityId, 'Position')?.y || 0
            );
        });

        this.eventBus.on('shotFired', (data) => {
            this.audio.playShot();
            if (data.result.hit) {
                this.audio.playHit();
                if (data.result.damage?.isCrit) this.audio.playCritical();
            } else {
                this.audio.playMiss();
            }
        });

        this.eventBus.on('entityMoved', () => this.audio.playMove());
        this.eventBus.on('doorOpened', () => this.audio.playDoorOpen());
        this.eventBus.on('itemPickedUp', () => this.audio.playPickup());
        this.eventBus.on('levelUp', () => this.audio.playLevelUp());
        this.eventBus.on('questCompleted', () => this.audio.playQuestComplete());

        this.eventBus.on('addXP', (data) => {
            if (this.levelUpSystem && this.playerId) {
                this.levelUpSystem.addXP(this.playerId, data.amount);
            }
        });

        this.eventBus.on('startDialogue', (data) => this._startDialogue(data.npcId));
        this.eventBus.on('dialogueEnded', () => {
            this.state = GameState.EXPLORING;
        });

        // Combat targeting state
        this._targetingMode = false;
        this._targetList = [];
        this._targetIndex = 0;
    }

    _startCharCreation() {
        this.state = GameState.CHAR_CREATION;
        this.mainMenu.visible = false;
        this.charCreationUI.open();
        this.charCreationUI.visible = true;
        this.uiManager.addPanel(this.charCreationUI);
    }

    _loadGame(slot) {
        this._initGame(null);  // Init with defaults first
        this.saveLoad.load(slot);
        this._updateFOV();
    }

    _initGame(charData) {
        // Remove main menu and char creation panels
        this.uiManager.removePanel(this.mainMenu);
        this.uiManager.removePanel(this.charCreationUI);
        this.mainMenu.visible = false;
        this.charCreationUI.visible = false;

        // Load map
        const { tileMap, playerStart } = MapLoader.load(wastelandOutpost, this.em);
        this.tileMap = tileMap;

        // Create player
        this.playerId = this.em.create();
        this.em.add(this.playerId, 'Position', Position(playerStart.x, playerStart.y));
        this.em.add(this.playerId, 'Renderable', Renderable('@', Colors.player, null, 10));
        this.em.add(this.playerId, 'Player', { name: charData?.name || 'Wanderer' });

        if (charData && charData.stats) {
            this.em.add(this.playerId, 'Stats', charData.stats);
        } else {
            this.em.add(this.playerId, 'Stats', Stats({
                strength: 5, perception: 6, endurance: 5,
                charisma: 5, intelligence: 5, agility: 7, luck: 5,
                maxHP: 30, hp: 30, maxAP: 8, ap: 8,
                skills: { smallGuns: 55, melee: 40, lockpick: 30, speech: 35, repair: 25 },
            }));
        }

        this.em.add(this.playerId, 'CombatState', CombatState());
        this.em.add(this.playerId, 'Faction', Faction(Factions.PLAYER));
        this.em.add(this.playerId, 'Inventory', Inventory(DerivedStats.getCarryWeight(
            this.em.get(this.playerId, 'Stats').strength
        )));

        // Starting weapon
        const playerCombat = this.em.get(this.playerId, 'CombatState');
        playerCombat.equippedWeapon = { ...weapons.pipe_pistol };

        // Starting inventory
        const inv = this.em.get(this.playerId, 'Inventory');
        inv.items.push({ id: 'stimpak', name: 'Stimpak', type: 'consumable', glyph: '!', fg: '#44ff44', weight: 1, stackable: true, quantity: 3, effects: { healHP: 15 } });
        inv.items.push({ id: '9mm', name: '9mm Rounds', type: 'ammo', glyph: '=', fg: '#aa8833', weight: 0, stackable: true, quantity: 24 });

        // Store tag skills
        if (charData && charData.tagSkills) {
            this.em.get(this.playerId, 'Stats')._tagSkills = charData.tagSkills;
        }

        // Setup NPC combat components
        this._setupNPCs();

        // Init systems
        this.movementSystem = new MovementSystem(this.em, this.tileMap, this.eventBus);
        this.fovSystem = new FOVSystem();
        this.pathfinding = new Pathfinding(this.tileMap, this.em);
        this.coverResolver = new CoverResolver(this.tileMap, this.em);
        this.hitCalculation = new HitCalculation(this.coverResolver);
        this.damageCalculation = new DamageCalculation();
        this.turnManager = new TurnManager(this.em, this.eventBus);
        this.overwatch = new Overwatch(this.em, this.hitCalculation, this.damageCalculation, this.eventBus);
        this.combatSystem = new CombatSystem(this, this.turnManager, this.hitCalculation, this.damageCalculation, this.overwatch, this.eventBus);
        this.aiSystem = new AISystem(this.em, this.combatSystem, this.pathfinding, this.tileMap, this.eventBus);
        this.interactionSystem = new InteractionSystem(this.em, this.tileMap, this.eventBus);
        this.levelUpSystem = new LevelUpSystem(this.em, this.eventBus);
        this.statusEffectSystem = new StatusEffectSystem(this.em, this.eventBus);
        this.perkSystem = new PerkSystem(this.em);
        this.renderSystem = new RenderSystem(this.renderer, this.em, this.tileMap, this.camera);

        // UI panels
        this.hud = new HUD(this.em, this.playerId);
        this.combatLog = new CombatLog(this.eventBus);
        this.targetingUI = new TargetingUI(this.em, this.hitCalculation, this.eventBus);
        this.characterSheet = new CharacterSheet(this.em, this.playerId);
        this.inventoryScreen = new InventoryScreen(this.em, this.playerId, this.interactionSystem, this.eventBus);
        this.dialoguePanel = new DialoguePanel(this.dialogueEngine, this.eventBus);
        this.questLog = new QuestLog(this.questManager);

        this.uiManager.addPanel(this.hud);
        this.uiManager.addPanel(this.combatLog);
        this.uiManager.addPanel(this.targetingUI);
        this.uiManager.addPanel(this.characterSheet);
        this.uiManager.addPanel(this.inventoryScreen);
        this.uiManager.addPanel(this.dialoguePanel);
        this.uiManager.addPanel(this.questLog);

        // Set state and update
        this.state = GameState.EXPLORING;
        this._updateFOV();
    }

    _setupNPCs() {
        const npcs = this.em.query('NPC');
        for (const nid of npcs) {
            const npc = this.em.get(nid, 'NPC');
            if (npc.hostile) {
                this.em.add(nid, 'Stats', Stats({
                    strength: 5, perception: 5, endurance: 5,
                    charisma: 2, intelligence: 3, agility: 5, luck: 4,
                    maxHP: 20, hp: 20, maxAP: 7, ap: 7, ac: 3,
                    meleeDamage: 2, critChance: 4,
                    skills: { smallGuns: 45, melee: 40 },
                }));
                const cs = CombatState();
                cs.equippedWeapon = { ...weapons.pipe_pistol };
                this.em.add(nid, 'CombatState', cs);
                this.em.add(nid, 'Faction', Faction(Factions.RAIDER));
                this.em.add(nid, 'AI', AI('hostile'));
            } else {
                this.em.add(nid, 'Stats', Stats({ maxHP: 30, hp: 30, maxAP: 5, ap: 5 }));
                this.em.add(nid, 'CombatState', CombatState());
                this.em.add(nid, 'Faction', Faction(Factions.NEUTRAL));

                // Check for dialogue
                if (npc.name === 'Merchant') {
                    this.em.add(nid, 'Dialogue', { dialogueId: 'merchant' });
                }
            }
        }
    }

    _startDialogue(npcId) {
        const dialogue = this.em.get(npcId, 'Dialogue');
        const npc = this.em.get(npcId, 'NPC');
        if (!dialogue || !this.dialogueTrees[dialogue.dialogueId]) return;

        this.state = GameState.DIALOGUE;
        this.dialogueEngine.start(this.dialogueTrees[dialogue.dialogueId], this.playerId, npcId);
        this.dialoguePanel.open(npc?.name || 'Unknown');
    }

    _handleInput(e) {
        // Main menu
        if (this.state === GameState.MAIN_MENU) {
            this.mainMenu.handleInput(e.key);
            this.audio.playMenuMove();
            return;
        }

        // Char creation
        if (this.state === GameState.CHAR_CREATION) {
            this.charCreationUI.handleInput(e.key);
            this.audio.playMenuMove();
            return;
        }

        // Let UI handle first
        if (this.uiManager.handleInput(e.key)) return;

        if (this.state === GameState.EXPLORING) {
            this._handleExploreInput(e);
        } else if (this.state === GameState.COMBAT) {
            this._handleCombatInput(e);
        }
    }

    _handleExploreInput(e) {
        let dx = 0, dy = 0;
        switch (e.key) {
            case 'ArrowUp':    case 'k': case '8': dy = -1; break;
            case 'ArrowDown':  case 'j': case '2': dy = 1;  break;
            case 'ArrowLeft':  case 'h': case '4': dx = -1; break;
            case 'ArrowRight': case 'l': case '6': dx = 1;  break;
            case 'y': case '7': dx = -1; dy = -1; break;
            case 'u': case '9': dx = 1;  dy = -1; break;
            case 'b': case '1': dx = -1; dy = 1;  break;
            case 'n': case '3': dx = 1;  dy = 1;  break;
            case '.': case '5': break;
            case 'g': {
                // Pickup item at feet
                const pp = this.em.get(this.playerId, 'Position');
                const items = this.em.query('Position', 'Item');
                for (const iid of items) {
                    const ip = this.em.get(iid, 'Position');
                    if (ip.x === pp.x && ip.y === pp.y) {
                        this.interactionSystem.pickupItem(this.playerId, iid);
                        break;
                    }
                }
                return;
            }
            case 'i':
                this.inventoryScreen.toggle();
                return;
            case 'c':
                this.characterSheet.toggle();
                return;
            case 'q':
                this.questLog.toggle();
                return;
            case 'S':
                if (this.saveLoad.save('manual')) {
                    this.combatLog.add('Game saved.', Colors.uiHighlight);
                }
                return;
            case 'L':
                if (this.saveLoad.load('manual')) {
                    this.combatLog.add('Game loaded.', Colors.uiHighlight);
                    this._updateFOV();
                }
                return;
            default: return;
        }

        if (dx !== 0 || dy !== 0) {
            const pp = this.em.get(this.playerId, 'Position');
            const nx = pp.x + dx;
            const ny = pp.y + dy;

            // Check for hostile NPC
            const hostileAtTarget = this._getHostileAt(nx, ny);
            if (hostileAtTarget !== null) {
                this._startCombatWith(hostileAtTarget);
                return;
            }

            // Check for friendly NPC to talk to
            const npcAtTarget = this._getNPCAt(nx, ny);
            if (npcAtTarget !== null && this.em.has(npcAtTarget, 'Dialogue')) {
                this._startDialogue(npcAtTarget);
                return;
            }

            this.movementSystem.tryMove(this.playerId, dx, dy);
        }

        this._checkHostileProximity();
        this._updateFOV();
    }

    _handleCombatInput(e) {
        if (!this.turnManager.isPlayerTurn()) return;
        if (this.animationManager.isAnimating()) return;

        if (this._targetingMode) {
            switch (e.key) {
                case 'Tab':
                    this._targetIndex = (this._targetIndex + 1) % this._targetList.length;
                    return;
                case 'f': case 'Enter':
                    this.combatSystem.attemptShot(this.playerId, this._targetList[this._targetIndex]);
                    this._targetingMode = false;
                    this._updateFOV();
                    return;
                case 'a':
                    this.targetingUI.open(this.playerId, this._targetList[this._targetIndex]);
                    this._targetingMode = false;
                    return;
                case 'Escape':
                    this._targetingMode = false;
                    return;
            }
            return;
        }

        let dx = 0, dy = 0;
        switch (e.key) {
            case 'ArrowUp':    case 'k': case '8': dy = -1; break;
            case 'ArrowDown':  case 'j': case '2': dy = 1;  break;
            case 'ArrowLeft':  case 'h': case '4': dx = -1; break;
            case 'ArrowRight': case 'l': case '6': dx = 1;  break;
            case 'y': case '7': dx = -1; dy = -1; break;
            case 'u': case '9': dx = 1;  dy = -1; break;
            case 'b': case '1': dx = -1; dy = 1;  break;
            case 'n': case '3': dx = 1;  dy = 1;  break;
            case 'f':
                this._enterTargetingMode();
                return;
            case 'a':
                this._enterTargetingMode(true);
                return;
            case 'm': {
                const enemies = this._getAdjacentEnemies();
                if (enemies.length > 0) {
                    this.combatSystem.attemptMelee(this.playerId, enemies[0]);
                    this._updateFOV();
                } else {
                    this.combatLog.add('No adjacent enemies for melee!');
                }
                return;
            }
            case 'o':
                this.overwatch.setOverwatch(this.playerId);
                this.combatLog.add('Set overwatch. Watching for movement...', '#6af');
                this.combatSystem.endTurn();
                return;
            case 'i':
                this.inventoryScreen.toggle();
                return;
            case ' ':
                this.combatSystem.endTurn();
                return;
            default: return;
        }

        if (dx !== 0 || dy !== 0) {
            this.combatSystem.combatMove(this.playerId, dx, dy);
            this._updateFOV();
        }
    }

    _enterTargetingMode(aimed = false) {
        this._targetList = this._getVisibleEnemies();
        if (this._targetList.length === 0) {
            this.combatLog.add('No visible targets!');
            return;
        }
        this._targetingMode = true;
        this._targetIndex = 0;

        if (aimed) {
            this.targetingUI.open(this.playerId, this._targetList[0]);
            this._targetingMode = false;
        }
    }

    _getVisibleEnemies() {
        const enemies = this.em.query('Position', 'Stats', 'Faction');
        return enemies.filter(eid => {
            if (eid === this.playerId) return false;
            const f = this.em.get(eid, 'Faction');
            const s = this.em.get(eid, 'Stats');
            const p = this.em.get(eid, 'Position');
            return f.id !== Factions.PLAYER && f.id !== Factions.NEUTRAL && s.hp > 0 && this.tileMap.isVisible(p.x, p.y);
        });
    }

    _getAdjacentEnemies() {
        const pp = this.em.get(this.playerId, 'Position');
        return this._getVisibleEnemies().filter(eid => {
            const ep = this.em.get(eid, 'Position');
            return Math.abs(ep.x - pp.x) <= 1 && Math.abs(ep.y - pp.y) <= 1;
        });
    }

    _getHostileAt(x, y) {
        const entities = this.em.query('Position', 'Faction', 'Stats');
        for (const eid of entities) {
            const p = this.em.get(eid, 'Position');
            const f = this.em.get(eid, 'Faction');
            const s = this.em.get(eid, 'Stats');
            if (p.x === x && p.y === y && f.id !== Factions.PLAYER && f.id !== Factions.NEUTRAL && s.hp > 0) {
                return eid;
            }
        }
        return null;
    }

    _getNPCAt(x, y) {
        const entities = this.em.query('Position', 'NPC');
        for (const eid of entities) {
            const p = this.em.get(eid, 'Position');
            const s = this.em.get(eid, 'Stats');
            if (p.x === x && p.y === y && s && s.hp > 0) {
                return eid;
            }
        }
        return null;
    }

    _checkHostileProximity() {
        const pp = this.em.get(this.playerId, 'Position');
        const enemies = this.em.query('Position', 'Stats', 'Faction', 'AI');

        for (const eid of enemies) {
            const ep = this.em.get(eid, 'Position');
            const es = this.em.get(eid, 'Stats');
            const ef = this.em.get(eid, 'Faction');
            if (es.hp <= 0 || ef.id === Factions.PLAYER || ef.id === Factions.NEUTRAL) continue;
            if (!this.tileMap.isVisible(ep.x, ep.y)) continue;

            const dist = Math.abs(ep.x - pp.x) + Math.abs(ep.y - pp.y);
            if (dist <= 8) {
                this._startCombatWith(eid);
                return;
            }
        }
    }

    _startCombatWith(enemyId) {
        if (this.state === GameState.COMBAT) return;

        const pp = this.em.get(this.playerId, 'Position');
        const participants = [enemyId];
        const enemies = this.em.query('Position', 'Stats', 'Faction', 'AI');

        for (const eid of enemies) {
            if (eid === enemyId) continue;
            const ep = this.em.get(eid, 'Position');
            const es = this.em.get(eid, 'Stats');
            const ef = this.em.get(eid, 'Faction');
            if (es.hp <= 0 || ef.id === Factions.PLAYER || ef.id === Factions.NEUTRAL) continue;
            const dist = Math.abs(ep.x - pp.x) + Math.abs(ep.y - pp.y);
            if (dist <= 15) participants.push(eid);
        }

        this.combatSystem.initiateCombat(this.playerId, participants);
        this.combatLog.add('Hostiles detected! Combat initiated!', '#f66');
    }

    _updateFOV() {
        if (!this.playerId || !this.tileMap) return;
        const pp = this.em.get(this.playerId, 'Position');
        if (!pp) return;
        this.fovSystem.update(this.tileMap, pp.x, pp.y);
        this.camera.follow(pp.x, pp.y, this.tileMap.width, this.tileMap.height);
    }

    start() {
        const loop = () => {
            if (this.state === GameState.MAIN_MENU || this.state === GameState.CHAR_CREATION) {
                this.renderer.clear();
                this.uiManager.render();
            } else {
                this.animationManager.update();
                this.particleSystem.update();
                if (this.renderSystem) {
                    this.renderSystem.render();
                }
                this.animationManager.render(this.renderer, this.camera);
                this.particleSystem.render(this.renderer, this.camera);
                this._renderTargetingHighlight();
                this.uiManager.render();

                if (this.state === GameState.GAME_OVER) {
                    this._renderGameOver();
                }
            }

            requestAnimationFrame(loop);
        };

        loop();
    }

    _renderTargetingHighlight() {
        if (!this._targetingMode || this._targetList.length === 0) return;

        const targetId = this._targetList[this._targetIndex];
        const tp = this.em.get(targetId, 'Position');
        if (!tp || !this.camera.isVisible(tp.x, tp.y)) return;

        const sx = tp.x - this.camera.x;
        const sy = tp.y - this.camera.y;

        const time = performance.now();
        const blink = Math.floor(time / 300) % 2 === 0;
        if (blink) {
            this.renderer.drawGlyph(sx - 1, sy, '[', '#ff0');
            this.renderer.drawGlyph(sx + 1, sy, ']', '#ff0');
        }

        const combat = this.em.get(this.playerId, 'CombatState');
        if (combat && combat.equippedWeapon) {
            const result = this.hitCalculation.calculate(
                this.em.get(this.playerId, 'Stats'),
                this.em.get(targetId, 'Stats'),
                this.em.get(this.playerId, 'Position'),
                tp,
                combat.equippedWeapon
            );
            this.renderer.drawText(sx - 1, sy - 1, `${Math.round(result.hitChance)}%`, '#ff0');
        }

        const ts = this.em.get(targetId, 'Stats');
        const npc = this.em.get(targetId, 'NPC');
        if (ts) {
            const name = npc ? npc.name : 'Enemy';
            this.renderer.drawText(1, this.renderer.rows - 7, `Target: ${name} HP:${ts.hp}/${ts.maxHP}`, '#f66');
            this.renderer.drawText(1, this.renderer.rows - 6, '[f]ire [a]imed [Tab]next target [Esc]cancel', Colors.uiDim);
        }
    }

    _renderGameOver() {
        const cx = Math.floor(this.renderer.cols / 2);
        const cy = Math.floor(this.renderer.rows / 2);
        this.renderer.drawBox(cx - 15, cy - 3, 30, 7, '#f00', '#0a0000');
        this.renderer.drawText(cx - 7, cy - 1, 'YOU HAVE DIED', '#f00', '#0a0000');
        this.renderer.drawText(cx - 12, cy + 1, 'The wasteland claims another...', '#800', '#0a0000');
    }
}
