import { waitForDOMContentLoaded } from "../utils/async-utils";


// Used for tracking and managing camera tools in the scene
AFRAME.registerSystem("robot-tools", {
  init() {
    this.robotEls = [];
    this.cameraUpdateCount = 0;
    this.ticks = 0;
    this.updateMyRobot = this.updateMyRobot.bind(this);

    waitForDOMContentLoaded().then(() => {
      const playerModelEl = document.querySelector("#avatar-rig .model");
      playerModelEl.addEventListener("model-loading", () => (this.playerHead = null));
      playerModelEl.addEventListener("model-loaded", this.updatePlayerHead.bind(this));
      this.updatePlayerHead();
      this.updateMyRobot();
    });
  },

  updatePlayerHead() {
    const headEl = document.getElementById("avatar-head");
    this.playerHead = headEl && headEl.object3D;
  },

  register(el) {
    this.robotEls.push(el);
    el.addEventListener("ownership-changed", this.updateMyMachine);
    this.updateMyRobot();
  },

  deregister(el) {
    this.robotEls.splice(this.robotEls.indexOf(el), 1);
    el.removeEventListener("ownership-changed", this.updateMyMachine);
    this.updateMyRobot();
  },

  getMyRobot() {
    return this.myRobot;
  },


  updateMyRobot() {
    this.myRobot = this.robotEls.find(NAF.utils.isMine);

    if (this.myRobot) {
      this.sceneEl.addState("robot");
    } else {
      this.sceneEl.removeState("robot");
    }
  },

  tick() {
    this.ticks++;
  }
});
