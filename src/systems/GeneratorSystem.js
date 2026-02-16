/**
 * GeneratorSystem — manages all generators and their linked elements.
 *
 * Tracks primary and secondary generators, handles activation chains,
 * and coordinates auto-activation of puzzle elements.
 */
export class GeneratorSystem {
  /**
   * @param {Phaser.Scene} scene
   */
  constructor(scene) {
    this.scene = scene;

    /** @type {Map<string, import('../entities/Generator.js').Generator>} */
    this.generators = new Map();

    /** @type {Map<string, string[]>} generatorId → [elementId, …] */
    this.generatorLinks = new Map();

    /** @type {Object.<string, Phaser.Physics.Arcade.Sprite>} elementId → element */
    this.elementsById = {};
  }

  /**
   * Register a generator with the system
   * @param {string} generatorId
   * @param {import('../entities/Generator.js').Generator} generator
   */
  registerGenerator(generatorId, generator) {
    this.generators.set(generatorId, generator);
  }

  /**
   * Register an element that can be controlled by generators
   * @param {string} elementId
   * @param {Phaser.Physics.Arcade.Sprite} element
   */
  registerElement(elementId, element) {
    this.elementsById[elementId] = element;
  }

  /**
   * Define which elements are linked to a generator
   * @param {string} generatorId
   * @param {string[]} linkedElementIds
   */
  linkElementsToGenerator(generatorId, linkedElementIds) {
    const existing = this.generatorLinks.get(generatorId) || [];
    this.generatorLinks.set(generatorId, [...existing, ...linkedElementIds]);
  }

  /**
   * Activate a generator and trigger all its linked elements
   * @param {string} generatorId
   * @returns {boolean} true if generator was activated, false if not found or already active
   */
  activateGenerator(generatorId) {
    const gen = this.generators.get(generatorId);
    if (!gen) {
      console.warn(`GeneratorSystem: Generator not found: ${generatorId}`);
      return false;
    }

    // Skip if already activated
    if (gen.isActivated) return false;

    // Activate generator and all linked elements
    gen.activate(this.elementsById);
    return true;
  }

  /**
   * Deactivate a generator and all its linked elements
   * @param {string} generatorId
   * @returns {boolean} true if generator was deactivated, false if not found or already inactive
   */
  deactivateGenerator(generatorId) {
    const gen = this.generators.get(generatorId);
    if (!gen) {
      console.warn(`GeneratorSystem: Generator not found: ${generatorId}`);
      return false;
    }

    // Skip if already deactivated
    if (!gen.isActivated) return false;

    // Deactivate generator and all linked elements
    gen.deactivate(this.elementsById);
    return true;
  }

  /**
   * Toggle a generator's activation state
   * @param {string} generatorId
   * @returns {boolean} the new activation state
   */
  toggleGenerator(generatorId) {
    const gen = this.generators.get(generatorId);
    if (!gen) {
      console.warn(`GeneratorSystem: Generator not found: ${generatorId}`);
      return false;
    }

    gen.toggle(this.elementsById);
    return gen.isActivated;
  }

  /**
   * Get status of a generator
   * @param {string} generatorId
   * @returns {{
   *   activated: boolean,
   *   isPrimary: boolean,
   *   elementCount: number,
   *   elements: string[]
   * } | null}
   */
  getGeneratorStatus(generatorId) {
    const gen = this.generators.get(generatorId);
    if (!gen) return null;

    const linkedIds = this.generatorLinks.get(generatorId) || [];
    return {
      activated: gen.isActivated,
      isPrimary: gen.isPrimary,
      elementCount: linkedIds.length,
      elements: linkedIds,
    };
  }

  /**
   * Get all generators
   * @returns {string[]} array of generator IDs
   */
  getAllGeneratorIds() {
    return Array.from(this.generators.keys());
  }

  /**
   * Get all primary generators
   * @returns {string[]}
   */
  getPrimaryGenerators() {
    return Array.from(this.generators.entries())
      .filter(([_, gen]) => gen.isPrimary)
      .map(([id, _]) => id);
  }

  /**
   * Get all secondary generators
   * @returns {string[]}
   */
  getSecondaryGenerators() {
    return Array.from(this.generators.entries())
      .filter(([_, gen]) => !gen.isPrimary)
      .map(([id, _]) => id);
  }

  /**
   * Clean up the system
   */
  destroy() {
    this.generators.clear();
    this.generatorLinks.clear();
    this.elementsById = {};
  }
}
