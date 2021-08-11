import { waitForDOMContentLoaded } from "../utils/async-utils";


const CAMERA_UPDATE_FRAME_DELAY = 10; // Update one camera every N'th frame

// Used for tracking and managing camera tools in the scene
AFRAME.registerSystem("machine-tools", {
  init() {
    this.machineEls = [];
    this.cameraUpdateCount = 0;
    this.ticks = 0;
    this.updateMyMachine = this.updateMyMachine.bind(this);

    waitForDOMContentLoaded().then(() => {
      const playerModelEl = document.querySelector("#avatar-rig .model");
      playerModelEl.addEventListener("model-loading", () => (this.playerHead = null));
      playerModelEl.addEventListener("model-loaded", this.updatePlayerHead.bind(this));
      this.updatePlayerHead();
      this.updateMyMachine();
    });
  },

  updatePlayerHead() {
    const headEl = document.getElementById("avatar-head");
    this.playerHead = headEl && headEl.object3D;
  },

  register(el) {
    this.machineEls.push(el);
    el.addEventListener("ownership-changed", this.updateMyMachine);
    this.updateMyMachine();
  },

  deregister(el) {
    this.machineEls.splice(this.machineEls.indexOf(el), 1);
    el.removeEventListener("ownership-changed", this.updateMyMachine);
    this.updateMyMachine();
  },

  getMyMachine() {
    return this.myMachine;
  },


  updateMyMachine() {
    this.myMachine = this.machineEls.find(NAF.utils.isMine);

    if (this.myMachine) {
      this.sceneEl.addState("machine");
    } else {
      this.sceneEl.removeState("machine");
    }
  },

  tick() {
    this.ticks++;
  }
});
