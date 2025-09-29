import { Events } from "GameUtil";
import * as hz from "horizon/core";
import { SFXEvents } from "SFXEvents";

class PartManager extends hz.Component<typeof PartManager> {
  static propsDefinition = {
    part1: { type: hz.PropTypes.Entity },
    part2: { type: hz.PropTypes.Entity },
    part3: { type: hz.PropTypes.Entity },
    part4: { type: hz.PropTypes.Entity },
    part5: { type: hz.PropTypes.Entity },
    partCollectSFX: { type: hz.PropTypes.Entity },
  };

  private partSpawnLocations?: hz.Entity[];
  private totalPartsCollected = 0;
  private murderer?: hz.Player;
  private readonly RESPAWN_DISTANCE_THRESHOLD = 0.1; // Minimum distance in units

  preStart(): void {
    // connect roundStart event from GameManager
    this.connectLocalBroadcastEvent(Events.registerNewMatch, () => {
      this.resetParts();
    });

    this.connectLocalBroadcastEvent(Events.spawnParts, () => {
      this.spawnParts();
    });

    this.connectNetworkBroadcastEvent<{ player: hz.Player; part: hz.Entity }>(
      Events.partCollected,
      (data: { player: hz.Player; part: hz.Entity }) => {
        console.log(
          `[PartManager] partCollected event received for entity ${data.part.name.get()} by player ${data.player.name.get()}`
        );
        this.onPartCollected(data.player, data.part);

        // Optionally handle part collection logic here if needed
      }
    );
    // connect to murderer selected event
    this.connectNetworkBroadcastEvent<{ player: hz.Player; part: hz.Entity }>(
      Events.selectedMurderer,
      (data: { player: hz.Player }) => {
        this.murderer = data.player;
      }
    );
  }

  start() {
    this.partSpawnLocations = this.world.getEntitiesWithTags(["PartSpawn"]);
    // this.spawnParts();
  }

  resetParts() {
    this.totalPartsCollected = 0;

    const parts = [
      this.props.part1,
      this.props.part2,
      this.props.part3,
      this.props.part4,
      this.props.part5,
    ];

    parts.forEach((part) => {
      part?.transform.position.set(this.entity.position.get());
      part?.simulated.set(false);
    });
  }

  spawnParts() {
    console.log("[PartManager] Spawning parts...");
    if (!this.partSpawnLocations || this.partSpawnLocations.length < 5) {
      console.warn(
        "Not enough PartSpawn locations found. Need at least 5, found:",
        this.partSpawnLocations?.length || 0
      );
      return;
    }

    const parts = [
      this.props.part1,
      this.props.part2,
      this.props.part3,
      this.props.part4,
      this.props.part5,
    ];

    // Check if all parts are assigned
    const missingParts = parts.filter((p) => !p);
    if (missingParts.length > 0) {
      console.warn(
        "Some part props are not assigned:",
        missingParts.map((_, i) => `part${i + 1}`).join(", ")
      );
      return;
    }

    // Create set of available indices
    const availableIndices = new Set<number>();
    for (let i = 0; i < this.partSpawnLocations.length; i++) {
      availableIndices.add(i);
    }

    const partSpawns: hz.Vec3[] = [];

    // Randomly select unique spawn locations by index
    while (partSpawns.length < parts.length && availableIndices.size > 0) {
      const indicesArray = Array.from(availableIndices);
      const randomIndex =
        indicesArray[Math.floor(Math.random() * indicesArray.length)];
      const randomLocation = this.partSpawnLocations[randomIndex];
      if (randomLocation?.position) {
        partSpawns.push(randomLocation.position.get());
        availableIndices.delete(randomIndex);
      }
    }

    // Set positions and enable simulation
    parts.forEach((part, index) => {
      if (part && partSpawns[index]) {
        part.simulated.set(true);
        part.interactionMode.set(hz.EntityInteractionMode.Grabbable);
        part.position.set(partSpawns[index]);

        console.log(
          `[PartManager] Spawned part${index + 1} at position:`,
          partSpawns[index]
        );
      }
    });
  }

  respawnPartRandomly(part: hz.Entity) {
    if (!this.partSpawnLocations || this.partSpawnLocations.length === 0) {
      console.warn("No PartSpawn locations available for respawning.");
      return;
    }

    const parts = [
      this.props.part1,
      this.props.part2,
      this.props.part3,
      this.props.part4,
      this.props.part5,
    ];

    // Get active parts (simulated and not the one being respawned)
    const activeParts = parts.filter(
      (p) => p && p !== part && p.simulated.get()
    );

    // Find locations that are far enough from all active parts
    const validLocations: hz.Entity[] = [];
    for (const location of this.partSpawnLocations) {
      if (!location?.position) continue;

      const locationPos = location.position.get();
      let isValid = true;

      for (const activePart of activeParts) {
        if (!activePart?.position) continue;

        const distance = locationPos.distance(activePart.position.get());
        if (distance < this.RESPAWN_DISTANCE_THRESHOLD) {
          isValid = false;
          break;
        }
      }

      if (isValid) {
        validLocations.push(location);
      }
    }

    if (validLocations.length === 0) {
      console.warn(
        "No valid spawn locations available for respawning part (all too close to active parts)."
      );
      return;
    }

    // Pick random valid location
    const randomLocation =
      validLocations[Math.floor(Math.random() * validLocations.length)];

    if (part && randomLocation) {
      part.position.set(randomLocation.position.get());
      part.interactionMode.set(hz.EntityInteractionMode.Grabbable);
      part.simulated.set(true);
      console.log(
        `[PartManager] Respawned part at position:`,
        randomLocation.position.get()
      );
    }
  }

  onPartCollected(player: hz.Player, part: hz.Entity) {
    // if player is murderer, respawn the part
    if (player === this.murderer) {
      this.props.partCollectSFX?.transform.position.set(part.position.get());
      this.props.partCollectSFX
        ?.as(hz.AudioGizmo)
        .play({ fade: 0, players: [player] });
      part.as(hz.GrabbableEntity).forceRelease();
      this.respawnPartRandomly(part);
      // this.world.ui.showPopupForEveryone(
      //   `Part collected (${this.totalPartsCollected}/5)`,
      //   3
      // );
    } else {
      this.props.partCollectSFX?.transform.position.set(part.position.get());
      this.props.partCollectSFX
        ?.as(hz.AudioGizmo)
        .play({ fade: 0, players: [player] });

      part.transform.position.set(this.entity.position.get());
      part.simulated.set(false);
      this.totalPartsCollected++;
      this.world.ui.showPopupForEveryone(
        `Part collected (${this.totalPartsCollected}/5)`,
        3
      );

      //this.sendLocalBroadcastEvent(Events.partCollected, { player, part });
      // if parts collected >= 5, send spawn revolver event
      if (this.totalPartsCollected >= 5) {
        this.world.ui.showPopupForEveryone(`All parts collected!`, 3);
        this.sendLocalBroadcastEvent(Events.spawnRevolver, { player });
        this.totalPartsCollected = 0; // reset count after spawning revolver
      }

      console.log(
        `[PartManager] Total parts collected: ${this.totalPartsCollected}`
      );
    }
  }
}
hz.Component.register(PartManager);
