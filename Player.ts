import * as hz from "horizon/core";
import Events from "GameUtil";

export const PlayerSettings = {
  MaxHealth: 100,
  HealthRegenRate: 1, // health per second
  MaxStamina: 100,
  StaminaRegenRate: 10, // stamina per second
  StaminaDepletionRate: 20, // stamina per second when running
  WalkSpeed: 5, // units per second
  RunSpeed: 10, // units per second
  JumpHeight: 3.5, // units
  CrouchSpeed: 3, // units per second
};

class Player extends hz.Component<typeof Player> {
  static propsDefinition = {
    horrorAmbienceSFX_1: { type: hz.PropTypes.Entity },
    horrorAmbienceSFX_2: { type: hz.PropTypes.Entity },
    horrorAmbienceSFX_3: { type: hz.PropTypes.Entity },
    heartBeatSFX: { type: hz.PropTypes.Entity },
    FootstepWalkSFX: { type: hz.PropTypes.Entity },
    FootstepRunSFX: { type: hz.PropTypes.Entity },
    FootstepCrouchSFX: { type: hz.PropTypes.Entity },
    FootstepLandSFX: { type: hz.PropTypes.Entity },
  };

  private owner!: hz.Player;
  private serverPlayer?: hz.Player;
  private isActive: boolean = false;

  // SFX state tracking
  private horrorAmbiencePlaying: boolean = false;
  private heartbeatPlaying: boolean = false;

  preStart(): void {
    this.connectLocalBroadcastEvent<{ player: hz.Player; playerIndex: number }>(
      Events.assignPlayerScript,
      (data: { player: hz.Player; playerIndex: number }) => {
        console.log("Assigning player script to:", data.player.name.get());
        this.assignToPlayer(data.player);
      }
    );

    this.connectLocalBroadcastEvent<{}>(
      Events.returnPlayerScript,
      () => {
        console.log("Returning player script to server");
        this.returnToServer();
      }
    );
  }

  start() {
    this.serverPlayer = this.world.getServerPlayer();

    // Don't run if this is the server player
    if (this.entity.owner.get() === this.serverPlayer) {
      console.log("Player script on server - inactive");
      this.isActive = false;
      return;
    }

    this.owner = this.entity.owner.get()!;
    this.isActive = true;
    this.initializePlayer();
  }

  private assignToPlayer(player: hz.Player): void {
    this.entity.owner.set(player);
    this.owner = player;
    this.isActive = true;
    this.initializePlayer();
  }

  private returnToServer(): void {
    if (!this.serverPlayer) return;

    this.cleanup();
    this.entity.owner.set(this.serverPlayer);
    this.isActive = false;
  }

  private initializePlayer(): void {
    if (!this.isActive) return;

    console.log(
      "Initializing player script for:",
      this.owner?.name.get() || "Unknown"
    );

    // Initialize player-specific settings
    // Additional initialization can be added here
  }

  private cleanup(): void {
    // Stop all SFX
    this.stopHorrorAmbience();
    this.stopHeartbeat();
    this.stopFootsteps();
  }

  // ========================================
  // HORROR AMBIENCE METHODS
  // ========================================

  public playHorrorAmbience(): void {
    if (!this.isActive || this.horrorAmbiencePlaying) return;

    this.horrorAmbiencePlaying = true;

    // Play all horror ambience layers with random delays for variation
    if (this.props.horrorAmbienceSFX_1) {
      this.props.horrorAmbienceSFX_1.as(hz.AudioGizmo).volume.set(0.3);
      this.props.horrorAmbienceSFX_1.as(hz.AudioGizmo).play({ fade: 30 });
    }

    if (this.props.horrorAmbienceSFX_2) {
      this.async.setTimeout(() => {
        this.props.horrorAmbienceSFX_2!.as(hz.AudioGizmo).volume.set(0.25);
        this.props.horrorAmbienceSFX_2!.as(hz.AudioGizmo).play({ fade: 30 });
      }, 500);
    }

    if (this.props.horrorAmbienceSFX_3) {
      this.async.setTimeout(() => {
        this.props.horrorAmbienceSFX_3!.as(hz.AudioGizmo).volume.set(0.2);
        this.props.horrorAmbienceSFX_3!.as(hz.AudioGizmo).play({ fade: 30 });
      }, 1000);
    }
  }

  public stopHorrorAmbience(): void {
    if (!this.horrorAmbiencePlaying) return;

    this.horrorAmbiencePlaying = false;

    if (this.props.horrorAmbienceSFX_1) {
      this.props.horrorAmbienceSFX_1.as(hz.AudioGizmo).stop({ fade: 30 });
    }

    if (this.props.horrorAmbienceSFX_2) {
      this.props.horrorAmbienceSFX_2.as(hz.AudioGizmo).stop({ fade: 30 });
    }

    if (this.props.horrorAmbienceSFX_3) {
      this.props.horrorAmbienceSFX_3.as(hz.AudioGizmo).stop({ fade: 30 });
    }
  }

  // ========================================
  // HEARTBEAT METHODS
  // ========================================

  public startHeartbeat(): void {
    if (!this.isActive || this.heartbeatPlaying) return;

    this.heartbeatPlaying = true;

    if (this.props.heartBeatSFX) {
      this.props.heartBeatSFX.as(hz.AudioGizmo).volume.set(0.4);
      this.props.heartBeatSFX.as(hz.AudioGizmo).play({ fade: 20 });
    }
  }

  public stopHeartbeat(): void {
    if (!this.heartbeatPlaying) return;

    this.heartbeatPlaying = false;

    if (this.props.heartBeatSFX) {
      this.props.heartBeatSFX.as(hz.AudioGizmo).stop({ fade: 20 });
    }
  }

  public setHeartbeatIntensity(intensity: number): void {
    if (!this.heartbeatPlaying || !this.props.heartBeatSFX) return;

    // Clamp intensity between 0 and 1
    const clampedIntensity = Math.max(0, Math.min(1, intensity));
    const volume = 0.2 + clampedIntensity * 0.3; // Range: 0.2 to 0.5

    this.props.heartBeatSFX.as(hz.AudioGizmo).volume.set(volume);
  }

  // ========================================
  // FOOTSTEP METHODS
  // ========================================

  public playFootstepWalk(): void {
    if (!this.isActive || !this.props.FootstepWalkSFX) return;
    this.props.FootstepWalkSFX.as(hz.AudioGizmo).play();
  }

  public playFootstepRun(): void {
    if (!this.isActive || !this.props.FootstepRunSFX) return;
    this.props.FootstepRunSFX.as(hz.AudioGizmo).play();
  }

  public playFootstepCrouch(): void {
    if (!this.isActive || !this.props.FootstepCrouchSFX) return;
    this.props.FootstepCrouchSFX.as(hz.AudioGizmo).play();
  }

  public playFootstepLand(): void {
    if (!this.isActive || !this.props.FootstepLandSFX) return;
    this.props.FootstepLandSFX.as(hz.AudioGizmo).play();
  }

  private stopFootsteps(): void {
    // Footsteps are one-shot sounds, no need to explicitly stop
    // This method exists for completeness and future expansion
  }
}
hz.Component.register(Player);
