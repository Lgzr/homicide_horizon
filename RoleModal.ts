/**
 * RoleModal - CustomUI Component for Horizon Worlds
 *
 * Converted from Figma JSX (figmatocode output)
 * Converter: figma-to-horizon-v2.js
 */

import 'horizon/core';
import { UIComponent, View, Text } from 'horizon/ui';

class RoleModal extends UIComponent {
  protected readonly panelWidth = 500;
  protected readonly panelHeight = 500;

  initializeUI() {
    return View({
      style: {
        width: 500,
        height: 500,
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center'
      },
      children: [
        View({
          style: {
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center'
          },
          children: [
            View({
              style: {
                width: 234,
                paddingTop: 8,
                paddingBottom: 8,
                backgroundColor: '#303030',
                borderRadius: 4,
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                overflow: 'hidden'
              },
              children: [
                View({
                  style: {
                    alignSelf: 'stretch',
                    justifyContent: 'center',
                    alignItems: 'center',
                    flexDirection: 'row',
                    height: 12
                  },
                  children: [
                    View({
                      style: {
                        flex: 1,
                        justifyContent: 'center',
                        height: 17,
                        marginBottom: -3
                      },
                      children: [
                        Text({
                          text: 'You Are',
                          style: {
                            color: 'white',
                            fontSize: 14,
                            fontFamily: 'Oswald',
                            fontWeight: '400',
                            textAlign: 'center',
                            textAlignVertical: 'center',
                            marginTop: 0,
                            marginBottom: 0
                          },
                        })
                      ],
                    })
                  ],
                }),
                View({
                  style: {
                    alignSelf: 'stretch',
                    justifyContent: 'center',
                    alignItems: 'center',
                    flexDirection: 'row',
                    height: 31
                  },
                  children: [
                    View({
                      style: {
                        flex: 1,
                        justifyContent: 'center',
                        opacity: 0.9,
                        height: 43,
                        marginBottom: -7
                      },
                      children: [
                        Text({
                          text: 'Innocent',
                          style: {
                            color: '#3fff30',
                            fontSize: 36,
                            fontFamily: 'Oswald',
                            fontWeight: '400',
                            textAlign: 'center',
                            textAlignVertical: 'center',
                            marginTop: 0,
                            marginBottom: 0
                          },
                        })
                      ],
                    })
                  ],
                })
              ],
            }),
            View({
              style: {
                alignSelf: 'stretch',
                paddingTop: 8,
                justifyContent: 'center',
                alignItems: 'center',
                flexDirection: 'row'
              },
              children: [
                View({
                  style: {
                    flex: 1,
                    justifyContent: 'center',
                    height: 17,
                    marginBottom: -3
                  },
                  children: [
                    Text({
                      text: 'your chance to be murderer: 4%',
                      style: {
                        color: 'white',
                        fontSize: 14,
                        fontFamily: 'Oswald',
                        fontWeight: '400',
                        textAlign: 'center',
                        letterSpacing: 0.4,
                        textAlignVertical: 'center',
                        marginTop: 0,
                        marginBottom: 0
                      },
                    })
                  ],
                })
              ],
            })
          ],
        })
      ],
    });
  }
}

UIComponent.register(RoleModal);