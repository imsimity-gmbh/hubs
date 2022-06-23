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
    this.experiments05Els = [];
    this.experiments06Els = [];

    this.experimentPlacers = [];

    this.ticks = 0;
    this.updateMyExperiment = this.updateMyExperiment.bind(this);
    this.updateMyExperimentTask = this.updateMyExperimentTask.bind(this);

    waitForDOMContentLoaded().then(() => {
      this.updateMyExperiment();

      this.updateMyExperimentTask('01');
      this.updateMyExperimentTask('02');
      this.updateMyExperimentTask('03');
      this.updateMyExperimentTask('04');
      this.updateMyExperimentTask('05');  
      this.updateMyExperimentTask('06');    
      
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
        this.experiments04Els.push(el);
        el.addEventListener("ownership-changed", () => this.updateMyExperimentTask(id));
        this.updateMyExperimentTask(id);
        break;
      case "05":
        this.experiments05Els.push(el);
        el.addEventListener("ownership-changed", () => this.updateMyExperimentTask(id));
        this.updateMyExperimentTask(id);
        break;
      case "06":
        this.experiments06Els.push(el);
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
      case "05":
        this.experiments05Els.splice(this.experiments05Els.indexOf(el), 1);
        el.removeEventListener("ownership-changed", () => this.updateMyExperimentTask(id));
        this.updateMyExperimentTask(id);
        break;
      case "06":
        this.experiments06Els.splice(this.experiments06Els.indexOf(el), 1);
        el.removeEventListener("ownership-changed", () => this.updateMyExperimentTask(id));
        this.updateMyExperimentTask(id);
        break;
    }
  },

  getMyExperiment() {

    this.updateMyExperiment();

    return this.myExpBase;
  },

  getTaskById(id) {

    this.updateMyExperimentTask(id);

    switch(id) {
      case "01":
        return this.myExp01;
      case "02":
        return this.myExp02;
      case "03":
        return this.myExp03;
      case "04":
        return this.myExp04;
      case "05":
        return this.myExp05;
      case "06":
        return this.myExp06;
    }
  },


  updateMyExperiment() {
    this.myExpBase = this.experimentsBaseEls.length > 0 ? this.experimentsBaseEls[0] : null; //.find(NAF.utils.isMine);
    if (this.myExpBase) {
      this.sceneEl.addState("firstexperiment");
    } else {
      this.sceneEl.removeState("firstexperiment");
    }
  },

  updateMyExperimentTask(id) {
    switch(id) {
      case "01":
        this.myExp01 =  this.experiments01Els.length > 0 ? this.experiments01Els[0] : null; //.find(NAF.utils.isMine);
        if (this.myExp01) {
          this.sceneEl.addState("firstexperiment-01");
        } else {
          this.sceneEl.removeState("firstexperiment-01");
        }
        break;
      case "02":
        this.myExp02 = this.experiments02Els.length > 0 ?  this.experiments02Els[0] : null; //.find(NAF.utils.isMine);
        if (this.myExp02) {
          this.sceneEl.addState("firstexperiment-02");
        } else {
          this.sceneEl.removeState("firstexperiment-02");
        }
        break;
      case "03":
        this.myExp03 =  this.experiments03Els.length > 0 ?  this.experiments03Els[0] : null; //.find(NAF.utils.isMine);
        if (this.myExp03) {
          this.sceneEl.addState("firstexperiment-03");
        } else {
          this.sceneEl.removeState("firstexperiment-03");
        }
        break;
      case "04":
        this.myExp04 = this.experiments04Els.length > 0 ?  this.experiments04Els[0] : null; //.find(NAF.utils.isMine);
        if (this.myExp04) {
          this.sceneEl.addState("firstexperiment-04");
        } else {
          this.sceneEl.removeState("firstexperiment-04");
        }
        break;
      case "05":
        this.myExp05 = this.experiments05Els.length > 0 ?  this.experiments05Els[0] : null; //.find(NAF.utils.isMine);
        if (this.myExp05) {
          this.sceneEl.addState("firstexperiment-05");
        } else {
          this.sceneEl.removeState("firstexperiment-05");
        }
        break;
      case "06":
        this.myExp06 = this.experiments06Els.length > 0 ?  this.experiments06Els[0] : null; //.find(NAF.utils.isMine);
        if (this.myExp06) {
          this.sceneEl.addState("firstexperiment-06");
        } else {
          this.sceneEl.removeState("firstexperiment-06");
        }
        break;
    }
  },


  tick() {
    this.ticks++;
  }
});
