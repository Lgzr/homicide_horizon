import * as hz from "horizon/core";

class HiddenDoorController extends hz.Component<typeof HiddenDoorController> {
  static propsDefinition = {
    concealEntity: { type: hz.PropTypes.Entity },
    triggerVolume: { type: hz.PropTypes.Entity },
    openSFX: { type: hz.PropTypes.Entity },
    closeSFX: { type: hz.PropTypes.Entity },
    slideDirection: { type: hz.PropTypes.String, default: "left" }, // "left" or "right"
    slideDistance: { type: hz.PropTypes.Number, default: 2.0 },
    openDuration: { type: hz.PropTypes.Number, default: 0.8 },
    closeDuration: { type: hz.PropTypes.Number, default: 0.3 },
    stayOpenTime: { type: hz.PropTypes.Number, default: 5.0 },
  };

  // Concealed passage controller - slides entity to reveal hidden passage
  // Opens when player enters trigger, stays open briefly, then closes quickly
  // Can slide left or right based on slideDirection prop
  // Useful for paintings, bookcases, or walls that conceal passages

  private isOpen: boolean = false;
  private isAnimating: boolean = false;
  private closedPosition!: hz.Vec3;
  private openPosition!: hz.Vec3;
  private closeTimer: number | null = null;
  private animationTimer: number | null = null;

  preStart(): void {
    // Connect to trigger volume collision event
    if (this.props.triggerVolume) {
      this.connectCodeBlockEvent(
        this.props.triggerVolume as hz.Entity,
        hz.CodeBlockEvents.OnPlayerEnterTrigger,
        (player: hz.Player) => {
          console.log(
            `Player entered concealed passage trigger: ${player.name.get()}`
          );
          this.openPassage();
        }
      );
    }
  }

  start() {
    // Initialize passage in closed state
    this.isOpen = false;
    this.isAnimating = false;

    // Store the initial closed position
    if (this.props.concealEntity) {
      const entity = this.props.concealEntity as hz.Entity;
      this.closedPosition = entity.transform.localPosition.get();

      // Calculate open position based on slide direction
      const slideDistance = this.props.slideDistance || 2.0;
      const direction = (this.props.slideDirection || "left").toLowerCase();

      if (direction === "left") {
        // Slide to the left (negative X)
        this.openPosition = new hz.Vec3(
          this.closedPosition.x - slideDistance,
          this.closedPosition.y,
          this.closedPosition.z
        );
      } else if (direction === "right") {
        // Slide to the right (positive X)
        this.openPosition = new hz.Vec3(
          this.closedPosition.x + slideDistance,
          this.closedPosition.y,
          this.closedPosition.z
        );
      } else {
        console.warn(
          `Invalid slideDirection: ${direction}. Using 'left' as default.`
        );
        this.openPosition = new hz.Vec3(
          this.closedPosition.x - slideDistance,
          this.closedPosition.y,
          this.closedPosition.z
        );
      }

      console.log(
        `Concealed passage initialized. Closed: ${this.closedPosition}, Open: ${this.openPosition}`
      );
    }
  }

  openPassage(): void {
    if (this.isOpen || this.isAnimating) {
      console.log("Cannot open - passage already open or animating");
      return;
    }

    this.isOpen = true;
    this.isAnimating = true;

    console.log("Opening concealed passage");

    // Play open sound effect
    this.props.openSFX?.as(hz.AudioGizmo)?.play();

    // Animate entity to open position
    this.animateSlide(
      this.closedPosition,
      this.openPosition,
      this.props.openDuration || 0.8,
      () => {
        this.isAnimating = false;
        console.log("Passage fully opened");

        // Start timer to auto-close after stayOpenTime
        const stayOpenTime = (this.props.stayOpenTime || 5.0) * 1000; // Convert to milliseconds
        this.closeTimer = this.async.setTimeout(() => {
          console.log("Auto-closing passage after timeout");
          this.closePassage();
        }, stayOpenTime);
      }
    );
  }

  closePassage(): void {
    if (!this.isOpen || this.isAnimating) {
      console.log("Cannot close - passage already closed or animating");
      return;
    }

    this.isAnimating = true;

    console.log("Closing concealed passage");

    // Play close sound effect
    this.props.closeSFX?.as(hz.AudioGizmo)?.play();

    // Animate entity back to closed position (faster)
    this.animateSlide(
      this.openPosition,
      this.closedPosition,
      this.props.closeDuration || 0.3,
      () => {
        this.isAnimating = false;
        this.isOpen = false;
        console.log("Passage fully closed");
      }
    );

    // Clear timer if exists
    if (this.closeTimer !== null) {
      this.async.clearTimeout(this.closeTimer);
      this.closeTimer = null;
    }
  }

  animateSlide(
    startPos: hz.Vec3,
    endPos: hz.Vec3,
    duration: number,
    onComplete?: () => void
  ): void {
    if (!this.props.concealEntity) {
      onComplete?.();
      return;
    }

    const entity = this.props.concealEntity as hz.Entity;
    const steps = Math.ceil(duration * 60); // 60 steps per second
    let currentStep = 0;

    this.animationTimer = this.async.setInterval(() => {
      currentStep++;
      const t = Math.min(currentStep / steps, 1.0);
      const eased = this.easeInOutQuad(t);

      // Lerp between start and end positions
      const newPos = new hz.Vec3(
        startPos.x + (endPos.x - startPos.x) * eased,
        startPos.y + (endPos.y - startPos.y) * eased,
        startPos.z + (endPos.z - startPos.z) * eased
      );

      entity.transform.localPosition.set(newPos);

      if (t >= 1.0) {
        if (this.animationTimer !== null) {
          this.async.clearInterval(this.animationTimer);
          this.animationTimer = null;
        }
        onComplete?.();
      }
    }, 1000 / 60);
  }

  easeInOutQuad(t: number): number {
    return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
  }
}
hz.Component.register(HiddenDoorController);
