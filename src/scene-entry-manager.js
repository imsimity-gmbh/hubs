import qsTruthy from "./utils/qs_truthy";
import nextTick from "./utils/next-tick";
import { hackyMobileSafariTest } from "./utils/detect-touchscreen";
import { isIOS as detectIOS } from "./utils/is-mobile";
import { SignInMessages } from "./react-components/auth/SignInModal";

const isBotMode = qsTruthy("bot");
const isMobile = AFRAME.utils.device.isMobile();
const forceEnableTouchscreen = hackyMobileSafariTest();
const isMobileVR = AFRAME.utils.device.isMobileVR();
const isDebug = qsTruthy("debug");
const qs = new URLSearchParams(location.search);
const deg2rad = 0.0174533;

import { addMedia } from "./utils/media-utils";
import {
  isIn2DInterstitial,
  handleExitTo2DInterstitial,
  exit2DInterstitialAndEnterVR,
  forceExitFrom2DInterstitial
} from "./utils/vr-interstitial";
import { ObjectContentOrigins } from "./object-types";
import { getAvatarSrc, getAvatarType } from "./utils/avatar-utils";
import { SOUND_ENTER_SCENE } from "./systems/sound-effects-system";

import { encodeNetworkId } from "./utils/GecoLab/network-helper";

const isIOS = detectIOS();

export default class SceneEntryManager {
  constructor(hubChannel, authChannel, history) {
    this.hubChannel = hubChannel;
    this.authChannel = authChannel;
    this.store = window.APP.store;
    this.mediaSearchStore = window.APP.mediaSearchStore;
    this.scene = document.querySelector("a-scene");
    this.rightCursorController = document.getElementById("right-cursor-controller");
    this.leftCursorController = document.getElementById("left-cursor-controller");
    this.avatarRig = document.getElementById("avatar-rig");
    this._entered = false;
    this.performConditionalSignIn = () => {};
    this.history = history;
  }

  init = () => {
    this.whenSceneLoaded(() => {
      console.log("Scene is loaded so setting up controllers");
      this.rightCursorController.components["cursor-controller"].enabled = false;
      this.leftCursorController.components["cursor-controller"].enabled = false;
      this.mediaDevicesManager = window.APP.mediaDevicesManager;
      this._setupBlocking();
    });
  };

  hasEntered = () => {
    return this._entered;
  };

  enterScene = async (enterInVR, muteOnEntry) => {
    console.log("Entering scene...");
    document.getElementById("viewing-camera").removeAttribute("scene-preview-camera");

    if (isDebug && NAF.connection.adapter.session) {
      NAF.connection.adapter.session.options.verbose = true;
    }

    if (enterInVR) {
      // This specific scene state var is used to check if the user went through the
      // entry flow and chose VR entry, and is used to preempt VR mode on refreshes.
      this.scene.addState("vr-entered");

      // HACK - A-Frame calls getVRDisplays at module load, we want to do it here to
      // force gamepads to become live.
      "getVRDisplays" in navigator && navigator.getVRDisplays();

      await exit2DInterstitialAndEnterVR(true);
    }

    const waypointSystem = this.scene.systems["hubs-systems"].waypointSystem;
    waypointSystem.moveToSpawnPoint();

    if (isMobile || forceEnableTouchscreen || qsTruthy("force_enable_touchscreen")) {
      this.avatarRig.setAttribute("virtual-gamepad-controls", {});
    }

    this._setupPlayerRig();
    this._setupKicking();
    this._setupMedia();
    this._setupCamera();
    this._setupMachine();
    this._setupExample();
    this._setupRobot();
    this._setupFirstExperimentPos01();
    this._startFirstExperimentPos01();
    this._setupFirstExperimentPos02();
    this._startFirstExperimentPos02();
    this._setupSecondExperimentPos01();
    this._startSecondExperimentPos01();
    this._setupSecondExperimentPos02();
    this._startSecondExperimentPos02();
    this._setupThirdExperimentPos01();
    this._startThirdExperimentPos01();
    this._setupThirdExperimentPos02();
    this._startThirdExperimentPos02();

    if (qsTruthy("offline")) return;

    this._spawnAvatar();

    this.scene.systems["hubs-systems"].soundEffectsSystem.playSoundOneShot(SOUND_ENTER_SCENE);

    if (isBotMode) {
      this._runBot();
      this.scene.addState("entered");
      this.hubChannel.sendEnteredEvent();
      return;
    }

    this.scene.classList.remove("hand-cursor");
    this.scene.classList.add("no-cursor");

    this.rightCursorController.components["cursor-controller"].enabled = true;
    this.leftCursorController.components["cursor-controller"].enabled = true;
    this._entered = true;

    // Delay sending entry event telemetry until VR display is presenting.
    (async () => {
      while (enterInVR && !this.scene.renderer.xr.isPresenting) {
        await nextTick();
      }

      this.hubChannel.sendEnteredEvent().then(() => {
        this.store.update({ activity: { lastEnteredAt: new Date().toISOString() } });
      });
    })();

    // Bump stored entry count after 30s
    setTimeout(() => this.store.bumpEntryCount(), 30000);

    this.scene.addState("entered");

    APP.dialog.enableMicrophone(!muteOnEntry);
  };

  whenSceneLoaded = callback => {
    if (this.scene.hasLoaded) {
      console.log("Scene already loaded so callback invoked directly");
      callback();
    } else {
      console.log("Scene not yet loaded so callback is deferred");
      this.scene.addEventListener("loaded", callback);
    }
  };

  enterSceneWhenLoaded = enterInVR => {
    this.whenSceneLoaded(() => this.enterScene(enterInVR));
  };

  exitScene = () => {
    this.scene.exitVR();
    if (APP.dialog && APP.dialog.localMediaStream) {
      APP.dialog.localMediaStream.getTracks().forEach(t => t.stop());
    }
    if (this.hubChannel) {
      this.hubChannel.disconnect();
    }
    if (this.scene.renderer) {
      this.scene.renderer.setAnimationLoop(null); // Stop animation loop, TODO A-Frame should do this
    }
    this.scene.parentNode.removeChild(this.scene);
  };

  _setupPlayerRig = () => {
    this._setPlayerInfoFromProfile();

    // Explict user action changed avatar or updated existing avatar.
    this.scene.addEventListener("avatar_updated", () => this._setPlayerInfoFromProfile(true));

    // Store updates can occur to avatar id in cases like error, auth reset, etc.
    this.store.addEventListener("statechanged", () => this._setPlayerInfoFromProfile());

    const avatarScale = parseInt(qs.get("avatar_scale"), 10);
    if (avatarScale) {
      this.avatarRig.setAttribute("scale", { x: avatarScale, y: avatarScale, z: avatarScale });
    }
  };

  _setPlayerInfoFromProfile = async (force = false) => {
    const avatarId = this.store.state.profile.avatarId;
    if (!force && this._lastFetchedAvatarId === avatarId) return; // Avoid continually refetching based upon state changing

    this._lastFetchedAvatarId = avatarId;
    const avatarSrc = await getAvatarSrc(avatarId);

    this.avatarRig.setAttribute("player-info", { avatarSrc, avatarType: getAvatarType(avatarId) });
  };

  _setupKicking = () => {
    // This event is only received by the kicker
    document.body.addEventListener("kicked", ({ detail }) => {
      const { clientId: kickedClientId } = detail;
      const { entities } = NAF.connection.entities;
      for (const id in entities) {
        const entity = entities[id];
        if (NAF.utils.getCreator(entity) !== kickedClientId) continue;

        if (entity.components.networked.data.persistent) {
          NAF.utils.takeOwnership(entity);
          window.APP.pinningHelper.unpinElement(entity);
          entity.parentNode.removeChild(entity);
        } else {
          NAF.entities.removeEntity(id);
        }
      }
    });
  };

  _setupBlocking = () => {
    document.body.addEventListener("blocked", ev => {
      NAF.connection.entities.removeEntitiesOfClient(ev.detail.clientId);
    });

    document.body.addEventListener("unblocked", ev => {
      NAF.connection.entities.completeSync(ev.detail.clientId, true);
    });
  };

  _setupMedia = () => {
    const offset = { x: 0, y: 0, z: -1.5 };
    const spawnMediaInfrontOfPlayer = (src, contentOrigin) => {
      if (!this.hubChannel.can("spawn_and_move_media")) return;
      const { entity, orientation } = addMedia(
        src,
        "#interactable-media",
        contentOrigin,
        null,
        !(src instanceof MediaStream),
        true
      );
      orientation.then(or => {
        entity.setAttribute("offset-relative-to", {
          target: "#avatar-pov-node",
          offset,
          orientation: or
        });
      });

      return entity;
    };

    this.scene.addEventListener("add_media", e => {
      const contentOrigin = e.detail instanceof File ? ObjectContentOrigins.FILE : ObjectContentOrigins.URL;

      spawnMediaInfrontOfPlayer(e.detail, contentOrigin);
    });

    this.scene.addEventListener("object_spawned", e => {
      this.hubChannel.sendObjectSpawnedEvent(e.detail.objectType);
    });

    this.scene.addEventListener("action_spawn", () => {
      handleExitTo2DInterstitial(false, () => window.APP.mediaSearchStore.pushExitMediaBrowserHistory());
      window.APP.mediaSearchStore.sourceNavigateToDefaultSource();
    });

    this.scene.addEventListener("action_kick_client", ({ detail: { clientId } }) => {
      this.performConditionalSignIn(
        () => this.hubChannel.can("kick_users"),
        async () => await window.APP.hubChannel.kick(clientId),
        SignInMessages.kickUser
      );
    });

    this.scene.addEventListener("action_mute_client", ({ detail: { clientId } }) => {
      this.performConditionalSignIn(
        () => this.hubChannel.can("mute_users"),
        () => window.APP.hubChannel.mute(clientId),
        SignInMessages.muteUser
      );
    });

    this.scene.addEventListener("action_vr_notice_closed", () => forceExitFrom2DInterstitial());

    document.addEventListener("paste", e => {
      if (
        (e.target.matches("input, textarea") || e.target.contentEditable === "true") &&
        document.activeElement === e.target
      )
        return;

      // Never paste into scene if dialog is open
      const uiRoot = document.querySelector(".ui-root");
      if (uiRoot && uiRoot.classList.contains("in-modal-or-overlay")) return;

      const url = e.clipboardData.getData("text");
      const files = e.clipboardData.files && e.clipboardData.files;
      if (url) {
        spawnMediaInfrontOfPlayer(url, ObjectContentOrigins.URL);
      } else {
        for (const file of files) {
          spawnMediaInfrontOfPlayer(file, ObjectContentOrigins.CLIPBOARD);
        }
      }
    });

    document.addEventListener("dragover", e => e.preventDefault());

    document.addEventListener("drop", e => {
      e.preventDefault();

      let url = e.dataTransfer.getData("url");

      if (!url) {
        // Sometimes dataTransfer text contains a valid URL, so try for that.
        try {
          url = new URL(e.dataTransfer.getData("text")).href;
        } catch (e) {
          // Nope, not this time.
        }
      }

      const files = e.dataTransfer.files;

      if (url) {
        spawnMediaInfrontOfPlayer(url, ObjectContentOrigins.URL);
      } else {
        for (const file of files) {
          spawnMediaInfrontOfPlayer(file, ObjectContentOrigins.FILE);
        }
      }
    });

    let currentVideoShareEntity;
    let isHandlingVideoShare = false;

    const shareSuccess = (isDisplayMedia, isVideoTrackAdded, target) => {
      isHandlingVideoShare = false;

      if (isVideoTrackAdded) {
        if (target === "avatar") {
          this.avatarRig.setAttribute("player-info", { isSharingAvatarCamera: true });
        } else {
          currentVideoShareEntity = spawnMediaInfrontOfPlayer(this.mediaDevicesManager.mediaStream, undefined);
          // Wire up custom removal event which will stop the stream.
          currentVideoShareEntity.setAttribute("emit-scene-event-on-remove", "event:action_end_video_sharing");
        }

        this.scene.emit("share_video_enabled", { source: isDisplayMedia ? "screen" : "camera" });
        this.scene.addState("sharing_video");
      }
    };

    const shareError = error => {
      console.error(error);
      isHandlingVideoShare = false;
      this.scene.emit("share_video_failed");
    };

    this.scene.addEventListener("action_share_camera", event => {
      if (isHandlingVideoShare) return;
      isHandlingVideoShare = true;

      const constraints = {
        video: {
          width: isIOS ? { max: 1280 } : { max: 1280, ideal: 720 },
          frameRate: 30
        }
        //TODO: Capture audio from camera?
      };

      // check preferences
      const store = window.APP.store;
      const preferredCamera = store.state.preferences.preferredCamera || "default";
      switch (preferredCamera) {
        case "default":
          constraints.video.mediaSource = "camera";
          break;
        case "user":
        case "environment":
          constraints.video.facingMode = preferredCamera;
          break;
        default:
          constraints.video.deviceId = preferredCamera;
          break;
      }

      this.mediaDevicesManager.startVideoShare(constraints, false, event.detail?.target, shareSuccess, shareError);
    });

    this.scene.addEventListener("action_share_screen", () => {
      if (isHandlingVideoShare) return;
      isHandlingVideoShare = true;

      this.mediaDevicesManager.startVideoShare(
        {
          video: {
            // Work around BMO 1449832 by calculating the width. This will break for multi monitors if you share anything
            // other than your current monitor that has a different aspect ratio.
            width: 720 * (screen.width / screen.height),
            height: 720,
            frameRate: 30
          },
          audio: {
            echoCancellation: window.APP.store.state.preferences.disableEchoCancellation === true ? false : true,
            noiseSuppression: window.APP.store.state.preferences.disableNoiseSuppression === true ? false : true,
            autoGainControl: window.APP.store.state.preferences.disableAutoGainControl === true ? false : true
          }
        },
        true,
        null,
        shareSuccess,
        shareError
      );
    });

    this.scene.addEventListener("action_end_video_sharing", async () => {
      if (isHandlingVideoShare) return;
      isHandlingVideoShare = true;

      if (currentVideoShareEntity && currentVideoShareEntity.parentNode) {
        NAF.utils.takeOwnership(currentVideoShareEntity);
        currentVideoShareEntity.parentNode.removeChild(currentVideoShareEntity);
      }

      await this.mediaDevicesManager.stopVideoShare();
      currentVideoShareEntity = null;

      this.avatarRig.setAttribute("player-info", { isSharingAvatarCamera: false });
      this.scene.emit("share_video_disabled");
      this.scene.removeState("sharing_video");
      isHandlingVideoShare = false;
    });

    this.scene.addEventListener("action_end_mic_sharing", async () => {
      await this.mediaDevicesManager.stopMicShare();
    });

    this.scene.addEventListener("action_selected_media_result_entry", async e => {
      // TODO spawn in space when no rights
      const { entry, selectAction } = e.detail;
      if (selectAction !== "spawn") return;

      const delaySpawn = isIn2DInterstitial() && !isMobileVR;
      await exit2DInterstitialAndEnterVR();

      // If user has HMD lifted up or gone through interstitial, delay spawning for now. eventually show a modal
      if (delaySpawn) {
        setTimeout(() => {
          spawnMediaInfrontOfPlayer(entry.url, ObjectContentOrigins.URL);
        }, 3000);
      } else {
        spawnMediaInfrontOfPlayer(entry.url, ObjectContentOrigins.URL);
      }
    });

    this.mediaSearchStore.addEventListener("media-exit", () => {
      exit2DInterstitialAndEnterVR();
    });
  };

  _setupCamera = () => {
    this.scene.addEventListener("action_toggle_camera", () => {
      if (!this.hubChannel.can("spawn_camera")) return;
      const myCamera = this.scene.systems["camera-tools"].getMyCamera();

      if (myCamera) {
        myCamera.parentNode.removeChild(myCamera);
      } else {
        const entity = document.createElement("a-entity");
        entity.setAttribute("networked", { template: "#interactable-camera" });
        entity.setAttribute("offset-relative-to", {
          target: "#avatar-pov-node",
          offset: { x: 0, y: 0, z: -1.5 }
        });
        this.scene.appendChild(entity);
      }
    });

    this.scene.addEventListener("photo_taken", e => this.hubChannel.sendMessage({ src: e.detail }, "photo"));
    this.scene.addEventListener("video_taken", e => this.hubChannel.sendMessage({ src: e.detail }, "video"));
  };

  _spawnStopwatch = (table, groupCode, position) => {
      if (!this.hubChannel.can("spawn_camera")) return;
      const myStopwatch = this.scene.systems["first-experiments"].getTaskById("stopwatch", groupCode);

      if (myStopwatch) {
        myStopwatch.parentNode.removeChild(myStopwatch);
      } else {
        const entity = document.createElement("a-entity");

        const anchor = this.scene.querySelector(table);
        const anchorPos = anchor.getAttribute("position");
        const anchorRot = anchor.getAttribute("rotation");

        const distToAnchor = 0.2;
        var radAngle =  deg2rad * anchorRot.y;
        var dir = {x: Math.sin(radAngle) * distToAnchor, z:  Math.cos(radAngle) * distToAnchor};

        var networkId = encodeNetworkId("stopwatch", groupCode, position);

        entity.setAttribute("networked", { template: "#interactable-stopwatch-camera", networkId: networkId });
        entity.setAttribute("position", {x: (anchorPos.x + dir.x), y: (anchorPos.y + 2), z: (anchorPos.z + dir.z)});
        entity.setAttribute("rotation", {x: anchorRot.x, y: anchorRot.y, z: anchorRot.z});
        this.scene.appendChild(entity);
      }
  };


  _setupExample = () => {
    this.scene.addEventListener("action_toggle_example", () => {
      if (!this.hubChannel.can("spawn_camera")) return;
      const myExample = this.scene.systems["example-tools"].getMyExample();

      if (myExample) {
        myExample.parentNode.removeChild(myExample);
      } else {
        const entity = document.createElement("a-entity");

        const distToPlayer = 2.5;
        const camera = document.querySelector("#avatar-pov-node");
        const povRotation =  camera.getAttribute("rotation");

        var radAngle =  deg2rad * povRotation.y;
        var dir = {x: -Math.sin(radAngle), z:  -Math.cos(radAngle)};

        entity.setAttribute("networked", { template: "#interactable-example-camera" });
        entity.setAttribute("offset-relative-to", {
          target: "#avatar-rig",
          offset: { x: dir.x * distToPlayer, y: 0.0, z: dir.z * distToPlayer},
          lookAt: true
        });
        this.scene.appendChild(entity);
      
      }
    });

  };


  _setupMachine = () => {
    this.scene.addEventListener("action_toggle_machine", () => {
      if (!this.hubChannel.can("spawn_camera")) return;
      
      const myMachine = this.scene.systems["machine-tools"].getMyMachine();

      if (myMachine) {
        myMachine.parentNode.removeChild(myMachine);
      } else {
        const entity = document.createElement("a-entity");

        const distToPlayer = 2.5;
        const camera = document.querySelector("#avatar-pov-node");
        const povRotation =  camera.getAttribute("rotation");

        var radAngle =  deg2rad * povRotation.y;
        var dir = {x: -Math.sin(radAngle), z:  -Math.cos(radAngle)};

        entity.setAttribute("networked", { template: "#interactable-machine-camera" });
        entity.setAttribute("offset-relative-to", {
          target: "#avatar-rig",
          offset: { x: dir.x * distToPlayer, y: 0.0, z: dir.z * distToPlayer},
          lookAt: true
        });
        this.scene.appendChild(entity);
      
      }
    });
  };

  _setupFirstExperimentPos01 = () => {
    this.scene.addEventListener("action_toggle_first_experiment_01", (event) => {

      console.log("Placing");

      var groupCode = event.detail;

      if (!this.hubChannel.can("spawn_camera")) return;
      
      const myExperiment = this.scene.systems["first-experiments"].getExperimentByGroupCode(groupCode);

      if (myExperiment) {
        myExperiment.parentNode.removeChild(myExperiment);
      } else {
        const entity = document.createElement("a-entity");

        const anchor = this.scene.querySelector(".table_main_01");
        const anchorPos = anchor.getAttribute("position");
        const anchorRot = anchor.getAttribute("rotation");

        var networkId = encodeNetworkId("base", groupCode, "position_01");

        entity.setAttribute("networked", { template: "#interactable-first-experiment-camera", networkId: networkId });
        entity.setAttribute("position", {x: anchorPos.x, y: anchorPos.y, z: anchorPos.z});
        entity.setAttribute("rotation", {x: anchorRot.x, y: anchorRot.y, z: anchorRot.z});

        this.scene.appendChild(entity);
      }
    });
  };


  _setupFirstExperimentPos02 = () => {
    this.scene.addEventListener("action_toggle_first_experiment_02", (event) => {

      console.log("Placing");

      var groupCode = event.detail;

      if (!this.hubChannel.can("spawn_camera")) return;
      
      const myExperiment = this.scene.systems["first-experiments"].getExperimentByGroupCode(groupCode);

      if (myExperiment) {
        myExperiment.parentNode.removeChild(myExperiment);
      } else {
        const entity = document.createElement("a-entity");

        const anchor = this.scene.querySelector(".table_main_02");
        const anchorPos = anchor.getAttribute("position");
        const anchorRot = anchor.getAttribute("rotation");

        var networkId = encodeNetworkId("base", groupCode, "position_02");

        entity.setAttribute("networked", { template: "#interactable-first-experiment-camera", networkId:networkId });
        entity.setAttribute("position", {x: anchorPos.x, y: anchorPos.y, z: anchorPos.z});
        entity.setAttribute("rotation", {x: anchorRot.x, y: anchorRot.y, z: anchorRot.z});
        this.scene.appendChild(entity);
        
      }
    });
  };
  _startFirstExperimentPos01 = () => {
    this.scene.addEventListener("action_toggle_first_experiment_01_start", (event) => {

      var groupCode = event.detail;

      this._spawnStopwatch(".table_main_01", groupCode, "position_01");
      this._spawnFirstExperimentPart03(".table_main_01", groupCode, "position_01");
      this._spawnFirstExperimentPart01(".table_main_01", groupCode, "position_01");
      this._spawnFirstExperimentPart02(".table_side_01", groupCode, "position_01");
      this._spawnFirstExperimentPart04(".table_main_01", groupCode, "position_01");
      this._spawnFirstExperimentPart05(".table_main_01", groupCode, "position_01");
      this._spawnFirstExperimentPart06(".table_main_01", groupCode, "position_01");
    });
  };


  _startFirstExperimentPos02 = () => {
    this.scene.addEventListener("action_toggle_first_experiment_02_start", (event) => {
      
      var groupCode = event.detail;

      this._spawnStopwatch(".table_main_02", groupCode, "position_02");
      this._spawnFirstExperimentPart03(".table_main_02", groupCode, "position_02");
      this._spawnFirstExperimentPart01(".table_main_02", groupCode, "position_02");
      this._spawnFirstExperimentPart02(".table_side_02", groupCode, "position_02");
      this._spawnFirstExperimentPart04(".table_main_02", groupCode, "position_02");
      this._spawnFirstExperimentPart05(".table_main_02", groupCode, "position_02");
      this._spawnFirstExperimentPart06(".table_main_02", groupCode, "position_02");
    });
  };

  _setupSecondExperimentPos01 = () => {
    this.scene.addEventListener("action_toggle_second_experiment_01", (event) => {

      console.log("Placing");

      var groupCode = event.detail;

      if (!this.hubChannel.can("spawn_camera")) return;
      
      const myExperiment = this.scene.systems["second-experiments"].getExperimentByGroupCode(groupCode);

      if (myExperiment) {
        myExperiment.parentNode.removeChild(myExperiment);
      } else {
        const entity = document.createElement("a-entity");

        const anchor = this.scene.querySelector(".table_main_01");
        const anchorPos = anchor.getAttribute("position");
        const anchorRot = anchor.getAttribute("rotation");

        var networkId = encodeNetworkId("base", groupCode, "position_01");

        entity.setAttribute("networked", { template: "#interactable-second-experiment-camera", networkId: networkId });
        entity.setAttribute("position", {x: anchorPos.x, y: anchorPos.y, z: anchorPos.z});
        entity.setAttribute("rotation", {x: anchorRot.x, y: anchorRot.y, z: anchorRot.z});

        this.scene.appendChild(entity);
      }
    });
  };

  _setupSecondExperimentPos02 = () => {
    this.scene.addEventListener("action_toggle_second_experiment_02", (event) => {

      console.log("Placing");

      var groupCode = event.detail;

      if (!this.hubChannel.can("spawn_camera")) return;
      
      const myExperiment = this.scene.systems["second-experiments"].getExperimentByGroupCode(groupCode);

      if (myExperiment) {
        myExperiment.parentNode.removeChild(myExperiment);
      } else {
        const entity = document.createElement("a-entity");

        const anchor = this.scene.querySelector(".table_main_02");
        const anchorPos = anchor.getAttribute("position");
        const anchorRot = anchor.getAttribute("rotation");

        var networkId = encodeNetworkId("base", groupCode, "position_02");

        entity.setAttribute("networked", { template: "#interactable-second-experiment-camera", networkId: networkId });
        entity.setAttribute("position", {x: anchorPos.x, y: anchorPos.y, z: anchorPos.z});
        entity.setAttribute("rotation", {x: anchorRot.x, y: anchorRot.y, z: anchorRot.z});

        this.scene.appendChild(entity);
      }
    });
  };

  _startSecondExperimentPos01 = () => {
    this.scene.addEventListener("action_toggle_second_experiment_01_start", (event) => {

      var groupCode = event.detail;

      this._spawnSecondExperimentPart01(".table_main_01", groupCode, "position_01");
      this._spawnSecondExperimentPart02(".table_side_01", groupCode, "position_01");
      this._spawnSecondExperimentPart03(".table_main_01", groupCode, "position_01");
      this._spawnSecondExperimentPart04(".table_main_01", groupCode, "position_01");
      this._spawnSecondExperimentPart05(".table_main_01", groupCode, "position_01");
      this._spawnSecondExperimentPart06(".table_main_01", groupCode, "position_01");
    });
  };


  _startSecondExperimentPos02 = () => {
    this.scene.addEventListener("action_toggle_second_experiment_02_start", (event) => {

      var groupCode = event.detail;

      this._spawnSecondExperimentPart01(".table_main_02", groupCode, "position_02");
      this._spawnSecondExperimentPart02(".table_side_02", groupCode, "position_02");
      this._spawnSecondExperimentPart03(".table_main_02", groupCode, "position_02");
      this._spawnSecondExperimentPart04(".table_main_02", groupCode, "position_02");
      this._spawnSecondExperimentPart05(".table_main_02", groupCode, "position_02");
      this._spawnSecondExperimentPart06(".table_main_02", groupCode, "position_02");
    });
  };

  _setupThirdExperimentPos01 = () => {
    this.scene.addEventListener("action_toggle_third_experiment_01", (event) => {

      console.log("Placing");

      var groupCode = event.detail;

      if (!this.hubChannel.can("spawn_camera")) return;
      
      const myExperiment = this.scene.systems["third-experiments"].getExperimentByGroupCode(groupCode);

      if (myExperiment) {
        myExperiment.parentNode.removeChild(myExperiment);
      } else {
        const entity = document.createElement("a-entity");

        const anchor = this.scene.querySelector(".table_main_01");
        const anchorPos = anchor.getAttribute("position");
        const anchorRot = anchor.getAttribute("rotation");

        var networkId = encodeNetworkId("base", groupCode, "position_01");

        entity.setAttribute("networked", { template: "#interactable-third-experiment-camera", networkId: networkId });
        entity.setAttribute("position", {x: anchorPos.x, y: anchorPos.y, z: anchorPos.z});
        entity.setAttribute("rotation", {x: anchorRot.x, y: anchorRot.y, z: anchorRot.z});

        this.scene.appendChild(entity);
      }
    });
  };


  _setupThirdExperimentPos02 = () => {
    this.scene.addEventListener("action_toggle_third_experiment_02", (event) => {

      console.log("Placing");

      var groupCode = event.detail;

      if (!this.hubChannel.can("spawn_camera")) return;
      
      const myExperiment = this.scene.systems["third-experiments"].getExperimentByGroupCode(groupCode);

      if (myExperiment) {
        myExperiment.parentNode.removeChild(myExperiment);
      } else {
        const entity = document.createElement("a-entity");

        const anchor = this.scene.querySelector(".table_main_02");
        const anchorPos = anchor.getAttribute("position");
        const anchorRot = anchor.getAttribute("rotation");

        var networkId = encodeNetworkId("base", groupCode, "position_02");

        entity.setAttribute("networked", { template: "#interactable-third-experiment-camera", networkId:networkId });
        entity.setAttribute("position", {x: anchorPos.x, y: anchorPos.y, z: anchorPos.z});
        entity.setAttribute("rotation", {x: anchorRot.x, y: anchorRot.y, z: anchorRot.z});
        this.scene.appendChild(entity);
        
      }
    });
  };
  _startThirdExperimentPos01 = () => {
    this.scene.addEventListener("action_toggle_third_experiment_01_start", (event) => {

      var groupCode = event.detail;
      
      this._spawnThirdExperimentPart01(".table_main_01", groupCode, "position_01");
    });
  };


  _startThirdExperimentPos02 = () => {
    this.scene.addEventListener("action_toggle_third_experiment_02_start", (event) => {
      
      var groupCode = event.detail;
      
      this._spawnThirdExperimentPart01(".table_main_02", groupCode, "position_02");
    });
  };

  _spawnFirstExperimentPart01 = (table, groupCode, position) => {

      console.log("Placing");

      if (!this.hubChannel.can("spawn_camera")) return;
      
      const myExperiment = this.scene.systems["first-experiments"].getTaskById("01", groupCode);

      if (myExperiment) {
        myExperiment.parentNode.removeChild(myExperiment);
      } else {
        const entity = document.createElement("a-entity");

        const anchor = this.scene.querySelector(table);
        const anchorPos = anchor.getAttribute("position");
        const anchorRot = anchor.getAttribute("rotation");
        
        var networkId = encodeNetworkId("01", groupCode, position);

        entity.setAttribute("networked", { template: "#interactable-first-experiment-01-camera", networkId: networkId });
        entity.setAttribute("position", {x: anchorPos.x, y: anchorPos.y, z: anchorPos.z});
        entity.setAttribute("rotation", {x: anchorRot.x, y: anchorRot.y, z: anchorRot.z});
        this.scene.appendChild(entity);
        
      }
  };

  _spawnFirstExperimentPart02 = (table, groupCode, position) => {

      console.log("Placing");

      if (!this.hubChannel.can("spawn_camera")) return;
      
      const myExperiment = this.scene.systems["first-experiments"].getTaskById("02", groupCode);

      if (myExperiment) {
        myExperiment.parentNode.removeChild(myExperiment);
      } else {
        const entity = document.createElement("a-entity");

        const anchor = this.scene.querySelector(table);
        const anchorPos = anchor.getAttribute("position");
        const anchorRot = anchor.getAttribute("rotation");

        var networkId = encodeNetworkId("02", groupCode, position);

        entity.setAttribute("networked", { template: "#interactable-first-experiment-02-camera", networkId: networkId });
        entity.setAttribute("position", {x: anchorPos.x, y: anchorPos.y, z: anchorPos.z});
        entity.setAttribute("rotation", {x: anchorRot.x, y: anchorRot.y, z: anchorRot.z});
        this.scene.appendChild(entity);
      
      }
  };

  _spawnFirstExperimentPart03 = (table, groupCode, position) => {

      console.log("Placing");

      if (!this.hubChannel.can("spawn_camera")) return;
      
      const myExperiment = this.scene.systems["first-experiments"].getTaskById("03", groupCode);

      if (myExperiment) {
        myExperiment.parentNode.removeChild(myExperiment);
      } else {
        const entity = document.createElement("a-entity");

        const anchor = this.scene.querySelector(table);
        const anchorPos = anchor.getAttribute("position");
        const anchorRot = anchor.getAttribute("rotation");

        var networkId = encodeNetworkId("03", groupCode, position);

        entity.setAttribute("networked", { template: "#interactable-first-experiment-03-camera", networkId: networkId });
        entity.setAttribute("position", {x: anchorPos.x, y: anchorPos.y, z: anchorPos.z});
        entity.setAttribute("rotation", {x: anchorRot.x, y: anchorRot.y, z: anchorRot.z});
        this.scene.appendChild(entity);
      
      }
  };

  _spawnFirstExperimentPart04 = (table, groupCode, position) => {

      console.log("Placing");

      if (!this.hubChannel.can("spawn_camera")) return;
      
      const myExperiment = this.scene.systems["first-experiments"].getTaskById("04", groupCode);

      if (myExperiment) {
        myExperiment.parentNode.removeChild(myExperiment);
      } else {
        const entity = document.createElement("a-entity");

        const anchor = this.scene.querySelector(table);
        const anchorPos = anchor.getAttribute("position");
        const anchorRot = anchor.getAttribute("rotation");

        var networkId = encodeNetworkId("04", groupCode, position);

        entity.setAttribute("networked", { template: "#interactable-first-experiment-04-camera", networkId: networkId });
        entity.setAttribute("position", {x: anchorPos.x, y: anchorPos.y, z: anchorPos.z});
        entity.setAttribute("rotation", {x: anchorRot.x, y: anchorRot.y, z: anchorRot.z});
        this.scene.appendChild(entity);

      }
  };

  _spawnFirstExperimentPart05 = (table, groupCode, position) => {

    console.log("Placing");

    if (!this.hubChannel.can("spawn_camera")) return;
    
    const myExperiment = this.scene.systems["first-experiments"].getTaskById("05", groupCode);

    if (myExperiment) {
      myExperiment.parentNode.removeChild(myExperiment);
    } else {
      const entity = document.createElement("a-entity");

      const anchor = this.scene.querySelector(table);
      const anchorPos = anchor.getAttribute("position");
      const anchorRot = anchor.getAttribute("rotation");

      var networkId = encodeNetworkId("05", groupCode, position);

      entity.setAttribute("networked", { template: "#interactable-first-experiment-05-camera", networkId: networkId });
      entity.setAttribute("position", {x: anchorPos.x, y: anchorPos.y, z: anchorPos.z});
      entity.setAttribute("rotation", {x: anchorRot.x, y: anchorRot.y, z: anchorRot.z});
      this.scene.appendChild(entity);
      
    }
  };

  _spawnFirstExperimentPart06 = (table, groupCode, position) => {

    console.log("Placing");

    if (!this.hubChannel.can("spawn_camera")) return;
    
    const myExperiment = this.scene.systems["first-experiments"].getTaskById("06", groupCode);

    if (myExperiment) {
      myExperiment.parentNode.removeChild(myExperiment);
    } else {
      const entity = document.createElement("a-entity");

      const anchor = this.scene.querySelector(table);
      const anchorPos = anchor.getAttribute("position");
      const anchorRot = anchor.getAttribute("rotation");

      var networkId = encodeNetworkId("06", groupCode, position);

      entity.setAttribute("networked", { template: "#interactable-first-experiment-06-camera", networkId: networkId });
      entity.setAttribute("position", {x: anchorPos.x, y: anchorPos.y, z: anchorPos.z});
      entity.setAttribute("rotation", {x: anchorRot.x, y: anchorRot.y, z: anchorRot.z});
      this.scene.appendChild(entity);
    
    }
  };


  _spawnSecondExperimentPart01 = (table, groupCode, position) => {

    console.log("Placing");

    if (!this.hubChannel.can("spawn_camera")) return;
    
    const myExperiment = this.scene.systems["second-experiments"].getTaskById("01", groupCode);

    if (myExperiment) {
      myExperiment.parentNode.removeChild(myExperiment);
    } else {
      const entity = document.createElement("a-entity");

      const anchor = this.scene.querySelector(table);
      const anchorPos = anchor.getAttribute("position");
      const anchorRot = anchor.getAttribute("rotation");
      
      var networkId = encodeNetworkId("01", groupCode, position);

      entity.setAttribute("networked", { template: "#interactable-second-experiment-01-camera", networkId: networkId });
      entity.setAttribute("position", {x: anchorPos.x, y: anchorPos.y, z: anchorPos.z});
      entity.setAttribute("rotation", {x: anchorRot.x, y: anchorRot.y, z: anchorRot.z});
      this.scene.appendChild(entity);
      
    }
  };

  _spawnSecondExperimentPart02 = (table, groupCode, position) => {

    console.log("Placing");

    if (!this.hubChannel.can("spawn_camera")) return;
    
    const myExperiment = this.scene.systems["second-experiments"].getTaskById("02", groupCode);

    if (myExperiment) {
      myExperiment.parentNode.removeChild(myExperiment);
    } else {
      const entity = document.createElement("a-entity");

      const anchor = this.scene.querySelector(table);
      const anchorPos = anchor.getAttribute("position");
      const anchorRot = anchor.getAttribute("rotation");
      
      var networkId = encodeNetworkId("02", groupCode, position);

      entity.setAttribute("networked", { template: "#interactable-second-experiment-02-camera", networkId: networkId });
      entity.setAttribute("position", {x: anchorPos.x, y: anchorPos.y, z: anchorPos.z});
      entity.setAttribute("rotation", {x: anchorRot.x, y: anchorRot.y, z: anchorRot.z});
      this.scene.appendChild(entity);
      
    }
  };

  _spawnSecondExperimentPart03 = (table, groupCode, position) => {

    console.log("Placing");

    if (!this.hubChannel.can("spawn_camera")) return;
    
    const myExperiment = this.scene.systems["second-experiments"].getTaskById("03", groupCode);

    if (myExperiment) {
      myExperiment.parentNode.removeChild(myExperiment);
    } else {
      const entity = document.createElement("a-entity");

      const anchor = this.scene.querySelector(table);
      const anchorPos = anchor.getAttribute("position");
      const anchorRot = anchor.getAttribute("rotation");
      
      var networkId = encodeNetworkId("03", groupCode, position);

      entity.setAttribute("networked", { template: "#interactable-second-experiment-03-camera", networkId: networkId });
      entity.setAttribute("position", {x: anchorPos.x, y: anchorPos.y, z: anchorPos.z});
      entity.setAttribute("rotation", {x: anchorRot.x, y: anchorRot.y, z: anchorRot.z});
      this.scene.appendChild(entity);
      
    }
  };

  _spawnSecondExperimentPart04 = (table, groupCode, position) => {

    console.log("Placing");

    if (!this.hubChannel.can("spawn_camera")) return;
    
    const myExperiment = this.scene.systems["second-experiments"].getTaskById("04", groupCode);

    if (myExperiment) {
      myExperiment.parentNode.removeChild(myExperiment);
    } else {
      const entity = document.createElement("a-entity");

      const anchor = this.scene.querySelector(table);
      const anchorPos = anchor.getAttribute("position");
      const anchorRot = anchor.getAttribute("rotation");
      
      var networkId = encodeNetworkId("04", groupCode, position);

      entity.setAttribute("networked", { template: "#interactable-second-experiment-04-camera", networkId: networkId });
      entity.setAttribute("position", {x: anchorPos.x, y: anchorPos.y, z: anchorPos.z});
      entity.setAttribute("rotation", {x: anchorRot.x, y: anchorRot.y, z: anchorRot.z});
      this.scene.appendChild(entity);
      
    }
  };

  _spawnSecondExperimentPart05 = (table, groupCode, position) => {

    console.log("Placing");

    if (!this.hubChannel.can("spawn_camera")) return;
    
    const myExperiment = this.scene.systems["second-experiments"].getTaskById("05", groupCode);

    if (myExperiment) {
      myExperiment.parentNode.removeChild(myExperiment);
    } else {
      const entity = document.createElement("a-entity");

      const anchor = this.scene.querySelector(table);
      const anchorPos = anchor.getAttribute("position");
      const anchorRot = anchor.getAttribute("rotation");
      
      var networkId = encodeNetworkId("05", groupCode, position);

      entity.setAttribute("networked", { template: "#interactable-second-experiment-05-camera", networkId: networkId });
      entity.setAttribute("position", {x: anchorPos.x, y: anchorPos.y, z: anchorPos.z});
      entity.setAttribute("rotation", {x: anchorRot.x, y: anchorRot.y, z: anchorRot.z});
      this.scene.appendChild(entity);
      
    }
  };

  _spawnSecondExperimentPart06 = (table, groupCode, position) => {

    console.log("Placing");

    if (!this.hubChannel.can("spawn_camera")) return;
    
    const myExperiment = this.scene.systems["second-experiments"].getTaskById("06", groupCode);

    if (myExperiment) {
      myExperiment.parentNode.removeChild(myExperiment);
    } else {
      const entity = document.createElement("a-entity");

      const anchor = this.scene.querySelector(table);
      const anchorPos = anchor.getAttribute("position");
      const anchorRot = anchor.getAttribute("rotation");
      
      var networkId = encodeNetworkId("06", groupCode, position);

      entity.setAttribute("networked", { template: "#interactable-second-experiment-06-camera", networkId: networkId });
      entity.setAttribute("position", {x: anchorPos.x, y: anchorPos.y, z: anchorPos.z});
      entity.setAttribute("rotation", {x: anchorRot.x, y: anchorRot.y, z: anchorRot.z});
      this.scene.appendChild(entity);
      
    }
  };

  _spawnThirdExperimentPart01 = (table, groupCode, position) => {

    console.log("Placing");

    if (!this.hubChannel.can("spawn_camera")) return;
    
    const myExperiment = this.scene.systems["third-experiments"].getTaskById("01", groupCode);

    if (myExperiment) {
      myExperiment.parentNode.removeChild(myExperiment);
    } else {
      const entity = document.createElement("a-entity");

      const anchor = this.scene.querySelector(table);
      const anchorPos = anchor.getAttribute("position");
      const anchorRot = anchor.getAttribute("rotation");
      
      var networkId = encodeNetworkId("01", groupCode, position);

      entity.setAttribute("networked", { template: "#interactable-third-experiment-01-camera", networkId: networkId });
      entity.setAttribute("position", {x: anchorPos.x, y: anchorPos.y, z: anchorPos.z});
      entity.setAttribute("rotation", {x: anchorRot.x, y: anchorRot.y, z: anchorRot.z});
      this.scene.appendChild(entity);
      
    }
};

  _setupRobot = () => {
    this.scene.addEventListener("action_toggle_robot", () => {
      if (!this.hubChannel.can("spawn_camera")) return;

      console.log("Spawning a Robot");
      
      const myRobot = this.scene.systems["robot-tools"].getMyRobot();

      if (myRobot) {
        myRobot.parentNode.removeChild(myRobot);
      } else {
        const entity = document.createElement("a-entity");

        const distToPlayer = 2.5;
        const camera = document.querySelector("#avatar-pov-node");
        const povRotation =  camera.getAttribute("rotation");

        var radAngle =  deg2rad * povRotation.y;
        var dir = {x: -Math.sin(radAngle), z:  -Math.cos(radAngle)};

        entity.setAttribute("networked", { template: "#interactable-robot-camera" });
        entity.setAttribute("offset-relative-to", {
          target: "#avatar-rig",
          offset: { x: dir.x * distToPlayer, y: 0.0, z: dir.z * distToPlayer},
          lookAt: true
        });
        this.scene.appendChild(entity);
      
      }
    });
  };

  _spawnAvatar = () => {
    this.avatarRig.setAttribute("networked", "template: #remote-avatar; attachTemplateToLocal: false;");
    this.avatarRig.setAttribute("networked-avatar", "");
    this.avatarRig.emit("entered");
  };

  _runBot = async () => {
    const audioEl = document.createElement("audio");
    let audioInput;
    let dataInput;

    // Wait for startup to render form
    do {
      audioInput = document.querySelector("#bot-audio-input");
      dataInput = document.querySelector("#bot-data-input");
      await nextTick();
    } while (!audioInput || !dataInput);

    const getAudio = () => {
      audioEl.loop = true;
      audioEl.muted = false;
      audioEl.crossorigin = "anonymous";
      audioEl.src = URL.createObjectURL(audioInput.files[0]);
      document.body.appendChild(audioEl);
    };

    if (audioInput.files && audioInput.files.length > 0) {
      getAudio();
    } else {
      audioInput.onchange = getAudio;
    }

    const camera = document.querySelector("#avatar-pov-node");
    const leftController = document.querySelector("#player-left-controller");
    const rightController = document.querySelector("#player-right-controller");
    const getRecording = () => {
      fetch(URL.createObjectURL(dataInput.files[0]))
        .then(resp => resp.json())
        .then(recording => {
          camera.setAttribute("replay", "");
          camera.components["replay"].poses = recording.camera.poses;

          leftController.setAttribute("replay", "");
          leftController.components["replay"].poses = recording.left.poses;
          leftController.removeAttribute("visibility-by-path");
          leftController.removeAttribute("track-pose");
          leftController.setAttribute("visible", true);

          rightController.setAttribute("replay", "");
          rightController.components["replay"].poses = recording.right.poses;
          rightController.removeAttribute("visibility-by-path");
          rightController.removeAttribute("track-pose");
          rightController.setAttribute("visible", true);
        });
    };

    if (dataInput.files && dataInput.files.length > 0) {
      getRecording();
    } else {
      dataInput.onchange = getRecording;
    }

    await new Promise(resolve => audioEl.addEventListener("canplay", resolve));

    const audioStream = audioEl.captureStream
      ? audioEl.captureStream()
      : audioEl.mozCaptureStream
        ? audioEl.mozCaptureStream()
        : null;

    if (audioStream) {
      let audioVolume = Number(qs.get("audio_volume") || "1.0");
      if (isNaN(audioVolume)) {
        audioVolume = 1.0;
      }
      const audioContext = THREE.AudioContext.getContext();
      const audioSource = audioContext.createMediaStreamSource(audioStream);
      const audioDestination = audioContext.createMediaStreamDestination();
      const gainNode = audioContext.createGain();
      audioSource.connect(gainNode);
      gainNode.connect(audioDestination);
      gainNode.gain.value = audioVolume;
      this.mediaDevicesManager.mediaStream.addTrack(audioDestination.stream.getAudioTracks()[0]);
    }

    await APP.dialog.setLocalMediaStream(this.mediaDevicesManager.mediaStream);
    audioEl.play();
  };
}
