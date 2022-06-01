import { waitForDOMContentLoaded } from "../../utils/async-utils";
import { cloneObject3D } from "../../utils/three-utils";
import { loadModel } from ".././gltf-model-plus";
import groundSampleSrc1 from "../../assets/models/GecoLab/ground-sample-coarse-1.glb";
import groundSampleSrc2 from "../../assets/models/GecoLab/ground-sample-coarse-2.glb";
import groundSampleSrc3 from "../../assets/models/GecoLab/ground-sample-coarse-3.glb";

const groundSampleModelPromise1 = waitForDOMContentLoaded().then(() => loadModel(groundSampleSrc1));
const groundSampleModelPromise2 = waitForDOMContentLoaded().then(() => loadModel(groundSampleSrc2));
const groundSampleModelPromise3 = waitForDOMContentLoaded().then(() => loadModel(groundSampleSrc3));
 
 AFRAME.registerComponent("first-experiment-01", {
    schema: {
    },
  
    init: function() {
      this.sceneEl = document.querySelector("a-scene");
      this.lastUpdate = performance.now();
     
      this.el.sceneEl.addEventListener("stateadded", () => this.updateUI());
      this.el.sceneEl.addEventListener("stateremoved", () => this.updateUI());

      waitForDOMContentLoaded().then(() => {
        this.expSystem = this.el.sceneEl.systems["first-experiments"];

        this.groundSamplesWrapper = this.el.querySelector(".ground-samples-wrapper");

        this.groundSample1 = this.el.querySelector(".ground-sample-1");
        this.spawnItem(groundSampleModelPromise1, new THREE.Vector3(-1.5, 0.8, 0), this.groundSample1);
        this.groundSample2 = this.el.querySelector(".ground-sample-2");
        this.spawnItem(groundSampleModelPromise2, new THREE.Vector3(0, 0.8, 0), this.groundSample2);
        this.groundSample3 = this.el.querySelector(".ground-sample-3");
        this.spawnItem(groundSampleModelPromise3, new THREE.Vector3(1.5, 0.8, 0), this.groundSample3);

        this.groundSample1Btn = this.el.querySelector(".ground-sample-btn-1");
        this.groundSample1Btn.object3D.addEventListener("interact", () => this.onChooseGroundSample(1));

        this.groundSample2Btn = this.el.querySelector(".ground-sample-btn-2");
        this.groundSample2Btn.object3D.addEventListener("interact", () => this.onChooseGroundSample(2));

        this.groundSample3Btn = this.el.querySelector(".ground-sample-btn-3");
        this.groundSample3Btn.object3D.addEventListener("interact", () => this.onChooseGroundSample(3));

        this.multipleChoice = this.el.querySelector("#multiple-choice-question");
        this.multipleChoice.object3D.visible = false; 

        this.updateUI();

        this.expSystem.registerTask(this.el, "01");
      });

      this.groundSampleIndex = 0;

      this.onFinishPart01Callback = [];
      this.startPart02Callbacks = [];
      this.onSubmitMultipleChoice = AFRAME.utils.bind(this.onSubmitMultipleChoice, this);
    },

    subscribe(eventName, fn)
    {
      switch(eventName) {
        case "onFinishPart01":
          this.onFinishPart01Callback.push(fn);
          break;
        case "startPart02":
          this.startPart02Callbacks.push(fn);
          break;
      }
    },

    unsubscribe(eventName, fn)
    {
      switch(eventName) {
        case "onFinishPart01":
          let index = this.onFinishPart01Callback.indexOf(fn);
          this.onFinishPart01Callback.splice(index, 1);
          break;
        case "startPart02":
          let index2 = this.startPart02Callbacks.indexOf(fn);
          this.startPart02Callbacks.splice(index2, 1);
          break;
      }
    },
    
    updateUI: function() {

    },
  
    tick: function() {

    },

    spawnItem(promise, position, entity) {
      promise.then(model => {
          entity.object3D.visible = false;
          const mesh = cloneObject3D(model.scene);
          mesh.scale.set(3, 3, 3);
          mesh.matrixNeedsUpdate = true;
          entity.setObject3D("mesh", mesh);
      
          entity.object3D.visible = true;
          entity.object3D.scale.set(2.0, 2.0, 2.0);
          entity.setAttribute("position", {x: position.x, y: position.y, z: position.z});
          entity.object3D.matrixNeedsUpdate = true;
          console.log(entity);
      });
    },

    onChooseGroundSample(index) {
        this.groundSamplesWrapper.object3D.visible = false;
        this.groundSampleIndex = index;

        this.multipleChoice.object3D.visible = true; 
        if(this.multipleChoice != null)
            this.multipleChoice.components["multiple-choice-question"].subscribe("onSubmit", this.onSubmitMultipleChoice);
        else 
            console.log("Can't subscribe to multiple-choice1 callback, multiple-choice1 component not found");
    },

    notifyParent(correctAnswer, selectedAnswer) {
        this.onFinishPart01Callback.forEach(cb => {
          cb(correctAnswer, selectedAnswer);
        });
        this.startPart02Callbacks.forEach(cb => {
          cb(this.groundSampleIndex);
      });
    },

    onSubmitMultipleChoice(correctAnswer, selectedAnswer) {
      if(correctAnswer == selectedAnswer) {
        this.notifyParent(correctAnswer, selectedAnswer);
        setTimeout(() => {
          this.multipleChoice.object3D.visible = false; 
        }, 500);
      }
    }

  });