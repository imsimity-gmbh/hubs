import { waitForDOMContentLoaded } from "../../../utils/async-utils";
import { cloneObject3D } from "../../../utils/three-utils";
import { loadModel } from "../../gltf-model-plus";
import gecoMapSrc from "../../../assets/models/GecoLab/geco_map.glb";
import { IMSIMITY_INIT_DELAY } from "../../../utils/imsimity";
import { decodeNetworkId, getNetworkIdFromEl } from "../../../utils/GecoLab/network-helper";

const gecoMapPromise =  waitForDOMContentLoaded().then(() => loadModel(gecoMapSrc));

 AFRAME.registerComponent("second-experiment-01", {
    schema: {
      nextBtnClickCount: {default: 0},
      groundSampleChosen: {default: false},
      groundSampleIndex: {default: 0},
    },
  
    init: function() {
      this.lastUpdate = performance.now();
     
      this.el.sceneEl.addEventListener("stateadded", () => this.updateUI());
      this.el.sceneEl.addEventListener("stateremoved", () => this.updateUI());

      this.localNextButtonClickCount = 0;
      this.localGroundSampleClicked = false;
      this.localGroundSampleIndex = 0;

      this.onFinishPart01Callbacks = [];
      this.groundSampleCallbacks = [];

      this.expSystem = this.el.sceneEl.systems["second-experiments"];


      this.delayedInit = AFRAME.utils.bind(this.delayedInit, this);

      waitForDOMContentLoaded().then(() => {
        var networkId = getNetworkIdFromEl(this.el);

        this.experimentData = decodeNetworkId(networkId);

        this.isMember = this.expSystem.getIsMemberForGroupCode(this.experimentData.groupCode);

        this.expSystem.registerTask("01", this.el, this.experimentData);
        
        setTimeout(() => {
          waitForDOMContentLoaded().then(() => {
          
            this.firstExpPart02 = this.expSystem.getTaskById("02", this.experimentData.groupCode);
            
            if (this.firstExpPart02)
            {
              // TODO: unsubscribe on delete
              this.firstExpPart02.components["second-experiment-02"].subscribe('onObjectSpawnedPart02', this.delayedInit);
            }
            else  
            {
              console.log('second-experiment-02 not found');
              // Fallback, we trigger manualy the delayed init
              this.delayedInit();
            }

            this.nextBtn = this.el.querySelector(".next-btn");
            this.nextBtn.object3D.visible = false;
            this.nextBtn.object3D.addEventListener("interact", () => this.onNextButtonClick());
           
          });  
        }, IMSIMITY_INIT_DELAY * 0.9);

      });
    },


    delayedInit()
    {
      console.log('Delayed Init SE-01');

      this.secondExpPart02 = this.expSystem.getTaskById("02", this.experimentData.groupCode);

      this.groundSamplesWrapper = this.el.querySelector(".ground-samples-wrapper");
     
      this.gecoMap = this.el.querySelector(".geco-map");
      this.spawnMap(gecoMapPromise, new THREE.Vector3(0, 1.05, 0.15), this.gecoMap, false);

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
      
      this.updateUI();

    },

    onNextButtonClick()
    {
      NAF.utils.getNetworkedEntity(this.el).then(networkedEl => {
    
        NAF.utils.takeOwnership(networkedEl);
  
        this.el.setAttribute("second-experiment-01", "nextBtnClickCount", this.localNextButtonClickCount + 1); 
        
        this.updateUI();
      });
    },

    subscribe(eventName, fn)
    {
      switch(eventName) {
        case "onFinishPart01":
          this.onFinishPart01Callbacks.push(fn);
          break;
        case "groundSampleSelected":
          this.groundSampleCallbacks.push(fn);
          break;
      }
    },

    unsubscribe(eventName, fn)
    {
      switch(eventName) {
        case "onFinishPart01":
          let index2 = this.onFinishPart01Callbacks.indexOf(fn);
          this.onFinishPart01Callbacks.splice(index2, 1);
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

      if (this.localNextButtonClickCount != this.data.nextBtnClickCount)
      {
        this.localNextButtonClickCount = this.data.nextBtnClickCount;

        if (this.localNextButtonClickCount == 1)
        {
          this.mannequin = this.el.sceneEl.systems["mannequin-manager"].getMannequinByGroupCode(this.experimentData.groupCode);
          this.mannequin.components["mannequin"].displayMessage(27);

          this.nextBtn.object3D.visible = false;

          if (this.isMember)
          {
            //little delay to make things nicer
            setTimeout(() => {
              this.nextBtn.object3D.visible = true;
            }, IMSIMITY_INIT_DELAY);
          }
        }
        else
        {
          this.mannequin = this.el.sceneEl.systems["mannequin-manager"].getMannequinByGroupCode(this.experimentData.groupCode);
          this.mannequin.components["mannequin"].displayMessage(28);

          this.nextBtn.object3D.visible = false;

          if (this.isMember)
          {
            //little delay to make things nicer
            setTimeout(() => {
                
              this.gecoMap.object3D.visible = true;
      
              this.btnWrapper.object3D.visible = true;  
              
            }, IMSIMITY_INIT_DELAY);
          }

        }
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
          return "Nördliches,\nOberrhein-Tiefland";
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


    startPart01() {

      console.log('Show next button');

      
      if (this.isMember)
      {
        this.nextBtn.object3D.visible = true;
      }
     
      //this.mannequin.components["mannequin"].displayMessage(17);
    },



    onClickGroundSample(index) {
      NAF.utils.getNetworkedEntity(this.el).then(networkedEl => {
    
        NAF.utils.takeOwnership(networkedEl);
  
        this.el.setAttribute("second-experiment-01", "groundSampleIndex", index); 
        this.el.setAttribute("second-experiment-01", "groundSampleChosen", true);      
        
        this.updateUI();
      });
    },

    chooseGroundSample() {
        this.gecoMap.object3D.visible = false;
        this.btnWrapper.object3D.visible = false;

        // Mannequin
        this.mannequin = this.el.sceneEl.systems["mannequin-manager"].getMannequinByGroupCode(this.experimentData.groupCode);
        this.mannequin.components["mannequin"].displayMessage(29);

        if(this.localGroundSampleIndex == 1) {
          this.groundSampleCallbacks.forEach(cb => {
            cb(this.localGroundSampleIndex);
          });
        }
        else if(this.localGroundSampleIndex == 2) {
          this.groundSampleCallbacks.forEach(cb => {
            cb(this.localGroundSampleIndex);
          });
        }
        else if(this.localGroundSampleIndex == 3) {
          this.groundSampleCallbacks.forEach(cb => {
            cb(this.localGroundSampleIndex);
          });
        }
        else if(this.localGroundSampleIndex == 4) {
          this.groundSampleCallbacks.forEach(cb => {
            cb(this.localGroundSampleIndex);
          });
        }  
         
        setTimeout(() => {
          this.callOnFinishPart1();
        }, 500);
       
        // Mannequin
        this.mannequin = this.el.sceneEl.systems["mannequin-manager"].getMannequinByGroupCode(this.experimentData.groupCode);
        //this.mannequin.components["mannequin"].displayMessage(16);
    },

    callOnFinishPart1() {
      console.log("calling all callbacks (" + this.onFinishPart01Callbacks.length + ")");
      this.onFinishPart01Callbacks.forEach(cb => {
        cb(this.localGroundSampleIndex);
      });
    },

    remove() {
      console.log("removing first-experiment 01");
      this.expSystem.deregisterTask("01", this.el, this.experimentData);
    }

  });

