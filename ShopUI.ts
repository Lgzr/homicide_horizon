import * as hz from 'horizon/core';

class KnifeShop extends hz.Component<typeof KnifeShop> {
  static propsDefinition = {};

  preStart(): void {
    // Initialize network event connections
  }

  start() {

  }

  // create buttons for each knife skin
  // on button press, call ShopManager to handle purchase
  purchaseKnifeSkin(skinIndex: number) {
    // Handle knife skin purchase logic
  }
}
hz.Component.register(KnifeShop);