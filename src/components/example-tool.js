//TODO_LAURA_SOUND: import your new sounds here !
import { SOUND_MEDIA_LOADED, SOUND_ERROR_BUTTON, SOUND_SUCCESS_BUTTON } from "../systems/sound-effects-system";

import { cloneObject3D } from "../utils/three-utils";
import { loadModel } from "./gltf-model-plus";
import { waitForDOMContentLoaded } from "../utils/async-utils";
import stopwatchModelSrc from "../assets/robot.glb";

const stopwatchModelPromise = waitForDOMContentLoaded().then(() => loadModel(stopwatchModelSrc));

AFRAME.registerComponent("example-tool", {
  // TODO: network the right variables
  schema: {
  },

  init() {

    this.el.object3D.visible = false; // Make invisible until model ready
    this.lastUpdate = performance.now();

    // Call this.updateUI(); when a networked variable has been changed
    this.el.sceneEl.addEventListener("stateadded", () => this.updateUI());
    this.el.sceneEl.addEventListener("stateremoved", () => this.updateUI());

    stopwatchModelPromise.then(model => {
      const mesh = cloneObject3D(model.scene);
      mesh.scale.set(3, 3, 3);
      mesh.matrixNeedsUpdate = true;
      this.el.setObject3D("mesh", mesh);

      this.el.object3D.visible = true;
      this.el.object3D.scale.set(1.0, 1.0, 1.0);
      this.el.object3D.matrixNeedsUpdate = true;

      this.el.setAttribute("animation-mixer", {});
      this.el.components["animation-mixer"].initMixer(mesh.animations);
      
      this.simpleAnim = this.el.components["simple-animation"];

      this. animPaused = true;
      //Buttons:
      this.myPlayBtn = this.el.querySelector(".robot-start-btn");
      this.myPlayBtn.object3D.addEventListener("interact", () => this.onPlayClick());

      this.myPlayPauseBtn = this.el.querySelector(".robot-play-pause-btn");
      this.myPlayPauseBtn.object3D.addEventListener("interact", () => this.onPlayPauseClick());

      this.myStopBtn = this.el.querySelector(".robot-stop-btn");
      this.myStopBtn.object3D.addEventListener("interact", () => this.onStopClick());

    
      this.updateUI();

      this.stopwatchSystem = this.el.sceneEl.systems["example-tools"];
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

  onPlayClick()
  {
    if(this.animPaused == false)
      return;

    if(this.simpleAnim.getAnim("robotAction") == null)
      this.animPaused = false;
    this.simpleAnim.playClip("robotAction", true);
  },
  onPlayPauseClick() 
  {
    if(this.simpleAnim.currentActions.length > 0)
      this.animPaused = !this.animPaused;
    this.simpleAnim.pauseClip("robotAction", this.animPaused);
  },
  onStopClick()
  {
    if(this.simpleAnim.currentActions.length > 0)
      this.animPaused = true;
    this.simpleAnim.stopClip("robotAction");
  }

});
