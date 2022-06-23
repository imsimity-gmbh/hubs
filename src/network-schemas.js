function registerNetworkSchemas() {
  const vectorRequiresUpdate = epsilon => {
    return () => {
      let prev = null;

      return curr => {
        if (prev === null) {
          prev = new THREE.Vector3(curr.x, curr.y, curr.z);
          return true;
        } else if (!NAF.utils.almostEqualVec3(prev, curr, epsilon)) {
          prev.copy(curr);
          return true;
        }

        return false;
      };
    };
  };

  // Note: networked template ids are semantically important. We use the template suffix as a filter
  // for allowing and authorizing messages in reticulum.
  // See `spawn_permitted?` in https://github.com/mozilla/reticulum/blob/master/lib/ret_web/channels/hub_channel.ex

  // NAF schemas have been extended with a custom nonAuthorizedComponents property that is used to skip authorization
  // on certain components and properties regardless of hub or user permissions. See permissions-utils.js.

  NAF.schemas.add({
    template: "#remote-avatar",
    components: [
      {
        component: "position",
        requiresNetworkUpdate: vectorRequiresUpdate(0.001)
      },
      {
        component: "rotation",
        requiresNetworkUpdate: vectorRequiresUpdate(0.5)
      },
      {
        component: "scale",
        requiresNetworkUpdate: vectorRequiresUpdate(0.001)
      },
      "player-info",
      "networked-avatar",
      {
        selector: ".camera",
        component: "position",
        requiresNetworkUpdate: vectorRequiresUpdate(0.001)
      },
      {
        selector: ".camera",
        component: "rotation",
        requiresNetworkUpdate: vectorRequiresUpdate(0.5)
      },
      {
        selector: ".left-controller",
        component: "position",
        requiresNetworkUpdate: vectorRequiresUpdate(0.001)
      },
      {
        selector: ".left-controller",
        component: "rotation",
        requiresNetworkUpdate: vectorRequiresUpdate(0.5)
      },
      {
        selector: ".left-controller",
        component: "visible"
      },
      {
        selector: ".right-controller",
        component: "position",
        requiresNetworkUpdate: vectorRequiresUpdate(0.001)
      },
      {
        selector: ".right-controller",
        component: "rotation",
        requiresNetworkUpdate: vectorRequiresUpdate(0.5)
      },
      {
        selector: ".right-controller",
        component: "visible"
      }
    ]
  });

  NAF.schemas.add({
    template: "#interactable-media",
    components: [
      {
        component: "position",
        requiresNetworkUpdate: vectorRequiresUpdate(0.001)
      },
      {
        component: "rotation",
        requiresNetworkUpdate: vectorRequiresUpdate(0.5)
      },
      {
        component: "scale",
        requiresNetworkUpdate: vectorRequiresUpdate(0.001)
      },
      // TODO: Optimize checking mediaOptions with requiresNetworkUpdate.
      "media-loader",
      {
        component: "media-video",
        property: "time"
      },
      {
        component: "media-video",
        property: "videoPaused"
      },
      {
        component: "media-pdf",
        property: "index"
      },
      "pinnable"
    ],
    nonAuthorizedComponents: [
      {
        component: "media-video",
        property: "time"
      },
      {
        component: "media-video",
        property: "videoPaused"
      },
      {
        component: "media-pager",
        property: "index"
      }
    ]
  });

  NAF.schemas.add({
    template: "#interactable-emoji",
    components: [
      {
        component: "position",
        requiresNetworkUpdate: vectorRequiresUpdate(0.001)
      },
      {
        component: "rotation",
        requiresNetworkUpdate: vectorRequiresUpdate(0.5)
      },
      {
        component: "emoji",
        property: "emitEndTime"
      },
      {
        component: "emoji",
        property: "particleEmitterConfig"
      },
      {
        component: "scale",
        requiresNetworkUpdate: vectorRequiresUpdate(0.001)
      },
      "media-loader",
      "pinnable",
      {
        selector: ".particle-emitter",
        component: "particle-emitter"
      }
    ]
  });

  NAF.schemas.add({
    template: "#interactable-media-frame",
    components: [
      {
        component: "media-frame",
        property: "targetId"
      },
      {
        component: "media-frame",
        property: "originalTargetScale"
      }
    ],
    // TODO we probably want media frames to support permissioning of some form
    nonAuthorizedComponents: ["media-frame"]
  });

  NAF.schemas.add({
    template: "#static-media",
    components: [
      // TODO: Optimize checking mediaOptions with requiresNetworkUpdate.
      "media-loader",
      {
        component: "media-video",
        property: "time"
      }
    ],
    nonAuthorizedComponents: [
      {
        component: "media-video",
        property: "time"
      }
    ]
  });

  NAF.schemas.add({
    template: "#static-controlled-media",
    components: [
      // TODO: Optimize checking mediaOptions with requiresNetworkUpdate.
      "media-loader",
      {
        component: "media-video",
        property: "time"
      },
      {
        component: "media-video",
        property: "videoPaused"
      },
      {
        component: "media-pdf",
        property: "index"
      }
    ],
    nonAuthorizedComponents: [
      {
        component: "media-video",
        property: "time"
      },
      {
        component: "media-video",
        property: "videoPaused"
      },
      {
        component: "media-pager",
        property: "index"
      }
    ]
  });

  NAF.schemas.add({
    template: "#interactable-drawing",
    components: [
      {
        component: "position",
        requiresNetworkUpdate: vectorRequiresUpdate(0.001)
      },
      {
        component: "rotation",
        requiresNetworkUpdate: vectorRequiresUpdate(0.5)
      },
      {
        component: "scale",
        requiresNetworkUpdate: vectorRequiresUpdate(0.001)
      },
      "networked-drawing"
    ]
  });

  NAF.schemas.add({
    template: "#interactable-camera",
    components: [
      "position",
      "rotation",
      {
        component: "camera-tool",
        property: "isSnapping"
      },
      {
        component: "camera-tool",
        property: "isRecording"
      },
      {
        component: "camera-tool",
        property: "label"
      }
    ]
  });

  NAF.schemas.add({
    template: "#interactable-machine-camera",
    components: [
      "position",
      "rotation",
      {
        component: "machine-tool",
        property: "buttonId"
      },
      {
        component: "machine-tool",
        property: "fakebuttonId"
      },
      {
        component: "machine-tool",
        property: "helpedClick"
      }
    ]
  });

  NAF.schemas.add({
    template: "#interactable-stopwatch-camera",
    components: [
      "position",
      "rotation",
      {
        selector: ".stopwatch-wrapper",
        component: "position",
      },
      {
        selector: ".stopwatch-wrapper",
        component: "rotation",
      },
      {
        selector: ".stopwatch-tool",
        component: "stopwatch-tool",
        property: "startClicked"
      },
      {
        selector: ".stopwatch-tool",
        component: "stopwatch-tool",
        property: "resetClicked"
      },
      {
        selector: ".stopwatch-tool",
        component: "stopwatch-tool",
        property: "currentTime"
      }
    ]
  });

  NAF.schemas.add({
    template: "#interactable-example-camera",
    components: [
      "position",
      "rotation",
      {
        selector: ".testing-ground-wrapper",
        component: "position"
      },
      {
        selector: ".testing-ground-wrapper",
        component: "rotation"
      },
      {
        selector: ".socket-test-wrapper",
        component: "position"
      },
      {
        selector: ".socket-test-wrapper",
        component: "rotation"
      },
      {
        selector: ".testing-box2",
        component: "position"
      },
      {
        selector: ".testing-box2",
        component: "rotation"
      },
      {
        selector: ".testing-box3",
        component: "position"
      },
      {
        selector: ".testing-box3",
        component: "rotation"
      },
      {
        selector: ".test-trigger-zone",
        component: "position"
      },
      {
        selector: ".test-trigger-zone",
        component: "rotation"
      },
      {
        selector: ".multiple-choice-wrapper",
        component: "position"
      },
      {
        selector: ".multiple-choice-wrapper",
        component: "rotation"
      },
      {
        selector: ".answer-area",
        component: "position"
      },
      {
        selector: ".answer-area",
        component: "rotation"
      },
      {
        selector: ".submit-button",
        component: "position"
      },
      {
        selector: ".submit-button",
        component: "rotation"
      },
      {
        selector: ".collectible-wrapper",
        component: "position"
      },
      {
        selector: ".collectible-wrapper",
        component: "rotation"
      },
      {
        selector: "#entity-socket",
        component: "entity-socket",
        property: "acceptedEntities"
      },
      {
        selector: "#entity-socket",
        component: "entity-socket",
        property: "radius"
      },
      {
        selector: "#entity-socket",
        component: "entity-socket",
        property: "snappedEntity"
      },
      {
        selector: "#multiple-choice-component",
        component: "multiple-choice-question",
        property: "question_id"
      },
      {
        selector: "#multiple-choice-component",
        component: "multiple-choice-question",
        property: "answer_id"
      },
      {
        selector: "#multiple-choice-component",
        component: "multiple-choice-question",
        property: "answerSelected"
      },
      {
        selector: "#multiple-choice-component",
        component: "multiple-choice-question",
        property: "answerSubmitted"
      }
    ]
  });

  NAF.schemas.add({
    template: "#interactable-robot-camera",
    components: [
      "position",
      "rotation",
    ]
  });

  NAF.schemas.add({
    template: "#interactable-first-experiment-camera",
    components: [
      "position",
      "rotation",
      {
        selector: ".interactable",
        component: "first-experiment",
        property: "startClicked"
      }
    ]
  });

  NAF.schemas.add({
    template: "#interactable-first-experiment-01-camera",
    components: [
      "position",
      "rotation",
      {
        selector: "#first-experiment-01-wrapper",
        component: "first-experiment-01",
        property: "groundSampleChosen"
      },
      {
        selector: "#first-experiment-01-wrapper",
        component: "first-experiment-01",
        property: "groundSampleIndex"
      }
    ]
  });

  NAF.schemas.add({
    template: "#interactable-first-experiment-02-camera",
    components: [
      "position",
      "rotation",
      {
        selector: ".part02-wrapper",
        component: "position"
      },
      {
        selector: ".part02-wrapper",
        component: "rotation"
      },
      {
        selector: ".cupboard-wrapper",
        component: "position"
      },
      {
        selector: ".cupboard-wrapper",
        component: "rotation"
      },
      {
        selector: ".mortar-entity",
        component: "position"
      },
      {
        selector: ".mortar-entity",
        component: "rotation"
      },
      {
        selector: ".mortar-stick-entity",
        component: "position"
      },
      {
        selector: ".mortar-stick-entity",
        component: "rotation"
      },
      {
        selector: ".ground-sample-entity",
        component: "position"
      },
      {
        selector: ".ground-sample-entity",
        component: "rotation"
      },
      {
        selector: ".bunsen-burner-entity",
        component: "position"
      },
      {
        selector: ".bunsen-burner-entity",
        component: "rotation"
      },
      {
        selector: ".flame-entity",
        component: "position"
      },
      {
        selector: ".flame-entity",
        component: "rotation"
      },
      {
        selector: ".tripod-1-entity",
        component: "position"
      },
      {
        selector: ".tripod-1-entity",
        component: "rotation"
      },
      {
        selector: ".tripod-plate-entity",
        component: "position"
      },
      {
        selector: ".tripod-plate-entity",
        component: "rotation"
      },
      {
        selector: ".tripod-2-entity",
        component: "position"
      },
      {
        selector: ".tripod-2-entity",
        component: "rotation"
      },
      {
        selector: ".tripod-triangle-entity",
        component: "position"
      },
      {
        selector: ".tripod-triangle-entity",
        component: "rotation"
      },
      {
        selector: ".firelighter-entity",
        component: "position"
      },
      {
        selector: ".firelighter-entity",
        component: "rotation"
      },
      {
        selector: ".thermo-entity",
        component: "position"
      },
      {
        selector: ".thermo-entity",
        component: "rotation"
      },
      {
        selector: ".thermo-text",
        component: "position"
      },
      {
        selector: ".thermo-text",
        component: "rotation"
      },
      {
        selector: ".glass-stick-entity",
        component: "position"
      },
      {
        selector: ".glass-stick-entity",
        component: "rotation"
      },
      {
        selector: ".scale-entity",
        component: "position"
      },
      {
        selector: ".scale-entity",
        component: "rotation"
      },
      {
        selector: ".display-text",
        component: "position"
      },
      {
        selector: ".display-text",
        component: "rotation"
      },
      {
        selector: ".tara-btn",
        component: "position"
      },
      {
        selector: ".tara-btn",
        component: "rotation"
      },
      {
        selector: ".glow-loss-btn",
        component: "position"
      },
      {
        selector: ".glow-loss-btn",
        component: "rotation"
      },
      {
        selector: ".crucible-entity",
        component: "position"
      },
      {
        selector: "crucible-entity",
        component: "rotation"
      },
      {
        selector: ".attached-tong-entity",
        component: "position"
      },
      {
        selector: ".attached-tong-entity",
        component: "rotation"
      },
      {
        selector: ".spoon-entity",
        component: "position"
      },
      {
        selector: ".spoon-entity",
        component: "rotation"
      },
      {
        selector: "ground-sample-spoon",
        component: "position"
      },
      {
        selector: ".ground-sample-spoon",
        component: "rotation"
      },
      {
        selector: ".tong-entity",
        component: "position"
      },
      {
        selector: ".tong-entity",
        component: "rotation"
      }
    ]
  });

  NAF.schemas.add({
    template: "#interactable-first-experiment-03-camera",
    components: [
      "position",
      "rotation",
      {
        selector: ".part03-wrapper",
        component: "first-experiment-03",
        property: "grindBtnClicked"
      }
    ]
  });

  NAF.schemas.add({
    template: "#interactable-first-experiment-04-camera",
    components: [
      "position",
      "rotation",
      {
        selector: ".part04-wrapper",
        component: "first-experiment-04",
        property: "glovesPopupClosed"
      },
      {
        selector: ".part04-wrapper",
        component: "first-experiment-04",
        property: "startBurnerClicked"
      },
      {
        selector: ".part04-wrapper",
        component: "first-experiment-04",
        property: "stirBtnHeld"
      }
    ]
  });

  NAF.schemas.add({
    template: "#interactable-first-experiment-05-camera",
    components: [
      "position",
      "rotation",
      {
        selector: ".part05-wrapper",
        component: "first-experiment-05",
        property: "stirBtnHeld"
      },
      {
        selector: ".part05-wrapper",
        component: "first-experiment-05",
        property: "onClickCutBunsenBurner"
      },
      {
        selector: ".part05-wrapper",
        component: "first-experiment-05",
        property: "onClickTurnOffBunsenBurner"
      }
    ]
  });

  NAF.schemas.add({
    template: "#interactable-first-experiment-06-camera",
    components: [
      "position",
      "rotation",
      {
        selector: ".part06-wrapper",
        component: "first-experiment-06",
        property: "formulaPopupClosed"
      },
      {
        selector: ".part06-wrapper",
        component: "first-experiment-06",
        property: "onClickDiscussResult"
      },
      {
        selector: ".part06-wrapper",
        component: "first-experiment-06",
        property: "onClickTidyUp"
      }
    ]
  });

  NAF.schemas.add({
    template: "#interactable-first-experiment-placer-camera",
    components: [
      "position",
      "rotation",
    ]
  });

  NAF.schemas.add({
    template: "#template-waypoint-avatar",
    components: [
      {
        component: "position",
        requiresNetworkUpdate: vectorRequiresUpdate(0.001)
      },
      {
        component: "rotation",
        requiresNetworkUpdate: vectorRequiresUpdate(0.5)
      },
      {
        component: "scale",
        requiresNetworkUpdate: vectorRequiresUpdate(0.001)
      },
      "waypoint"
    ],
    nonAuthorizedComponents: [
      {
        component: "position",
        requiresNetworkUpdate: vectorRequiresUpdate(0.001)
      },
      {
        component: "rotation",
        requiresNetworkUpdate: vectorRequiresUpdate(0.5)
      },
      {
        component: "scale",
        requiresNetworkUpdate: vectorRequiresUpdate(0.001)
      },
      "waypoint"
    ]
  });

  NAF.schemas.add({
    template: "#interactable-pen",
    components: [
      {
        component: "position",
        requiresNetworkUpdate: vectorRequiresUpdate(0.001)
      },
      {
        component: "rotation",
        requiresNetworkUpdate: vectorRequiresUpdate(0.5)
      },
      {
        component: "scale",
        requiresNetworkUpdate: vectorRequiresUpdate(0.001)
      },
      {
        selector: "#pen",
        component: "pen",
        property: "radius"
      },
      {
        selector: "#pen",
        component: "pen",
        property: "color"
      },
      {
        selector: "#pen",
        component: "pen",
        property: "drawMode"
      },
      {
        selector: "#pen",
        component: "pen",
        property: "penVisible"
      },
      {
        selector: "#pen",
        component: "pen-laser",
        property: "laserVisible"
      },
      {
        selector: "#pen",
        component: "pen-laser",
        property: "remoteLaserOrigin",
        requiresNetworkUpdate: vectorRequiresUpdate(0.001)
      },
      {
        selector: "#pen",
        component: "pen-laser",
        property: "laserTarget",
        requiresNetworkUpdate: vectorRequiresUpdate(0.001)
      }
    ]
  });
}

export default registerNetworkSchemas;
