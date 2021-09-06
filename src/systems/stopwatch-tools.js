import { waitForDOMContentLoaded } from "../utils/async-utils";


// Used for tracking and managing camera tools in the scene
AFRAME.registerSystem("stopwatch-tools", {
  init() {
    this.machineEls = [];
    this.cameraUpdateCount = 0;
    this.ticks = 0;
    this.updateMyStopwatch = this.updateMyStopwatch.bind(this);

    waitForDOMContentLoaded().then(() => {
      const playerModelEl = document.querySelector("#avatar-rig .model");
      playerModelEl.addEventListener("model-loading", () => (this.playerHead = null));
      playerModelEl.addEventListener("model-loaded", this.updatePlayerHead.bind(this));
      this.updatePlayerHead();
      this.updateMyStopwatch();
    });
  },

  updatePlayerHead() {
    const headEl = document.getElementById("avatar-head");
    this.playerHead = headEl && headEl.object3D;
  },

  register(el) {
    this.machineEls.push(el);
    el.addEventListener("ownership-changed", this.updateMyStopwatch);
    this.updateMyStopwatch();
  },

  deregister(el) {
    this.machineEls.splice(this.machineEls.indexOf(el), 1);
    el.removeEventListener("ownership-changed", this.updateMyStopwatch);
    this.updateMyStopwatch();
  },

  getMyStopwatch() {
    return this.myMachine;
  },


  updateMyStopwatch() {
    this.myMachine = this.machineEls.find(NAF.utils.isMine);

    if (this.myMachine) {
      this.sceneEl.addState("stopwatch");
    } else {
      this.sceneEl.removeState("stopwatch");
    }
  },

  tick() {
    this.ticks++;
  }
});
