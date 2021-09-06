//TODO_LAURA_SOUND: import your new sounds here !
import { SOUND_MEDIA_LOADED, SOUND_ERROR_BUTTON, SOUND_SUCCESS_BUTTON } from "../systems/sound-effects-system";

import { cloneObject3D } from "../utils/three-utils";
import { loadModel } from "./gltf-model-plus";
import { waitForDOMContentLoaded } from "../utils/async-utils";
import stopwatchModelSrc from "../assets/camera_tool.glb";

const stopwatchModelPromise = waitForDOMContentLoaded().then(() => loadModel(stopwatchModelSrc));

AFRAME.registerComponent("stopwatch-tool", {
  // TODO: network the right variables
  schema: {
  },

  init() {

    this.el.object3D.visible = false; // Make invisible until model ready
    this.lastUpdate = performance.now();

    this.el.sceneEl.addEventListener("stateadded", () => this.updateUI());
    this.el.sceneEl.addEventListener("stateremoved", () => this.updateUI());

    stopwatchModelPromise.then(model => {
      const mesh = cloneObject3D(model.scene);
      mesh.scale.set(1, 1, 1);
      mesh.matrixNeedsUpdate = true;
      this.el.setObject3D("mesh", mesh);

      this.el.object3D.visible = true;
      this.el.object3D.scale.set(1.0, 1.0, 1.0);
      this.el.object3D.matrixNeedsUpdate = true;
      
      
      //this.myButton = this.el.querySelector(".my-button-name");
      //this.myButton.object3D.addEventListener("interact", () => this.onMyButtonClick());

    
      this.updateUI();

      this.stopwatchSystem = this.el.sceneEl.systems["stopwatch-tools"];
      this.stopwatchSystem.register(this.el);

    });
  },

  remove() {
    this.stopwatchSystem.deregister(this.el);
  },

  
  
  update() {
    this.updateUI();
  },

  updateUI() {
  
  },

  

  tick() {
    // This is a state machine, nothing needs to be rendered every frame
  },

  onMyButtonClick()
  {
    //console.log("Click !");
  },
});
