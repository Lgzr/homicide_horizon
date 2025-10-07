import * as hz from "horizon/core";

class Ladder extends hz.Component<typeof Ladder> {
  static propsDefinition = {
    TriggerGizmo: { type: hz.PropTypes.Entity },
    climbSpeed: { type: hz.PropTypes.Number, default: 3.0 },
    exitDistance: { type: hz.PropTypes.Number, default: 2.0 },
  };

  // when a player is nearby, player climbs up / down the ladder depending on where they're looking
  // trigger volume to trigger climb mode
  // while in climb mode, player can move up / down the ladder by looking up / down and pressing forward on the joystick
  // exit climb mode when player moves away from ladder or jumps off ladder

  private climbingPlayers: Map<hz.Player, boolean> = new Map();
  private climbingIntervals: Map<hz.Player, number> = new Map();
  private originalGravity: Map<hz.Player, number> = new Map();

  preStart() {
    this.connectCodeBlockEvent(
      this.entity,
      hz.CodeBlockEvents.OnPlayerEnterTrigger,
      (player: hz.Player) => {
        console.log("Player entered ladder trigger:", player.name.get());
        this.enableClimbMode(player);
      }
    );

    this.connectCodeBlockEvent(
      this.entity,
      hz.CodeBlockEvents.OnPlayerExitTrigger,
      (player: hz.Player) => {
        console.log("Player exited ladder trigger:", player.name.get());
        this.disableClimbMode(player);
      }
    );
  }

  start() {}

  enableClimbMode(player: hz.Player) {
    if (this.climbingPlayers.get(player)) {
      console.log("Player already in climb mode:", player.name.get());
      return;
    }

    console.log("Enabling climb mode for player:", player.name.get());
    this.climbingPlayers.set(player, true);

    // Store original player settings
    this.originalGravity.set(player, player.gravity.get());

    // Reduce gravity to prevent falling
    player.gravity.set(0.1);

    // Set up climbing update loop
    // const intervalId = this.async.setInterval(() => {
    //   this.updateClimbing(player);
    // }, 1000 / 30); // 30 times per second

    // this.climbingIntervals.set(player, intervalId);
  }

  disableClimbMode(player: hz.Player) {
    if (!this.climbingPlayers.get(player)) {
      return;
    }

    console.log("Disabling climb mode for player:", player.name.get());
    this.climbingPlayers.delete(player);

    // Clear the update interval
    const intervalId = this.climbingIntervals.get(player);
    if (intervalId !== undefined) {
      this.async.clearInterval(intervalId);
      this.climbingIntervals.delete(player);
    }

    // Restore original player settings
    const originalGravity = this.originalGravity.get(player);
    if (originalGravity !== undefined) {
      player.gravity.set(originalGravity);
      this.originalGravity.delete(player);
    }
  }

  updateClimbing(player: hz.Player) {
    if (!this.climbingPlayers.get(player)) {
      return;
    }

    // Get player's camera look direction
    const headRotation = player.head.getRotation(hz.Space.World);
    const forward = hz.Quaternion.mulVec3(headRotation, new hz.Vec3(0, 0, 1));

    // Calculate pitch (how much looking up/down)
    // forward.y represents vertical component: positive = looking up, negative = looking down
    const pitch = Math.asin(forward.y);
    const pitchDegrees = (pitch * 180) / Math.PI;

    // Check if player is looking significantly up or down (threshold of 30 degrees)
    const climbSpeed = this.props.climbSpeed || 3.0;

    if (Math.abs(pitchDegrees) > 30) {
      // Get player's current position
      const currentPos = player.position.get();

      // Calculate vertical movement based on look direction
      let verticalSpeed = 0;

      if (pitchDegrees > 30) {
        // Looking up - climb up
        verticalSpeed = climbSpeed * (pitchDegrees / 90); // Scale with angle
      } else if (pitchDegrees < -30) {
        // Looking down - climb down
        verticalSpeed = climbSpeed * (pitchDegrees / 90); // Negative speed
      }

      // Apply vertical movement
      const newPos = new hz.Vec3(
        currentPos.x,
        currentPos.y + verticalSpeed * 0.033, // 0.033 = 1/30 seconds
        currentPos.z
      );

      player.position.set(newPos);
    }

    // Check distance from ladder - exit if too far
    // const playerPos = player.position.get();
    // const ladderPos = this.entity.transform.position.get();
    // const distance = Math.sqrt(
    //   Math.pow(playerPos.x - ladderPos.x, 2) +
    //     Math.pow(playerPos.z - ladderPos.z, 2)
    // );

    // const exitDistance = this.props.exitDistance || 2.0;
    // if (distance > exitDistance) {
    //   console.log("Player too far from ladder, exiting climb mode");
    //   this.disableClimbMode(player);
    // }
  }
}
hz.Component.register(Ladder);
