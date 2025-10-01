import * as hz from "horizon/core";
import { LeaderboardEvents } from "LeaderboardEvents";

class Server extends hz.Component<typeof Server> {
  static propsDefinition = {};

  start() {
    this.startMinuteLoop();
  }

  startMinuteLoop() {
    this.async.setInterval(() => {
      console.log("Incrementing Time Played for all players");
      this.world.getPlayers().forEach((player) => {
        this.sendNetworkBroadcastEvent(LeaderboardEvents.IncrementTimePlayed, {
          player: player,
          amount: 1,
        });
      });
    }, 60000); // 60000 ms = 1 minute
  }
}
hz.Component.register(Server);
