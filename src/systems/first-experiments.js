import { waitForDOMContentLoaded } from "../utils/async-utils";


// Used for tracking and managing camera tools in the scene
AFRAME.registerSystem("first-experiments", {
  init() {
    this.experimentsEls = [];
    this.ticks = 0;
    this.updateMyExperiment = this.updateMyExperiment.bind(this);

    waitForDOMContentLoaded().then(() => {
      this.updateMyExperiment();
    });
  },

  register(el) {
    this.experimentEls.push(el);
    el.addEventListener("ownership-changed", this.updateMyExperiment);
    this.updateMyExperiment();
  },

  deregister(el) {
    this.experimentEls.splice(this.experimentEls.indexOf(el), 1);
    el.removeEventListener("ownership-changed", this.updateMyExperiment);
    this.updateMyExperiment();
  },

  getMyExperiment() {
    return this.myExp;
  },


  updateMyExperiment() {
    this.myExp = this.experimentEls.find(NAF.utils.isMine);

    if (this.myExp) {
      this.sceneEl.addState("firstexperiment");
    } else {
      this.sceneEl.removeState("firstexperiment");
    }
  },

  tick() {
    this.ticks++;
  }
});
