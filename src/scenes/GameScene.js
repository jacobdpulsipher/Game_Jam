import Phaser from 'phaser';
import { SCENES, GAME_WIDTH, GAME_HEIGHT, DOOR, PUSH_BLOCK } from '../config.js';
import { Player } from '../entities/Player.js';
import { Generator } from '../entities/Generator.js';
import { Terminal } from '../entities/Terminal.js';
import { ExtensionCord } from '../entities/ExtensionCord.js';
import { Spikes } from '../entities/Spikes.js';
import { Enemy } from '../entities/Enemy.js';
import { SlideDoor } from '../puzzles/SlideDoor.js';
import { PushBlock } from '../puzzles/PushBlock.js';
import { HeavyBlock } from '../entities/HeavyBlock.js';
import { Elevator } from '../puzzles/Elevator.js';
import { Drawbridge } from '../puzzles/Drawbridge.js';
import { getLevelById, getFirstLevel, getNextLevel } from '../levels/LevelRegistry.js';
import { GeneratorSystem } from '../systems/GeneratorSystem.js';
import { music } from '../audio/ProceduralMusic.js';
import { isMobile } from '../utils/mobile.js';
import {
  generateDumpsterPlatform,
  generateChimneyPlatform,
  generateACUnitPlatform,
  generateVentBoxPlatform,
  generateCratePlatform,
  generateSkyscraperPlatform,
} from '../assets/EnvironmentTextures.js';

/** Map of style names to texture generator functions. */
const STYLE_GENERATORS = {
  dumpster:    generateDumpsterPlatform,
  chimney:     generateChimneyPlatform,
  ac_unit:     generateACUnitPlatform,
  vent_box:    generateVentBoxPlatform,
  crate:       generateCratePlatform,
  skyscraper:  generateSkyscraperPlatform,
};

/** Minimum visual height for each platform style (the visual extends below the walkable surface). */
const STYLE_MIN_HEIGHTS = {
  dumpster:    32,
  chimney:     40,
  ac_unit:     28,
  vent_box:    20,
  crate:       32,
  skyscraper:  200,
};

/**
 * GameScene — data-driven level builder.
 *
 * Receives `{ levelId }` via scene data.  If none provided, loads the first level.
 * Reads a declarative level data object from LevelRegistry and instantiates
 * all platforms, entities, and puzzle elements.
 */
export class GameScene extends Phaser.Scene {
  constructor() {
    super({ key: SCENES.GAME });
  }

  create(sceneData) {
    try {
      // Resolve level data
      const levelId = sceneData?.levelId;
      this._levelData = levelId ? getLevelById(levelId) : getFirstLevel();
      if (!this._levelData) throw new Error(`Level not found: ${levelId}`);

      this._buildLevel(this._levelData);
    } catch (e) {
      this.add.text(20, 20, 'ERROR: ' + e.message + '\n' + e.stack, {
        fontSize: '12px', fontFamily: 'monospace', color: '#ff0000',
        wordWrap: { width: GAME_WIDTH - 40 },
      });
    }
  }

  // ═══════════════════════════════════════════════════════════════
  //  LEVEL BUILDER — reads declarative data and creates everything
  // ═══════════════════════════════════════════════════════════════

  _buildLevel(data) {
    // Cleanup per-level UI hints (scene.restart / next level)
    if (this._generatorHintText) {
      this._generatorHintText.destroy();
      this._generatorHintText = null;
    }

    // Remove any lingering event handlers from a previous level (scene.restart)
    this.events.off('player-action', this._handleAction, this);
    this.events.off('player-interact', this._handleInteract, this);
    this.events.off('player-attack-strike', this._handleAttackStrike, this);
    this.events.off('door-closing-tick', this._handleDoorClosing, this);
    this.events.off('trigger-zone-activated', this._handleTriggerZone, this);

    this.cameras.main.setBackgroundColor(data.bgColor || '#1a1a2e');
    this._levelComplete = false;

    // ── Dark City Backdrop ──
    this._drawCityBackdrop(data.world.width, data.world.height);

    // ── Midground Buildings (decorative layer between backdrop and gameplay) ──
    this._drawMidgroundBuildings(data);

    // ── Lampposts (decorative light posts) ──
    this._drawLampposts(data);

    // ── Atmospheric Effects (puddles, steam vents) ──
    this._drawAtmosphericEffects(data);

    // Lookup maps so terminals can reference doors/elevators by id
    this._elementsById = {};

    // Create GeneratorSystem
    this._generatorSystem = new GeneratorSystem(this);

    // ── Platforms ──
    this.platforms = this.physics.add.staticGroup();
    for (const p of data.platforms) {
      if (p.style && STYLE_GENERATORS[p.style]) {
        // Styled platform — render as a rooftop object (dumpster, chimney, etc.)
        const visualH = Math.max(p.height, STYLE_MIN_HEIGHTS[p.style] || p.height);
        const genFn = STYLE_GENERATORS[p.style];
        const texKey = genFn(this, p.width, visualH);

        // Walk surface Y = top edge of the original platform rect
        const surfaceY = p.y - p.height / 2;

        // Invisible physics zone at the original platform position
        const zone = this.add.zone(p.x, p.y, p.width, p.height);
        this.physics.add.existing(zone, true);
        this.platforms.add(zone);

        // Visual image — origin top-center, extends downward from walkable surface
        const visual = this.add.image(p.x, surfaceY, texKey);
        visual.setOrigin(0.5, 0);
        visual.setDepth(0); // same depth as gameplay
      } else {
        // Default ground tileSprite
        const ts = this.add.tileSprite(p.x, p.y, p.width, p.height, 'ground');
        this.physics.add.existing(ts, true);
        this.platforms.add(ts);
      }
    }

    // ── Generators ──
    this._generators = {};
    for (const g of data.generators) {
      const gen = new Generator(this, g.x, g.y, {
        isPrimary: g.isPrimary !== false,
        isActivated: g.isActivated,
        autoActivateIds: g.autoActivateIds || [],
      });
      // Overhead labels removed
      gen.elementId = g.id;
      this._generators[g.id] = gen;
      this._elementsById[g.id] = gen;
      this._generatorSystem.registerGenerator(g.id, gen);
    }

    // Context hint (Power Climb only): teach players that secondary generator uses E.
    if (data.id === 'level_04') {
      const g2 = this._generators?.g2;
      if (g2 && !g2.isPrimary) {
        this._generatorHintText = this.add.text(
          g2.x,
          g2.y - 70,
          isMobile() ? "Tap ⚡ to activate this generator" : "Press 'D' to activate this generator",
          {
            fontSize: '14px',
            fontFamily: 'monospace',
            color: '#44ddff',
            align: 'center',
          },
        ).setOrigin(0.5, 1).setDepth(200).setVisible(false);
      }
    }

    // ── Player ──
    this.player = new Player(this, data.player.x, data.player.y);
    this.player.generator = this._generators[data.player.generatorId];

    // ── Doors ──
    this._doors = [];
    for (const d of (data.doors || [])) {
      const door = new SlideDoor(this, {
        x: d.x, y: d.y,
        width: d.width, height: d.height,
        slideSpeed: d.slideSpeed, direction: d.direction,
        range: d.range, label: d.label,
      });
      door.elementId = d.id;
      this._elementsById[d.id] = door;
      this._doors.push(door);
    }

    // ── Elevators ──
    this._elevators = [];
    for (const e of (data.elevators || [])) {
      const elev = new Elevator(this, {
        x: e.x, startY: e.startY, endY: e.endY,
        width: e.width, height: e.height,
        speed: e.speed, pauseDuration: e.pauseDuration,
        label: e.label,
      });
      elev.elementId = e.id;
      this._elementsById[e.id] = elev;
      this._elevators.push(elev);
    }

    // ── Push Blocks ──
    this._pushBlocks = [];
    for (const b of (data.pushBlocks || [])) {
      const block = new PushBlock(this, b.x, b.y);
      block.elementId = b.id;
      this._elementsById[b.id] = block;
      this._pushBlocks.push(block);
    }

    // ── Heavy Blocks ──
    this._heavyBlocks = [];
    for (const hb of (data.heavyBlocks || [])) {
      const heavy = new HeavyBlock(this, hb.x, hb.y, hb.width, hb.height);
      heavy.elementId = hb.id;
      this._elementsById[hb.id] = heavy;
      this._heavyBlocks.push(heavy);
    }

    // ── Drawbridges ──
    this._drawbridges = [];
    for (const db of (data.drawbridges || [])) {
      const bridge = new Drawbridge(this, {
        pivotX: db.pivotX, pivotY: db.pivotY,
        width: db.width, height: db.height,
        speed: db.speed, direction: db.direction,
        label: db.label,
      });
      bridge.elementId = db.id;
      this._elementsById[db.id] = bridge;
      this._drawbridges.push(bridge);
    }

    // ── Spikes ──
    this._spikes = [];
    for (const s of (data.spikes || [])) {
      const spike = new Spikes(this, {
        x: s.x, y: s.y, width: s.width,
        height: s.height, label: s.label,
      });
      spike.elementId = s.id;
      this._elementsById[s.id] = spike;
      this._spikes.push(spike);
      this._generatorSystem.registerElement(s.id, spike);
    }

    // ── Enemies ──
    this._enemies = [];
    for (const e of (data.enemies || [])) {
      const enemy = new Enemy(this, {
        x: e.x, y: e.y,
        speed: e.speed,
        rangeLeft: e.rangeLeft,
        rangeRight: e.rangeRight,
        direction: e.direction,
        width: e.width,
        height: e.height,
        label: e.label,
        id: e.id,
      });
      this._enemies.push(enemy);
    }

    // Register all puzzle elements with GeneratorSystem for auto-activation
    for (const door of this._doors) {
      this._generatorSystem.registerElement(door.elementId, door);
    }
    for (const elev of this._elevators) {
      this._generatorSystem.registerElement(elev.elementId, elev);
    }
    for (const block of this._pushBlocks) {
      this._generatorSystem.registerElement(block.elementId, block);
    }
    for (const bridge of this._drawbridges) {
      this._generatorSystem.registerElement(bridge.elementId, bridge);
    }

    // Set up generator links from level data
    for (const link of (data.generatorLinks || [])) {
      this._generatorSystem.linkElementsToGenerator(link.generatorId, link.linkedElements);
    }

    // ── Terminals ──
    this.terminals = [];
    for (const t of (data.terminals || [])) {
      const term = new Terminal(this, t.x, t.y);
      term.elementId = t.id;
      const linked = this._elementsById[t.linkTo];
      if (linked) term.linkTo(linked);
      this.terminals.push(term);
    }

    // ── Trigger Zones ──
    this._triggerZones = [];
    for (const tz of (data.triggerZones || [])) {
      const zone = this.add.zone(tz.x, tz.y, tz.width, tz.height);
      this.physics.add.existing(zone, true); // static
      zone.elementId = tz.id;
      zone.triggersGenerator = tz.triggersGenerator;
      zone.triggersIds = tz.triggersIds || [];
      zone.onceOnly = tz.onceOnly || false;
      zone.hasTriggered = false;
      this._triggerZones.push(zone);
    }

    // ── Extension Cord ──
    this.extensionCord = new ExtensionCord(this, this.player.generator);

    // ── Goal zone ──
    if (data.goal) {
      this.goalZone = this.add.zone(data.goal.x, data.goal.y, 50, 50);
      this.physics.add.existing(this.goalZone, true);
    }

    // ── Mentor NPC (Voltage Jack) ──
    this._mentorSprite = null;
    this._mentorData = null;
    if (data.mentor) {
      this._mentorData = data.mentor;
      const texKey = data.mentor.textureKey || 'mentor_small';
      if (this.textures.exists(texKey)) {
        this._mentorSprite = this.add.image(data.mentor.x, data.mentor.y, texKey)
          .setOrigin(0.5, 1)
          .setScale(0.6)
          .setDepth(10);
        // Standstill bounce tween
        this.tweens.add({
          targets: this._mentorSprite,
          y: data.mentor.y - 3,
          duration: 600,
          yoyo: true,
          repeat: -1,
          ease: 'Sine.easeInOut',
        });
      }
    }

    // ── COLLISIONS ──
    this.physics.add.collider(this.player, this.platforms);

    for (const door of this._doors) {
      this.physics.add.collider(this.player, door);
    }

    for (const elev of this._elevators) {
      this.physics.add.collider(this.player, elev);
    }

    for (const bridge of this._drawbridges) {
      this.physics.add.collider(this.player, bridge.bridgeBody);
    }

    for (const block of this._pushBlocks) {
      // Block collides with platforms (so it can rest & fall off edges)
      this.physics.add.collider(block, this.platforms);

      // Player can stand on the block's top platform (always)
      this.physics.add.collider(this.player, block.topPlatform);

      // Player collides with block body only when foreground & not grabbed
      this.physics.add.collider(this.player, block, null, () => {
        return block.inForeground && !block.isGrabbed;
      });

      // Block collides with doors
      for (const door of this._doors) {
        this.physics.add.collider(block, door);
      }

      // Block collides with elevators
      for (const elev of this._elevators) {
        this.physics.add.collider(block, elev);
      }

      // Block collides with drawbridge bodies
      for (const bridge of this._drawbridges) {
        this.physics.add.collider(block, bridge.bridgeBody);
      }
    }

    // Heavy block collisions
    for (const heavy of this._heavyBlocks) {
      // Heavy block collides with platforms (rests on floor)
      this.physics.add.collider(heavy, this.platforms);

      // Player collides with heavy block body (solid wall)
      this.physics.add.collider(this.player, heavy);

      // Player can stand on the heavy block's top platform
      this.physics.add.collider(this.player, heavy.topPlatform);

      // Player blocked by the heavy block's skirt (fills gap to floor)
      this.physics.add.collider(this.player, heavy.skirt);

      // Heavy block sits on push block top-platforms
      for (const block of this._pushBlocks) {
        this.physics.add.collider(heavy, block.topPlatform);
      }

      // Heavy block collides with doors
      for (const door of this._doors) {
        this.physics.add.collider(heavy, door);
      }

      // Heavy block collides with elevators
      for (const elev of this._elevators) {
        this.physics.add.collider(heavy, elev);
      }
    }

    // Spike overlaps — kill player on contact
    for (const spike of this._spikes) {
      this.physics.add.overlap(this.player, spike, () => {
        if (spike.isDangerous) this.player.die();
      }, null, this);
    }

    // Enemy collisions
    for (const enemy of this._enemies) {
      // Enemies collide with platforms so they walk on ground
      this.physics.add.collider(enemy, this.platforms);

      // Enemies collide with doors
      for (const door of this._doors) {
        this.physics.add.collider(enemy, door);
      }

      // Player overlaps enemy → die (if enemy is alive and player not attacking)
      this.physics.add.overlap(this.player, enemy, () => {
        if (enemy.isDangerous && !this.player._isAttacking) this.player.die();
      }, null, this);
    }

    // Trigger zone overlaps — activate generators on contact
    for (const zone of this._triggerZones) {
      this.physics.add.overlap(this.player, zone, () => {
        if (!zone.hasTriggered || !zone.onceOnly) {
          zone.hasTriggered = true;
          // Activate via triggersIds (direct element activation)
          if (zone.triggersIds && zone.triggersIds.length > 0) {
            for (const elementId of zone.triggersIds) {
              const element = this._elementsById[elementId];
              if (element && typeof element.activate === 'function') {
                element.activate();
              }
            }
          }
          // Activate via triggersGenerator (GeneratorSystem)
          if (zone.triggersGenerator && this._generatorSystem) {
            this._generatorSystem.activateGenerator(zone.triggersGenerator);
          }
        }
      }, null, this);
    }

    if (this.goalZone) {
      this.physics.add.overlap(this.player, this.goalZone, this._onReachGoal, null, this);
    }

    // ── Tutorial Popup Zones ──
    this._tutorialPopups = [];
    this._activeTutorial = null;  // currently displayed popup
    for (const tp of (data.tutorialPopups || [])) {
      const zone = this.add.zone(tp.x, tp.y, tp.width, tp.height);
      this.physics.add.existing(zone, true);
      zone._tutData = tp;
      this._tutorialPopups.push(zone);
    }

    // ── EVENT HANDLERS ──
    this.events.on('player-action', this._handleAction, this);
    this.events.on('player-interact', this._handleInteract, this);
    this.events.on('player-attack-strike', this._handleAttackStrike, this);
    this.events.on('door-closing-tick', this._handleDoorClosing, this);
    this.events.on('trigger-zone-activated', this._handleTriggerZone, this);

    // ── Camera ──
    this.cameras.main.setBounds(0, 0, data.world.width, data.world.height);
    this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
    this.physics.world.setBounds(0, 0, data.world.width, data.world.height);

    // ── Launch UI ──
    this.scene.launch(SCENES.UI);

    // ── Level name ──
    this.add.text(GAME_WIDTH / 2, 20,
      `${data.name}  |  D = cord  |  F = grab  |  Arrows = move  |  Space = jump`, {
        fontSize: '13px', fontFamily: 'monospace', color: '#888',
      }).setOrigin(0.5).setScrollFactor(0).setDepth(100);

    // ── Music ──
    music.init();
    // Extract level number from level ID (e.g., 'level_01' -> 1, 'level_02' -> 2)
    const levelNum = parseInt(data.id.replace(/\D/g, '')) || 1;
    music.playLevel(levelNum);
  }

  // ═══════════════════════════════════════════════════════════════
  //  UPDATE
  // ═══════════════════════════════════════════════════════════════

  update(time, delta) {
    // Check tutorial popup zones — show/hide based on proximity (non-blocking)
    // Skip zone checks once the level is complete (victory popup uses the same system)
    if (this._tutorialPopups && this.player && !this._levelComplete) {
      let insideZone = null;
      for (const zone of this._tutorialPopups) {
        const dx = Math.abs(this.player.x - zone.x);
        const dy = Math.abs(this.player.y - zone.y);
        if (dx < zone.width / 2 && dy < zone.height / 2) {
          insideZone = zone._tutData;
          break;
        }
      }
      // Show popup if entering a new zone, hide if leaving
      if (insideZone && (!this._activeTutorial || this._activeTutorial._tutId !== insideZone.id)) {
        this._dismissTutorial();
        this._showTutorial(insideZone);
      } else if (!insideZone && this._activeTutorial) {
        this._dismissTutorial();
      }
    }

    if (this.player) this.player.update();
    if (this.extensionCord) this.extensionCord.update(this.player);

    // Show/hide the Power Climb generator hint when the player approaches G2.
    if (this._generatorHintText && this.player && this._levelData?.id === 'level_04') {
      const g2 = this._generators?.g2;
      if (!g2 || g2.isPrimary) {
        this._generatorHintText.setVisible(false);
      } else if (g2.isActivated) {
        this._generatorHintText.setVisible(false);
      } else {
        const dist = Phaser.Math.Distance.Between(g2.x, g2.y, this.player.x, this.player.y);
        this._generatorHintText.setVisible(dist <= 90);
      }
    }

    // Update enemies
    for (const enemy of this._enemies) {
      if (enemy.active) enemy.update();
    }

    // Elevator rider logic — carry the player along with moving elevators
    for (const elev of this._elevators) {
      elev.trackMovement();
      if (elev.deltaY !== 0 && this.player) {
        // Check if player is standing on this elevator
        const px = this.player.x;
        const py = this.player.y + this.player.body.halfHeight;
        const ex = elev.x;
        const ey = elev.y - elev._h / 2;
        const onTop = Math.abs(px - ex) < elev._w / 2 + 4 &&
                       Math.abs(py - ey) < 8;
        if (onTop) {
          this.player.y += elev.deltaY;

          // If the player is holding a push block and it's riding this elevator,
          // carry it along too. Grabbed blocks are kinematic (body.moves=false),
          // so they won't be pushed by the moving elevator unless we do this.
          const grabbed = this.player.grabbedBlock;
          if (grabbed && grabbed.isGrabbed) {
            const bx = grabbed.x;
            const by = grabbed.y + PUSH_BLOCK.SIZE / 2;
            const blockOnTop = Math.abs(bx - ex) < elev._w / 2 + PUSH_BLOCK.SIZE / 2 + 4 &&
                               Math.abs(by - ey) < 12;
            if (blockOnTop) {
              grabbed.y += elev.deltaY;
              if (grabbed.body) {
                grabbed.body.position.y += elev.deltaY;
                grabbed.body.prev.y += elev.deltaY;
              }
              grabbed.syncPosition();
            }
          }
        }
      }
    }

    // Sync push block top-platforms with their dynamic bodies
    for (const block of this._pushBlocks) {
      block.syncPosition();
    }

    // Sync heavy block top-platforms
    for (const heavy of this._heavyBlocks) {
      heavy.syncPosition();
    }

    // Check if any block has landed on spikes → neutralise them
    for (const spike of this._spikes) {
      if (!spike.isDangerous) continue;
      for (const block of this._pushBlocks) {
        if (this._isBlockCoveringSpikes(block, spike)) {
          spike.neutralise();
        }
      }
    }

    // Door propping — check every door / block combination
    for (const door of this._doors) {
      if (door.isPropped) {
        let stillPropped = false;
        for (const block of this._pushBlocks) {
          if (block.isUnderDoor(door)) { stillPropped = true; break; }
        }
        if (!stillPropped) door.resumeClosing();
      }
    }
  }

  /** Check if a block is resting on top of / covering a spike zone. */
  _isBlockCoveringSpikes(block, spike) {
    const overlapX = Math.abs(block.x - spike.x) < (PUSH_BLOCK.SIZE / 2 + spike._w / 2);
    // Both sit on the same surface, so compare their bottoms
    const blockBottom = block.y + PUSH_BLOCK.SIZE / 2;
    const spikeBottom = spike.y + spike._h / 2;
    const verticallyClose = Math.abs(blockBottom - spikeBottom) < 30;
    return overlapX && verticallyClose && block.body.blocked.down;
  }

  // ═══════════════════════════════════════════════════════════════
  //  EVENT HANDLERS
  // ═══════════════════════════════════════════════════════════════

  /** Draw a dark city skyline backdrop behind the level. */
  _drawCityBackdrop(worldW, worldH) {
    const g = this.add.graphics();
    g.setDepth(-10);
    g.setScrollFactor(0.3, 0.3); // parallax — moves slower than camera

    // Night sky gradient
    const skyH = worldH;
    for (let y = 0; y < skyH; y += 4) {
      const t = y / skyH;
      const r = Math.floor(10 + t * 15);
      const gr = Math.floor(10 + t * 12);
      const b = Math.floor(25 + t * 20);
      g.fillStyle(Phaser.Display.Color.GetColor(r, gr, b), 1);
      g.fillRect(0, y, worldW * 3, 4);
    }

    // Stars (small dots)
    g.fillStyle(0xffffff, 0.4);
    const starSeed = worldW * 7;
    for (let i = 0; i < 60; i++) {
      const sx = ((starSeed * (i + 1) * 13) % (worldW * 2));
      const sy = ((starSeed * (i + 1) * 7) % (worldH * 0.35));
      const sz = ((i * 31) % 5 < 1) ? 1.5 : 0.8;
      g.fillStyle(0xffffff, 0.25 + ((i * 17) % 3) * 0.1);
      g.fillCircle(sx, sy, sz);
    }

    // Far horizon glow (subtle city light pollution)
    for (let i = 0; i < 6; i++) {
      g.fillStyle(0x1a1428, 0.06 - i * 0.008);
      g.fillRect(0, worldH - 180 - i * 30, worldW * 3, 50);
    }

    // Background buildings (far layer — darker, smaller, denser)
    const farColors = [0x0e0e1a, 0x0c0c18, 0x101020, 0x0d0d1c];
    const farBuildings = Math.floor(worldW / 40) + 6;
    for (let i = 0; i < farBuildings; i++) {
      const bx = i * 40 - 30 + ((i * 37) % 20);
      const bh = 60 + ((i * 73) % 140);
      const bw = 22 + ((i * 41) % 35);
      const fc = farColors[i % farColors.length];
      g.fillStyle(fc, 0.9);
      g.fillRect(bx, worldH - bh - 100, bw, bh + 100);
      // Dark windows
      g.fillStyle(0x0a0a12, 1);
      for (let wy = worldH - bh - 90; wy < worldH - 110; wy += 10) {
        for (let wx = bx + 3; wx < bx + bw - 3; wx += 6) {
          g.fillRect(wx, wy, 2, 3);
        }
      }
      // Occasional lit window
      g.fillStyle(0x221a00, 0.4);
      const litY = worldH - bh - 90 + ((i * 19) % (bh - 30));
      const litX = bx + 4 + ((i * 7) % Math.max(bw - 10, 1));
      g.fillRect(litX, litY, 2, 3);
    }

    // Mid-distance buildings (between far and near — more detail, variety)
    const midColors = [0x111122, 0x0f0f20, 0x12121e, 0x131326];
    const midBuildings = Math.floor(worldW / 55) + 5;
    for (let i = 0; i < midBuildings; i++) {
      const bx = i * 55 + ((i * 43) % 25) - 15;
      const bh = 90 + ((i * 89) % 180);
      const bw = 35 + ((i * 51) % 45);
      const mc = midColors[i % midColors.length];
      g.fillStyle(mc, 0.95);
      g.fillRect(bx, worldH - bh - 80, bw, bh + 80);
      // Windows — some dim, occasional lit
      for (let wy = worldH - bh - 70; wy < worldH - 90; wy += 12) {
        for (let wx = bx + 4; wx < bx + bw - 4; wx += 8) {
          const hash = (wx * 5 + wy * 3 + i) % 17;
          const isLit = hash < 2;
          g.fillStyle(isLit ? 0x2a1a00 : 0x090914, isLit ? 0.5 : 1);
          g.fillRect(wx, wy, 3, 4);
        }
      }
      // Rooftop detail for taller buildings
      if (bh > 140 && ((i * 13) % 3 === 0)) {
        g.fillStyle(0x161628, 1);
        g.fillRect(bx + bw / 2 - 6, worldH - bh - 80 - 8, 12, 8);
        // Antenna
        g.lineStyle(1, 0x1a1a2e, 0.7);
        g.beginPath();
        g.moveTo(bx + bw / 2, worldH - bh - 88);
        g.lineTo(bx + bw / 2, worldH - bh - 110);
        g.strokePath();
        g.fillStyle(0xff2200, 0.35);
        g.fillCircle(bx + bw / 2, worldH - bh - 110, 1.5);
      }
    }

    // Foreground buildings (near layer — slightly lighter silhouettes, denser)
    const nearColor = 0x151525;
    const nearColors = [0x151525, 0x161630, 0x141428, 0x171730];
    const nearBuildings = Math.floor(worldW / 60) + 5;
    for (let i = 0; i < nearBuildings; i++) {
      const bx = i * 60 + ((i * 53) % 30) - 20;
      const bh = 100 + ((i * 97) % 180);
      const bw = 40 + ((i * 61) % 50);
      const nc = nearColors[i % nearColors.length];
      g.fillStyle(nc, 0.95);
      g.fillRect(bx, worldH - bh - 60, bw, bh + 60);
      // Windows — some lit (dim yellow), most dark
      for (let wy = worldH - bh - 50; wy < worldH - 70; wy += 14) {
        for (let wx = bx + 5; wx < bx + bw - 5; wx += 10) {
          const isLit = ((wx * 3 + wy * 7) % 11) < 2;
          g.fillStyle(isLit ? 0x332200 : 0x0a0a18, isLit ? 0.6 : 1);
          g.fillRect(wx, wy, 4, 5);
        }
      }
      // Fire escape on some near buildings
      if (bh > 120 && ((i * 7) % 3 === 0)) {
        const feX = bx + bw - 2;
        g.lineStyle(1, 0x1e1e30, 0.6);
        for (let fy = worldH - bh - 40; fy < worldH - 70; fy += 28) {
          // Platform
          g.fillStyle(0x1a1a2c, 0.7);
          g.fillRect(feX, fy, 10, 2);
          // Railing
          g.beginPath();
          g.moveTo(feX + 10, fy);
          g.lineTo(feX + 10, fy - 8);
          g.strokePath();
          // Ladder to next
          g.beginPath();
          g.moveTo(feX + 4, fy + 2);
          g.lineTo(feX + 4, fy + 28);
          g.strokePath();
        }
      }
    }
  }

  /** Draw decorative buildings behind platforms to make them look like rooftops. */
  _drawMidgroundBuildings(data) {
    if (!data.midgroundBuildings?.length) return;

    const g = this.add.graphics();
    g.setDepth(-5); // between backdrop (-10) and gameplay elements (0+)
    // scrollFactor 1.0 (default) — moves with the game world, aligned with platforms

    for (const b of data.midgroundBuildings) {
      const color = b.color || 0x1c1c3a;
      const bx = b.x;
      const by = b.y;
      const bw = b.width;
      const bh = b.height;

      // ── Building body ──
      g.fillStyle(color, 1);
      g.fillRect(bx, by, bw, bh);

      // ── Brick pattern overlay ──
      const brickW = 14;
      const brickH = 7;
      // Horizontal mortar lines
      const r0 = (color >> 16) & 0xff;
      const g0 = (color >> 8) & 0xff;
      const b0 = color & 0xff;
      const mortarC = Phaser.Display.Color.GetColor(
        Math.max(0, r0 - 10), Math.max(0, g0 - 10), Math.max(0, b0 - 10)
      );
      g.fillStyle(mortarC, 0.3);
      for (let my = by; my < by + bh; my += brickH) {
        g.fillRect(bx, my, bw, 1);
      }
      // Vertical mortar (offset rows)
      for (let my = by; my < by + bh; my += brickH) {
        const row = Math.floor((my - by) / brickH);
        const off = (row % 2 === 0) ? 0 : brickW / 2;
        g.fillStyle(mortarC, 0.2);
        for (let mx = bx + off; mx < bx + bw; mx += brickW) {
          g.fillRect(mx, my, 1, brickH);
        }
      }
      // Subtle brick color variation
      for (let my = by; my < by + bh; my += brickH) {
        const row = Math.floor((my - by) / brickH);
        const off = (row % 2 === 0) ? 0 : brickW / 2;
        for (let mx = bx + off; mx < bx + bw; mx += brickW) {
          const h = ((mx * 7 + my * 13) % 29);
          if (h < 4) {
            g.fillStyle(0x000000, 0.06);
            g.fillRect(mx + 1, my + 1, brickW - 2, brickH - 2);
          } else if (h < 7) {
            g.fillStyle(0xffffff, 0.03);
            g.fillRect(mx + 1, my + 1, brickW - 2, brickH - 2);
          }
        }
      }

      // ── Cornice / ledge at top (slightly wider overhang) ──
      const overhang = 4;
      const corniceColor = Phaser.Display.Color.GetColor(
        Math.min(255, r0 + 22), Math.min(255, g0 + 22), Math.min(255, b0 + 30)
      );
      g.fillStyle(corniceColor, 0.95);
      g.fillRect(bx - overhang, by, bw + overhang * 2, 4);
      // Decorative band below cornice
      g.fillStyle(corniceColor, 0.5);
      g.fillRect(bx - overhang + 1, by + 4, bw + overhang * 2 - 2, 2);

      // ── Side edges (darker vertical bands for depth) ──
      g.fillStyle(0x000000, 0.22);
      g.fillRect(bx, by + 6, 3, bh - 6);
      g.fillRect(bx + bw - 3, by + 6, 3, bh - 6);

      // ── Vertical column separators for wide buildings ──
      if (bw > 120) {
        const colSpacing = bw > 250 ? 80 : 60;
        for (let cx = bx + colSpacing; cx < bx + bw - 20; cx += colSpacing) {
          g.fillStyle(0x000000, 0.12);
          g.fillRect(cx, by + 6, 2, bh - 10);
        }
      }

      // ── Floor separator lines (stone bands) ──
      const floorH = 36;
      for (let fy = by + floorH; fy < by + bh - 10; fy += floorH) {
        g.fillStyle(corniceColor, 0.25);
        g.fillRect(bx + 4, fy, bw - 8, 2);
      }

      // ── Windows — larger, more detailed ──
      const winW = 9;
      const winH = 12;
      const spacingX = 20;
      const spacingY = 24;
      const marginX = 12;
      const marginY = 14;

      let floorIdx = 0;
      for (let wy = by + marginY; wy + winH < by + bh - 8; wy += spacingY) {
        // Skip occasional floor (mechanical / dark band)
        if (floorIdx % 7 === 4) { floorIdx++; continue; }
        for (let wx = bx + marginX; wx + winW < bx + bw - marginX; wx += spacingX) {
          // Deterministic lit/unlit using position hash
          const hash = ((wx * 3 + wy * 7 + bx) % 17);

          // Window recess
          g.fillStyle(0x000000, 0.2);
          g.fillRect(wx - 1, wy - 1, winW + 2, winH + 2);

          if (hash < 3) {
            // Warm lit window (yellow/orange)
            const warmth = hash === 0 ? 0x886633 : hash === 1 ? 0x7a6030 : 0x6a5528;
            g.fillStyle(warmth, 0.7);
            g.fillRect(wx, wy, winW, winH);
            // Half-drawn blind
            if (hash === 1) {
              g.fillStyle(0x554422, 0.35);
              g.fillRect(wx, wy, winW, winH / 2);
            }
          } else if (hash < 5) {
            // Bluish reflected sky
            g.fillStyle(0x1a2a44, 0.8);
            g.fillRect(wx, wy, winW, winH);
          } else {
            // Dark window
            g.fillStyle(0x0a0a18, 0.9);
            g.fillRect(wx, wy, winW, winH);
          }

          // Window sill
          g.fillStyle(corniceColor, 0.5);
          g.fillRect(wx - 1, wy + winH, winW + 2, 2);
          // Center mullion
          g.fillStyle(0x000000, 0.15);
          g.fillRect(wx + Math.floor(winW / 2), wy, 1, winH);

          // Occasional window AC unit
          if (hash % 13 === 5 && wy + winH + 8 < by + bh) {
            g.fillStyle(0x4a4a4a, 0.7);
            g.fillRect(wx, wy + winH + 2, winW, 5);
            g.fillStyle(0x3a3a3a, 0.5);
            g.fillRect(wx + 1, wy + winH + 3, winW - 2, 1);
          }
        }
        floorIdx++;
      }

      // ── Rooftop details ──
      if (b.roofDetails) {
        for (const d of b.roofDetails) {
          const dx = bx + (d.offsetX || 0);
          if (d.type === 'ac') {
            // AC / HVAC unit box
            g.fillStyle(0x2a2a48, 1);
            g.fillRect(dx, by - 10, 22, 10);
            g.fillStyle(0x333355, 0.8);
            g.fillRect(dx + 3, by - 8, 16, 2);
            g.fillRect(dx + 3, by - 4, 16, 2);
          } else if (d.type === 'tank') {
            // Water tank on legs
            g.fillStyle(0x252545, 1);
            g.fillRect(dx + 2, by - 8, 3, 8);
            g.fillRect(dx + 17, by - 8, 3, 8);
            g.fillRect(dx, by - 22, 22, 14);
            g.fillStyle(0x333358, 0.6);
            g.fillRect(dx + 2, by - 20, 18, 2);
          } else if (d.type === 'antenna') {
            // Thin antenna mast with blinking red light
            g.lineStyle(1.5, 0x3a3a58, 0.8);
            g.beginPath();
            g.moveTo(dx + 2, by);
            g.lineTo(dx + 2, by - 30);
            g.strokePath();
            g.fillStyle(0xff3300, 0.6);
            g.fillCircle(dx + 2, by - 30, 2);
          } else if (d.type === 'dish') {
            // Satellite dish
            g.lineStyle(1, 0x3a3a58, 0.7);
            g.fillStyle(0x2a2a48, 0.8);
            g.fillRect(dx + 5, by - 4, 2, 4);
            g.beginPath();
            g.arc(dx + 6, by - 10, 7, -0.4, Math.PI + 0.4, false);
            g.strokePath();
          } else if (d.type === 'fire_escape') {
            // Metal fire escape with platforms and ladders
            const feX = dx;
            const feW = d.width || 18;
            g.lineStyle(1, 0x2a2a48, 0.8);
            for (let fy = by + 30; fy < by + bh - 20; fy += 36) {
              // Platform
              g.fillStyle(0x222244, 0.7);
              g.fillRect(feX, fy, feW, 2);
              // Railing
              g.beginPath();
              g.moveTo(feX + feW, fy);
              g.lineTo(feX + feW, fy - 10);
              g.strokePath();
              g.beginPath();
              g.moveTo(feX, fy);
              g.lineTo(feX, fy - 10);
              g.strokePath();
              // Ladder rungs
              for (let ly = fy + 6; ly < fy + 34 && ly < by + bh - 20; ly += 7) {
                g.fillStyle(0x2a2a48, 0.5);
                g.fillRect(feX + 3, ly, feW - 6, 1);
              }
            }
          } else if (d.type === 'neon_sign') {
            // Small neon sign on building front
            const signW = d.width || 30;
            const signH = 10;
            const signY = by + (d.offsetY || 50);
            // Dark backing
            g.fillStyle(0x111122, 0.9);
            g.fillRect(dx, signY, signW, signH);
            // Neon glow (pinkish or cyan)
            const neonColor = d.neonColor || 0xff2266;
            g.fillStyle(neonColor, 0.15);
            g.fillRect(dx - 4, signY - 3, signW + 8, signH + 6);
            g.fillStyle(neonColor, 0.4);
            g.fillRect(dx + 2, signY + 2, signW - 4, signH - 4);
            // Text-like bars
            g.fillStyle(neonColor, 0.7);
            g.fillRect(dx + 4, signY + 3, 6, 2);
            g.fillRect(dx + 12, signY + 3, 4, 2);
            g.fillRect(dx + 18, signY + 5, 5, 2);
          } else if (d.type === 'awning') {
            // Store awning/canopy
            const awnW = d.width || 30;
            const awnH = 8;
            const awnY = by + (d.offsetY || 60);
            g.fillStyle(d.color || 0x553322, 0.8);
            g.fillTriangle(dx, awnY, dx + awnW, awnY, dx + awnW / 2, awnY + awnH);
            g.fillRect(dx, awnY - 1, awnW, 2);
          } else if (d.type === 'pipes') {
            // Exposed pipes running down the building side
            const pipeX = dx;
            const pipeH = d.height || (bh - 20);
            const pipeW = d.width || 20;
            // Vertical pipes
            g.lineStyle(2, 0x303050, 0.7);
            g.beginPath();
            g.moveTo(pipeX + 3, by + 6);
            g.lineTo(pipeX + 3, by + pipeH);
            g.strokePath();
            g.lineStyle(1.5, 0x2a2a44, 0.6);
            g.beginPath();
            g.moveTo(pipeX + pipeW - 4, by + 10);
            g.lineTo(pipeX + pipeW - 4, by + pipeH - 10);
            g.strokePath();
            // Horizontal connector
            g.lineStyle(1.5, 0x303050, 0.5);
            g.beginPath();
            g.moveTo(pipeX + 3, by + pipeH * 0.4);
            g.lineTo(pipeX + pipeW - 4, by + pipeH * 0.4);
            g.strokePath();
            // Pipe joints (small circles)
            g.fillStyle(0x3a3a58, 0.7);
            g.fillCircle(pipeX + 3, by + 6, 2);
            g.fillCircle(pipeX + 3, by + pipeH, 2);
            g.fillCircle(pipeX + pipeW - 4, by + 10, 1.5);
          }
        }
      }
    }
  }

  /** Draw decorative lampposts at positions specified in level data. */
  _drawLampposts(data) {
    if (!data.lampposts?.length) return;

    for (const lp of data.lampposts) {
      // Lamppost sprite — sits at ground level, so origin-bottom
      const post = this.add.image(lp.x, lp.y, 'lamppost');
      post.setOrigin(0.5, 1); // origin at bottom-center
      post.setDepth(-2);      // behind gameplay, in front of midground

      // Glow overlay — positioned under the lamp head
      const glow = this.add.image(lp.x + 4, lp.y - 80, 'lamppost_glow');
      glow.setOrigin(0.5, 0);
      glow.setDepth(-2);
      glow.setAlpha(0.6);
      glow.setScale(1.5, 2.0); // stretch the cone downward

      // Subtle pulsing glow animation
      this.tweens.add({
        targets: glow,
        alpha: { from: 0.5, to: 0.7 },
        duration: 1500 + ((lp.x * 7) % 800),
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
      });
    }
  }

  /**
   * Draw atmospheric environmental effects — only puddles and steam vents.
   * These are subtle, non-obstructive and add ambiance without clutter.
   */
  _drawAtmosphericEffects(data) {
    if (!data.decorations?.length) return;

    const g = this.add.graphics();
    g.setDepth(-1);

    for (const d of data.decorations) {
      const dx = d.x;
      const dy = d.y;
      if (d.type === 'puddle') {
        // Dark reflective puddle on ground
        g.fillStyle(0x1a1a2e, 0.6);
        g.fillEllipse(dx, dy, d.width || 30, 4);
        g.fillStyle(0x2a2a44, 0.3);
        g.fillEllipse(dx, dy, (d.width || 30) * 0.6, 2);
      } else if (d.type === 'steam_vent') {
        // Steam/smoke rising effect drawn as stacked transparent circles
        g.fillStyle(0x888899, 0.05);
        for (let i = 0; i < 5; i++) {
          const vy = dy - 8 - i * 12;
          const vr = 4 + i * 3;
          g.fillCircle(dx + ((i * 3) % 5) - 2, vy, vr);
        }
        // Vent grate on ground
        g.fillStyle(0x333333, 0.8);
        g.fillRect(dx - 8, dy - 2, 16, 3);
        g.lineStyle(0.5, 0x444444, 0.5);
        for (let lx = dx - 6; lx <= dx + 6; lx += 3) {
          g.beginPath();
          g.moveTo(lx, dy - 2);
          g.lineTo(lx, dy + 1);
          g.strokePath();
        }
      }
      // All other decoration types (barrel, trashcan, crate_stack, chain_fence)
      // are intentionally removed — platforms now USE styled textures instead.
    }
  }

  // ═══════════════════════════════════════════════════════════════
  //  TUTORIAL POPUP SYSTEM
  // ═══════════════════════════════════════════════════════════════

  /** Show a non-blocking tutorial hint in the top-left corner. */
  _showTutorial(data) {
    this._dismissTutorial();
    music.playRadioBeep();

    // On mobile, swap keyboard references for touch-control labels
    const lines = isMobile()
      ? data.lines.map(line => line
          .replace(/arrow keys/gi, 'the D-pad')
          .replace(/Press\s+SPACE\s+or\s+UP/gi, 'Tap ▲')
          .replace(/Press\s+D\b/gi, 'Tap ⚡')
          .replace(/Press\s+'D'/gi, "Tap ⚡")
          .replace(/Press\s+F\b/gi, 'Tap 🔧')
          .replace(/Press\s+ENTER/gi, 'Tap the screen')
        )
      : data.lines;

    const portraitKey = data.portraitKey;
    const hasPortrait = !!portraitKey && this.textures.exists(portraitKey);
    const speakerName = data.speakerName || 'MENTOR';

    // Top-left position, compact box
    const margin = 12;
    const lineH = 20;
    const padding = 14;
    const titleH = 28;
    const portraitTarget = 64;
    let portraitW = 0;
    let portraitH = 0;
    let portraitScale = 0;
    if (hasPortrait) {
      const src = this.textures.get(portraitKey).getSourceImage();
      const srcW = src?.width || portraitTarget;
      const srcH = src?.height || portraitTarget;
      portraitScale = Math.min(portraitTarget / srcW, portraitTarget / srcH);
      portraitW = Math.round(srcW * portraitScale);
      portraitH = Math.round(srcH * portraitScale);
    }
    const portraitGap = hasPortrait ? 10 : 0;

    const boxW = hasPortrait ? 420 : 340;
    const contentH = titleH + padding + lines.length * lineH + padding;
    const boxH = Math.max(contentH, titleH + padding + portraitH + padding);
    const boxX = margin;
    const boxY = margin;

    const contentX = boxX + padding + (hasPortrait ? (portraitW + portraitGap) : 0);

    // Panel background
    const panel = this.add.graphics().setScrollFactor(0).setDepth(501);
    // Outer border glow
    panel.fillStyle(0x00aaff, 0.2);
    panel.fillRoundedRect(boxX - 2, boxY - 2, boxW + 4, boxH + 4, 8);
    // Panel body
    panel.fillStyle(0x0a0a1e, 0.88);
    panel.fillRoundedRect(boxX, boxY, boxW, boxH, 6);
    // Top accent bar
    panel.fillStyle(0x00aaff, 0.7);
    panel.fillRect(boxX + 12, boxY + 4, boxW - 24, 2);

    // Optional portrait panel
    let portrait = null;
    if (hasPortrait) {
      const px = boxX + padding;
      const py = boxY + titleH + padding;

      // Portrait backing
      panel.fillStyle(0x000000, 0.25);
      panel.fillRoundedRect(px - 6, py - 6, portraitW + 12, portraitH + 12, 6);
      panel.fillStyle(0x00aaff, 0.25);
      panel.fillRoundedRect(px - 4, py - 4, portraitW + 8, portraitH + 8, 6);

      portrait = this.add.image(px, py, portraitKey)
        .setOrigin(0, 0)
        .setScrollFactor(0)
        .setDepth(502)
        .setScale(portraitScale);
      // Keep it crisp
      if (portrait.setPipeline) {
        // no-op; Phaser will keep pixelArt crisp via game config
      }
    }

    // Title text
    const title = this.add.text(contentX, boxY + 12, data.title, {
      fontSize: '16px',
      fontFamily: 'monospace',
      color: '#44ddff',
      fontStyle: 'bold',
    }).setOrigin(0, 0).setScrollFactor(0).setDepth(502);

    // Radio label (top-right)
    let radioLabel = null;
    if (hasPortrait) {
      radioLabel = this.add.text(boxX + boxW - padding, boxY + 14, `RADIO: ${speakerName}`.toUpperCase(), {
        fontSize: '11px',
        fontFamily: 'monospace',
        color: '#44ddff',
      }).setOrigin(1, 0).setScrollFactor(0).setDepth(502);
    }

    // Body lines
    const bodyTexts = [];
    const bodyStartY = boxY + titleH + padding;
    for (let i = 0; i < lines.length; i++) {
      const t = this.add.text(contentX, bodyStartY + i * lineH, lines[i], {
        fontSize: '13px',
        fontFamily: 'monospace',
        color: '#ccccdd',
      }).setOrigin(0, 0).setScrollFactor(0).setDepth(502);
      bodyTexts.push(t);
    }

    // Store references for cleanup
    this._activeTutorial = {
      _tutId: data.id, panel, title, radioLabel, portrait, bodyTexts,
    };
  }

  /** Dismiss the active tutorial hint. */
  _dismissTutorial() {
    if (!this._activeTutorial) return;
    const { panel, title, radioLabel, portrait, bodyTexts } = this._activeTutorial;

    if (panel) panel.destroy();
    if (title) title.destroy();
    if (radioLabel) radioLabel.destroy();
    if (portrait) portrait.destroy();
    if (bodyTexts) bodyTexts.forEach(t => t.destroy());

    this._activeTutorial = null;
  }

  _handleAction(player) {
    // Try to activate nearby inactive secondary generator (press E)
    // This works regardless of cord state — generators don't need the cord
    for (const [id, gen] of Object.entries(this._generators)) {
      if (!gen.isPrimary && !gen.isActivated) {
        const dist = Phaser.Math.Distance.Between(gen.x, gen.y, player.x, player.y);
        if (dist <= 50) {
          this._generatorSystem.activateGenerator(id);
          this._playSpark(gen.x, gen.y);
          return;
        }
      }
    }

    // If already connected, only allow disconnecting at the same terminal
    if (player.cordConnectedTerminal) {
      const ct = player.cordConnectedTerminal;
      if (ct.isPlayerInRange(player)) {
        player.disconnectCord();
        music.playElectricZap();
        this.events.emit('cord-changed', null);
      }
      // Cord is in use — must unplug first before connecting elsewhere
      return;
    }

    // Try to connect to nearest in-range terminal
    let best = null;
    let bestDist = Infinity;
    for (const t of this.terminals) {
      if (t.isPlayerInRange(player) && this.extensionCord.isInRange(t)) {
        const d = Phaser.Math.Distance.Between(t.x, t.y, player.x, player.y);
        if (d < bestDist) { bestDist = d; best = t; }
      }
    }
    if (best) {
      player.connectTo(best);
      music.playElectricZap();
      this.events.emit('cord-changed', best);
      return;
    }

    // No terminal nearby and cord not connected — attack with the plug!
    if (!player.cordConnectedTerminal) {
      player.attack();
    }
  }

  /** Handle the attack strike moment — check for nearby enemies and kill them. */
  _handleAttackStrike(player) {
    const ATTACK_RANGE = 100; // pixels in front of the player
    const ATTACK_HEIGHT = 50; // vertical tolerance

    // Hand position (matches ExtensionCord plug offset)
    const handOffsetX = player.facingRight ? 18 : -18;
    const handX = player.x + handOffsetX;
    const handY = player.y - 8;

    for (const enemy of this._enemies) {
      if (!enemy.active || !enemy.isDangerous) continue;

      // Check if enemy is in front of the player and within range
      const dx = enemy.x - player.x;
      const dy = Math.abs(enemy.y - player.y);
      const inFront = player.facingRight ? (dx > 0 && dx < ATTACK_RANGE) : (dx < 0 && dx > -ATTACK_RANGE);

      if (inFront && dy < ATTACK_HEIGHT) {
        // Electric blast sound
        music.playElectricBlast();
        // Electric spark arc from hand to enemy
        this._playSparkArc(handX, handY, enemy.x, enemy.y);
        // Spark burst at the enemy position
        this._playSpark(enemy.x, enemy.y);
        enemy.kill();
      }
    }
  }

  /**
   * Play an electric spark arc from the player's hand toward a target.
   * Multiple sparks shoot in a directed stream with slight scatter.
   */
  _playSparkArc(fromX, fromY, toX, toY) {
    const g = this.add.graphics();
    g.setDepth(55);

    const sparkColors = [0x00ccff, 0x44eeff, 0xffffff, 0xaaddff, 0x88ffff, 0xffff00, 0xffaa00];
    const dx = toX - fromX;
    const dy = toY - fromY;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const baseAngle = Math.atan2(dy, dx);

    const sparks = [];
    const count = 18 + Math.floor(Math.random() * 8);

    for (let i = 0; i < count; i++) {
      // Spread angle slightly around the direction to target
      const angle = baseAngle + (Math.random() - 0.5) * 0.7;
      const speed = dist * 3 + Math.random() * 80;
      // Stagger start positions slightly along the hand
      const startOffX = (Math.random() - 0.5) * 8;
      const startOffY = (Math.random() - 0.5) * 8;
      sparks.push({
        x: fromX + startOffX,
        y: fromY + startOffY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 1.0,
        size: 1.5 + Math.random() * 3.5,
        color: sparkColors[Math.floor(Math.random() * sparkColors.length)],
      });
    }

    // Also draw a few jagged lightning bolt segments
    const boltSegments = [];
    const numBolts = 3 + Math.floor(Math.random() * 2);
    for (let b = 0; b < numBolts; b++) {
      const segs = [];
      let px = fromX, py = fromY;
      const steps = 4 + Math.floor(Math.random() * 3);
      for (let s = 0; s <= steps; s++) {
        const t = s / steps;
        const targetX = fromX + dx * t + (Math.random() - 0.5) * 16;
        const targetY = fromY + dy * t + (Math.random() - 0.5) * 12;
        segs.push({ x: targetX, y: targetY });
      }
      // Ensure last point hits the target
      segs[segs.length - 1] = { x: toX, y: toY };
      boltSegments.push(segs);
    }

    const duration = 250;
    const startTime = this.time.now;

    this.time.addEvent({
      delay: 16,
      repeat: Math.ceil(duration / 16),
      callback: () => {
        g.clear();
        const elapsed = this.time.now - startTime;
        const t = Math.min(elapsed / duration, 1);

        // Draw lightning bolts (fade out fast)
        if (t < 0.5) {
          const boltAlpha = (1 - t / 0.5) * 0.9;
          for (const segs of boltSegments) {
            // Outer glow
            g.lineStyle(4, 0x44aaff, boltAlpha * 0.3);
            g.beginPath();
            g.moveTo(segs[0].x, segs[0].y);
            for (let s = 1; s < segs.length; s++) {
              g.lineTo(segs[s].x, segs[s].y);
            }
            g.strokePath();
            g.lineStyle(2, 0x88eeff, boltAlpha);
            g.beginPath();
            g.moveTo(segs[0].x, segs[0].y);
            for (let s = 1; s < segs.length; s++) {
              g.lineTo(segs[s].x, segs[s].y);
            }
            g.strokePath();
            // Brighter core
            g.lineStyle(0.5, 0xffffff, boltAlpha);
            g.beginPath();
            g.moveTo(segs[0].x, segs[0].y);
            for (let s = 1; s < segs.length; s++) {
              g.lineTo(segs[s].x, segs[s].y);
            }
            g.strokePath();
          }
        }

        // Draw spark particles
        for (const s of sparks) {
          s.x += s.vx * 0.016;
          s.y += s.vy * 0.016;
          s.vy += 30 * 0.016; // light gravity
          s.vx *= 0.96; // drag
          s.vy *= 0.96;
          s.life = 1 - t;

          if (s.life > 0) {
            // Outer glow
            g.fillStyle(s.color, s.life * 0.25);
            g.fillCircle(s.x, s.y, s.size * s.life * 3);
            // Core
            g.fillStyle(s.color, s.life * 0.95);
            g.fillCircle(s.x, s.y, s.size * s.life);
            // Hot center
            g.fillStyle(0xffffff, s.life * 0.5);
            g.fillCircle(s.x, s.y, s.size * s.life * 0.5);
          }
        }

        // Hand flash at origin — bigger, brighter
        if (t < 0.25) {
          const flashAlpha = (1 - t / 0.25) * 0.7;
          g.fillStyle(0xffffff, flashAlpha * 0.4);
          g.fillCircle(fromX, fromY, 18 * (1 - t * 2.5));
          g.fillStyle(0x88eeff, flashAlpha);
          g.fillCircle(fromX, fromY, 10 * (1 - t * 2.5));
          g.fillStyle(0xffffff, flashAlpha * 0.8);
          g.fillCircle(fromX, fromY, 4 * (1 - t * 2.5));
        }

        if (t >= 1) {
          g.destroy();
        }
      },
    });
  }

  /** Play a spark particle burst at the given position. */
  _playSpark(x, y) {
    const g = this.add.graphics();
    g.setDepth(50);

    const sparkColors = [0xffff00, 0xffaa00, 0xffffff, 0xff8800, 0x00ccff];
    const sparks = [];

    // Create spark particles
    for (let i = 0; i < 12; i++) {
      const angle = (Math.PI * 2 * i) / 12 + (Math.random() - 0.5) * 0.5;
      const speed = 40 + Math.random() * 80;
      sparks.push({
        x: x,
        y: y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 1.0,
        size: 1 + Math.random() * 2.5,
        color: sparkColors[Math.floor(Math.random() * sparkColors.length)],
      });
    }

    // Animate over ~400ms
    const duration = 400;
    const startTime = this.time.now;

    const sparkTimer = this.time.addEvent({
      delay: 16,
      repeat: Math.ceil(duration / 16),
      callback: () => {
        g.clear();
        const elapsed = this.time.now - startTime;
        const t = Math.min(elapsed / duration, 1);

        for (const s of sparks) {
          s.x += s.vx * 0.016;
          s.y += s.vy * 0.016;
          s.vy += 80 * 0.016; // gravity on sparks
          s.life = 1 - t;

          if (s.life > 0) {
            g.fillStyle(s.color, s.life);
            g.fillCircle(s.x, s.y, s.size * s.life);
            // Glow around bright sparks
            g.fillStyle(0xffffff, s.life * 0.3);
            g.fillCircle(s.x, s.y, s.size * s.life * 2);
          }
        }

        // Central flash (fades quickly)
        if (t < 0.3) {
          const flashAlpha = (1 - t / 0.3) * 0.6;
          g.fillStyle(0xffffff, flashAlpha);
          g.fillCircle(x, y, 15 * (1 - t));
          g.fillStyle(0xffff00, flashAlpha * 0.5);
          g.fillCircle(x, y, 20 * (1 - t));
        }

        if (t >= 1) {
          g.destroy();
        }
      },
    });
  }

  _handleInteract(player) {
    if (player.grabbedBlock) {
      player.releaseBlock();
      return;
    }
    // Try to grab any nearby block
    for (const block of this._pushBlocks) {
      if (block.isPlayerInRange(player)) {
        player.grabBlock(block);
        return;
      }
    }
  }

  _handleDoorClosing(door) {
    for (const block of this._pushBlocks) {
      if (block.isUnderDoor(door)) {
        // Door bottom must be high enough for player to pass
        // Player collision body (54px) - Block height (48px) = 6px minimum clearance
        const CLEARANCE = 6;
        const blockTop = block.y - PUSH_BLOCK.SIZE / 2;
        const doorBottom = blockTop - CLEARANCE;
        const propY = doorBottom - (door._h || DOOR.HEIGHT) / 2;
        if (door.y >= propY) {
          door.propAt(propY);
        }
      }
    }
  }

  _handleTriggerZone({ triggerId, generatorId }) {
    if (this._generatorSystem) {
      this._generatorSystem.activateGenerator(generatorId);
    }
  }

  _onReachGoal() {
    if (this._levelComplete) return;
    this._levelComplete = true;

    // Freeze player movement but keep physics for animation
    this.player.setVelocity(0, 0);
    this.player.body.setAllowGravity(false);
    this.player._isRepairing = true; // block normal update movement

    // Face the goal zone (generator is usually to the right)
    if (this.goalZone) {
      const faceRight = this.goalZone.x >= this.player.x;
      this.player.setFlipX(!faceRight);
      this.player.facingRight = faceRight;
    }

    // Stop level music
    music.stop();

    // ── Mentor rescue path (Level 06 ending) ──
    if (this._mentorData) {
      this._onRescueMentor();
      return;
    }

    // --- Repair cutscene: 3 wrench strikes with clangs & smoke ---
    const STRIKES = 3;
    const STRIKE_DELAY = 450; // ms between strikes
    let strikeCount = 0;

    const doStrike = () => {
      strikeCount++;

      // Play attack animation
      this.player._isAttacking = true;
      this.player.play('attack', true);
      this.time.delayedCall(80, () => { this.player._isAttacking = false; });

      // Clang sound
      music.playMetalClang();

      // Smoke puff particles near the generator
      this._spawnSmokePuff(this.goalZone.x, this.goalZone.y);

      if (strikeCount < STRIKES) {
        this.time.delayedCall(STRIKE_DELAY, doStrike);
      } else {
        // Final strike done — short pause then victory
        this.time.delayedCall(400, () => {
          this._showVictory();
        });
      }
    };

    // Small pause before first strike
    this.time.delayedCall(300, doStrike);
  }

  // ═══════════════════════════════════════════════════════════════
  //  MENTOR RESCUE — Level 06 ending sequence
  // ═══════════════════════════════════════════════════════════════

  /**
   * Called when the player reaches Voltage Jack in Level 06.
   * Shows a dialogue box, then "To Be Continued" title card.
   */
  _onRescueMentor() {
    // Play rescue SFX (joyful chime)
    music.playRescueChime();

    // Pause physics so everything freezes during the cutscene
    this.physics.pause();

    // Stop the mentor bounce tween and settle him in place
    if (this._mentorSprite) {
      this.tweens.killTweensOf(this._mentorSprite);
    }

    // Show dialogue box after a short beat
    this.time.delayedCall(600, () => {
      this._showMentorDialogue(this._mentorData.lines, () => {
        // After dialogue is dismissed, show "To Be Continued"
        this._showToBeContinued();
      });
    });
  }

  /**
   * Display a dialogue box with Voltage Jack's portrait and multiple lines.
   * Player presses ENTER/SPACE to advance through lines, then calls onComplete.
   */
  _showMentorDialogue(lines, onComplete) {
    const portraitKey = this.textures.exists('mentor_face') ? 'mentor_face' : null;
    const hasPortrait = !!portraitKey;
    const speakerName = 'Voltage Jack';

    const margin = 12;
    const lineH = 22;
    const padding = 16;
    const titleH = 30;
    const portraitTarget = 64;
    let portraitW = 0, portraitH = 0, portraitScale = 1;
    if (hasPortrait) {
      const src = this.textures.get(portraitKey).getSourceImage();
      const srcW = src?.width || portraitTarget;
      const srcH = src?.height || portraitTarget;
      portraitScale = Math.min(portraitTarget / srcW, portraitTarget / srcH);
      portraitW = Math.round(srcW * portraitScale);
      portraitH = Math.round(srcH * portraitScale);
    }
    const portraitGap = hasPortrait ? 10 : 0;

    const boxW = 460;
    const visibleLines = lines.length;
    const contentH = titleH + padding + visibleLines * lineH + padding + 20;
    const boxH = Math.max(contentH, titleH + padding + portraitH + padding);
    const boxX = margin;
    const boxY = margin;
    const contentX = boxX + padding + (hasPortrait ? (portraitW + portraitGap) : 0);

    // Panel background
    const panel = this.add.graphics().setScrollFactor(0).setDepth(501);
    panel.fillStyle(0xffaa00, 0.25);
    panel.fillRoundedRect(boxX - 2, boxY - 2, boxW + 4, boxH + 4, 8);
    panel.fillStyle(0x0a0a1e, 0.92);
    panel.fillRoundedRect(boxX, boxY, boxW, boxH, 6);
    panel.fillStyle(0xffaa00, 0.7);
    panel.fillRect(boxX + 12, boxY + 4, boxW - 24, 2);

    // Portrait
    let portrait = null;
    if (hasPortrait) {
      const px = boxX + padding;
      const py = boxY + titleH + padding;
      panel.fillStyle(0x000000, 0.25);
      panel.fillRoundedRect(px - 6, py - 6, portraitW + 12, portraitH + 12, 6);
      panel.fillStyle(0xffaa00, 0.25);
      panel.fillRoundedRect(px - 4, py - 4, portraitW + 8, portraitH + 8, 6);
      portrait = this.add.image(px, py, portraitKey)
        .setOrigin(0, 0).setScrollFactor(0).setDepth(502).setScale(portraitScale);
    }

    // Title
    const title = this.add.text(contentX, boxY + 12, speakerName, {
      fontSize: '16px', fontFamily: 'monospace', color: '#ffcc44', fontStyle: 'bold',
    }).setOrigin(0, 0).setScrollFactor(0).setDepth(502);

    // Body lines — all visible
    const bodyTexts = [];
    const bodyStartY = boxY + titleH + padding;
    for (let i = 0; i < lines.length; i++) {
      const t = this.add.text(contentX, bodyStartY + i * lineH, lines[i], {
        fontSize: '13px', fontFamily: 'monospace', color: '#ccccdd',
      }).setOrigin(0, 0).setScrollFactor(0).setDepth(502);
      bodyTexts.push(t);
    }

    // "Press ENTER" hint
    const hintLabel = isMobile() ? '[ Tap to continue ]' : '[ Press ENTER ]';
    const hint = this.add.text(boxX + boxW / 2, boxY + boxH - 10, hintLabel, {
      fontSize: '11px', fontFamily: 'monospace', color: '#888888',
    }).setOrigin(0.5, 1).setScrollFactor(0).setDepth(502);

    // Blink the hint
    this.tweens.add({
      targets: hint, alpha: 0.3, duration: 500, yoyo: true, repeat: -1,
    });

    // Wait for ENTER or tap to dismiss
    const dismiss = () => {
      panel.destroy();
      title.destroy();
      if (portrait) portrait.destroy();
      bodyTexts.forEach(t => t.destroy());
      hint.destroy();
      if (onComplete) onComplete();
    };

    this.input.keyboard.once('keydown-ENTER', dismiss);
    this.input.keyboard.once('keydown-SPACE', dismiss);
    this.input.once('pointerdown', dismiss);
  }

  /**
   * Show the "To Be Continued" title card with music.
   */
  _showToBeContinued() {
    // Dim the screen
    const cx = this.cameras.main.scrollX + GAME_WIDTH / 2;
    const cy = this.cameras.main.scrollY + GAME_HEIGHT / 2;

    const dimOverlay = this.add.rectangle(cx, cy, GAME_WIDTH + 100, GAME_HEIGHT + 100, 0x000000, 0)
      .setScrollFactor(0).setDepth(600);
    this.tweens.add({
      targets: dimOverlay, fillAlpha: 0.6, duration: 1200, ease: 'Quad.easeIn',
    });

    // Play the ending song
    this.time.delayedCall(500, () => {
      music.playEnding();
    });

    // Big yellow "To Be Continued" text — fades in
    const tbcText = this.add.text(cx, cy, 'To Be Continued', {
      fontSize: '48px',
      fontFamily: 'monospace',
      fontStyle: 'bold',
      color: '#ffdd00',
      stroke: '#000000',
      strokeThickness: 4,
      align: 'center',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(601).setAlpha(0);

    this.tweens.add({
      targets: tbcText,
      alpha: 1,
      duration: 2000,
      delay: 800,
      ease: 'Quad.easeIn',
    });

    // Subtle pulse on the text once visible
    this.time.delayedCall(3000, () => {
      this.tweens.add({
        targets: tbcText,
        scaleX: { from: 1, to: 1.03 },
        scaleY: { from: 1, to: 1.03 },
        duration: 1500,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
      });
    });
  }

  /** Spawn a burst of smoke puff circles that float upward and fade. */
  _spawnSmokePuff(x, y) {
    const count = 6 + Math.floor(Math.random() * 4);
    for (let i = 0; i < count; i++) {
      const px = x + (Math.random() - 0.5) * 24;
      const py = y - 5 + (Math.random() - 0.5) * 10;
      const size = 3 + Math.random() * 5;
      const gray = 0.4 + Math.random() * 0.3;
      const color = Phaser.Display.Color.GetColor(
        Math.floor(gray * 255), Math.floor(gray * 255), Math.floor(gray * 255)
      );

      const puff = this.add.circle(px, py, size, color, 0.7).setDepth(150);

      // Float up and fade out
      this.tweens.add({
        targets: puff,
        y: py - 20 - Math.random() * 20,
        x: px + (Math.random() - 0.5) * 16,
        alpha: 0,
        scaleX: 0.3,
        scaleY: 0.3,
        duration: 500 + Math.random() * 400,
        ease: 'Quad.easeOut',
        onComplete: () => puff.destroy(),
      });
    }
  }

  /** Show victory message and play victory music. */
  _showVictory() {
    this.physics.pause();

    // --- Floodlights power-up sequence ---
    const POWER_UP_DURATION = 1500; // ms
    music.playPowerUp(POWER_UP_DURATION / 1000);
    this._spawnFloodlights(POWER_UP_DURATION);
    this._illuminateWindows(POWER_UP_DURATION);

    // After floodlights finish powering up, play victory music & show message
    this.time.delayedCall(POWER_UP_DURATION + 200, () => {
      music.playVictory();

      // Show victory popup (e.g. Voltage Jack radio message) if defined
      const popup = this._levelData.victoryPopup;
      if (popup) {
        // Wait for the victory fanfare to finish (~2s) before showing the popup
        this.time.delayedCall(2500, () => {
          this._showTutorial(popup);
          // Show "Press ENTER to continue" prompt below the popup
          const cx = this.cameras.main.scrollX + GAME_WIDTH / 2;
          const promptY = this.cameras.main.scrollY + GAME_HEIGHT - 40;
          const promptLabel = isMobile() ? 'Tap to continue' : 'Press ENTER to continue';
          const promptText = this.add.text(cx, promptY, promptLabel, {
            fontSize: '18px', fontFamily: 'monospace', color: '#44ddff', align: 'center',
          }).setOrigin(0.5).setDepth(502).setScrollFactor(0);

          const advanceFromPopup = () => {
            this._dismissTutorial();
            promptText.destroy();
            this._showLevelComplete();
          };
          this.input.keyboard.once('keydown-ENTER', advanceFromPopup);
          this.input.once('pointerdown', advanceFromPopup);
        });
      } else {
        this._showLevelComplete();
      }
    });
  }

  /** Show the "Level Complete" / "You Win" text and wire up ENTER/tap to advance. */
  _showLevelComplete() {
    const cx = this.cameras.main.scrollX + GAME_WIDTH / 2;
    const cy = this.cameras.main.scrollY + GAME_HEIGHT / 2;

    const next = this._levelData.nextLevel;
    const mobile = isMobile();
    const msg = next
      ? (mobile ? 'Level Complete!\nTap for next level' : 'Level Complete!\nPress ENTER for next level')
      : 'Generator Fixed!\nYou Win!';

    this.add.text(cx, cy, msg, {
      fontSize: '32px', fontFamily: 'monospace', color: '#0f0', align: 'center',
    }).setOrigin(0.5).setDepth(200);

    if (next) {
      const advance = () => {
        this.scene.stop(SCENES.UI);
        this.scene.restart({ levelId: next });
      };
      this.input.keyboard.once('keydown-ENTER', advance);
      this.input.once('pointerdown', advance);
    }
  }

  /**
   * Spawn floodlight beams that shine upward from the bottom of the map.
   * Each beam is a triangle that fades in during the power-up duration.
   * @param {number} duration - Fade-in duration in ms
   */
  _spawnFloodlights(duration) {
    const worldW = this._levelData.world.width;
    const worldH = this._levelData.world.height;
    const bottomY = worldH;       // bottom of the world
    const beamHeight = worldH;    // beams extend the full map height

    // Place 4-6 floodlights evenly across the map width
    const count = Math.max(4, Math.min(6, Math.floor(worldW / 250)));
    const spacing = worldW / (count + 1);

    // Warm amber / white light colors
    const colors = [0xffee88, 0xffffff, 0xffd866, 0xeeeeff, 0xffcc44, 0xfff0cc];

    for (let i = 0; i < count; i++) {
      const bx = spacing * (i + 1);
      const beamWidth = 30 + Math.random() * 20;  // width at bottom
      const spreadTop = 60 + Math.random() * 40;   // width at top (wider = more spread)

      const g = this.add.graphics().setDepth(100);
      g.setAlpha(0); // start invisible

      const color = colors[i % colors.length];

      // Draw the beam as a filled triangle (wide at bottom, narrowing upward,
      // but actually wider at top to simulate light spread)
      g.fillStyle(color, 0.12);
      g.beginPath();
      g.moveTo(bx - beamWidth / 2, bottomY);        // bottom-left
      g.lineTo(bx + beamWidth / 2, bottomY);        // bottom-right
      g.lineTo(bx + spreadTop / 2, bottomY - beamHeight); // top-right (spread)
      g.lineTo(bx - spreadTop / 2, bottomY - beamHeight); // top-left (spread)
      g.closePath();
      g.fillPath();

      // Inner brighter core beam
      g.fillStyle(color, 0.08);
      g.beginPath();
      g.moveTo(bx - beamWidth * 0.3, bottomY);
      g.lineTo(bx + beamWidth * 0.3, bottomY);
      g.lineTo(bx + spreadTop * 0.25, bottomY - beamHeight);
      g.lineTo(bx - spreadTop * 0.25, bottomY - beamHeight);
      g.closePath();
      g.fillPath();

      // Light source glow at the bottom
      g.fillStyle(color, 0.25);
      g.fillCircle(bx, bottomY - 4, 6);
      g.fillStyle(0xffffff, 0.15);
      g.fillCircle(bx, bottomY - 4, 3);

      // Fade in with a slight stagger per light
      const stagger = (i / count) * duration * 0.3;
      this.tweens.add({
        targets: g,
        alpha: 1,
        duration: duration - stagger,
        delay: stagger,
        ease: 'Quad.easeIn',
      });

      // Subtle sway/flicker once fully on
      this.time.delayedCall(duration + stagger, () => {
        this.tweens.add({
          targets: g,
          alpha: { from: 0.85, to: 1 },
          duration: 300 + Math.random() * 200,
          yoyo: true,
          repeat: -1,
          ease: 'Sine.easeInOut',
        });
      });
    }
  }

  /**
   * Illuminate windows on background buildings when level is completed.
   * Overlays warm-lit windows on top of the dark ones drawn during backdrop
   * and midground building creation, simulating power being restored.
   * @param {number} duration - Fade-in duration in ms (synced with floodlights)
   */
  _illuminateWindows(duration) {
    const worldW = this._levelData.world.width;
    const worldH = this._levelData.world.height;

    // ── City backdrop windows (depth -9, above backdrop at -10) ──
    const bgGlow = this.add.graphics();
    bgGlow.setDepth(-9);
    bgGlow.setScrollFactor(0.3, 0.3); // match backdrop parallax
    bgGlow.setAlpha(0);

    // Mirror _drawCityBackdrop() placement exactly so overlays always align.

    // Far buildings (same as _drawCityBackdrop far layer)
    const farBuildings = Math.floor(worldW / 40) + 6;
    for (let i = 0; i < farBuildings; i++) {
      const bx = i * 40 - 30 + ((i * 37) % 20);
      const bh = 60 + ((i * 73) % 140);
      const bw = 22 + ((i * 41) % 35);

      for (let wy = worldH - bh - 90; wy < worldH - 110; wy += 10) {
        for (let wx = bx + 3; wx < bx + bw - 3; wx += 6) {
          // Keep some windows dark for texture (deterministic)
          if (((wx * 5 + wy * 3 + i * 11) % 13) < 3) continue;
          const warmth = (((wx + wy + i) % 4) === 0) ? 0xffdd55 : 0xffcc33;
          bgGlow.fillStyle(warmth, 0.5);
          bgGlow.fillRect(wx, wy, 2, 3);
        }
      }
    }

    // Mid-distance buildings (same as _drawCityBackdrop mid layer)
    const midBuildings = Math.floor(worldW / 55) + 5;
    for (let i = 0; i < midBuildings; i++) {
      const bx = i * 55 + ((i * 43) % 25) - 15;
      const bh = 90 + ((i * 89) % 180);
      const bw = 35 + ((i * 51) % 45);

      for (let wy = worldH - bh - 70; wy < worldH - 90; wy += 12) {
        for (let wx = bx + 4; wx < bx + bw - 4; wx += 8) {
          const hash = (wx * 5 + wy * 3 + i) % 17;
          const wasLit = hash < 2;
          if (wasLit) continue; // already had a lit window
          if (((wx * 7 + wy * 2 + i * 3) % 19) < 3) continue; // keep some dark
          const warmth = (((wx + wy + i) % 3) === 0) ? 0xffdd44 : 0xeebb33;
          bgGlow.fillStyle(warmth, 0.55);
          bgGlow.fillRect(wx, wy, 3, 4);
        }
      }
    }

    // Foreground buildings (same as _drawCityBackdrop near layer)
    const nearBuildings = Math.floor(worldW / 60) + 5;
    for (let i = 0; i < nearBuildings; i++) {
      const bx = i * 60 + ((i * 53) % 30) - 20;
      const bh = 100 + ((i * 97) % 180);
      const bw = 40 + ((i * 61) % 50);

      for (let wy = worldH - bh - 50; wy < worldH - 70; wy += 14) {
        for (let wx = bx + 5; wx < bx + bw - 5; wx += 10) {
          const wasLit = ((wx * 3 + wy * 7) % 11) < 2;
          if (wasLit) continue;
          if (((wx * 7 + wy * 2 + i * 5) % 17) < 3) continue;
          const warmth = (((wx + wy + i) % 3) === 0) ? 0xffcc33 : 0xeebb22;
          bgGlow.fillStyle(warmth, 0.6);
          bgGlow.fillRect(wx, wy, 4, 5);
        }
      }
    }

    // ── Midground building windows (depth -4, above midground at -5) ──
    const midGlow = this.add.graphics();
    midGlow.setDepth(-4);
    midGlow.setAlpha(0);

    const midgroundBuildings = this._levelData.midgroundBuildings || [];
    for (const b of midgroundBuildings) {
      const bx = b.x;
      const by = b.y;
      const bw = b.width;
      const bh = b.height;
      // Match _drawMidgroundBuildings() window grid
      const winW = 9;
      const winH = 12;
      const spacingX = 20;
      const spacingY = 24;
      const marginX = 12;
      const marginY = 14;

      let floorIdx = 0;
      for (let wy = by + marginY; wy + winH < by + bh - 8; wy += spacingY) {
        if (floorIdx % 7 === 4) { floorIdx++; continue; }
        for (let wx = bx + marginX; wx + winW < bx + bw - marginX; wx += spacingX) {
          const hash = ((wx * 3 + wy * 7 + bx) % 17);

          // In _drawMidgroundBuildings(): hash < 3 warm-lit, hash < 5 bluish, else dark.
          if (hash < 5) continue;

          // Keep a small fraction dark even after power-up
          if (((wx * 11 + wy * 5 + bx) % 23) < 3) continue;

          const warmth = (hash % 4 === 0) ? 0xffdd44 : 0xeebb33;
          midGlow.fillStyle(warmth, 0.55);
          midGlow.fillRect(wx, wy, winW, winH);

          // Soft orange halo on some windows
          if (hash % 5 === 0) {
            midGlow.fillStyle(0xffaa22, 0.07);
            midGlow.fillRect(wx - 3, wy - 2, winW + 6, winH + 4);
          }
        }
        floorIdx++;
      }
    }

    // Fade in both overlays slightly after floodlights begin
    const delayOffset = duration * 0.2;
    for (const gfx of [bgGlow, midGlow]) {
      this.tweens.add({
        targets: gfx,
        alpha: 1,
        duration: duration - delayOffset,
        delay: delayOffset,
        ease: 'Quad.easeIn',
      });

      // Gentle pulse once fully on
      this.time.delayedCall(duration + delayOffset, () => {
        this.tweens.add({
          targets: gfx,
          alpha: { from: 0.9, to: 1 },
          duration: 800 + Math.random() * 400,
          yoyo: true,
          repeat: -1,
          ease: 'Sine.easeInOut',
        });
      });
    }
  }
}