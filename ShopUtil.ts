import * as hz from "horizon/core";

export const ShopEvents = {
  knifeSkinUpdated: new hz.LocalEvent<{
    player: hz.Player;
    knife_index: number;
  }>("knifeSkinUpdated"),
};

// create state switch that returns knife tag from index
export function getKnifeTagFromIndex(index: number): string {
  switch (index) {
    case 0:
      return "knife_default";
    case 1:
      return "knife_red";
    case 2:
      return "knife_blue";
    case 3:
      return "knife_green";
    case 4:
      return "knife_yellow";
    case 5:
      return "knife_purple";
    case 6:
      return "knife_orange";

    default:
      return "knife_default";
  }
}
