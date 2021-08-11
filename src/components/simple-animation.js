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

  playClip(clipName) {
    const { mixer, animations } = this.mixerEl.components["animation-mixer"];

    //console.log(mixer);
    //console.log(animations);

    // if the animations arent loaded yet

    if (!animations)
    {
      console.warn(`Animations are not loaded inside the Animation Mixer of ${this.el.className}`);
      return;
    }
      
    

    if (animations.length === 0) 
    {
      return;
    }

    const clip = animations.find(({ name }) => name === clipName);

    if (!clip) {
      console.warn(`Could not find animation named '${n}' in ${this.el.className}`);
      return;
    }

    console.log(clip);

    this.currentActions.length = 0;

    const mesh = this.el.object3D.children[GROUP_ID];

    console.log(mesh);

    const action = mixer.clipAction(clip, mesh);
    action.enabled = true;
    action.setLoop(THREE.LoopOnce, Infinity).play();
    action.clampWhenFinished = true;
    this.currentActions.push(action);
    
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
  }
});
