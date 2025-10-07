/**
 * GameOverModal - CustomUI Component for Horizon Worlds
 *
 * Converted from Figma JSX (figmatocode output)
 * Converter: figma-to-horizon-v2.js
 */

import { Asset, PropTypes } from 'horizon/core';
import { UIComponent, View, Text, Image, ImageSource } from 'horizon/ui';

class GameOverModal extends UIComponent {
  protected readonly panelWidth = 500;
  protected readonly panelHeight = 500;

  static propsDefinition = {
    MurdererImage: { type: PropTypes.Asset },
    KnifeImage: { type: PropTypes.Asset },
    GunImage: { type: PropTypes.Asset },
    DetectiveImage: { type: PropTypes.Asset }
  };

  initializeUI() {
    // Helper method to create image with placeholder fallback
    const createImageOrPlaceholder = (asset: Asset | undefined, style: any, children?: any[]) => {
      if (children && children.length > 0) {
        // When there are children, create a wrapper View with the full style
        const content = asset && asset.id ? Image({
          source: ImageSource.fromTextureAsset(asset),
          style: { width: style.width, height: style.height, position: 'absolute', top: 0, left: 0 }
        }) : View({
          style: { width: style.width, height: style.height, backgroundColor: '#878787', position: 'absolute', top: 0, left: 0 }
        });
        return View({
          style: { ...style, overflow: 'hidden' },
          children: [content, ...children]
        });
      }
      // Simple image without children
      const content = asset && asset.id ? Image({
        source: ImageSource.fromTextureAsset(asset),
        style: { width: style.width, height: style.height }
      }) : View({
        style: { width: style.width, height: style.height, backgroundColor: '#878787' }
      });
      return content;
    };

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
            padding: 8,
            backgroundColor: '#141414',
            opacity: 0.9,
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
                height: 21
              },
              children: [
                View({
                  style: {
                    flex: 1,
                    justifyContent: 'center',
                    height: 29,
                    marginBottom: -5
                  },
                  children: [
                    Text({
                      text: 'The Detective has saved the day!',
                      style: {
                        color: '#526fff',
                        fontSize: 24,
                        fontFamily: 'Oswald',
                        fontWeight: '400',
                        textAlign: 'center',
                        letterSpacing: 1.74,
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
                paddingTop: 8,
                paddingBottom: 8,
                justifyContent: 'center',
                alignItems: 'center',
                flexDirection: 'row'
              },
              children: [
                View({
                  style: {
                    justifyContent: 'center',
                    alignItems: 'center',
                    flexDirection: 'row'
                  },
                  children: [
                    View({
                      style: {
                        borderRadius: 4,
                        flexDirection: 'column',
                        justifyContent: 'center',
                        alignItems: 'center',
                        overflow: 'hidden'
                      },
                      children: [
                        createImageOrPlaceholder(this.props.MurdererImage, {
                          width: 128,
                          height: 128,
                          paddingTop: 8,
                          flexDirection: 'column',
                          justifyContent: 'flex-start',
                          alignItems: 'center'
                        }, [
                          View({
                            style: {
                              justifyContent: 'flex-start',
                              height: 19,
                              marginBottom: -3
                            },
                            children: [
                              Text({
                                text: 'Murderer',
                                style: {
                                  color: 'white',
                                  fontSize: 16,
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
                        ]),
                        View({
                          style: {
                            alignSelf: 'stretch',
                            height: 21,
                            backgroundColor: '#d40000',
                            flexDirection: 'column',
                            justifyContent: 'center',
                            alignItems: 'center'
                          },
                          children: [
                            View({
                              style: {
                                alignSelf: 'stretch',
                                flex: 1,
                                justifyContent: 'center',
                                height: 19,
                                marginBottom: -3
                              },
                              children: [
                                Text({
                                  text: 'username',
                                  style: {
                                    color: 'white',
                                    fontSize: 16,
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
                        paddingLeft: 4,
                        flexDirection: 'column',
                        justifyContent: 'center',
                        alignItems: 'center'
                      },
                      children: [
                        View({
                          style: {
                            alignSelf: 'stretch',
                            flex: 1,
                            justifyContent: 'flex-end',
                            alignItems: 'center',
                            flexDirection: 'row',
                            height: 31
                          },
                          children: [
                            View({
                              style: {
                                justifyContent: 'center',
                                height: 43,
                                marginBottom: -7
                              },
                              children: [
                                Text({
                                  text: 'v',
                                  style: {
                                    color: 'white',
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
                        }),
                        View({
                          style: {
                            paddingRight: 4,
                            justifyContent: 'center',
                            alignItems: 'center',
                            flexDirection: 'row'
                          },
                          children: [
                            View({
                              style: {
                                borderRadius: 4,
                                flexDirection: 'column',
                                justifyContent: 'center',
                                alignItems: 'center',
                                overflow: 'hidden'
                              },
                              children: [
                                createImageOrPlaceholder(this.props.KnifeImage, {
                                  width: 87,
                                  height: 87
                                }),
                                View({
                                  style: {
                                    alignSelf: 'stretch',
                                    height: 17,
                                    backgroundColor: '#878787',
                                    flexDirection: 'column',
                                    justifyContent: 'center',
                                    alignItems: 'center'
                                  },
                                  children: [
                                    View({
                                      style: {
                                        alignSelf: 'stretch',
                                        flex: 1,
                                        justifyContent: 'center',
                                        height: 13,
                                        marginBottom: -2
                                      },
                                      children: [
                                        Text({
                                          text: 'default',
                                          style: {
                                            color: 'white',
                                            fontSize: 11,
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
                            })
                          ],
                        })
                      ],
                    })
                  ],
                }),
                View({
                  style: {
                    justifyContent: 'center',
                    alignItems: 'center',
                    flexDirection: 'row'
                  },
                  children: [
                    View({
                      style: {
                        alignSelf: 'stretch',
                        paddingRight: 4,
                        flexDirection: 'column',
                        justifyContent: 'center',
                        alignItems: 'center'
                      },
                      children: [
                        View({
                          style: {
                            alignSelf: 'stretch',
                            flex: 1,
                            justifyContent: 'flex-start',
                            alignItems: 'center',
                            flexDirection: 'row',
                            height: 31
                          },
                          children: [
                            View({
                              style: {
                                justifyContent: 'center',
                                height: 43,
                                marginBottom: -7
                              },
                              children: [
                                Text({
                                  text: 's',
                                  style: {
                                    color: 'white',
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
                        }),
                        View({
                          style: {
                            paddingLeft: 4,
                            justifyContent: 'center',
                            alignItems: 'center',
                            flexDirection: 'row'
                          },
                          children: [
                            View({
                              style: {
                                borderRadius: 4,
                                flexDirection: 'column',
                                justifyContent: 'center',
                                alignItems: 'center',
                                overflow: 'hidden'
                              },
                              children: [
                                createImageOrPlaceholder(this.props.GunImage, {
                                  width: 87,
                                  height: 87
                                }),
                                View({
                                  style: {
                                    alignSelf: 'stretch',
                                    height: 17,
                                    backgroundColor: '#878787',
                                    flexDirection: 'column',
                                    justifyContent: 'center',
                                    alignItems: 'center'
                                  },
                                  children: [
                                    View({
                                      style: {
                                        alignSelf: 'stretch',
                                        flex: 1,
                                        justifyContent: 'center',
                                        height: 13,
                                        marginBottom: -2
                                      },
                                      children: [
                                        Text({
                                          text: 'default',
                                          style: {
                                            color: 'white',
                                            fontSize: 11,
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
                            })
                          ],
                        })
                      ],
                    }),
                    View({
                      style: {
                        borderRadius: 4,
                        flexDirection: 'column',
                        justifyContent: 'center',
                        alignItems: 'center',
                        overflow: 'hidden'
                      },
                      children: [
                        createImageOrPlaceholder(this.props.DetectiveImage, {
                          width: 128,
                          height: 128,
                          paddingTop: 8,
                          flexDirection: 'column',
                          justifyContent: 'flex-start',
                          alignItems: 'center'
                        }, [
                          View({
                            style: {
                              justifyContent: 'flex-start',
                              height: 19,
                              marginBottom: -3
                            },
                            children: [
                              Text({
                                text: 'Detective',
                                style: {
                                  color: 'white',
                                  fontSize: 16,
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
                        ]),
                        View({
                          style: {
                            alignSelf: 'stretch',
                            height: 21,
                            backgroundColor: '#5370ff',
                            flexDirection: 'column',
                            justifyContent: 'center',
                            alignItems: 'center'
                          },
                          children: [
                            View({
                              style: {
                                alignSelf: 'stretch',
                                flex: 1,
                                justifyContent: 'center',
                                height: 19,
                                marginBottom: -3
                              },
                              children: [
                                Text({
                                  text: 'username',
                                  style: {
                                    color: 'white',
                                    fontSize: 16,
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
                flexDirection: 'row'
              },
              children: [
                View({
                  style: {
                    width: 28,
                    height: 28,
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center'
                  },
                  children: [
                    View({
                      style: {
                        alignSelf: 'stretch',
                        height: 29,
                        justifyContent: 'center'
                      },
                      children: [
                        Text({
                          text: '1',
                          style: {
                            color: 'white',
                            fontSize: 16,
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
                    flex: 1,
                    alignSelf: 'stretch',
                    paddingTop: 4,
                    paddingBottom: 4,
                    justifyContent: 'center',
                    alignItems: 'center',
                    flexDirection: 'row'
                  },
                  children: [
                    View({
                      style: {
                        flex: 1,
                        borderRadius: 4,
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        overflow: 'hidden',
                        flexDirection: 'row'
                      },
                      children: [
                        View({
                          style: {
                            width: 137,
                            height: 20,
                            backgroundColor: '#00ff08'
                          },
                        }),
                        View({
                          style: {
                            flex: 1,
                            height: 20,
                            backgroundColor: '#d40000'
                          },
                        })
                      ],
                    })
                  ],
                }),
                View({
                  style: {
                    width: 28,
                    height: 28,
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center'
                  },
                  children: [
                    View({
                      style: {
                        alignSelf: 'stretch',
                        flex: 1,
                        justifyContent: 'center',
                        height: 19,
                        marginBottom: -3
                      },
                      children: [
                        Text({
                          text: '2',
                          style: {
                            color: 'white',
                            fontSize: 16,
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
            })
          ],
        }),
        View({
          style: {
            paddingTop: 4,
            flexDirection: 'column',
            justifyContent: 'flex-start',
            alignItems: 'flex-start'
          },
          children: [
            View({
              style: {
                width: 387,
                padding: 8,
                backgroundColor: '#141414',
                opacity: 0.9,
                borderRadius: 4,
                justifyContent: 'space-between',
                alignItems: 'center',
                overflow: 'hidden',
                flexDirection: 'row'
              },
              children: [
                View({
                  style: {
                    justifyContent: 'center',
                    height: 22,
                    marginBottom: -4
                  },
                  children: [
                    Text({
                      text: 'Survived 0m 34s',
                      style: {
                        color: '#00ff08',
                        fontSize: 18,
                        fontFamily: 'Oswald',
                        fontWeight: '400',
                        textAlign: 'center',
                        letterSpacing: 1.44,
                        textAlignVertical: 'center',
                        marginTop: 0,
                        marginBottom: 0
                      },
                    })
                  ],
                }),
                View({
                  style: {
                    justifyContent: 'center',
                    height: 22,
                    marginBottom: -4
                  },
                  children: [
                    Text({
                      text: '+100 XP',
                      style: {
                        color: 'white',
                        fontSize: 18,
                        fontFamily: 'Oswald',
                        fontWeight: '400',
                        textAlign: 'center',
                        letterSpacing: 1.74,
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

UIComponent.register(GameOverModal);