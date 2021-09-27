import { waitForDOMContentLoaded } from "../utils/async-utils";


// Used for tracking and managing camera tools in the scene
AFRAME.registerSystem("example-tools", {
  init() {
    this.exampleEls = [];
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
    this.exampleEls.push(el);
    el.addEventListener("ownership-changed", this.updateMyStopwatch);
    this.updateMyStopwatch();
  },

  deregister(el) {
    this.exampleEls.splice(this.exampleEls.indexOf(el), 1);
    el.removeEventListener("ownership-changed", this.updateMyStopwatch);
    this.updateMyStopwatch();
  },

  getMyExample() {
    return this.myExample;
  },


  updateMyStopwatch() {
    this.myExample = this.exampleEls.find(NAF.utils.isMine);

    if (this.myExample) {
      this.sceneEl.addState("example");
    } else {
      this.sceneEl.removeState("example");
    }
  },

  tick() {
    this.ticks++;
  }
});
