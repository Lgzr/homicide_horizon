/**
 * hudProxy - Combined Modal CustomUI Component for Horizon Worlds
 *
 * This component combines the functionality of RoleModal and GameOverModal
 * into a single local CustomUI that conditionally renders based on game state.
 * - Shows role assignment when game starts (RoleModal view)
 * - Shows game over results when game ends (GameOverModal view)
 * - No E key interaction - only triggered programmatically
 */

import * as hz from 'horizon/core';
import { Asset, PropTypes } from 'horizon/core';
import { UIComponent, View, Text, Image, ImageSource } from 'horizon/ui';
import { Events, WinState } from './GameUtil';

enum ModalMode {
  Hidden = 'hidden',
  RoleDisplay = 'roleDisplay',
  GameOver = 'gameOver'
}

class HudProxy extends UIComponent {
  protected readonly panelWidth = 500;
  protected readonly panelHeight = 500;

  static propsDefinition = {
    MurdererImage: { type: PropTypes.Asset },
    KnifeImage: { type: PropTypes.Asset },
    GunImage: { type: PropTypes.Asset },
    DetectiveImage: { type: PropTypes.Asset }
  };

  // Current mode of the modal
  private currentMode: ModalMode = ModalMode.Hidden;

  // Role display data
  private playerRole: string = 'Innocent';
  private roleColor: string = '#3fff30'; // Default to innocent green
  private murdererChance: number = 4;

  // Game over data
  private winnerText: string = 'The Detective has saved the day!';
  private winnerColor: string = '#526fff';
  private murdererName: string = 'username';
  private detectiveName: string = 'username';
  private survivalTime: string = '0m 34s';
  private xpGained: number = 100;
  private innocentCount: number = 1;
  private murdererCount: number = 2;

  async start() {
    // Listen for show role event
    this.connectLocalBroadcastEvent(
      Events.showRoleModal,
      (data: { role: string; murdererChance: number }) => {
        this.showRoleModal(data.role, data.murdererChance);
      }
    );

    // Listen for show game over event
    this.connectLocalBroadcastEvent(
      Events.showGameOverModal,
      (data: {
        winState: WinState;
        murdererName: string;
        detectiveName: string;
        survivalTime: string;
        xpGained: number;
        innocentCount: number;
        murdererCount: number;
      }) => {
        this.showGameOverModal(data);
      }
    );

    // Listen for hide modal event
    this.connectLocalBroadcastEvent(Events.hideModal, () => {
      this.hideModal();
    });

    // Start hidden
    this.entity.visible.set(false);
  }

  /**
   * Show the role modal view
   */
  private showRoleModal(role: string, murdererChance: number): void {
    this.currentMode = ModalMode.RoleDisplay;
    this.playerRole = role;
    this.murdererChance = murdererChance;

    // Set role-specific color
    switch (role) {
      case 'Murderer':
        this.roleColor = '#d40000';
        break;
      case 'Detective':
        this.roleColor = '#526fff';
        break;
      case 'Innocent':
      default:
        this.roleColor = '#3fff30';
        break;
    }

    // Rebuild UI with role view
    this.rebuildUI();
    this.entity.visible.set(true);

    // Auto-hide after 5 seconds
    this.async.setTimeout(() => {
      this.hideModal();
    }, 5000);
  }

  /**
   * Show the game over modal view
   */
  private showGameOverModal(data: {
    winState: WinState;
    murdererName: string;
    detectiveName: string;
    survivalTime: string;
    xpGained: number;
    innocentCount: number;
    murdererCount: number;
  }): void {
    this.currentMode = ModalMode.GameOver;
    this.murdererName = data.murdererName;
    this.detectiveName = data.detectiveName;
    this.survivalTime = data.survivalTime;
    this.xpGained = data.xpGained;
    this.innocentCount = data.innocentCount;
    this.murdererCount = data.murdererCount;

    // Set winner-specific text and color
    switch (data.winState) {
      case WinState.InnocentsWin:
        this.winnerText = 'The Detective has saved the day!';
        this.winnerColor = '#526fff';
        break;
      case WinState.MurdererWins:
        this.winnerText = 'The Murderer has won!';
        this.winnerColor = '#d40000';
        break;
      case WinState.Draw:
        this.winnerText = 'It\'s a Draw!';
        this.winnerColor = '#ffffff';
        break;
    }

    // Rebuild UI with game over view
    this.rebuildUI();
    this.entity.visible.set(true);

    // Auto-hide after 10 seconds
    this.async.setTimeout(() => {
      this.hideModal();
    }, 10000);
  }

  /**
   * Hide the modal
   */
  private hideModal(): void {
    this.currentMode = ModalMode.Hidden;
    this.entity.visible.set(false);
  }

  /**
   * Rebuild the UI based on current mode
   * Note: In Horizon, we can't dynamically rebuild UI after initialization.
   * Instead, we hide/show and update by making the entity visible/invisible
   * and relying on the initial UI structure.
   */
  private rebuildUI(): void {
    // The UI is built once in initializeUI, and we control visibility
    // through entity.visible.set()
  }

  initializeUI() {
    // Return different UI based on current mode
    if (this.currentMode === ModalMode.RoleDisplay) {
      return this.createRoleModalUI();
    } else if (this.currentMode === ModalMode.GameOver) {
      return this.createGameOverModalUI();
    } else {
      // Hidden state - return minimal UI
      return View({
        style: {
          width: 0,
          height: 0
        },
        children: []
      });
    }
  }

  /**
   * Create the role modal UI (based on RoleModal.ts)
   */
  private createRoleModalUI() {
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
                          text: this.playerRole,
                          style: {
                            color: this.roleColor,
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
                      text: `your chance to be murderer: ${this.murdererChance}%`,
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

  /**
   * Create the game over modal UI (based on GameOverModal.ts)
   */
  private createGameOverModalUI() {
    // Helper method to create image with placeholder fallback
    const createImageOrPlaceholder = (asset: Asset | undefined, style: any, children?: any[]) => {
      if (children && children.length > 0) {
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
        width: '100%',
        height: '100%',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
      },
      children: [
        View({
          style: {
            width: 462,
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
                width: 446,
                justifyContent: 'center',
                alignItems: 'center',
                flexDirection: 'row',
                height: 21
              },
              children: [
                View({
                  style: {
                    width: 446,
                    justifyContent: 'center',
                    height: 29,
                    marginBottom: -5
                  },
                  children: [
                    Text({
                      text: this.winnerText,
                      style: {
                        color: this.winnerColor,
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
                alignSelf: 'stretch',
                height: 165,
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
                            paddingTop: 6,
                            paddingBottom: 6,
                            backgroundColor: '#d40000',
                            flexDirection: 'column',
                            justifyContent: 'center',
                            alignItems: 'center'
                          },
                          children: [
                            View({
                              style: {
                                alignSelf: 'stretch',
                                height: 13,
                                justifyContent: 'center'
                              },
                              children: [
                                Text({
                                  text: this.murdererName,
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
                                    paddingTop: 6,
                                    paddingBottom: 6,
                                    backgroundColor: '#878787',
                                    flexDirection: 'column',
                                    justifyContent: 'center',
                                    alignItems: 'center'
                                  },
                                  children: [
                                    View({
                                      style: {
                                        alignSelf: 'stretch',
                                        height: 9,
                                        justifyContent: 'center'
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
                                    paddingTop: 6,
                                    paddingBottom: 6,
                                    backgroundColor: '#878787',
                                    flexDirection: 'column',
                                    justifyContent: 'center',
                                    alignItems: 'center'
                                  },
                                  children: [
                                    View({
                                      style: {
                                        alignSelf: 'stretch',
                                        height: 9,
                                        justifyContent: 'center'
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
                            paddingTop: 6,
                            paddingBottom: 6,
                            backgroundColor: '#5370ff',
                            flexDirection: 'column',
                            justifyContent: 'center',
                            alignItems: 'center'
                          },
                          children: [
                            View({
                              style: {
                                alignSelf: 'stretch',
                                height: 13,
                                justifyContent: 'center'
                              },
                              children: [
                                Text({
                                  text: this.detectiveName,
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
                          text: this.innocentCount.toString(),
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
                          text: this.murdererCount.toString(),
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
            alignSelf: 'stretch',
            height: 45,
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center'
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
                      text: `Survived ${this.survivalTime}`,
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
                      text: `+${this.xpGained} XP`,
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

UIComponent.register(HudProxy);
