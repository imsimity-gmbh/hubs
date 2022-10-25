import { findAncestorWithComponent } from "../utils/scene-graph";

/**
 * Loops the given clip using this entity's animation mixer
 * @component simple-animation
 */

const SCENE_ID = 0, GROUP_ID = 1;


AFRAME.registerComponent("simple-animation", {
  schema: {
    
  },

  init() {
    this.mixerEl = findAncestorWithComponent(this.el, "animation-mixer");
    this.currentActions = [];
    this.currentClips = [];

    if (!this.mixerEl) {
      console.warn("simple-animation component could not find an animation-mixer in its ancestors.");
      return;
    }
  },

  initFinishedCallback(callback)
  {
    const { mixer } = this.mixerEl.components["animation-mixer"];

    mixer.addEventListener('finished', function(e) { callback(e); });

    
  },

  playClip(clipName, loop, clamp) {
    const { mixer, animations } = this.mixerEl.components["animation-mixer"];

    //console.log(mixer);
    //console.log(animations);

    // if the animations arent loaded yet

    var loopState = (loop == null) ? THREE.LoopOnce : loop;
    var clampState = (clamp == null) ? true : clamp;

    if (!animations)
    {
      console.warn(`Animations are not loaded inside the Animation Mixer of ${this.el.className}`);
      return;
    }
      
    

    if (animations.length === 0) 
    {
      return;
    }

    if(this.getAction(clipName) != null) {
      console.warn(`Animation named '${clipName}' already exists`);
      return;
    }

    const clip = animations.find(({ name }) => name === clipName);

    if (!clip) {
      console.warn(`Could not find animation named '${clipName}' in ${this.el.className}`);
      return;
    }

    //console.log(clip);

    this.currentActions.length = 0;

    const mesh = this.el.object3D.children[GROUP_ID];

    //console.log(mesh);

    const action = this.createAction(clipName);
    action.enabled = true;
    action.setLoop(loopState, Infinity).play();
    action.clampWhenFinished = clampState;

    this.currentActions.push(action);
    this.currentClips.push(clip);
  },

  // We have to be careful with naming, because pause() also didn't work, as did play()!
  pauseClip(clipName, pauseState)
  {
    if(this.currentActions.length <= 0) {
      console.log("No animation playing");
      return;
    }

    const searchAction = this.getAction(clipName);
    if(searchAction == null) {
      console.log(`Animation named '${clipName}' doesn't exist`);
      return;
    }

    for (let i = 0; i < this.currentActions.length; i++) {
      if(searchAction == this.currentActions[i]) {
        this.currentActions[i].paused = pauseState;
      }
    }
  },
  
  stopClip(clipName)
  {
    if(this.currentActions.length <= 0) {
      console.log("No animation playing");
      return;
    }

    const searchAction = this.getAction(clipName);
    if(searchAction == null) {
      console.log(`Animation named '${clipName}' doesn't exist`);
      return;
    }

    for (let i = 0; i < this.currentActions.length; i++) {
      if(searchAction == this.currentActions[i]) {
        this.currentActions[i].stop();
        this.currentActions.splice(i, 1);
      }
    }
  },

  destroy() {
    for (let i = 0; i < this.currentActions.length; i++) {
      this.currentActions[i].enabled = false;
      this.currentActions[i].stop();
    }
    this.currentActions.length = 0;
  },

  printAnimations()
  {
    const { animations } = this.mixerEl.components["animation-mixer"];

    console.log(animations);
  },

  resetClips()
  {
    const { mixer } = this.mixerEl.components["animation-mixer"];
    const mesh = this.el.object3D.children[GROUP_ID];

    this.currentClips.forEach(clip => {
      var action = mixer.existingAction(clip, mesh);

      if (action)
      {
        action.enabled = false;
        action.stop();
      }
      
    });

    mixer.stopAllAction();

    this.currentClips = [];
    this.currentActions = [];
  },

  getAction(clipName)
  {
    const searchAction = this.createAction(clipName);

    for (let i = 0; i < this.currentActions.length; i++) {
      if(searchAction == this.currentActions[i]) {
        return this.currentActions[i];
      }
    }
    return null;
  },

  createAction(clipName) 
  {
    const { mixer, animations } = this.mixerEl.components["animation-mixer"];

    const clip = animations.find(({ name }) => name === clipName);
    const mesh = this.el.object3D.children[GROUP_ID];

    return mixer.clipAction(clip, mesh);
  }
});
