import { waitForDOMContentLoaded } from "../../../utils/async-utils";
import { cloneObject3D } from "../../../utils/three-utils";
import { loadModel } from "../.././gltf-model-plus";
import growthCabinetSrc from "../../../assets/models/GecoLab/PlantGrowth/geco_growth_cabinet.glb";
import plantSrc from "../../../assets/models/GecoLab/PlantGrowth/wheat_co2_1.glb";
import { IMSIMITY_INIT_DELAY } from "../../../utils/imsimity";
import { decodeNetworkId, getNetworkIdFromEl } from "../../../utils/GecoLab/network-helper";

const growthCabinetPromise =  waitForDOMContentLoaded().then(() => loadModel(growthCabinetSrc));
const plantPromise =  waitForDOMContentLoaded().then(() => loadModel(plantSrc));

/* should be networked (buttons and multiple-choice), couldn't test yet, cause second user can't even go past the spawning of the experiment */
 
 AFRAME.registerComponent("third-experiment-01", {
    schema: {
      expClicked: {default: false},
    },
  
    init: function() {
      console.log("Third exp 1 started");
      
      this.lastUpdate = performance.now();
     
      this.el.sceneEl.addEventListener("stateadded", () => this.updateUI());
      this.el.sceneEl.addEventListener("stateremoved", () => this.updateUI());

      //local version of network variable:
      this.localExpClicked = false;

      //this.startPart02Callbacks = [];

      this.expSystem = this.el.sceneEl.systems["third-experiments"];

      this.delayedInit = AFRAME.utils.bind(this.delayedInit, this);

      waitForDOMContentLoaded().then(() => {
        console.log("Third exp 1 registered");
        var networkId = getNetworkIdFromEl(this.el);

        this.experimentData = decodeNetworkId(networkId);

        this.isMember = this.expSystem.getIsMemberForGroupCode(this.experimentData.groupCode);

        this.expSystem.registerTask("01", this.el, this.experimentData);
        
        setTimeout(() => {
          waitForDOMContentLoaded().then(() => {
            
            this.thirdExpStartBtn = this.el.querySelector(".exp-button");
            this.thirdExpStartBtn.object3D.addEventListener("interact", () => this.onClickExp());
            this.thirdExpStartBtn.object3D.visible = false;

            /*
            this.thirdExpPart02 = this.el.sceneEl.systems["third-experiments"].getTaskById("02", this.experimentData.groupCode);
            
            if (this.thirdExpPart02)
            {
              // TODO: unsubscribe on delete
              this.thirdExpPart02.components["third-experiment-02"].subscribe('onObjectSpawnedPart02', this.delayedInit);
            }
            else  
            {
              console.log('third-experiment-02 not found');
              // Fallback, we trigger manualy the delayed init
              this.delayedInit();
            }*/
           
          });  
        }, IMSIMITY_INIT_DELAY * 0.9);

      });

      
      
      
    },

    delayedInit()
    {
      console.log('Delayed Init FE-01');

      //this.thirdExpPart02 = this.expSystem.getTaskById("02", this.experimentData.groupCode);

      this.plantStartWrapper = this.el.querySelector(".plant-Start-Wrapper");
     
      this.growthCabinet1 = this.el.querySelector(".growth-Cabinet-1");
      this.spawnGrowthCabinet(growthCabinetPromise, new THREE.Vector3(0, 0, 0), this.growthCabinet1, false);
      this.growthCabinet2 = this.el.querySelector(".growth-Cabinet-2");
      this.spawnGrowthCabinet(growthCabinetPromise, new THREE.Vector3(0, 0, 0.15), this.growthCabinet2, false);
      this.growthCabinet3 = this.el.querySelector(".growth-Cabinet-3");
      this.spawnGrowthCabinet(growthCabinetPromise, new THREE.Vector3(0, 0, 0.3), this.growthCabinet3, false);

      this.plantPlace1 = this.el.querySelector("plant-Place-1");
      this.spawnGrowthCabinet(plantPromise, new THREE.Vector3(-1, 0, 0), this.plantPlace1, false);
      this.plantPlace2 = this.el.querySelector("plant-Place-2");
      this.spawnGrowthCabinet(plantPromise, new THREE.Vector3(-1, 0, 0.15), this.plantPlace2, false);
      this.plantPlace3 = this.el.querySelector("plant-Place-3");
      this.spawnGrowthCabinet(plantPromise, new THREE.Vector3(-1, 0, 0.3), this.plantPlace3, false);

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
      if(this.localExpClicked != this.data.sexpClicked) {
        this.showPlants();
        this.localExpClicked = this.data.expClicked;
      }
    },
  
    tick: function() {

    },

    spawnGrowthCabinet(promise, position, entity, show) {
      promise.then(model => {
          entity.object3D.visible = false;
          const mesh = cloneObject3D(model.scene);
          mesh.scale.set(1, 1, 1);
          mesh.matrixNeedsUpdate = true;
          entity.setObject3D("mesh", mesh);
      
          if(show)
            entity.object3D.visible = true;

          entity.object3D.scale.set(1, 1, 1);
          entity.object3D.rotation.set(0, 0, 0);
          entity.setAttribute("position", {x: position.x, y: position.y, z: position.z});
          entity.object3D.matrixNeedsUpdate = true;
          console.log(entity);
      });
    },

    startPart01() {
      this.mannequin = this.el.sceneEl.systems["mannequin-manager"].getMannequinByGroupCode(this.experimentData.groupCode);
      console.log('Show Ground Sample');

      this.growthCabinet1.object3D.visible = true;
      this.growthCabinet1.object3D.visible = true;
      this.growthCabinet1.object3D.visible = true;

      if (this.isMember)
      {
        this.thirdExpStartBtn.object3D.visible = true;
      }
    },

    onClickExp()
    {
      NAF.utils.getNetworkedEntity(this.el).then(networkedEl => {
    
        NAF.utils.takeOwnership(networkedEl);
  
        this.el.setAttribute("third-experiment", "expClicked", true);      
  
        this.updateUI();
      });
    },

    showPlants()
    {
      this.plantPlace1.object3D.visible = true;
      this.plantPlace2.object3D.visible = true;
      this.plantPlace3.object3D.visible = true;
    },

    /*
    notifyPart02() {
      this.startPart02Callbacks.forEach(cb => {
        cb(this.localGroundSampleIndex);
      });
    },
    */

    remove() {
      console.log("removing third-experiment 01");
      this.expSystem.deregisterTask("01", this.el, this.experimentData);
    }

  });

