import { waitForDOMContentLoaded } from "../../utils/async-utils";
import { cloneObject3D } from "../../utils/three-utils";
import { loadModel } from ".././gltf-model-plus";
import grindedSampleSrc from "../../assets/models/GecoLab/ground_sample_grinded.glb";

const grindedSampleModelPromise = waitForDOMContentLoaded().then(() => loadModel(grindedSampleSrc));
 
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
        this.spawnItem(grindedSampleModelPromise, new THREE.Vector3(-1.5, 0.8, 0), this.groundSample1);
        this.groundSample2 = this.el.querySelector(".ground-sample-2");
        this.spawnItem(grindedSampleModelPromise, new THREE.Vector3(0, 0.8, 0), this.groundSample2);
        this.groundSample3 = this.el.querySelector(".ground-sample-3");
        this.spawnItem(grindedSampleModelPromise, new THREE.Vector3(1.5, 0.8, 0), this.groundSample3);

        this.groundSample1Btn = this.el.querySelector(".ground-sample-btn-1");
        this.groundSample1Btn.object3D.addEventListener("interact", () => this.onChooseGroundSample());

        this.groundSample2Btn = this.el.querySelector(".ground-sample-btn-2");
        this.groundSample2Btn.object3D.addEventListener("interact", () => this.onChooseGroundSample());

        this.groundSample3Btn = this.el.querySelector(".ground-sample-btn-3");
        this.groundSample3Btn.object3D.addEventListener("interact", () => this.onChooseGroundSample());

        this.multipleChoice = this.el.querySelector("#multiple-choice-question");
        this.multipleChoice.object3D.visible = false; 

        this.updateUI();

        this.expSystem.registerTask(this.el, "01");
      });

      this.onFinishPart01Callback = [];
      this.onSubmitMultipleChoice = AFRAME.utils.bind(this.onSubmitMultipleChoice, this);
    },

    subscribe(eventName, fn)
    {
      switch(eventName) {
        case "onFinishPart01":
          this.onFinishPart01Callback.push(fn);
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
          entity.object3D.scale.set(3.0, 3.0, 3.0);
          entity.setAttribute("position", {x: position.x, y: position.y, z: position.z});
          entity.object3D.matrixNeedsUpdate = true;
          console.log(entity);
      });
    },

    onChooseGroundSample() {
        this.groundSamplesWrapper.object3D.visible = false;

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