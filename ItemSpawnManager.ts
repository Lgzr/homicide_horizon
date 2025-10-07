import * as hz from 'horizon/core';

// Define events for spawning
export const ItemSpawnEvents = {
  SpawnGroup1: new hz.LocalEvent<{}>('SpawnGroup1'),
  SpawnGroup2: new hz.LocalEvent<{}>('SpawnGroup2'),
  SpawnGroup3: new hz.LocalEvent<{}>('SpawnGroup3'),
  SpawnGroup4: new hz.LocalEvent<{}>('SpawnGroup4'),
  SpawnGroup5: new hz.LocalEvent<{}>('SpawnGroup5'),
};

interface SpawnGroup {
  enabled: boolean;
  pointTag: string;
  entityTag: string;
  spawnPoints: hz.Entity[];
  spawnableEntities: hz.Entity[];
  occupiedPoints: Set<string>; // Track which points have spawned items
}

class ItemSpawnManager extends hz.Component<typeof ItemSpawnManager> {
  static propsDefinition = {
    // Spawn Group 1
    spawnGroup1Enabled: { type: hz.PropTypes.Boolean, default: false },
    spawnGroup1PointTag: { type: hz.PropTypes.String, default: '' },
    spawnGroup1EntityTag: { type: hz.PropTypes.String, default: '' },

    // Spawn Group 2
    spawnGroup2Enabled: { type: hz.PropTypes.Boolean, default: false },
    spawnGroup2PointTag: { type: hz.PropTypes.String, default: '' },
    spawnGroup2EntityTag: { type: hz.PropTypes.String, default: '' },

    // Spawn Group 3
    spawnGroup3Enabled: { type: hz.PropTypes.Boolean, default: false },
    spawnGroup3PointTag: { type: hz.PropTypes.String, default: '' },
    spawnGroup3EntityTag: { type: hz.PropTypes.String, default: '' },

    // Spawn Group 4
    spawnGroup4Enabled: { type: hz.PropTypes.Boolean, default: false },
    spawnGroup4PointTag: { type: hz.PropTypes.String, default: '' },
    spawnGroup4EntityTag: { type: hz.PropTypes.String, default: '' },

    // Spawn Group 5
    spawnGroup5Enabled: { type: hz.PropTypes.Boolean, default: false },
    spawnGroup5PointTag: { type: hz.PropTypes.String, default: '' },
    spawnGroup5EntityTag: { type: hz.PropTypes.String, default: '' },

    // Optional: Minimum distance between spawned items at different points
    minSpawnDistance: { type: hz.PropTypes.Number, default: 0.1 },
  };

  private spawnGroups: Map<number, SpawnGroup> = new Map();
  private readonly TOTAL_SPAWN_GROUPS = 5;

  preStart(): void {
    // Connect network events for each spawn group
    this.connectNetworkBroadcastEvent(ItemSpawnEvents.SpawnGroup1, () => {
      this.spawnForGroup(1);
    });

    this.connectNetworkBroadcastEvent(ItemSpawnEvents.SpawnGroup2, () => {
      this.spawnForGroup(2);
    });

    this.connectNetworkBroadcastEvent(ItemSpawnEvents.SpawnGroup3, () => {
      this.spawnForGroup(3);
    });

    this.connectNetworkBroadcastEvent(ItemSpawnEvents.SpawnGroup4, () => {
      this.spawnForGroup(4);
    });

    this.connectNetworkBroadcastEvent(ItemSpawnEvents.SpawnGroup5, () => {
      this.spawnForGroup(5);
    });
  }

  start(): void {
    this.initializeSpawnGroups();
  }

  private initializeSpawnGroups(): void {
    for (let i = 1; i <= this.TOTAL_SPAWN_GROUPS; i++) {
      const enabled = this.props[`spawnGroup${i}Enabled` as keyof typeof this.props] as boolean;
      const pointTag = this.props[`spawnGroup${i}PointTag` as keyof typeof this.props] as string;
      const entityTag = this.props[`spawnGroup${i}EntityTag` as keyof typeof this.props] as string;

      if (!enabled || !pointTag || !entityTag) {
        console.log(`[ItemSpawnManager] Spawn Group ${i} is disabled or not configured.`);
        continue;
      }

      // Find all spawn points with the specified tag
      const spawnPoints = this.world.getEntitiesWithTags([pointTag]);
      
      // Find all entities with the specified tag
      const spawnableEntities = this.world.getEntitiesWithTags([entityTag]);

      if (spawnPoints.length === 0) {
        console.warn(`[ItemSpawnManager] No spawn points found with tag: ${pointTag}`);
        continue;
      }

      if (spawnableEntities.length === 0) {
        console.warn(`[ItemSpawnManager] No spawnable entities found with tag: ${entityTag}`);
        continue;
      }

      const spawnGroup: SpawnGroup = {
        enabled,
        pointTag,
        entityTag,
        spawnPoints,
        spawnableEntities,
        occupiedPoints: new Set<string>(),
      };

      this.spawnGroups.set(i, spawnGroup);

      console.log(
        `[ItemSpawnManager] Initialized Spawn Group ${i}:`,
        `PointTag: ${pointTag} (${spawnPoints.length} points),`,
        `EntityTag: ${entityTag} (${spawnableEntities.length} entities)`
      );
    }
  }

  private spawnForGroup(groupIndex: number): void {
    const group = this.spawnGroups.get(groupIndex);

    if (!group) {
      console.warn(`[ItemSpawnManager] Spawn Group ${groupIndex} is not initialized.`);
      return;
    }

    console.log(`[ItemSpawnManager] Spawning for Group ${groupIndex} (${group.entityTag})...`);

    // Find available spawn points (not currently occupied)
    const availablePoints = group.spawnPoints.filter(
      (point) => !group.occupiedPoints.has(this.getPointId(point))
    );

    if (availablePoints.length === 0) {
      console.warn(
        `[ItemSpawnManager] No available spawn points for Group ${groupIndex}. All points occupied.`
      );
      return;
    }

    // Find an available entity to spawn (not currently simulated)
    const availableEntity = group.spawnableEntities.find((entity) => !entity.simulated.get());

    if (!availableEntity) {
      console.warn(
        `[ItemSpawnManager] No available entities to spawn for Group ${groupIndex}. All entities already spawned.`
      );
      return;
    }

    // Select a random available spawn point
    const randomPoint = availablePoints[Math.floor(Math.random() * availablePoints.length)];
    const spawnPosition = randomPoint.position.get();

    // Check if position is valid and not too close to other spawned items
    if (!this.isValidSpawnPosition(spawnPosition, group)) {
      console.warn(
        `[ItemSpawnManager] Selected spawn position is too close to another spawned item. Retrying...`
      );
      // Try again with another point if available
      return;
    }

    // Spawn the entity
    availableEntity.position.set(spawnPosition);
    availableEntity.simulated.set(true);
    availableEntity.interactionMode.set(hz.EntityInteractionMode.Grabbable);

    // Mark the point as occupied
    group.occupiedPoints.add(this.getPointId(randomPoint));

    console.log(
      `[ItemSpawnManager] Spawned ${group.entityTag} at point ${this.getPointId(randomPoint)}`,
      `Position: ${spawnPosition}`
    );

    // Optional: Set up event listener to clear occupation when entity is moved/collected
    this.setupEntityTracking(availableEntity, randomPoint, group);
  }

  private isValidSpawnPosition(position: hz.Vec3, group: SpawnGroup): boolean {
    const minDistance = this.props.minSpawnDistance;

    // Check distance from all currently spawned entities in this group
    for (const entity of group.spawnableEntities) {
      if (entity.simulated.get()) {
        const entityPos = entity.position.get();
        const distance = position.distance(entityPos);

        if (distance < minDistance) {
          return false;
        }
      }
    }

    return true;
  }

  private getPointId(point: hz.Entity): string {
    // Create unique ID based on position (or use entity ID if available)
    const pos = point.position.get();
    return `${pos.x.toFixed(2)}_${pos.y.toFixed(2)}_${pos.z.toFixed(2)}`;
  }

  private setupEntityTracking(entity: hz.Entity, spawnPoint: hz.Entity, group: SpawnGroup): void {
    // Track when entity is moved far from spawn point to free up the spawn point
    const pointId = this.getPointId(spawnPoint);
    const spawnPosition = spawnPoint.position.get();
    const checkDistance = 2.0; // Distance threshold to consider point "freed"

    // Use async loop with delay
    this.checkEntityPosition(entity, spawnPosition, pointId, group, checkDistance);
  }

  private async checkEntityPosition(
    entity: hz.Entity,
    spawnPosition: hz.Vec3,
    pointId: string,
    group: SpawnGroup,
    checkDistance: number
  ): Promise<void> {
    // Check every second using async setTimeout
    await new Promise<void>((resolve) => {
      this.async.setTimeout(() => resolve(), 1000);
    });

    if (!entity.simulated.get()) {
      // Entity is no longer active, free the point
      group.occupiedPoints.delete(pointId);
      console.log(`[ItemSpawnManager] Freed spawn point ${pointId} (entity despawned)`);
      return;
    }

    const currentPos = entity.position.get();
    const distance = currentPos.distance(spawnPosition);

    if (distance > checkDistance) {
      // Entity moved away from spawn point, consider it freed
      group.occupiedPoints.delete(pointId);
      console.log(`[ItemSpawnManager] Freed spawn point ${pointId} (entity moved away)`);
      return;
    }

    // Continue checking recursively
    this.checkEntityPosition(entity, spawnPosition, pointId, group, checkDistance);
  }

  // Public method to despawn an entity (e.g., when collected)
  public despawnEntity(entity: hz.Entity, groupIndex: number): void {
    const group = this.spawnGroups.get(groupIndex);
    
    if (!group) {
      console.warn(`[ItemSpawnManager] Cannot despawn: Group ${groupIndex} not found.`);
      return;
    }

    entity.simulated.set(false);
    entity.position.set(this.entity.position.get()); // Move to manager position (hide it)
    
    console.log(`[ItemSpawnManager] Despawned entity from Group ${groupIndex}`);
  }

  // Public method to respawn an entity at a new random location
  public respawnEntity(entity: hz.Entity, groupIndex: number): void {
    const group = this.spawnGroups.get(groupIndex);
    
    if (!group) {
      console.warn(`[ItemSpawnManager] Cannot respawn: Group ${groupIndex} not found.`);
      return;
    }

    // First despawn it
    entity.simulated.set(false);

    // Then spawn it again
    this.spawnForGroup(groupIndex);
  }

  // Public method to clear all spawned items for a group
  public clearGroup(groupIndex: number): void {
    const group = this.spawnGroups.get(groupIndex);
    
    if (!group) {
      console.warn(`[ItemSpawnManager] Cannot clear: Group ${groupIndex} not found.`);
      return;
    }

    group.spawnableEntities.forEach((entity) => {
      entity.simulated.set(false);
      entity.position.set(this.entity.position.get());
    });

    group.occupiedPoints.clear();
    
    console.log(`[ItemSpawnManager] Cleared all spawned items for Group ${groupIndex}`);
  }

  // Public method to spawn all available entities for a group
  public spawnAllForGroup(groupIndex: number): void {
    const group = this.spawnGroups.get(groupIndex);
    
    if (!group) {
      console.warn(`[ItemSpawnManager] Cannot spawn all: Group ${groupIndex} not found.`);
      return;
    }

    const availableEntities = group.spawnableEntities.filter((e) => !e.simulated.get());
    const spawnCount = Math.min(availableEntities.length, group.spawnPoints.length);

    console.log(`[ItemSpawnManager] Spawning ${spawnCount} items for Group ${groupIndex}...`);

    for (let i = 0; i < spawnCount; i++) {
      this.spawnForGroup(groupIndex);
    }
  }

  // Utility method to get spawn group info
  public getGroupInfo(groupIndex: number): SpawnGroup | undefined {
    return this.spawnGroups.get(groupIndex);
  }
}

hz.Component.register(ItemSpawnManager);
