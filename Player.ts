import * as hz from "horizon/core";

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
}




class Player extends hz.Component<typeof Player> {
  static propsDefinition = { };


  preStart(): void {
  
  }

  start() {
   // this.owner.get().CrouchSpeed.set(PlayerSettings.CrouchSpeed)?;
  }
}
hz.Component.register(Player);
