import { waitForDOMContentLoaded } from "../../../utils/async-utils";
import { cloneObject3D } from "../../../utils/three-utils";
import { loadModel } from "../.././gltf-model-plus";
import growthCabinetSrc from "../../../assets/models/GecoLab/PlantGrowth/geco_growth_cabinet.glb";
import plantSrc from "../../../assets/models/GecoLab/PlantGrowth/geco_growth_vase.glb";
import { IMSIMITY_INIT_DELAY } from "../../../utils/imsimity";
import { decodeNetworkId, getNetworkIdFromEl } from "../../../utils/GecoLab/network-helper";

const growthCabinetPromise =  waitForDOMContentLoaded().then(() => loadModel(growthCabinetSrc));
const plantPromise =  waitForDOMContentLoaded().then(() => loadModel(plantSrc));

/* should be networked (buttons and multiple-choice), couldn't test yet, cause second user can't even go past the spawning of the experiment */
 
 AFRAME.registerComponent("third-experiment-01", {
    schema: {
      expClicked: {default: false},
      closeCabinetClicked: {default: false},
    },
  
    init: function() {
      console.log("Third exp 1 started");
      
      this.lastUpdate = performance.now();
     
      this.el.sceneEl.addEventListener("stateadded", () => this.updateUI());
      this.el.sceneEl.addEventListener("stateremoved", () => this.updateUI());

      //local version of network variable:
      this.localExpClicked = false;
      this.localcloseCabinetClicked = false;

      //this.startPart02Callbacks = [];

      this.movableEntities = [];
      this.sockets = [];
      this.placedPlants = 0;

      this.onClickExp = AFRAME.utils.bind(this.onClickExp, this);
      this.onClickCloseCabinet = AFRAME.utils.bind(this.onClickCloseCabinet, this);

      this.expSystem = this.el.sceneEl.systems["third-experiments"];

      this.delayedInit = AFRAME.utils.bind(this.delayedInit, this);

      this.plantPlaced = AFRAME.utils.bind(this.plantPlaced, this);

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

            this.closeCabinetBtn = this.el.querySelector(".closeCabinet-button");
            this.closeCabinetBtn.object3D.addEventListener("interact", () => this.onClickCloseCabinet());
            this.closeCabinetBtn.object3D.visible = false;

            this.delayedInit();
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
      this.spawnItem(growthCabinetPromise, new THREE.Vector3(2.7, 0.8, 0.2), this.growthCabinet1, false, true);
      this.growthCabinet2 = this.el.querySelector(".growth-Cabinet-2");
      this.spawnItem(growthCabinetPromise, new THREE.Vector3(3.4, 0.8, 0.2), this.growthCabinet2, false, true);
      this.growthCabinet3 = this.el.querySelector(".growth-Cabinet-3");
      this.spawnItem(growthCabinetPromise, new THREE.Vector3(4.1, 0.8, 0.2), this.growthCabinet3, false, true);

      this.plantPlace1 = this.el.querySelector(".plant-Place-1-entity");
      this.movableEntities.push(this.plantPlace1);
      this.spawnItem(plantPromise, new THREE.Vector3(2.7, 0.8, 0.5), this.plantPlace1, false, false);
      this.plantPlace2 = this.el.querySelector(".plant-Place-2-entity");
      this.movableEntities.push(this.plantPlace2);
      this.spawnItem(plantPromise, new THREE.Vector3(3, 0.8, 0.5), this.plantPlace2, false, false);
      this.plantPlace3 = this.el.querySelector(".plant-Place-3-entity");
      this.movableEntities.push(this.plantPlace3);
      this.spawnItem(plantPromise, new THREE.Vector3(3.3, 0.8, 0.5), this.plantPlace3, false, false);

      //this.updateUI();

      this.plantSocket01 = this.el.querySelector(".plant-socket-01");
      this.sockets.push(this.plantSocket01);
      this.plantSocket02 = this.el.querySelector(".plant-socket-02");
      this.sockets.push(this.plantSocket02);
      this.plantSocket03 = this.el.querySelector(".plant-socket-03");
      this.sockets.push(this.plantSocket03);

      this.sockets.forEach(s => {
        s.object3D.visible = false; //hide holograms until needed
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
      if(this.localExpClicked != this.data.expClicked) {
        this.showPlants();
        this.localExpClicked = this.data.expClicked;
      }
      if(this.localcloseCabinetClicked != this.data.closeCabinetClicked) {
        this.closeCabinets();
        this.localcloseCabinetClicked = this.data.closeCabinetClicked;
      }
    },
  
    tick: function() {

    },
    //Step 3?
    spawnItem(promise, position, entity, show, animated = false) {
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

          if (animated)
            {
                console.log(mesh.animations);
                entity.setAttribute("animation-mixer", {});
                entity.components["animation-mixer"].initMixer(mesh.animations);
            }

      });
    },
    //Step 4
    startPart01() {
      this.mannequin = this.el.sceneEl.systems["mannequin-manager"].getMannequinByGroupCode(this.experimentData.groupCode);

      this.growthCabinet1.object3D.visible = true;
      this.growthCabinet2.object3D.visible = true;
      this.growthCabinet3.object3D.visible = true;

      if (this.isMember)
      {
        this.thirdExpStartBtn.object3D.visible = true;
      }
    },

    onClickExp()
    {
      NAF.utils.getNetworkedEntity(this.el).then(networkedEl => {
    
        NAF.utils.takeOwnership(networkedEl);
  
        this.el.setAttribute("third-experiment-01", "expClicked", true);      
  
        this.updateUI();
      });
    },
    //Step 5
    showPlants()
    {
      this.thirdExpStartBtn.object3D.visible = false;
      
      this.mannequin.components["mannequin"].displayMessage(44);

      this.plantPlace1.object3D.visible = true;
      this.plantPlace2.object3D.visible = true;
      this.plantPlace3.object3D.visible = true;

      this.enableInteractables();
      this.plantSocket01.components["entity-socket"].enableSocket();
      this.plantSocket02.components["entity-socket"].enableSocket();
      this.plantSocket03.components["entity-socket"].enableSocket();
    },
    //Step 6
    plantPlaced()
    {
      this.placedPlants += 1;
      if(this.placedPlants >= 3)
      {
        this.plantSocket01.components["entity-socket"].unsubscribe("onSnap", this.plantPlaced);
        this.plantSocket02.components["entity-socket"].unsubscribe("onSnap", this.plantPlaced);
        this.plantSocket03.components["entity-socket"].unsubscribe("onSnap", this.plantPlaced);

        this.mannequin.components["mannequin"].displayMessage(45);
        this.closeCabinetBtn.object3D.visible = true; //step 6
      }   
    },

    enableInteractables() {

      console.log("enabling interaction on movableEntities");

      this.sockets.forEach(s => {
          s.object3D.visible = true;
          var socket = s.components["entity-socket"];
          socket.subscribe("onSnap", this.plantPlaced);
          socket.delayedInitSocket();
      });
      
      if (this.isMember)
      {
          this.movableEntities.forEach(e => {
              let name = e.className;
              e.className = "interactable " + name;
          });
      }
      
    },

    onClickCloseCabinet()
    {
      NAF.utils.getNetworkedEntity(this.el).then(networkedEl => {
    
        NAF.utils.takeOwnership(networkedEl);
  
        this.el.setAttribute("third-experiment-01", "closeCabinetClicked", true);      
  
        this.updateUI();
      });
    },

    closeCabinets()
    {
      this.closeCabinetBtn.object3D.visible = false;
      this.thirdExpPart02 = this.expSystem.getTaskById("02", this.experimentData.groupCode);
      
      console.log(this.growthCabinet1.components["simple-animation"]);

      this.simpleAnim1 = this.growthCabinet1.components["simple-animation"];
      this.simpleAnim1.playClip("04_close_door", false, true);
      this.simpleAnim1.printAnimations();

      this.simpleAnim2 = this.growthCabinet2.components["simple-animation"];
      this.simpleAnim2.playClip("04_close_door", false, true);
      this.simpleAnim2.printAnimations();

      this.simpleAnim3 = this.growthCabinet3.components["simple-animation"];
      this.simpleAnim3.playClip("04_close_door", false, true);
      this.simpleAnim3.printAnimations();

      this.thirdExpPart02.components["third-experiment-02"].startPart02(); //for some reason this.thirdExpPart02 is undefined for second user (observer)
    },

    remove() {
      console.log("removing third-experiment 01");
      this.expSystem.deregisterTask("01", this.el, this.experimentData);
    }

  });

