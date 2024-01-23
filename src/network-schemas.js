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
        component: "stopwatch-tool",
        property: "startClicked"
      },
      {
        component: "stopwatch-tool",
        property: "resetClicked"
      },
      {
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
        component: "first-experiment-01",
        property: "groundSampleChosen"
      },
      {
        component: "first-experiment-01",
        property: "groundSampleIndex"
      },
      {
        component: "first-experiment-01",
        property: "questionAnswered"
      },
      {
        component: "first-experiment-01",
        property: "groundProfileSkiped"
      },
      {
        selector: ".bunsen-burner-socket",
        component: "entity-socket",
        property: "triggerValue"
      },
      {
        selector: ".tripod-1-socket",
        component: "entity-socket",
        property: "triggerValue"
      },
      {
        selector: ".tripod-2-socket",
        component: "entity-socket",
        property: "triggerValue"
      },
      {
        selector: ".firelighter-socket",
        component: "entity-socket",
        property: "triggerValue"
      },
      {
        selector: ".thermo-socket",
        component: "entity-socket",
        property: "triggerValue"
      },
      {
        selector: ".glass-stick-socket",
        component: "entity-socket",
        property: "triggerValue"
      },
      {
        selector: ".spoon-socket",
        component: "entity-socket",
        property: "triggerValue"
      },
      {
        selector: ".ground-sample-socket",
        component: "entity-socket",
        property: "triggerValue"
      },
      {
        selector: ".mortar-socket",
        component: "entity-socket",
        property: "triggerValue"
      },
      {
        selector: ".tong-socket",
        component: "entity-socket",
        property: "triggerValue"
      },
    ]
  });

  NAF.schemas.add({
    template: "#interactable-first-experiment-02-camera",
    components: [
      "position",
      "rotation",
      {
        selector: ".cupboard-wrapper",
        component: "position", requiresNetworkUpdate: vectorRequiresUpdate(0.001)
      },
      {
        selector: ".cupboard-wrapper",
        component: "rotation",
        requiresNetworkUpdate: vectorRequiresUpdate(0.5)
      },
      {
        selector: ".mortar-entity",
        component: "position", requiresNetworkUpdate: vectorRequiresUpdate(0.001)
      },
      {
        selector: ".mortar-entity",
        component: "rotation",
        requiresNetworkUpdate: vectorRequiresUpdate(0.5)
      },
      {
        selector: ".mortar-stick-entity",
        component: "position", requiresNetworkUpdate: vectorRequiresUpdate(0.001)
      },
      {
        selector: ".mortar-stick-entity",
        component: "rotation",
        requiresNetworkUpdate: vectorRequiresUpdate(0.5)
      },
      {
        selector: ".bunsen-burner-entity",
        component: "position", requiresNetworkUpdate: vectorRequiresUpdate(0.001)
      },
      {
        selector: ".bunsen-burner-entity",
        component: "rotation",
        requiresNetworkUpdate: vectorRequiresUpdate(0.5)
      },
      {
        selector: ".flame-entity",
        component: "position", requiresNetworkUpdate: vectorRequiresUpdate(0.001)
      },
      {
        selector: ".flame-entity",
        component: "rotation",
        requiresNetworkUpdate: vectorRequiresUpdate(0.5)
      },
      {
        selector: ".tripod-1-entity",
        component: "position", requiresNetworkUpdate: vectorRequiresUpdate(0.001)
      },
      {
        selector: ".tripod-1-entity",
        component: "rotation",
        requiresNetworkUpdate: vectorRequiresUpdate(0.5)
      },
      {
        selector: ".tripod-plate-entity",
        component: "position", requiresNetworkUpdate: vectorRequiresUpdate(0.001)
      },
      {
        selector: ".tripod-plate-entity",
        component: "rotation",
        requiresNetworkUpdate: vectorRequiresUpdate(0.5)
      },
      {
        selector: ".tripod-2-entity",
        component: "position", requiresNetworkUpdate: vectorRequiresUpdate(0.001)
      },
      {
        selector: ".tripod-2-entity",
        component: "rotation",
        requiresNetworkUpdate: vectorRequiresUpdate(0.5)
      },
      {
        selector: ".tripod-triangle-entity",
        component: "position", requiresNetworkUpdate: vectorRequiresUpdate(0.001)
      },
      {
        selector: ".tripod-triangle-entity",
        component: "rotation",
        requiresNetworkUpdate: vectorRequiresUpdate(0.5)
      },
      {
        selector: ".firelighter-entity",
        component: "position", requiresNetworkUpdate: vectorRequiresUpdate(0.001)
      },
      {
        selector: ".firelighter-entity",
        component: "rotation",
        requiresNetworkUpdate: vectorRequiresUpdate(0.5)
      },
      {
        selector: ".thermo-entity",
        component: "position", requiresNetworkUpdate: vectorRequiresUpdate(0.001)
      },
      {
        selector: ".thermo-entity",
        component: "rotation",
        requiresNetworkUpdate: vectorRequiresUpdate(0.5)
      },
      {
        selector: ".thermo-text",
        component: "position", requiresNetworkUpdate: vectorRequiresUpdate(0.001)
      },
      {
        selector: ".thermo-text",
        component: "rotation",
        requiresNetworkUpdate: vectorRequiresUpdate(0.5)
      },
      {
        selector: ".glass-stick-entity",
        component: "position", requiresNetworkUpdate: vectorRequiresUpdate(0.001)
      },
      {
        selector: ".glass-stick-entity",
        component: "rotation",
        requiresNetworkUpdate: vectorRequiresUpdate(0.5)
      },
      {
        selector: ".scale-entity",
        component: "position",
        requiresNetworkUpdate: vectorRequiresUpdate(0.001)
      },
      {
        selector: ".scale-entity",
        component: "rotation",
        requiresNetworkUpdate: vectorRequiresUpdate(0.5)
      },
      {
        selector: ".scale-entity",
        component: "waage-tool",
        property: "taraPressed"
      },
      {
        selector: ".scale-entity",
        component: "waage-tool",
        property: "glowLossPressed"
      },
      {
        selector: ".display-text",
        component: "position",
        requiresNetworkUpdate: vectorRequiresUpdate(0.001)
      },
      {
        selector: ".display-text",
        component: "rotation",
        requiresNetworkUpdate: vectorRequiresUpdate(0.5)
      },
      {
        selector: ".tara-btn",
        component: "position", requiresNetworkUpdate: vectorRequiresUpdate(0.001)
      },
      {
        selector: ".tara-btn",
        component: "rotation",
        requiresNetworkUpdate: vectorRequiresUpdate(0.5)
      },
      {
        selector: ".glow-loss-btn",
        component: "position",
        requiresNetworkUpdate: vectorRequiresUpdate(0.001)
      },
      {
        selector: ".glow-loss-btn",
        component: "rotation",
        requiresNetworkUpdate: vectorRequiresUpdate(0.5)
      },
      {
        selector: ".crucible-entity",
        component: "position",
        requiresNetworkUpdate: vectorRequiresUpdate(0.001)
      },
      {
        selector: "crucible-entity",
        component: "rotation",
        requiresNetworkUpdate: vectorRequiresUpdate(0.5)
      },
      {
        selector: ".attached-tong-entity",
        component: "position",
        requiresNetworkUpdate: vectorRequiresUpdate(0.001)
      },
      {
        selector: ".attached-tong-entity",
        component: "rotation",
        requiresNetworkUpdate: vectorRequiresUpdate(0.5)
      },
      {
        selector: ".crucible-ground-sample",
        component: "position",
        requiresNetworkUpdate: vectorRequiresUpdate(0.001)
      },
      {
        selector: ".crucible-ground-sample",
        component: "rotation",
        requiresNetworkUpdate: vectorRequiresUpdate(0.5)
      },
      {
        selector: ".spoon-entity",
        component: "position",
        requiresNetworkUpdate: vectorRequiresUpdate(0.001)
      },
      {
        selector: ".spoon-entity",
        component: "rotation",
        requiresNetworkUpdate: vectorRequiresUpdate(0.5)
      },
      {
        selector: "ground-sample-spoon",
        component: "position",
        requiresNetworkUpdate: vectorRequiresUpdate(0.001)
      },
      {
        selector: ".ground-sample-spoon",
        component: "rotation",
        requiresNetworkUpdate: vectorRequiresUpdate(0.5)
      },
      {
        selector: ".tong-entity",
        component: "position",
        requiresNetworkUpdate: vectorRequiresUpdate(0.001)
      },
      {
        selector: ".tong-entity",
        component: "rotation",
        requiresNetworkUpdate: vectorRequiresUpdate(0.5)
      }
    ]
  });

  NAF.schemas.add({
    template: "#interactable-first-experiment-03-camera",
    components: [
      "position",
      "rotation",
      {
        component: "first-experiment-03",
        property: "grindBtnClicked"
      },
      {
        component: "first-experiment-03",
        property: "taraPressed"
      },
      {
        component: "first-experiment-03",
        property: "randomAmounts"
      },
      {
        selector: ".mortar-socket-03",
        component: "entity-socket",
        property: "triggerValue"
      },
      {
        selector: ".ground-sample-socket-03",
        component: "entity-socket",
        property: "triggerValue"
      },
      {
        selector: ".grind-sample-entity",
        component: "entity-socket",
        property: "triggerValue"
      },
      {
        selector: ".crucible-socket",
        component: "entity-socket",
        property: "triggerValue"
      },
      {
        selector: ".spoon-socket-03",
        component: "entity-socket",
        property: "triggerValue"
      },
      {
        selector: ".spoon-socket-scale",
        component: "entity-socket",
        property: "triggerValue"
      },
      {
        selector: ".scale-socket",
        component: "entity-socket",
        property: "triggerValue"
      }
    ]
  });

  NAF.schemas.add({
    template: "#interactable-first-experiment-04-camera",
    components: [
      "position",
      "rotation",
      {
        component: "first-experiment-04",
        property: "burnerStarted"
      },
      {
        component: "first-experiment-04",
        property: "startBurnerClicked"
      },
      {
        component: "first-experiment-04",
        property: "ctrlBtnClicked"
      },
      {
        component: "first-experiment-04",
        property: "ctrlBtnIndex"
      },
      {
        component: "first-experiment-04",
        property: "stirBtnHeld"
      },
      {
        component: "first-experiment-04",
        property: "stirBtnDone"
      },
      {
        selector: ".crucible-socket-04",
        component: "entity-socket",
        property: "triggerValue"
      },
      {
        selector: ".firelighter-socket-04",
        component: "entity-socket",
        property: "triggerValue"
      },
      {
        selector: ".glass-stick-socket-04",
        component: "entity-socket",
        property: "triggerValue"
      },
    ]
  });

  NAF.schemas.add({
    template: "#interactable-first-experiment-05-camera",
    components: [
      "position",
      "rotation",
      {
        component: "first-experiment-05",
        property: "stirBtnHeld"
      },
      {
        component: "first-experiment-05",
        property: "stirBtnDone"
      },
      {
        component: "first-experiment-05",
        property: "ctrlBtnClicked"
      },
      {
        component: "first-experiment-05",
        property: "ctrlBtnIndex"
      },
      {
        component: "first-experiment-05",
        property: "minuteMark1"
      },
      {
        component: "first-experiment-05",
        property: "minuteMark2"
      },
      {
        component: "first-experiment-05",
        property: "minuteMark3"
      },
      {
        component: "first-experiment-05",
        property: "measuredCounter"
      },
      {
        component: "first-experiment-05",
        property: "thermoPopupClosed"
      },
      {
        selector: ".thermo-socket-05",
        component: "entity-socket",
        property: "triggerValue"
      },
      {
        selector: ".crucible-socket-05",
        component: "entity-socket",
        property: "triggerValue"
      },
      {
        selector: ".tong-socket-crucible",
        component: "entity-socket",
        property: "triggerValue"
      },
    ]
  });

  NAF.schemas.add({
    template: "#interactable-first-experiment-06-camera",
    components: [
      "position",
      "rotation",
      {
        component: "first-experiment-06",
        property: "formulaPopupClosed"
      },
      {
        component: "first-experiment-06",
        property: "onClickDiscussResult"
      },
      {
        component: "first-experiment-06",
        property: "onClickTidyUp"
      },
      {
        component: "first-experiment-06",
        property: "minuteMark4"
      },
      {
        selector: ".tong-socket-crucible-06",
        component: "entity-socket",
        property: "triggerValue"
      },
    ]
  });



  NAF.schemas.add({
    template: "#interactable-second-experiment-camera",
    components: [
      "position",
      "rotation",
      {
        component: "second-experiment",
        property: "startClicked"
      }
    ]
  });


  NAF.schemas.add({
    template: "#interactable-second-experiment-01-camera",
    components: [
      "position",
      "rotation",
      {
        component: "second-experiment-01",
        property: "nextBtnClickCount"
      },
      {
        component: "second-experiment-01",
        property: "groundSampleChosen"
      },
      {
        component: "second-experiment-01",
        property: "groundSampleIndex"
      }
    ]
  });

  NAF.schemas.add({
    template: "#interactable-second-experiment-02-camera",
    components: [
      "position",
      "rotation",
      {
        selector: ".cupboard-wrapper",
        component: "position", requiresNetworkUpdate: vectorRequiresUpdate(0.001)
      },
      {
        selector: ".cupboard-wrapper",
        component: "rotation",
        requiresNetworkUpdate: vectorRequiresUpdate(0.5)
      },
      {
        selector: ".sieve-base-entity",
        component: "position",
        requiresNetworkUpdate: vectorRequiresUpdate(0.001)
      },
      {
        selector: "sieve-base-entity",
        component: "rotation",
        requiresNetworkUpdate: vectorRequiresUpdate(0.5)
      },
      {
        selector: ".sieve-1-entity",
        component: "position",
        requiresNetworkUpdate: vectorRequiresUpdate(0.001)
      },
      {
        selector: "sieve-1-entity",
        component: "rotation",
        requiresNetworkUpdate: vectorRequiresUpdate(0.5)
      },
      {
        selector: ".sieve-2-entity",
        component: "position",
        requiresNetworkUpdate: vectorRequiresUpdate(0.001)
      },
      {
        selector: "sieve-2-entity",
        component: "rotation",
        requiresNetworkUpdate: vectorRequiresUpdate(0.5)
      },
      {
        selector: ".sieve-base-socket",
        component: "entity-socket",
        property: "triggerValue"
      },
      {
        selector: ".sieve-1-socket",
        component: "entity-socket",
        property: "triggerValue"
      },
      {
        selector: ".sieve-2-socket",
        component: "entity-socket",
        property: "triggerValue"
      },
    ]
  });

  NAF.schemas.add({
    template: "#interactable-second-experiment-03-camera",
    components: [
      "position",
      "rotation",
      {
        component: "second-experiment-03",
        property: "grindBtnClicked"
      }
    ]
  });

  NAF.schemas.add({
    template: "#interactable-second-experiment-04-camera",
    components: [
      "position",
      "rotation",
      {
        component: "second-experiment-04",
        property: "soilBtnClicked"
      },
      {
        component: "second-experiment-04",
        property: "lockBtnClicked"
      },
      {
        component: "second-experiment-04",
        property: "startBtnClicked"
      },
      {
        component: "second-experiment-04",
        property: "unlockBtnClicked"
      }
    ]
  });

  NAF.schemas.add({
    template: "#interactable-second-experiment-05-camera",
    components: [
      "position",
      "rotation",
      {
        selector: ".sieve-base-scale-socket",
        component: "entity-socket",
        property: "triggerValue"
      },
      {
        selector: ".sieve-1-scale-socket",
        component: "entity-socket",
        property: "triggerValue"
      },
      {
        selector: ".sieve-1-side-socket",
        component: "entity-socket",
        property: "triggerValue"
      },
      {
        selector: ".sieve-2-side-socket",
        component: "entity-socket",
        property: "triggerValue"
      },
    ]
  });

  NAF.schemas.add({
    template: "#interactable-second-experiment-06-camera",
    components: [
      "position",
      "rotation"
    ]
  });

  NAF.schemas.add({
    template: "#interactable-third-experiment-camera",
    components: [
      "position",
      "rotation",
      {
        component: "third-experiment",
        property: "startClicked"
      }
    ]
  });

  NAF.schemas.add({
    template: "#interactable-third-experiment-01-camera",
    components: [
      "position",
      "rotation",
      {
        component: "third-experiment-01",
        property: "expClicked"
      },
      {
        component: "third-experiment-01",
        property: "closeCabinetClicked"
      },
      {
        selector: ".plant-Place-1-entity",
        component: "position", requiresNetworkUpdate: vectorRequiresUpdate(0.001)
      },
      {
        selector: ".plant-Place-2-entity",
        component: "position", requiresNetworkUpdate: vectorRequiresUpdate(0.001)
      },
      {
        selector: ".plant-Place-3-entity",
        component: "position", requiresNetworkUpdate: vectorRequiresUpdate(0.001)
      },
      {
        selector: ".plant-Place-1-entity",
        component: "rotation",
        requiresNetworkUpdate: vectorRequiresUpdate(0.5)
      },
      {
        selector: ".plant-Place-2-entity",
        component: "rotation",
        requiresNetworkUpdate: vectorRequiresUpdate(0.5)
      },
      {
        selector: ".plant-Place-3-entity",
        component: "rotation",
        requiresNetworkUpdate: vectorRequiresUpdate(0.5)
      },
      {
        selector: ".plant-socket-01",
        component: "entity-socket",
        property: "triggerValue"
      },
      {
        selector: ".plant-socket-02",
        component: "entity-socket",
        property: "triggerValue"
      },
      {
        selector: ".plant-socket-03",
        component: "entity-socket",
        property: "triggerValue"
      },
    ]
  });

  NAF.schemas.add({
    template: "#interactable-third-experiment-02-camera",
    components: [
      "position",
      "rotation",
      {
        component: "third-experiment-02",
        property: "parameterClicked"
      },
      {
        component: "third-experiment-02",
        property: "chosen"
      },
      {
        component: "third-experiment-02",
        property: "nextBtnClickCount"
      },
      {
        component: "third-experiment-02",
        property: "skipBtnClicked"
      },
      {
        component: "third-experiment-02",
        property: "openBtnClicked"
      },
      {
        component: "third-experiment-02",
        property: "submitBtnClicked"
      },
    ]
  });

  NAF.schemas.add({
    template: "#interactable-third-experiment-03-camera",
    components: [
      "position",
      "rotation",
      {
        component: "third-experiment-03",
        property: "answer"
      },
      {
        component: "third-experiment-03",
        property: "nextBtnClicked"
      },
      {
        component: "third-experiment-03",
        property: "skipBtnClicked"
      },
      {
        component: "third-experiment-03",
        property: "openBtnClicked"
      },
    ]
  });

  NAF.schemas.add({
    template: "#interactable-third-experiment-04-camera",
    components: [
      "position",
      "rotation",
      {
        selector: ".sample-socket-scale-01",
        component: "entity-socket",
        property: "triggerValue"
      },
      {
        selector: ".sample-socket-scale-02",
        component: "entity-socket",
        property: "triggerValue"
      },
      {
        selector: ".sample-socket-scale-03",
        component: "entity-socket",
        property: "triggerValue"
      },
      {
        selector: ".sample-socket-01",
        component: "entity-socket",
        property: "triggerValue"
      },
      {
        selector: ".sample-socket-02",
        component: "entity-socket",
        property: "triggerValue"
      },
      {
        selector: ".sample-socket-03",
        component: "entity-socket",
        property: "triggerValue"
      },
      {
        selector: ".scissor-socket-01",
        component: "entity-socket",
        property: "triggerValue"
      },
      {
        selector: ".scissor-socket-02",
        component: "entity-socket",
        property: "triggerValue"
      },
      {
        selector: ".scissor-socket-03",
        component: "entity-socket",
        property: "triggerValue"
      },
      {
        component: "third-experiment-04",
        property: "confirmBtnClicked"
      },
      {
        component: "third-experiment-04",
        property: "skipBtnClicked"
      },
      {
        component: "third-experiment-04",
        property: "change1BtnClicked"
      },
      {
        component: "third-experiment-04",
        property: "change2BtnClicked"
      },
      {
        component: "third-experiment-04",
        property: "delayBtnClicked"
      },
      {
        selector: ".plant-sol-1-entity",
        component: "position", requiresNetworkUpdate: vectorRequiresUpdate(0.001)
      },
      {
        selector: ".plant-sol-2-entity",
        component: "position", requiresNetworkUpdate: vectorRequiresUpdate(0.001)
      },
      {
        selector: ".plant-sol-3-entity",
        component: "position", requiresNetworkUpdate: vectorRequiresUpdate(0.001)
      },
      {
        selector: ".plant-sol-1-entity",
        component: "rotation",
        requiresNetworkUpdate: vectorRequiresUpdate(0.5)
      },
      {
        selector: ".plant-sol-2-entity",
        component: "rotation",
        requiresNetworkUpdate: vectorRequiresUpdate(0.5)
      },
      {
        selector: ".plant-sol-3-entity",
        component: "rotation",
        requiresNetworkUpdate: vectorRequiresUpdate(0.5)
      },
      {
        selector: ".scissor-entity",
        component: "position", requiresNetworkUpdate: vectorRequiresUpdate(0.001)
      },
      {
        selector: ".scissor-entity",
        component: "rotation",
        requiresNetworkUpdate: vectorRequiresUpdate(0.5)
      },
    ]
  });

  NAF.schemas.add({
    template: "#interactable-third-experiment-05-camera",
    components: [
      "position",
      "rotation",
      {
        component: "third-experiment-05",
        property: "answer"
      },
      {
        component: "third-experiment-05",
        property: "nextBtnClicked"
      },
      {
        component: "third-experiment-05",
        property: "skipBtnClicked"
      },
      {
        component: "third-experiment-05",
        property: "tidyBtnClicked"
      },
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
