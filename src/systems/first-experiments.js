import { waitForDOMContentLoaded } from "../utils/async-utils";


// Used for tracking and managing camera tools in the scene
AFRAME.registerSystem("first-experiments", {
  init() {

    // TODO: Refactor for using a Pair <String, Element> (with String being the Group Access Code / groupId. (to track which experiment is linked to what in a same room))

    this.experimentsBaseEls = [];

    this.experiments01Els = [];
    this.experiments02Els = [];
    this.experiments03Els = [];
    this.experiments04Els = [];

    this.experimentPlacers = [];

    this.ticks = 0;
    this.updateMyExperiment = this.updateMyExperiment.bind(this);
    this.updateMyExperimentTask = this.updateMyExperimentTask.bind(this);
    this.updateMyExperimentPlacer = this.updateMyExperimentPlacer.bind(this);

    waitForDOMContentLoaded().then(() => {
      this.updateMyExperiment();
    });
  },

  register(el) {
    this.experimentsBaseEls.push(el);
    el.addEventListener("ownership-changed", this.updateMyExperiment);
    this.updateMyExperiment();
  },

  registerTask(el, id) {
    switch(id) {
      case "01":
        this.experiments01Els.push(el);
        el.addEventListener("ownership-changed", () => this.updateMyExperimentTask(id));
        this.updateMyExperimentTask(id);
        break;
      case "02":
        this.experiments02Els.push(el);
        el.addEventListener("ownership-changed", () => this.updateMyExperimentTask(id));
        this.updateMyExperimentTask(id);
        break;
      case "03":
        this.experiments03Els.push(el);
        el.addEventListener("ownership-changed", () => this.updateMyExperimentTask(id));
        this.updateMyExperimentTask(id);
        break;
      case "04":
        this.experiments03Els.push(el);
        el.addEventListener("ownership-changed", () => this.updateMyExperimentTask(id));
        this.updateMyExperimentTask(id);
        break;
    }
  },

  deregister(el) {
    this.experimentsBaseEls.splice(this.experimentsBaseEls.indexOf(el), 1);
    el.removeEventListener("ownership-changed", this.updateMyExperiment);
    this.updateMyExperiment();
  },

  deregisterTask(el, id) {
    switch(id) {
      case "01":
        this.experiments01Els.splice(this.experiments01Els.indexOf(el), 1);
        el.removeEventListener("ownership-changed", () => this.updateMyExperimentTask(id));
        this.updateMyExperimentTask(id);
        break;
      case "02":
        this.experiments02Els.splice(this.experiments02Els.indexOf(el), 1);
        el.removeEventListener("ownership-changed", () => this.updateMyExperimentTask(id));
        this.updateMyExperimentTask(id);
        break;
      case "03":
        this.experiments03Els.splice(this.experiments03Els.indexOf(el), 1);
        el.removeEventListener("ownership-changed", () => this.updateMyExperimentTask(id));
        this.updateMyExperimentTask(id);
        break;
      case "04":
        this.experiments04Els.splice(this.experiments04Els.indexOf(el), 1);
        el.removeEventListener("ownership-changed", () => this.updateMyExperimentTask(id));
        this.updateMyExperimentTask(id);
        break;
    }
  },

  getMyExperiment() {
    return this.myExpBase;
  },

  getTaskById(id) {
    switch(id) {
      case "01":
        return this.myExp01;
      case "02":
        return this.myExp02;
      case "03":
        return this.myExp03;
      case "04":
        return this.myExp04;
    }
  },


  updateMyExperiment() {
    this.myExpBase = this.experimentsBaseEls.find(NAF.utils.isMine);
    console.log(this.myExpBase);
    if (this.myExpBase) {
      this.sceneEl.addState("firstexperiment");
    } else {
      this.sceneEl.removeState("firstexperiment");
    }
  },

  updateMyExperimentTask(id) {
    switch(id) {
      case "01":
        this.myExp01 = this.experiments01Els.find(NAF.utils.isMine);
        console.log(this.myExp01);
        if (this.myExp01) {
          this.sceneEl.addState("firstexperiment-01");
        } else {
          this.sceneEl.removeState("firstexperiment-01");
        }
        break;
      case "02":
        this.myExp02 = this.experiments02Els.find(NAF.utils.isMine);
        console.log(this.myExp02);
        if (this.myExp02) {
          this.sceneEl.addState("firstexperiment-02");
        } else {
          this.sceneEl.removeState("firstexperiment-02");
        }
        break;
      case "03":
        this.myExp03 = this.experiments03Els.find(NAF.utils.isMine);
        console.log(this.myExp03);
        if (this.myExp03) {
          this.sceneEl.addState("firstexperiment-03");
        } else {
          this.sceneEl.removeState("firstexperiment-03");
        }
        break;
      case "04":
        this.myExp03 = this.experiments03Els.find(NAF.utils.isMine);
        console.log(this.myExp03);
        if (this.myExp03) {
          this.sceneEl.addState("firstexperiment-04");
        } else {
          this.sceneEl.removeState("firstexperiment-04");
        }
        break;
    }
  },

  updateMyExperimentPlacer() {
  
    this.myExpPlacer = this.experimentPlacers.find(NAF.utils.isMine);
    console.log(this.myExpPlacer);
    if (this.myExpPlacer) {
      this.sceneEl.addState("firstexperiment-placer-01");
    } else {
      this.sceneEl.removeState("firstexperiment-placer-01");
    }
  },

  registerPlacer(el) {
   
    this.experimentPlacers.push(el);
    el.addEventListener("ownership-changed", () => this.updateMyExperimentPlacer());
    this.updateMyExperimentPlacer();

  },

  deregisterPlacer(el) {
   
    this.experimentPlacers.splice(this.experimentPlacers.indexOf(el), 1);
    el.removeEventListener("ownership-changed", () => this.updateMyExperimentPlacer());
    this.updateMyExperimentPlacer();
  },


  getPlacer() {
    return this.myExpPlacer;
  },

  tick() {
    this.ticks++;
  }
});
