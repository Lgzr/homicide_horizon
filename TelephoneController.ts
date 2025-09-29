import { Events } from "GameUtil";
import * as hz from "horizon/core";

class TelephoneController extends hz.Component<typeof TelephoneController> {
  static propsDefinition = {
    ringSFX: { type: hz.PropTypes.Entity },
    answerSFX: { type: hz.PropTypes.Entity },
    hangupSFX: { type: hz.PropTypes.Entity },
  };

  private phoneRinging: boolean = false;

  preStart() {
    this.connectNetworkBroadcastEvent<{}>(Events.startPhoneRinging, () => {
      this.startPhoneRing();
    });

    this.connectCodeBlockEvent(
      this.entity,
      hz.CodeBlockEvents.OnPlayerCollision,
      (player: hz.Player) => {
        if (this.phoneRinging) {
          this.answerPhone();
        }
      }
    );
  }

  start() {
    //this.startPhoneRing();
  }

  startPhoneRing() {
    // phone rings for 45 seconds, plays a ring sound every 5 seconds
    this.phoneRinging = true;
    console.log("Phone is ringing...");

    this.props.ringSFX?.as(hz.AudioGizmo).play();
    this.async.setInterval(() => {
      if (this.phoneRinging) {
        this.props.ringSFX?.as(hz.AudioGizmo).play();
      }
    }, 5000);

    this.async.setTimeout(() => {
      this.props.hangupSFX?.as(hz.AudioGizmo).play();
      this.phoneRinging = false;
      console.log("Phone stopped ringing.");
    }, 45000);
  }

  answerPhone(player?: hz.Player) {
    if (this.phoneRinging) {
      this.props.ringSFX?.as(hz.AudioGizmo).stop();
      this.props.answerSFX?.as(hz.AudioGizmo).play();
      this.phoneRinging = false;
      player?.playAvatarGripPoseAnimationByName(
        hz.AvatarGripPoseAnimationNames.Throw
      );
      console.log("Phone answered.");

      this.async.setTimeout(() => {
        this.props.hangupSFX?.as(hz.AudioGizmo).play();
        console.log("Call ended.");
      }, 10000); // Call lasts for 10 seconds
    }
  }
}
hz.Component.register(TelephoneController);
