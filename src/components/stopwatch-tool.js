//TODO_LAURA_SOUND: import your new sounds here !
import { SOUND_MEDIA_LOADED, SOUND_ERROR_BUTTON, SOUND_SUCCESS_BUTTON } from "../systems/sound-effects-system";

import { cloneObject3D } from "../utils/three-utils";
import { loadModel } from "./gltf-model-plus";
import { waitForDOMContentLoaded } from "../utils/async-utils";
import stopwatchModelSrc from "../assets/camera_tool.glb";

// Change stopwatchModelSrc to your model
const stopwatchModelPromise = waitForDOMContentLoaded().then(() => loadModel(stopwatchModelSrc));

AFRAME.registerComponent("stopwatch-tool", {
  // TODO: network the right variables
  schema: {
  },


  // like Start() in Unity
  init() {

    this.el.object3D.visible = false; // Make invisible until model ready
    this.lastUpdate = performance.now();

    this.el.sceneEl.addEventListener("stateadded", () => this.updateUI());
    this.el.sceneEl.addEventListener("stateremoved", () => this.updateUI());

    // Load the 3D model
    stopwatchModelPromise.then(model => {
      const mesh = cloneObject3D(model.scene);
      mesh.scale.set(1, 1, 1);
      mesh.matrixNeedsUpdate = true;
      this.el.setObject3D("mesh", mesh);

      this.el.object3D.visible = true;
      this.el.object3D.scale.set(1.0, 1.0, 1.0);
      this.el.object3D.matrixNeedsUpdate = true;
      
      
      this.myStartButton = this.el.querySelector(".stopwatch-start-button");
      this.myStartButton.object3D.addEventListener("interact", () => this.onStartButtonClick());

      // Add Function callbacks to everybuttons (copy/paste like abover & rename)


      // Get the Text box

      // this.myTextBox = ??????;


      // this.myTextBox.object3D.text = "Some Text"; (00:00:00)

    
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

  
  // Like Update() in Unity
  tick() {
    // This is a state machine, nothing needs to be rendered every frame

    // If the Timer has started, calculate how long since it started

    // Display the text in 3D

  },

  onStartButtonClick()
  {
    console.log("Click !");

    this.startTime = performance.now();


  },

  // Stop function


  // Reset function
});
