import { waitForDOMContentLoaded } from "../../utils/async-utils";
import { cloneObject3D } from "../../utils/three-utils";
import { loadModel } from ".././gltf-model-plus";
import groundSampleSrc1 from "../../assets/models/GecoLab/ground-sample-coarse-1.glb";
import groundSampleSrc2 from "../../assets/models/GecoLab/ground-sample-coarse-2.glb";

const groundSampleModelPromise1 = waitForDOMContentLoaded().then(() => loadModel(groundSampleSrc1));
const groundSampleModelPromise2 = waitForDOMContentLoaded().then(() => loadModel(groundSampleSrc2));

/* should be networked (buttons and multiple-choice), couldn't test yet, cause second user can't even go past the spawning of the experiment */
 
 AFRAME.registerComponent("first-experiment-01", {
    schema: {
      groundSampleChosen: {default: false},
      groundSampleIndex: {default: 0}
    },
  
    init: function() {
      this.sceneEl = document.querySelector("a-scene");
      this.lastUpdate = performance.now();
     
      this.el.sceneEl.addEventListener("stateadded", () => this.updateUI());
      this.el.sceneEl.addEventListener("stateremoved", () => this.updateUI());

      this.localGroundSampleClicked = false;
      this.localGroundSampleIndex = 0;
      this.startPart02Callbacks = [];
      this.groundSampleCallbacks = [];

      this.expSystem = this.el.sceneEl.systems["first-experiments"];
      this.expSystem.registerTask(this.el, "01");

      this.onSubmitMultipleChoice = AFRAME.utils.bind(this.onSubmitMultipleChoice, this);


      waitForDOMContentLoaded().then(() => {
        

        this.groundSamplesWrapper = this.el.querySelector(".ground-samples-wrapper");

        this.groundSample1 = this.el.querySelector(".ground-sample-1");
        this.spawnItem(groundSampleModelPromise1, new THREE.Vector3(-0.9, 0.8, 0), this.groundSample1, false);
        this.groundSample2 = this.el.querySelector(".ground-sample-2");
        this.spawnItem(groundSampleModelPromise2, new THREE.Vector3(0.9, 0.8, 0), this.groundSample2, false);

       
        this.btnWrapper = this.el.querySelector(".sample-btn-wrapper");
        this.btnWrapper.object3D.visible = false;

        this.groundSample1Btn = this.el.querySelector(".ground-sample-btn-1");
        this.groundSample1Btn.object3D.addEventListener("interact", () => this.onClickGroundSample(1));

        this.groundSample2Btn = this.el.querySelector(".ground-sample-btn-2");
        this.groundSample2Btn.object3D.addEventListener("interact", () => this.onClickGroundSample(2));
        
        this.scaleEntity = this.sceneEl.querySelector(".scale-entity");

        this.multipleChoice = this.el.querySelector("#multiple-choice-question");
        this.multipleChoice.object3D.visible = false; 

        this.updateUI();

      });

      
    },

    subscribe(eventName, fn)
    {
      switch(eventName) {
        case "startPart02":
          this.startPart02Callbacks.push(fn);
          break;
        case "groundSampleSelected":
          this.groundSampleCallbacks.push(fn);
          break;
      }
    },

    unsubscribe(eventName, fn)
    {
      switch(eventName) {
        case "startPart02":
          let index2 = this.startPart02Callbacks.indexOf(fn);
          this.startPart02Callbacks.splice(index2, 1);
          break;
      }
    },

    update() {
      waitForDOMContentLoaded().then(() => { 
        this.updateUI();
      });
    },
    
    updateUI: function() {
      if(this.localGroundSampleClicked != this.data.groundSampleChosen) {
        this.localGroundSampleIndex = this.data.groundSampleIndex;
        this.chooseGroundSample();
        this.localGroundSampleClicked = this.data.groundSampleChosen;
      }
    },
  
    tick: function() {

    },

    spawnItem(promise, position, entity, show) {
      promise.then(model => {
          entity.object3D.visible = false;
          const mesh = cloneObject3D(model.scene);
          mesh.scale.set(3, 3, 3);
          mesh.matrixNeedsUpdate = true;
          entity.setObject3D("mesh", mesh);
      
          if(show)
            entity.object3D.visible = true;
          entity.object3D.scale.set(2.0, 2.0, 2.0);
          entity.setAttribute("position", {x: position.x, y: position.y, z: position.z});
          entity.object3D.matrixNeedsUpdate = true;
          console.log(entity);
      });
    },

    startPart01() {

      console.log('Show Ground Sample');

      this.groundSample1.object3D.visible = true;
      this.groundSample2.object3D.visible = true;

      this.btnWrapper.object3D.visible = true;
    },

    onClickGroundSample(index) {
      NAF.utils.getNetworkedEntity(this.el).then(networkedEl => {
    
        NAF.utils.takeOwnership(networkedEl);
  
        this.el.setAttribute("first-experiment-01", "groundSampleIndex", index); 
        this.el.setAttribute("first-experiment-01", "groundSampleChosen", true);      
        
        this.updateUI();
      });
    },

    chooseGroundSample() {
        this.groundSamplesWrapper.object3D.visible = false;

        if(this.localGroundSampleIndex == 1) {
          this.scaleEntity.components["waage-tool"].setGlowLossWeight(112.17);
          this.groundSampleCallbacks.forEach(cb => {
            cb(this.localGroundSampleIndex);
          });
        }
        else if(this.localGroundSampleIndex == 2) {
          this.scaleEntity.components["waage-tool"].setGlowLossWeight(113.7);
          this.groundSampleCallbacks.forEach(cb => {
            cb(this.localGroundSampleIndex);
          });
        }

        this.multipleChoice.object3D.visible = true; 
        if(this.multipleChoice != null)
            this.multipleChoice.components["multiple-choice-question"].subscribe("onSubmit", this.onSubmitMultipleChoice); //should be networked (I really hope it works)
        else 
            console.log("Can't subscribe to multiple-choice1 callback, multiple-choice1 component not found");
    },

    notifyPart02() {
      this.startPart02Callbacks.forEach(cb => {
        cb(this.localGroundSampleIndex);
      });
    },

    onSubmitMultipleChoice(correctAnswer, selectedAnswer) {
      if(correctAnswer == selectedAnswer) {
        this.notifyPart02();
        setTimeout(() => {
          this.multipleChoice.object3D.visible = false; 
        }, 500);
      }
    }

  });