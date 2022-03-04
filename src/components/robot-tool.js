//TODO_LAURA_SOUND: import your new sounds here !
import { SOUND_MEDIA_LOADED, SOUND_ERROR_BUTTON, SOUND_SUCCESS_BUTTON } from "../systems/sound-effects-system";

import { cloneObject3D } from "../utils/three-utils";
import { loadModel } from "./gltf-model-plus";
import { waitForDOMContentLoaded } from "../utils/async-utils";
import robotModelSrc from "../assets/robot.glb";

const robotModelPromise = waitForDOMContentLoaded().then(() => loadModel(robotModelSrc));

// ANIMATIONS
// robotAction (back & forth)
// robot_headAction (head tilt)



AFRAME.registerComponent("robot-tool", {
  schema: {
  },

  init() {
    
    this.el.object3D.visible = false; // Make invisible until model ready
    this.lastUpdate = performance.now();


    this.voiceRecording = false;
   
    this.el.sceneEl.addEventListener("stateadded", () => this.updateUI());
    this.el.sceneEl.addEventListener("stateremoved", () => this.updateUI());

    robotModelPromise.then(model => {
      const mesh = cloneObject3D(model.scene);
      mesh.scale.set(3.0, 3.0, 3.0);
      mesh.matrixNeedsUpdate = true;
      this.el.setObject3D("mesh", mesh);

      this.el.object3D.visible = true;
      this.el.object3D.scale.set(1.0, 1.0, 1.0);
      this.el.object3D.matrixNeedsUpdate = true;

      
      this.el.setAttribute("animation-mixer", {});
      this.el.components["animation-mixer"].initMixer(mesh.animations);

      this.simpleAnim = this.el.components["simple-animation"];
      this.simpleAnim.printAnimations();


      this.speakButton = this.el.querySelector(".robot-button-speak");
      this.speakButtonIcon = this.el.querySelector('.robot-button-speak-icon');

      if (this.speakButton)
      {
        this.speakButton.object3D.addEventListener("interact", () => this.onClickPlay());
      }

      this.speakButton.object3D.visible = true;
      
      // Callback for when the animation is done
      this.simpleAnim.initFinishedCallback((e) => { this.onAnimationDone(e.action._clip.name);});

      this.updateUI();

      this.robotSystem = this.el.sceneEl.systems["robot-tools"];
      this.robotSystem.register(this.el);

      this.messageDispatch = document.querySelector("#avatar-rig").messageDispatch;
    });
  },

  remove() {
    this.robotSystem.deregister(this.el);
  },

  updateUI() {

  },


  tick() {
    // This is a state machine, nothing needs to be rendered every frame
  },

  onClickPlay()
  {
    console.log("Click");

    this.voiceRecording = !this.voiceRecording;

    console.log("Recording : " + this.voiceRecording);

    this.speakButtonIcon.setAttribute("icon-button", "active", this.voiceRecording);

    if (this.voiceRecording)
    {
      this.simpleAnim.playClip("robot_headAction", true);

      if (this.messageDispatch) {
        this.messageDispatch.dispatch("@botstart");
      }
    }
    else  
    {
      this.simpleAnim.resetClips();
      
      if (this.messageDispatch) {
        this.messageDispatch.dispatch("@botstop");
      }
    }
  },

  onAnimationDone(animName)
  {
    console.log("OnAnimationDone called");
  },

  playSound(soundId)
  {
    const sceneEl = this.el.sceneEl;
    sceneEl.systems["hubs-systems"].soundEffectsSystem.playSoundOneShot(soundId);
  },

  onSpeakStarted(text)
  {
  
  },
});
