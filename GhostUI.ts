import * as hz from 'horizon/core';
import {UIComponent, View, Text} from 'horizon/ui';

class GhostUI extends UIComponent {
  static propsDefinition = {};

  panelHeight = 200; // the default value is 500
  panelWidth = 460; // the default value is 500

  start() {

  }

  initializeUI() {
    return View({
    
      children: Text({text: 'Hello World', style: {color: 'black'}}),
      style: {backgroundColor: 'white'},
    });
  }
}
UIComponent.register(GhostUI);