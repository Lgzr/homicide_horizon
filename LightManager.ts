import * as hz from "horizon/core";

export const LightEvents = {
  toggleLightGroup: new hz.LocalEvent<{ groupName: string; state: boolean }>(
    "toggleLightGroup"
  ),

  powerOutage: new hz.LocalEvent<{}>("powerOutage"),

  powerRestored: new hz.LocalEvent<{}>("powerRestored"),
};

class LightManager extends hz.Component<typeof LightManager> {
  static propsDefinition = {
    powerOutageSFX: { type: hz.PropTypes.Entity },
    powerRestoredSFX: { type: hz.PropTypes.Entity },
  };

  private powerOn?: boolean = true;

  preStart(): void {
    // Initialize network event connections
    this.connectNetworkBroadcastEvent(
      LightEvents.toggleLightGroup,
      (data: { groupName: string; state: boolean }) => {
        this.toggleLightGroup(data.groupName, data.state);
      }
    );

    this.connectNetworkBroadcastEvent(LightEvents.powerOutage, () => {
      // Turn off all lights
      this.powerOutage();
    });

    this.connectNetworkBroadcastEvent(LightEvents.powerRestored, () => {
      // Turn on all lights
      this.powerRestored();
    });
  }

  private lightGroups: { [key: string]: hz.Entity[] } = {};

  start() {
    // Initialize light groups
    this.initializeLightGroups();
  }

  powerOutage() {
    if (true) {
      this.powerOn = false;
      this.props.powerOutageSFX?.as(hz.AudioGizmo).play();
      // add slight delay between turning off each group for effect
      Object.keys(this.lightGroups).forEach((groupName) => {
        if (groupName.length > 0) {
          this.async.setTimeout(() => {
            this.toggleLightGroup(groupName, false);
          }, 100 * Object.keys(this.lightGroups).indexOf(groupName));
        }
      });
    }
  }

  powerRestored() {
    if (!this.powerOn) {
      this.powerOn = true;
      this.props.powerRestoredSFX?.as(hz.AudioGizmo).play();
      // add slight delay between turning off each group for effect
      Object.keys(this.lightGroups).forEach((groupName) => {
        if (groupName.length > 0) {
          this.async.setTimeout(() => {
            this.toggleLightGroup(groupName, true);
          }, 100 * Object.keys(this.lightGroups).indexOf(groupName));
        }
      });
    }
  }

  initializeLightGroups() {
    const lightGroup1 = this.world.findEntities("lights-1");
    const lightGroup2 = this.world.findEntities("lights-2");
    const lightGroup3 = this.world.findEntities("lights-3");
    const lightGroup4 = this.world.findEntities("lights-4");
    const lightGroup5 = this.world.findEntities("lights-5");
    const lightGroup6 = this.world.findEntities("lights-6");
    const lightGroup7 = this.world.findEntities("lights-7");

    this.lightGroups!["lights-1"] = lightGroup1;
    this.lightGroups!["lights-2"] = lightGroup2;
    this.lightGroups!["lights-3"] = lightGroup3;
    this.lightGroups!["lights-4"] = lightGroup4;
    this.lightGroups!["lights-5"] = lightGroup5;
    this.lightGroups!["lights-6"] = lightGroup6;
    this.lightGroups!["lights-7"] = lightGroup7;
    console.log(
      `Light groups initialized: ${Object.keys(this.lightGroups).join(", ")}`
    );
  }

  toggleLightGroup(groupName: string, state: boolean) {
    console.log(`Toggling light group ${groupName} to state: ${state}`);
    const group = this.lightGroups[groupName];
    console.log(`Found ${group ? group.length : 0} lights in group.`);
    if (group) {
      group.forEach((light) => {
        console.log(`Setting light ${light.name.get()} to state: ${state}`);
        light.as(hz.DynamicLightGizmo).enabled.set(state);
      });
    } else {
      console.warn(`Light group ${groupName} not found.`);
    }
  }
}
hz.Component.register(LightManager);
