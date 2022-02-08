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
    playing: { default: false }
  },

  init() {
    
    this.el.object3D.visible = false; // Make invisible until model ready
    this.lastUpdate = performance.now();


    this.localPlaying = false;
   
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


      this.playButton = this.el.querySelector(".robot-button");

      if (this.playButton)
      {
        this.playButton.object3D.addEventListener("interact", () => this.onClickPlay());
      }

      this.playButton.object3D.visible = true;
      
      // Callback for when the animation is done
      this.simpleAnim.initFinishedCallback((e) => { this.onAnimationDone(e.action._clip.name);});

      this.updateUI();

      this.robotSystem = this.el.sceneEl.systems["robot-tools"];
      this.robotSystem.register(this.el);

    });
  },

  remove() {
    this.robotSystem.deregister(this.el);
  },

  updateUI() {

    console.log("Upade UI called");

    if (!this.simpleAnim == null|| this.data.playing  == null)
    {
      console.log("Something isn't initialized");
      return;
    }
      
    console.log("Local : " + this.localPlaying);
    console.log("Networked : " + this.data.playing);


    if (this.data.playing != this.localPlaying)
    {
      
      this.playButton.object3D.visible = !this.data.playing;

      if (this.data.playing == true)
      {
        this.simpleAnim.resetClips();
        this.simpleAnim.playClip("robotAction", THREE.LoopOnce, false);
        this.playSound(SOUND_SUCCESS_BUTTON);
      }

      this.localPlaying = this.data.playing;
    }

  },


  tick() {
    // This is a state machine, nothing needs to be rendered every frame
  },

  onClickPlay()
  {
    console.log("Click");

    if (this.localPlaying)
      return;

    NAF.utils.getNetworkedEntity(this.el).then(networkedEl => {
      
      NAF.utils.takeOwnership(networkedEl);

      this.el.setAttribute("robot-tool", "playing", true);      

      this.updateUI();
    });

    
  },

  onAnimationDone(animName)
  {
    console.log("OnAnimationDone called");

    if (NAF.utils.isMine(this.el)) {

      this.el.setAttribute("robot-tool", "playing", false);
      

      this.updateUI();
    }
  },

  playSound(soundId)
  {
    const sceneEl = this.el.sceneEl;
    sceneEl.systems["hubs-systems"].soundEffectsSystem.playSoundOneShot(soundId);
  },
});
