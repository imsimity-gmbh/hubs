import { waitForDOMContentLoaded } from "../../../utils/async-utils";
import { cloneObject3D } from "../../../utils/three-utils";
import { loadModel } from "../.././gltf-model-plus";
import gecoMapSrc from "../../../assets/models/GecoLab/geco_map.glb";
import gecoGroundProfileSrc from "../../../assets/models/GecoLab/geco_ground_profile.glb";
import { IMSIMITY_INIT_DELAY } from "../../../utils/imsimity";

const gecoMapPromise =  waitForDOMContentLoaded().then(() => loadModel(gecoMapSrc));
const gecoGroundProfilePromise =  waitForDOMContentLoaded().then(() => loadModel(gecoGroundProfileSrc));

/* should be networked (buttons and multiple-choice), couldn't test yet, cause second user can't even go past the spawning of the experiment */
 
 AFRAME.registerComponent("first-experiment-01", {
    schema: {
      groundSampleChosen: {default: false},
      groundSampleIndex: {default: 0},
      questionAnswered: {default: false},
      groundProfileSkiped: {default: false},
    },
  
    init: function() {
      this.sceneEl = document.querySelector("a-scene");
      this.lastUpdate = performance.now();
     
      this.el.sceneEl.addEventListener("stateadded", () => this.updateUI());
      this.el.sceneEl.addEventListener("stateremoved", () => this.updateUI());

      this.localGroundSampleClicked = false;
      this.localGroundSampleIndex = 0;
      this.localQuestionAnswered = false;
      this.localGroundProfileSkiped = false;

      this.startPart02Callbacks = [];
      this.groundSampleCallbacks = [];

      this.expSystem = this.el.sceneEl.systems["first-experiments"];
      this.expSystem.registerTask(this.el, "01");

      this.onSubmitMultipleChoice = AFRAME.utils.bind(this.onSubmitMultipleChoice, this);
      this.onGroundProfileSkiped = AFRAME.utils.bind(this.onGroundProfileSkiped, this);

      this.delayedInit = AFRAME.utils.bind(this.delayedInit, this);

      setTimeout(() => {
        waitForDOMContentLoaded().then(() => {
        
          const sceneEl = this.el.sceneEl;
          this.experiment02 = sceneEl.systems["first-experiments"].getTaskById("02");
          
          if (this.experiment02)
          {
            // TODO: unsubscribe on delete
            this.experiment02.components["first-experiment-02"].subscribe('onObjectSpawnedPart02', this.delayedInit);
          }
          else  
          {
            console.log('first-experiment-02 not found');
            // Fallback, we trigger manualy the delayed init
            this.delayedInit();
          }
         
        });  
      }, IMSIMITY_INIT_DELAY * 0.9);
      
      
    },

    delayedInit()
    {
      console.log('Delayed Init FE-01');

      this.groundSamplesWrapper = this.el.querySelector(".ground-samples-wrapper");
     
      this.gecoMap = this.el.querySelector(".geco-map");
      this.spawnMap(gecoMapPromise, new THREE.Vector3(0, 1.05, 0.15), this.gecoMap, false);

      this.groundProfile = this.el.querySelector(".ground-profile-wrapper"); 
      this.groundProfileText = this.el.querySelector(".ground-profile-text"); 
      this.groundProfileModel = this.el.querySelector(".ground-profile-model"); 
      this.groundProfileBtn = this.el.querySelector(".ground-profile-btn"); 

      this.spawnGroundProfile(gecoGroundProfilePromise,new THREE.Vector3(0, 0.2, 0), this.groundProfileModel);

      this.groundProfileBtn.object3D.addEventListener("interact", () => this.onGroundProfileSkiped());
      this.groundProfile.object3D.visible = false;

      this.btnWrapper = this.el.querySelector(".sample-btn-wrapper");
      this.btnWrapper.object3D.visible = false;

      this.groundSample1Btn = this.el.querySelector(".ground-sample-btn-1");
      this.groundSample1Btn.object3D.addEventListener("interact", () => this.onClickGroundSample(1));

      this.groundSample2Btn = this.el.querySelector(".ground-sample-btn-2");
      this.groundSample2Btn.object3D.addEventListener("interact", () => this.onClickGroundSample(2));

      this.groundSample3Btn = this.el.querySelector(".ground-sample-btn-3");
      this.groundSample3Btn.object3D.addEventListener("interact", () => this.onClickGroundSample(3));

      this.groundSample4Btn = this.el.querySelector(".ground-sample-btn-4");
      this.groundSample4Btn.object3D.addEventListener("interact", () => this.onClickGroundSample(4));
      // TODO: Not Found...
      this.scaleEntity = this.sceneEl.querySelector(".scale-entity");

      this.multipleChoice = this.el.querySelector("#multiple-choice-question");
      this.multipleChoice.object3D.visible = false; 

      this.updateUI();

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

      if (this.localQuestionAnswered != this.data.questionAnswered)
      {
        this.localQuestionAnswered = this.data.questionAnswered;
         
        setTimeout(() => {
          this.multipleChoice.object3D.visible = false; 
          this.notifyPart02();
        }, 500);
      }

      if (this.localGroundProfileSkiped != this.data.groundProfileSkiped)
      {
        this.localGroundProfileSkiped = this.data.groundProfileSkiped;
         
        setTimeout(() => {
          this.multipleChoice.object3D.visible = true; 
          if(this.multipleChoice != null)
            this.multipleChoice.components["multiple-choice-question"].subscribe("onSubmit", this.onSubmitMultipleChoice); //should be networked (I really hope it works)
          else 
            console.log("Can't subscribe to multiple-choice1 callback, multiple-choice1 component not found");

          this.groundProfile.object3D.visible = false;
          this.groundSamplesWrapper.object3D.visible = false;
        }, 500);
      }


    },
  
    tick: function() {

    },

    getGroundSampleName()
    {
      switch(this.localGroundSampleIndex)
      {
        case 1:
          return "Schwarzwald";
        case 2:
          return "Schwäbische Alb";
        case 3:
          return "Voralpines Hügel-\nund Moorland";
        case 4:
          return "Odenwald,\nSpessart und Südröhn";
      }

      return "Error";
    },

    spawnMap(promise, position, entity, show) {
      promise.then(model => {
          entity.object3D.visible = false;
          const mesh = cloneObject3D(model.scene);
          mesh.scale.set(1, 1, 1);
          mesh.matrixNeedsUpdate = true;
          entity.setObject3D("mesh", mesh);
      
          if(show)
            entity.object3D.visible = true;

          entity.object3D.scale.set(0.7, 0.7, 0.7);
          entity.object3D.rotation.set(0.4, 0, 0);
          entity.setAttribute("position", {x: position.x, y: position.y, z: position.z});
          entity.object3D.matrixNeedsUpdate = true;
          console.log(entity);
      });
    },

    spawnGroundProfile(promise, position, entity) {
      promise.then(model => {
          entity.object3D.visible = false;
          const mesh = cloneObject3D(model.scene);
          mesh.scale.set(.5, .5, .5);
          mesh.matrixNeedsUpdate = true;
          entity.setObject3D("mesh", mesh);
    
          entity.object3D.visible = true;

          entity.object3D.scale.set(1, 1, 1);
          entity.object3D.rotation.set(0, 0.785398, 0);
          entity.setAttribute("position", {x: position.x, y: position.y, z: position.z});
          entity.object3D.matrixNeedsUpdate = true;
          console.log(entity);
      });
    },

    startPart01() {

      console.log('Show Ground Sample');

      
      this.mannequin = this.el.sceneEl.systems["mannequin-manager"].getMyMannequin();

      this.gecoMap.object3D.visible = true;

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
        this.gecoMap.object3D.visible = false;
        this.btnWrapper.object3D.visible = false;

        if(this.localGroundSampleIndex == 1) {
          this.scaleEntity.components["waage-tool"].setGlowLossWeight(112.17); // Schwarzwald Nördlicher
          this.groundSampleCallbacks.forEach(cb => {
            cb(this.localGroundSampleIndex);
          });
        }
        else if(this.localGroundSampleIndex == 2) {
          this.scaleEntity.components["waage-tool"].setGlowLossWeight(113.79); //  Schwäbische Alb
          this.groundSampleCallbacks.forEach(cb => {
            cb(this.localGroundSampleIndex);
          });
        }
        else if(this.localGroundSampleIndex == 3) {
          this.scaleEntity.components["waage-tool"].setGlowLossWeight(113.65); // Voralpines Hügel- und Moorland 
          this.groundSampleCallbacks.forEach(cb => {
            cb(this.localGroundSampleIndex);
          });
        }
        else if(this.localGroundSampleIndex == 4) {
          this.scaleEntity.components["waage-tool"].setGlowLossWeight(114.095); // Odenwald, Spessart und Südröhn 
          this.groundSampleCallbacks.forEach(cb => {
            cb(this.localGroundSampleIndex);
          });
        }  
        
        console.log("showing Ground Profile");
          this.groundProfile.object3D.visible = true;

          this.groundProfileText.setAttribute("text", { value: this.getGroundSampleName() });   
    },

    notifyPart02() {
      this.startPart02Callbacks.forEach(cb => {
        cb(this.localGroundSampleIndex);
      });
    },

    onSubmitMultipleChoice(correctAnswer, selectedAnswer) {
      if(correctAnswer == selectedAnswer) {
        NAF.utils.getNetworkedEntity(this.el).then(networkedEl => {
    
          NAF.utils.takeOwnership(networkedEl);
    
          this.el.setAttribute("first-experiment-01", "questionAnswered", true); 
          
          this.updateUI();
        });
      }
    },

    onGroundProfileSkiped()
    {
      NAF.utils.getNetworkedEntity(this.el).then(networkedEl => {
    
        NAF.utils.takeOwnership(networkedEl);
  
        this.el.setAttribute("first-experiment-01", "groundProfileSkiped", true); 
        
        this.updateUI();
      });
    }

  });

