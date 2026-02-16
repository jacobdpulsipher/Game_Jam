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
import { Elevator } from '../puzzles/Elevator.js';
import { Drawbridge } from '../puzzles/Drawbridge.js';
import { getLevelById, getFirstLevel, getNextLevel } from '../levels/LevelRegistry.js';
import { GeneratorSystem } from '../systems/GeneratorSystem.js';
import { music } from '../audio/ProceduralMusic.js';

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
    // Remove any lingering event handlers from a previous level (scene.restart)
    this.events.off('player-action', this._handleAction, this);
    this.events.off('player-interact', this._handleInteract, this);
    this.events.off('door-closing-tick', this._handleDoorClosing, this);
    this.events.off('trigger-zone-activated', this._handleTriggerZone, this);

    this.cameras.main.setBackgroundColor(data.bgColor || '#1a1a2e');
    this._levelComplete = false;

    // ── Dark City Backdrop ──
    this._drawCityBackdrop(data.world.width, data.world.height);

    // Lookup maps so terminals can reference doors/elevators by id
    this._elementsById = {};

    // Create GeneratorSystem
    this._generatorSystem = new GeneratorSystem(this);

    // ── Platforms ──
    this.platforms = this.physics.add.staticGroup();
    for (const p of data.platforms) {
      this.platforms.create(p.x, p.y, 'ground')
        .setDisplaySize(p.width, p.height).refreshBody();
    }

    // ── Generators ──
    this._generators = {};
    for (const g of data.generators) {
      const gen = new Generator(this, g.x, g.y, {
        isPrimary: g.isPrimary !== false,
        isActivated: g.isActivated,
        autoActivateIds: g.autoActivateIds || [],
      });
      gen.setLabel(g.label || 'G');
      gen.elementId = g.id;
      this._generators[g.id] = gen;
      this._elementsById[g.id] = gen;
      this._generatorSystem.registerGenerator(g.id, gen);
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

    // ── Cord Plug Kill Zone ── (invisible zone that follows the dangling plug)
    this._plugZone = this.add.zone(0, 0, 12, 12);
    this.physics.add.existing(this._plugZone, false); // dynamic so it can move
    this._plugZone.body.setAllowGravity(false);

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

      // Player overlaps enemy → die (if enemy is alive)
      this.physics.add.overlap(this.player, enemy, () => {
        if (enemy.isDangerous) this.player.die();
      }, null, this);

      // Plug zone overlaps enemy → kill enemy (only when cord is NOT connected)
      this.physics.add.overlap(this._plugZone, enemy, () => {
        if (enemy.isDangerous && !this.player.cordConnectedTerminal && !this.player._isDead) {
          enemy.kill();
        }
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

    // ── EVENT HANDLERS ──
    this.events.on('player-action', this._handleAction, this);
    this.events.on('player-interact', this._handleInteract, this);
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
      `${data.name}  |  E = cord  |  F = grab  |  WASD/Arrows = move  |  Space = jump`, {
        fontSize: '13px', fontFamily: 'monospace', color: '#888',
      }).setOrigin(0.5).setScrollFactor(0).setDepth(100);

    // ── Music ──
    music.init();
    music.playLevel();
  }

  // ═══════════════════════════════════════════════════════════════
  //  UPDATE
  // ═══════════════════════════════════════════════════════════════

  update(time, delta) {
    if (this.player) this.player.update();
    if (this.extensionCord) this.extensionCord.update(this.player);

    // Update enemies
    for (const enemy of this._enemies) {
      if (enemy.active) enemy.update();
    }

    // Update plug kill-zone position:
    // When cord is NOT connected, the plug dangles near the player.
    // When cord IS connected, move the zone off-screen (disabled).
    if (this._plugZone) {
      if (this.player && !this.player.cordConnectedTerminal && !this.player._isDead) {
        // Plug follows player — slightly in front, at waist height
        const offsetX = this.player.facingRight ? 20 : -20;
        this._plugZone.setPosition(this.player.x + offsetX, this.player.y + 10);
      } else {
        // Move off-screen when cord is in use or player is dead
        this._plugZone.setPosition(-999, -999);
      }
    }

    // Elevator rider logic — carry the player along with moving elevators
    for (const elev of this._elevators) {
      elev.trackMovement();
      if (elev.deltaY !== 0 && this.player && this.player.body.blocked.down) {
        // Check if player is standing on this elevator
        const px = this.player.x;
        const py = this.player.y + this.player.body.halfHeight;
        const ex = elev.x;
        const ey = elev.y - elev._h / 2;
        const onTop = Math.abs(px - ex) < elev._w / 2 + 4 &&
                       Math.abs(py - ey) < 8;
        if (onTop) {
          this.player.y += elev.deltaY;
        }
      }
    }

    // Sync push block top-platforms with their dynamic bodies
    for (const block of this._pushBlocks) {
      block.syncPosition();
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
    for (let i = 0; i < 40; i++) {
      const sx = ((starSeed * (i + 1) * 13) % (worldW * 2));
      const sy = ((starSeed * (i + 1) * 7) % (worldH * 0.4));
      g.fillCircle(sx, sy, Math.random() > 0.7 ? 1.5 : 0.8);
    }

    // Background buildings (far layer — darker, smaller)
    const farColor = 0x0e0e1a;
    const farBuildings = Math.floor(worldW / 60) + 4;
    for (let i = 0; i < farBuildings; i++) {
      const bx = i * 60 - 30 + ((i * 37) % 20);
      const bh = 80 + ((i * 73) % 120);
      const bw = 30 + ((i * 41) % 30);
      g.fillStyle(farColor, 0.9);
      g.fillRect(bx, worldH - bh - 100, bw, bh);
      // Dark windows
      g.fillStyle(0x0a0a12, 1);
      for (let wy = worldH - bh - 90; wy < worldH - 110; wy += 12) {
        for (let wx = bx + 4; wx < bx + bw - 4; wx += 8) {
          g.fillRect(wx, wy, 3, 4);
        }
      }
    }

    // Foreground buildings (near layer — slightly lighter silhouettes)
    const nearColor = 0x151525;
    const nearBuildings = Math.floor(worldW / 80) + 3;
    for (let i = 0; i < nearBuildings; i++) {
      const bx = i * 80 + ((i * 53) % 30) - 20;
      const bh = 100 + ((i * 97) % 160);
      const bw = 40 + ((i * 61) % 40);
      g.fillStyle(nearColor, 0.95);
      g.fillRect(bx, worldH - bh - 60, bw, bh);
      // Windows — some lit (dim yellow), most dark
      for (let wy = worldH - bh - 50; wy < worldH - 70; wy += 14) {
        for (let wx = bx + 5; wx < bx + bw - 5; wx += 10) {
          const isLit = ((wx * 3 + wy * 7) % 11) < 2; // ~18% chance lit
          g.fillStyle(isLit ? 0x332200 : 0x0a0a18, isLit ? 0.6 : 1);
          g.fillRect(wx, wy, 4, 5);
        }
      }
    }
  }

  _handleAction(player) {
    // If already connected, only allow disconnecting at the same terminal
    if (player.cordConnectedTerminal) {
      const ct = player.cordConnectedTerminal;
      if (ct.isPlayerInRange(player)) {
        player.disconnectCord();
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
      this.events.emit('cord-changed', best);
    }
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
        const propY = block.y - PUSH_BLOCK.SIZE / 2 - (door._h || DOOR.HEIGHT) / 2;
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
    this.physics.pause();
    music.stop();
    music.playVictory();

    const cx = this.cameras.main.scrollX + GAME_WIDTH / 2;
    const cy = this.cameras.main.scrollY + GAME_HEIGHT / 2;

    const next = this._levelData.nextLevel;
    const msg = next
      ? 'Level Complete!\nPress ENTER for next level'
      : 'Generator Fixed!\nYou Win!';

    this.add.text(cx, cy, msg, {
      fontSize: '32px', fontFamily: 'monospace', color: '#0f0', align: 'center',
    }).setOrigin(0.5).setDepth(200);

    if (next) {
      this.input.keyboard.once('keydown-ENTER', () => {
        this.scene.stop(SCENES.UI);
        this.scene.restart({ levelId: next });
      });
    }
  }
}