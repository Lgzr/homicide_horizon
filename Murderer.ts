import Events from "GameUtil";
import * as hz from "horizon/core";

class Murderer extends hz.Component<typeof Murderer> {
  static propsDefinition = {
    knife: { type: hz.PropTypes.Entity },
    eliminationTrigger: { type: hz.PropTypes.Entity },
  };

  private knifeHeld!: boolean;
  private knifeHolstered: boolean = false;
  private knife!: hz.Entity;
  private owner!: hz.Player;
  private serverPlayer?: hz.Player;
  private eliminationTrigger!: hz.Entity;
  private nearbyPlayers: hz.Player[] = [];
  private updateInterval?: number;

  preStart(): void {
    this.connectNetworkBroadcastEvent<{ player: hz.Player }>(
      Events.selectedMurderer,
      (data: { player: hz.Player }) => {
        console.log("Selected murderer:", data.player);
        this.updateMurderer(data.player);
      }
    );

    // Listen for knife held updates
    this.connectLocalBroadcastEvent<{
      player: hz.Player;
      holdingKnife: boolean;
      tag: string;
    }>(
      Events.knifeHeldUpdated,
      (data: { player: hz.Player; holdingKnife: boolean; tag: string }) => {
        // Only respond if this is the murderer's knife
        if (data.player === this.owner) {
          console.log("Knife held updated for murderer:", data.holdingKnife);
          this.knifeHeld = data.holdingKnife;
          this.updateEliminationTrigger();
        }
      }
    );

    this.connectCodeBlockEvent(
      this.props.knife!,
      hz.CodeBlockEvents.OnGrabStart,
      (data) => {
        console.log("Knife grabbed:", data);
        this.knifeHeld = true;
      }
    );

    this.connectCodeBlockEvent(
      this.props.knife!,
      hz.CodeBlockEvents.OnGrabEnd,
      (data) => {
        console.log("Knife released:", data);
        this.knifeHeld = false;
      }
    );

    // Connect elimination trigger event
    if (this.props.eliminationTrigger) {
      this.connectCodeBlockEvent(
        this.props.eliminationTrigger,
        hz.CodeBlockEvents.OnPlayerEnterTrigger,
        (enteredBy: hz.Player) => this.handlePlayerElimination(enteredBy)
      );
    }
  }

  private connectedHideKnifeInput!: hz.PlayerInput;

  start() {
    this.serverPlayer = this.world.getServerPlayer();

    // Initialize owner from entity owner
    const currentOwner = this.entity.owner.get();
    if (currentOwner) {
      this.owner = currentOwner;
    }

    // Return early if owner is server player
    if (this.owner === this.serverPlayer) {
      return;
    }

    this.knife = this.props.knife!.as(hz.AttachableEntity);

    // Only connect input if this is the local player
    if (this.owner === this.entity.owner.get()) {
      const attach = hz.PlayerControls.connectLocalInput(
        hz.PlayerInputAction.RightSecondary,
        hz.ButtonIcon.Swap,
        this
      );

      attach.registerCallback((action, pressed) => {
        if (pressed) {
          console.log("Toggling knife holster state");
          if (this.knifeHeld) {
            if (!this.knifeHolstered) {
              this.knife
                .as(hz.AttachableEntity)
                .attachToPlayer(this.owner, hz.AttachablePlayerAnchor.Torso);
            } else {
              this.knife.as(hz.AttachableEntity).detach();
              this.knife
                .as(hz.GrabbableEntity)
                .forceHold(this.owner, hz.Handedness.Right, true);
            }
          }
        }
      });
    }
  }

  updateMurderer(player: hz.Player): void {
    this.entity.owner.set(player);
    this.owner = player;
    // Initialize UI for the murderer (assuming local player)
  }

  private updateEliminationTrigger(): void {
    if (!this.eliminationTrigger) {
      this.eliminationTrigger = this.props.eliminationTrigger!;
    }

    if (this.knifeHeld) {
      // Start tracking nearby players
      this.startTrackingPlayers();
    } else {
      // Stop tracking and hide trigger
      this.stopTrackingPlayers();
    }
  }

  private startTrackingPlayers(): void {
    // Clear any existing interval
    if (this.updateInterval) {
      this.async.clearInterval(this.updateInterval);
    }

    // Update nearby players list every frame
    this.updateInterval = this.async.setInterval(() => {
      this.updateNearbyPlayers();
    }, 0.1); // Update every 100ms for performance
  }

  private stopTrackingPlayers(): void {
    if (this.updateInterval) {
      this.async.clearInterval(this.updateInterval);
      this.updateInterval = undefined;
    }

    // Move trigger far away when not in use
    if (this.eliminationTrigger) {
      this.eliminationTrigger.position.set(new hz.Vec3(0, -1000, 0));
    }

    this.nearbyPlayers = [];
  }

  private updateNearbyPlayers(): void {
    if (!this.owner || !this.eliminationTrigger) {
      return;
    }

    const ownerPosition = this.owner.position.get();
    const allPlayers = this.world.getPlayers();
    const ELIMINATION_RANGE = 1.0; // 1 meter

    // Find the closest player within range
    let closestPlayer: hz.Player | null = null;
    let closestDistance = ELIMINATION_RANGE;

    for (const player of allPlayers) {
      // Skip the murderer themselves
      if (player.id === this.owner.id) {
        continue;
      }

      const playerPosition = player.position.get();
      const distance = ownerPosition.distance(playerPosition);

      if (distance <= closestDistance) {
        closestPlayer = player;
        closestDistance = distance;
      }
    }

    if (closestPlayer) {
      // Position the trigger volume at the closest player's location
      const targetPosition = closestPlayer.position.get();
      this.eliminationTrigger.position.set(targetPosition);
      
      // Store the current nearby players list (just one player at a time)
      this.nearbyPlayers = [closestPlayer];
    } else {
      // No players in range, move trigger away
      this.eliminationTrigger.position.set(new hz.Vec3(0, -1000, 0));
      this.nearbyPlayers = [];
    }
  }

  private handlePlayerElimination(player: hz.Player): void {
    // Send network event to eliminate player
    this.owner.playAvatarGripPoseAnimationByName(hz.AvatarGripPoseAnimationNames.Throw);
    this.sendLocalBroadcastEvent(Events.playerEliminated, { player, killer: this.owner });
  }
}
hz.Component.register(Murderer);
