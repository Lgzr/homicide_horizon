import { Events, GameState } from "GameUtil";
import * as hz from "horizon/core";
import LocalCamera from "horizon/camera";

const THROW_FORCE_MIN = 15;
const THROW_FORCE_MAX = 50;
const THROW_CHARGE_READY_THRESHOLD = 25;

class KnifeController extends hz.Component<typeof KnifeController> {
  static propsDefinition = {
    knife: { type: hz.PropTypes.Entity },
    trail: { type: hz.PropTypes.Entity },
    stabSFX: {type: hz.PropTypes.Entity},
    throwSFX: {type: hz.PropTypes.Entity},
    hitSFX: {type: hz.PropTypes.Entity},


  };

  private murderer!: hz.Player;
  private knife!: hz.Entity;
  private knifeHeld = false;
  private knifeHolstered = false;
  private attackInput?: hz.PlayerInput;
  private chargeInput?: hz.PlayerInput;
  private holsterToggleInput?: hz.PlayerInput;
  private holsterQuickInput?: hz.PlayerInput;
  private throwForce = THROW_FORCE_MIN;
  private thrown = false;
  private chargeTimer: number | null = null;
  private owner!: hz.Player;
  private isCharging = false;
  private readyAnimPlayed = false;
  private lastThrower: hz.Player | null = null;
  private suppressNextDrop = false;
  private currentHolder: hz.Player | null = null;
  private zHolsterAction: hz.PlayerInputAction | null = null;

  preStart(): void {
    this.knife = (this.props.knife as hz.Entity) ?? this.entity;
    // Connect to the killbox trigger events if the killbox entity is assigned
    
      
      
    

      this.connectCodeBlockEvent(
        this.entity,
        hz.CodeBlockEvents.OnEntityCollision,
        (otherEntity: hz.Entity) => {
          this.knifeCollidedWithEntity(otherEntity);
        }
      );

      this.connectCodeBlockEvent(
        this.entity,
        hz.CodeBlockEvents.OnPlayerCollision,
        (player: hz.Player) => {
          this.knifeCollidedWithPlayer(player);
        }
      );

      this.connectNetworkBroadcastEvent<{ player: hz.Player }>(
        Events.selectedMurderer,
        (data: { player: hz.Player }) => {
          console.log(
            `[KnifeController] selectedMurderer event received for entity ${data.player.name.get()}`
          );
          this.murderer = data.player;
          this.assignWhoCanPickup({ player: data.player });
        }
      );

      this.connectLocalBroadcastEvent(
        Events.gameStateChanged,
        (data: { fromState: GameState; toState: GameState }) =>
          this.handleGameStateChanged(data.fromState, data.toState)
      );
    

    // Connect to the grab event to cleanup when the weapon is dropped
    this.connectCodeBlockEvent(
      this.entity,
      hz.CodeBlockEvents.OnGrabStart,
      this.knifePickedUp.bind(this)
    );
    this.connectCodeBlockEvent(
      this.entity,
      hz.CodeBlockEvents.OnGrabEnd,

      this.knifeDropped.bind(this)
    );


    this.connectCodeBlockEvent(
      this.entity,
      hz.CodeBlockEvents.OnAttachEnd,
      this.unholsterKnife.bind(this),
    );


   
  }

  start() {
    // Only connect input if this is the local player
    this.owner = this.entity.owner.get()!;
    this.props.trail?.as(hz.TrailGizmo)?.stop();
  }

  toggleKnife(action: hz.PlayerInputAction, pressed: boolean): void {
    if (!pressed) {
      if(!this.knifeHolstered) {
        this.holsterKnife();
        this.disconnectInputs();
      }
  }
}

  handleGameStateChanged(fromState: GameState, toState: GameState) {
    if (toState === GameState.GameOver) {
      // Reset knife state when game is over
      this.entity.transform.position.set(new hz.Vec3(0, 1, 0));
      this.entity.as(hz.GrabbableEntity)?.setWhoCanGrab([]);

      this.thrown = false;
      this.throwForce = 0;
      this.isCharging = false;
      this.readyAnimPlayed = false;
    }
  }

  assignWhoCanPickup({ player }: { player: hz.Player }): void {
    this.entity.interactionMode.set(hz.EntityInteractionMode.Grabbable);
    this.entity.owner.set(player);
    this.entity.as?.(hz.GrabbableEntity).setWhoCanGrab([player]);
    console.log(`Knife assigned to ${player.name.get()} for pickup`);
  }

  knifePickedUp(isRightHand: boolean, player: hz.Player) {
    // Handle knife pickup logic

    this.knifeHeld = true; // Update state
    this.currentHolder = player;
    this.props.trail?.as(hz.TrailGizmo)?.stop();

    this.sendLocalBroadcastEvent(Events.knifeHeldUpdated, {
      entity: this.entity,
      player: player,
      holdingKnife: true,
      tag: this.entity.tags.get()[0] || "",
    });

    LocalCamera.setCameraModeThirdPerson();
    LocalCamera.overrideCameraFOV(20);

    console.log(
      `${this.entity.name.get()}> was grabbed by <${player.name.get()}`
    );
    this.owner = this.entity.owner.get()!;
    this.thrown = false;
    // Reset interaction mode so next throw can re-enable physics reliably
    const physEnt = this.entity.as?.(hz.PhysicalEntity);
    if (physEnt) {
      physEnt.interactionMode.set(hz.EntityInteractionMode.Both);
    }

    if (player.deviceType.get() === hz.PlayerDeviceType.Mobile) {
      // Mobile controls
      this.setupMobileControls(player);
    } else {
      // Web/Desktop controls
      console.log("Setting up desktop controls for knife");
      this.setupDesktopControls(player);
    }

    // assign knife to player with skin
  }

  knifeDropped(player: hz.Player) {
  

    this.knifeHeld = false; // Update state

    console.log(
      `${this.entity.name.get()}> was dropped by <${player.name.get()}`
    );

    this.sendLocalBroadcastEvent(Events.knifeHeldUpdated, {
      entity: this.entity,
      player: player,
      holdingKnife: false,
      tag: this.entity.tags.get()[0] || "",
    });

    this.disconnectInputs();
    this.stopCharging();
    this.throwForce = THROW_FORCE_MIN;
    this.isCharging = false;
    this.knifeHolstered = false;
    this.currentHolder = null;
    this.entity.owner.get().stopAvatarAnimation();

    LocalCamera.setCameraModeFirstPerson();
    LocalCamera.overrideCameraFOV(75);
  }

  knifeCollidedWithEntity(otherEntity: hz.Entity) {
    console.log(`Knife collided with ${otherEntity.name.get()}`);
    this.props.trail?.as(hz.TrailGizmo)?.stop();
   
    // Handle knife collision logic
    // For example, if it hits a player, register an attack
    if (this.thrown) {
      const phys = this.entity.as?.(hz.PhysicalEntity);
       this.props.hitSFX?.as(hz.AudioGizmo).play();
      if (phys) {
        phys.interactionMode.set(hz.EntityInteractionMode.Grabbable);
      }
      this.thrown = false;
    }
  }



  knifeCollidedWithPlayer(player: hz.Player) {
    const shouldKill = player == this.owner || player == this.murderer || player == this.currentHolder;
    console.log(`Knife collision: ${this.entity.name.get()} with ${player.name.get()}`);
    console.log(`Should kill: ${shouldKill}`);
    console.log(this.owner, this.murderer, this.currentHolder);
    if (this.thrown || this.knifeHeld) {
if (!shouldKill) {
      this.eliminatePlayer(player);
    }
    }

    
  }

  eliminatePlayer(player: hz.Player) {
    console.log(`Eliminating player ${player.name.get()}`);
    this.props.stabSFX?.as(hz.AudioGizmo).play();
    this.sendNetworkBroadcastEvent(Events.playerEliminated, { player });
  }

  playerExitedKillbox(player: hz.Player) {
    // Handle player exiting the killbox
    // console.log(`Player ${player.name.get()} exited the killbox.`);
  }

  attemptKnifeAttack(action: hz.PlayerInputAction, pressed: boolean) {
    if (!pressed) {
      return;
    }

    if (!this.knifeHeld || this.knifeHolstered) {
      return;
    }

    if (this.isCharging && this.throwForce >= THROW_CHARGE_READY_THRESHOLD) {
      this.throwKnife();
      return;
    }

    this.entity.owner.get()?.playAvatarGripPoseAnimationByName("Throw");
  }

  throwKnife() {
    // Replace manual impulse with engine-provided throwHeldItem
    const player = this.entity.owner.get();
    if (!player) {
      console.warn("throwKnife: no owner player");
      return;
    }

    if (!this.knifeHeld || this.knifeHolstered) {
      return;
    }

    this.lastThrower = player; // Track the thrower for return
    this.props.throwSFX?.as(hz.AudioGizmo).play();
    // Map throwForce (30-50) to speed; base speed 25 from example, scale up modestly
    const normalized = Math.min(Math.max(this.throwForce, 0), 50) / 50; // 0..1
    const speed = 15 + normalized * 20; // 15 to 35 range
    // Pitch: slight arc; example used 30. Allow a little more when fully charged
    const pitch = 1; // 20..35 degrees
    const playAnimation = true;

    const options = { speed, pitch, yaw: 0, playAnimation } as any; // cast if needed by runtime
    console.log(
      `[KnifeController] throwHeldItem speed=${speed.toFixed(
        1
      )} pitch=${pitch.toFixed(1)} (force=${this.throwForce})`
    );
    try {
      player.throwHeldItem(options);
      this.entity.owner.get()?.playAvatarGripPoseAnimationByName("Throw");
      this.thrown = true;
      this.props.trail?.as(hz.TrailGizmo)?.play();
    } catch (e) {
      console.warn("throwHeldItem failed", e);
    }
    this.stopCharging();
    this.disconnectInputs();
    this.throwForce = THROW_FORCE_MIN; // reset
    this.isCharging = false;
    this.knifeHeld = false;
    this.knifeHolstered = false;
    this.currentHolder = null;
    LocalCamera.setCameraModeFirstPerson();
    LocalCamera.overrideCameraFOV(75);
  }

  private attachToPlayer() {
    const attachable = this.entity.as?.(hz.AttachableEntity);
    if (attachable) {
      attachable.attachToPlayer(
        this.currentHolder!,
        hz.AttachablePlayerAnchor.Torso
      );
    }
  }

  private holsterKnife() {
    // if (!this.knifeHeld || this.knifeHolstered || !this.currentHolder) {
    //   return;
    // }

    this.suppressNextDrop = true;
    this.knifeHolstered = true;
    this.entity.visible.set(false);
    this.disconnectInputs();
    this.stopCharging();
    this.throwForce = THROW_FORCE_MIN;
    this.isCharging = false;

    this.entity.as(hz.AttachableEntity).attachToPlayer(this.owner, hz.AttachablePlayerAnchor.Torso)

    const grabbable = this.entity.as?.(hz.GrabbableEntity);
    //grabbable?.setWhoCanGrab([]);
    // grabbable?.forceRelease();

    LocalCamera.setCameraModeFirstPerson();
    LocalCamera.overrideCameraFOV(75);
  }

  private unholsterKnife() {

    this.knifeHolstered = false;
    this.entity.visible.set(true);

 
    const phys = this.entity.as?.(hz.PhysicalEntity);
    if (phys) {
      phys.interactionMode.set(hz.EntityInteractionMode.Both);
    } else {
      this.entity.interactionMode.set(hz.EntityInteractionMode.Grabbable);
    }

    this.knifeHeld = true;
    this.setupControlsForPlayer(this.owner);
    LocalCamera.setCameraModeThirdPerson();
    LocalCamera.overrideCameraFOV(20);
  }

  aimKnifeToggle(action: hz.PlayerInputAction, pressed: boolean) {
    console.log(`Aim knife action: ${action}, pressed: ${pressed}`);

    if (this.knifeHolstered) {
      return;
    } else {

    if (pressed && !this.knifeHolstered) {
      // Begin charging only on press
      this.throwForce = 15; // base force
      this.isCharging = true;
      this.readyAnimPlayed = false;
      this.entity.owner.get()?.playAvatarGripPoseAnimationByName("ChargeThrow");
      this.startCharging();
      LocalCamera.overrideCameraFOV(65);
    } else {
      // Release
      LocalCamera.overrideCameraFOV(75);
      const accumulatedForce = this.throwForce;
      this.stopCharging();
      const shouldThrow = accumulatedForce > 20; // threshold
      if (shouldThrow) {
        this.throwKnife(); // plays Throw animation
      } else {
        // Only play cancel if we did NOT throw

        this.entity.owner
          .get()
          ?.playAvatarGripPoseAnimationByName("CancelThrow");
      }
    }
    }
  }

  private startCharging() {
    // Start a single timer that increases force

    this.chargeTimer = this.async.setInterval(() => {
      if (!this.isCharging) return;
      if (this.throwForce < 50) {
        this.throwForce += 1;
        // Trigger a "ready" pose once when near max force
        if (this.throwForce >= 45 && !this.readyAnimPlayed) {
          // this.entity.owner
          //   .get()
          //   ?.playAvatarGripPoseAnimationByName("ReadyThrow");
          this.readyAnimPlayed = true;
        }
      }

      // Optionally log sparingly
    }, 100);
  }

  private stopCharging() {
    if (this.chargeTimer !== null) {
      this.async.clearInterval(this.chargeTimer);
      this.chargeTimer = null;
    }
    this.isCharging = false;
  }

  disconnectInputs() {
    this.attackInput?.disconnect();
    this.chargeInput?.disconnect();
    this.holsterToggleInput?.disconnect();
    this.holsterQuickInput?.disconnect();

    this.attackInput = undefined;
    this.chargeInput = undefined;
    this.holsterToggleInput = undefined;
    this.holsterQuickInput = undefined;
  }

  private setupControlsForPlayer(player: hz.Player) {
    this.disconnectInputs();

    if (player.deviceType.get() === hz.PlayerDeviceType.Mobile) {
      this.setupMobileControls(player);
    } else {
      this.setupDesktopControls(player);
    }

    this.currentHolder = player;
  }

  private setupMobileControls(player: hz.Player) {
    this.chargeInput = hz.PlayerControls.connectLocalInput(
      hz.PlayerInputAction.LeftTrigger,
      hz.ButtonIcon.Aim,
      this
    );
    this.chargeInput.registerCallback(this.aimKnifeToggle.bind(this));

    this.attackInput = hz.PlayerControls.connectLocalInput(
      hz.PlayerInputAction.RightTrigger,
      hz.ButtonIcon.SwingWeapon,
      this
    );
    this.attackInput.registerCallback(this.attemptKnifeAttack.bind(this));

    this.holsterToggleInput = hz.PlayerControls.connectLocalInput(
      hz.PlayerInputAction.RightSecondary,
      hz.ButtonIcon.Swap,
      this
    );
    this.holsterToggleInput.registerCallback(this.holsterKnife.bind(this));
  }

  private setupDesktopControls(player: hz.Player) {
    console.log("Setting up desktop controls for knife");

    this.chargeInput = hz.PlayerControls.connectLocalInput(
      hz.PlayerInputAction.LeftTrigger,
      hz.ButtonIcon.Aim,
      this
    );
    this.chargeInput.registerCallback(this.aimKnifeToggle.bind(this));

    this.attackInput = hz.PlayerControls.connectLocalInput(
      hz.PlayerInputAction.RightTrigger,
      hz.ButtonIcon.SwingWeapon,
      this
    );
    this.attackInput.registerCallback(this.attemptKnifeAttack.bind(this));

    this.holsterToggleInput = hz.PlayerControls.connectLocalInput(
      hz.PlayerInputAction.RightSecondary,
      hz.ButtonIcon.Swap,
      this
    );
    this.holsterToggleInput.registerCallback(this.toggleKnife.bind(this));

    // Additional quick-throw using index trigger down (non-VR as per provided snippet)
    this.connectCodeBlockEvent(
      this.entity,
      hz.CodeBlockEvents.OnIndexTriggerDown,
      (p: hz.Player) => {
        if (p.deviceType.get() === hz.PlayerDeviceType.VR) return; // ignore VR per requirement
        // Only allow instant throw if charging has started
        if (this.isCharging) {
          this.throwKnife();
        }
      }
    );
  }
}
hz.Component.register(KnifeController);
