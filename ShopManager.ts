import * as hz from 'horizon/core';

class ShopManager extends hz.Component<typeof ShopManager> {
  static propsDefinition = {};

  preStart(): void {
    // Initialize network event connections
  }

  start() {

  }

  purchasedKnifeSkin(skinIndex: number) {
    // Handle knife skin purchase logic
  }

  purchasedRevolverSkin(skinIndex: number) {
    // Handle revolver skin purchase logic
  }
}
hz.Component.register(ShopManager);