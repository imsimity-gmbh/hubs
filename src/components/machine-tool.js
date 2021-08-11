import { addAndArrangeMedia } from "../utils/media-utils";
import { ObjectTypes } from "../object-types";
import { paths } from "../systems/userinput/paths";
import { SOUND_CAMERA_TOOL_TOOK_SNAPSHOT, SOUND_CAMERA_TOOL_COUNTDOWN } from "../systems/sound-effects-system";
import { getAudioFeedbackScale } from "./audio-feedback";
import { cloneObject3D } from "../utils/three-utils";
import { loadModel } from "./gltf-model-plus";
import { waitForDOMContentLoaded } from "../utils/async-utils";
import { findAncestorWithComponent } from "../utils/scene-graph";
import machineModelSrc from "../assets/machine_tool.glb";
import anime from "animejs";

const machineModelPromise = waitForDOMContentLoaded().then(() => loadModel(machineModelSrc));

const pathsMap = {
  "player-right-controller": {
    takeSnapshot: paths.actions.rightHand.takeSnapshot
  },
  "player-left-controller": {
    takeSnapshot: paths.actions.leftHand.takeSnapshot
  },
  "right-cursor": {
    takeSnapshot: paths.actions.cursor.right.takeSnapshot
  },
  "left-cursor": {
    takeSnapshot: paths.actions.cursor.left.takeSnapshot
  }
};

const isMobileVR = AFRAME.utils.device.isMobileVR();

const VIEWFINDER_FPS = 6;
const VIDEO_FPS = 25;
// Prefer h264 if available due to faster decoding speec on most platforms
const videoCodec = ["h264", "vp9,opus", "vp8,opus", "vp9", "vp8"].find(
  codec => window.MediaRecorder && MediaRecorder.isTypeSupported(`video/webm; codecs=${codec}`)
);
const videoMimeType = videoCodec ? `video/webm; codecs=${videoCodec}` : null;
const hasWebGL2 = !!document.createElement("canvas").getContext("webgl2");
const allowVideo = !!videoMimeType && hasWebGL2;


AFRAME.registerComponent("machine-tool", {
  schema: {
    captureAudio: { default: false },
    isSnapping: { default: false },
    isRecording: { default: false },
    label: { default: "" }
  },

  init() {

    console.log("MACHINE");

    this.el.object3D.visible = false; // Make invisible until model ready
    this.lastUpdate = performance.now();
    this.localSnapCount = 0; // Counter that is used to arrange photos/videos

   
    this.el.sceneEl.addEventListener("stateadded", () => this.updateUI());
    this.el.sceneEl.addEventListener("stateremoved", () => this.updateUI());

    machineModelPromise.then(model => {
      const mesh = cloneObject3D(model.scene);
      mesh.scale.set(1, 1, 1);
      mesh.matrixNeedsUpdate = true;
      this.el.setObject3D("mesh", mesh);

      this.el.object3D.visible = true;
      this.el.object3D.scale.set(1.0, 1.0, 1.0);
      this.el.object3D.matrixNeedsUpdate = true;
      
      const obj = this.el.object3D;

      
      this.el.setAttribute("animation-mixer", {});
      this.el.components["animation-mixer"].initMixer(model.animations);

      this.simpleAnim = this.el.components["simple-animation"];

      this.simpleAnim.initFinishedCallback(function(e) { 
        //console.log("finished :" + JSON.stringify(e.action.clip));
      });
      this.simpleAnim.playClip("door_02");
     
      this.label = this.el.querySelector(".label");
      
      this.updateUI();

      this.machineSystem = this.el.sceneEl.systems["machine-tools"];
      this.machineSystem.register(this.el);

    });
  },

  remove() {
    this.machineSystem.deregister(this.el);
  },

  
  
  update() {
    this.updateUI();
  },

  updateUI() {
    
  },

  

  tick() {

  }
});
