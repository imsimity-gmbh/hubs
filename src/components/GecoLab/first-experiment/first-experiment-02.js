import { cloneObject3D } from "../../../utils/three-utils";
import { loadModel } from "../.././gltf-model-plus";
import { waitForDOMContentLoaded } from "../../../utils/async-utils";
import { IMSIMITY_INIT_DELAY, decodeNetworkId, getNetworkIdFromEl } from "../../../utils/imsimity";
//Initial Models:
import mortarStickSrc from "../../../assets/models/GecoLab/mortar_stick.glb";
import groundSampleSrc1 from "../../../assets/models/GecoLab/ground-sample-coarse-1.glb";

import groundSampleInMortar from "../../../assets/models/GecoLab/mortar_with_sample_1.glb";

import bunsenBurnerSrc from "../../../assets/models/GecoLab/bunsen_burner.glb";
import tripodSrc from "../../../assets/models/GecoLab/tripod.glb";
import tripodPlateSrc from "../../../assets/models/GecoLab/tripod_plate.glb";
import tripodTriangleSrc from "../../../assets/models/GecoLab/tripod_triangle.glb";
import firelighterSrc from "../../../assets/models/GecoLab/lighter.glb";
import glassStickSrc from "../../../assets/models/GecoLab/stick_w_collider.glb";
import thermoSrc from "../../../assets/models/GecoLab/thermo_w_collider.glb"; 
import scaleSrc from "../../../assets/models/GecoLab/scales.glb";
import curcibleSrc from "../../../assets/models/GecoLab/crucible.glb";
import spoonSrc from "../../../assets/models/GecoLab/spoon_w_collider.glb";
import groundSampleSpoonSrc from "../../../assets/models/GecoLab/ground-sample-spoon.glb";
import tongSrc from "../../../assets/models/GecoLab/tong_w_collider.glb";
import { THREE } from "aframe";

// const robotModelPromise = waitForDOMContentLoaded().then(() => loadModel(robotModelSrc));

const groundSamplePromise = waitForDOMContentLoaded().then(() => loadModel(groundSampleSrc1));
const mortarStickModelPromise = waitForDOMContentLoaded().then(() => loadModel(mortarStickSrc));

const groundSampleInMortarPromise = waitForDOMContentLoaded().then(() => loadModel(groundSampleInMortar));

const bunsenBurnerModelPromise = waitForDOMContentLoaded().then(() => loadModel(bunsenBurnerSrc));
const tripodModelPromise = waitForDOMContentLoaded().then(() => loadModel(tripodSrc));
const tripodPlateModelPromise = waitForDOMContentLoaded().then(() => loadModel(tripodPlateSrc));
const tripodTriangleModelPromise = waitForDOMContentLoaded().then(() => loadModel(tripodTriangleSrc));
const firelighterModelPromise = waitForDOMContentLoaded().then(() => loadModel(firelighterSrc));
const glassStickModelPromise = waitForDOMContentLoaded().then(() => loadModel(glassStickSrc));
const thermoModelPromise = waitForDOMContentLoaded().then(() => loadModel(thermoSrc));
const scaleModelPromise = waitForDOMContentLoaded().then(() => loadModel(scaleSrc));
const curcibleModelPromise = waitForDOMContentLoaded().then(() => loadModel(curcibleSrc));
const spoonModelPromise = waitForDOMContentLoaded().then(() => loadModel(spoonSrc));
const groundSampleSpoonModelPromise = waitForDOMContentLoaded().then(() => loadModel(groundSampleSpoonSrc));
const tongModelPromise = waitForDOMContentLoaded().then(() => loadModel(tongSrc));

/* Networking: How to network entity-socket properly? If callback from onSnap works, part02 should too*/

  AFRAME.registerComponent("first-experiment-02", {
    schema: {
    },
  
    init: function() {
        this.lastUpdate = performance.now();
        
        this.el.sceneEl.addEventListener("stateadded", () => this.updateUI());
        this.el.sceneEl.addEventListener("stateremoved", () => this.updateUI());

        this.movableEntities = [];
        this.hiddenOnSpawn = [];
        this.sockets = [];
        this.onFinishPart02Callbacks = [];
        this.onObjectSpawnedPart02Callbacks = [];

        this.modelsSpawned = 0;
        this.totalModels = 18;

        this.expSystem = this.el.sceneEl.systems["first-experiments"];

        this.delayedInit = AFRAME.utils.bind(this.delayedInit, this);
        this.tryTriggeringCallbacks = AFRAME.utils.bind(this.tryTriggeringCallbacks, this);
        this.startPart02 = AFRAME.utils.bind(this.startPart02, this);

        waitForDOMContentLoaded().then(() => { 
            var networkId = getNetworkIdFromEl(this.el);
    
            this.experimentData = decodeNetworkId(networkId);
    
            this.expSystem.registerTask("02", this.el, this.experimentData);

            setTimeout(() => {
                this.delayedInit();
                
            }, IMSIMITY_INIT_DELAY);
            
        });
    },

    delayedInit()
    {

        this.skipBtn = this.el.querySelector(".skip-btn");
        this.skipBtn.object3D.addEventListener("interact", () => this.skipAufbau());
        this.skipBtn.object3D.visible = false;

        //Get spawnEntity of Models
        
        this.mortarEntity = this.el.querySelector(".mortar-entity");
        this.movableEntities.push(this.mortarEntity);
        this.hiddenOnSpawn.push(this.mortarEntity);
        this.mortarStickEntity = this.el.querySelector(".mortar-stick-entity");
        this.hiddenOnSpawn.push(this.mortarStickEntity);
        /// this.groundSampleEntity = this.el.querySelector(".ground-sample-entity");
        /// this.movableEntities.push(this.groundSampleEntity);
        // this.hiddenOnSpawn.push(this.groundSampleEntity);
        this.bunsenBurnerEntity = this.el.querySelector(".bunsen-burner-entity");
        this.movableEntities.push(this.bunsenBurnerEntity);
        this.hiddenOnSpawn.push(this.bunsenBurnerEntity);
        this.tripod1Entity = this.el.querySelector(".tripod-1-entity");
        this.movableEntities.push(this.tripod1Entity);
        this.hiddenOnSpawn.push(this.tripod1Entity);
        this.tripod2Entity = this.el.querySelector(".tripod-2-entity");
        this.movableEntities.push(this.tripod2Entity);
        this.hiddenOnSpawn.push(this.tripod2Entity);
        this.tripodPlateEntity = this.el.querySelector(".tripod-plate-entity");
        this.hiddenOnSpawn.push(this.tripodPlateEntity);
        this.tripodTriangleEntity = this.el.querySelector(".tripod-triangle-entity");
        this.hiddenOnSpawn.push(this.tripodTriangleEntity);
        this.firelighterEntity = this.el.querySelector(".firelighter-entity");
        this.movableEntities.push(this.firelighterEntity);
        this.hiddenOnSpawn.push(this.firelighterEntity);
        this.glassStickEntity = this.el.querySelector(".glass-stick-entity");
        this.movableEntities.push(this.glassStickEntity);
        this.hiddenOnSpawn.push(this.glassStickEntity);
        this.thermoEntity = this.el.querySelector(".thermo-entity");
        this.movableEntities.push(this.thermoEntity);
        this.hiddenOnSpawn.push(this.thermoEntity);
        this.spoonEntity = this.el.querySelector(".spoon-entity");
        this.movableEntities.push(this.spoonEntity);
        this.hiddenOnSpawn.push(this.spoonEntity);
        this.groundSampleSpoonEntity = this.el.querySelector(".ground-sample-spoon");
        this.scaleEntity = this.el.querySelector(".scale-entity");
        this.movableEntities.push(this.scaleEntity);
        this.crucibleEntityScale = this.scaleEntity.querySelector(".crucible-entity-scale");
        this.crucibleEntity = this.el.querySelector(".crucible-entity");
        this.movableEntities.push(this.crucibleEntity);
        this.attachedTongEntity = this.el.querySelector(".attached-tong-entity");
        this.tongEntity = this.el.querySelector(".tong-entity");
        this.movableEntities.push(this.tongEntity);
        this.hiddenOnSpawn.push(this.tongEntity);
        this.crucibleGroundSample = this.el.querySelector(".crucible-ground-sample");

        //Get entity socket of placing positions:

        this.firstExpPart01 = this.expSystem.getTaskById("01", this.experimentData.groupCode);


        if (this.firstExpPart01 == null)
        {
            console.log("FIRST EXPERIMENT 01 not found !!!!!");
            return;
        }
        
        this.mortarSocket = this.firstExpPart01.querySelector(".mortar-socket");
        this.sockets.push(this.mortarSocket);
        /// this.groundSampleSocket = this.expSystem.getTaskById("01", this.experimentData.groupCode).querySelector(".ground-sample-socket");
        /// this.sockets.push(this.groundSampleSocket);
        this.bunsenBurnerSocket = this.firstExpPart01.querySelector(".bunsen-burner-socket");
        this.sockets.push(this.bunsenBurnerSocket);
        this.tripod1Socket = this.firstExpPart01.querySelector(".tripod-1-socket");
        this.sockets.push(this.tripod1Socket);
        this.tripod2Socket = this.firstExpPart01.querySelector(".tripod-2-socket");
        this.sockets.push(this.tripod2Socket);
        this.firelighterSocket = this.firstExpPart01.querySelector(".firelighter-socket");
        this.sockets.push(this.firelighterSocket);
        this.glassStickSocket = this.firstExpPart01.querySelector(".glass-stick-socket");
        this.sockets.push(this.glassStickSocket);
        this.thermoSocket = this.firstExpPart01.querySelector(".thermo-socket");
        this.sockets.push(this.thermoSocket);
        this.spoonSocket = this.firstExpPart01.querySelector(".spoon-socket");
        this.sockets.push(this.spoonSocket);
        this.tongSocket = this.firstExpPart01.querySelector(".tong-socket");
        this.sockets.push(this.tongSocket);

        this.onPlacedExperimentItem = AFRAME.utils.bind(this.onPlacedExperimentItem, this);
        this.onPlacedMortar = AFRAME.utils.bind(this.onPlacedMortar, this);
        this.onInsertSample = AFRAME.utils.bind(this.onInsertSample, this);
        this.sockets.forEach(s => {
            s.object3D.visible = false; //hide holograms until needed
        });

        this.itemsPlaced = 0;

        this.spawnItem(tripodModelPromise, new THREE.Vector3(-1.3, 0.8, 0), this.tripod2Entity, false);
        this.spawnItem(tripodTriangleModelPromise, new THREE.Vector3(0, 0.5, 0), this.tripodTriangleEntity, false, new THREE.Vector3(0.85,0.85,0.85));
        this.spawnItem(bunsenBurnerModelPromise, new THREE.Vector3(-0.5, 0.8, 0), this.bunsenBurnerEntity, false);
        this.spawnItem(tripodModelPromise, new THREE.Vector3(-0.1, 0.8, 0), this.tripod1Entity, false);
        this.spawnItem(tripodPlateModelPromise, new THREE.Vector3(0, 0.5, 0), this.tripodPlateEntity, false);
        this.spawnItem(groundSampleInMortarPromise, new THREE.Vector3(0.3, 0.8, 0), this.mortarEntity, false);
        this.spawnItem(mortarStickModelPromise, new THREE.Vector3(0, 0.1, 0.05), this.mortarStickEntity, false);
        /// this.spawnItem(groundSampleInMortarPromise, new THREE.Vector3(-0.85, 0.8, 0), this.groundSampleEntity, false);
        this.spawnItem(glassStickModelPromise, new THREE.Vector3(0.45, 0.8, 0), this.glassStickEntity, false);
        this.spawnItem(spoonModelPromise, new THREE.Vector3(0.65, 0.8, 0), this.spoonEntity, false);
        this.spawnItem(groundSampleSpoonModelPromise, new THREE.Vector3(0, 0.01, 0.1), this.groundSampleSpoonEntity, false);
        this.spawnItem(firelighterModelPromise, new THREE.Vector3(0.8, 0.8, 0), this.firelighterEntity, false);
        this.spawnItem(thermoModelPromise, new THREE.Vector3(1.1, 0.8, -0.2), this.thermoEntity, false);
        this.spawnItem(tongModelPromise, new THREE.Vector3(0.23, 0.15, 0), this.attachedTongEntity, false);
        this.spawnItem(scaleModelPromise, new THREE.Vector3(0.9, 0.8, 0), this.scaleEntity, false);
        this.spawnItem(curcibleModelPromise, new THREE.Vector3(0.08, 0.19, 0), this.crucibleEntityScale, true);
        this.spawnItem(tongModelPromise, new THREE.Vector3(1.1, 0.8, 0.2), this.tongEntity, false);
        
        
        // Crucible entity needs special care...
        var mainTableAnchor = this.expSystem.getTaskById('01', this.experimentData.groupCode).object3D;
        var sideTableAnchor = this.el.object3D;

        sideTableAnchor.remove(this.crucibleEntity.object3D);
        mainTableAnchor.add(this.crucibleEntity.object3D);

        this.spawnItem(curcibleModelPromise, new THREE.Vector3(-1.1,0.9,-0.05), this.crucibleEntity, false);
        this.spawnItem(groundSamplePromise, new THREE.Vector3(0, 0.04, 0), this.crucibleGroundSample, true, new THREE.Vector3(0.38,0.38,0.38));


        this.updateUI();
       
        //bind Callback funtion:


        //Subscribe to callback after submitting multiple choice
        this.firstExpPart01.components["first-experiment-01"].subscribe("startPart02", this.startPart02);

    },

    subscribe(eventName, fn)
    {
        switch(eventName) {
            case "onFinishPart02":
              this.onFinishPart02Callbacks.push(fn);
              break;
            case "onObjectSpawnedPart02":
                this.onObjectSpawnedPart02Callbacks.push(fn);
                break;
          }
    },

    unsubscribe(eventName, fn)
    {
        var index = 0;
        switch(eventName) {
            case "onFinishPart02":
              index = this.onFinishPart02Callback.indexOf(fn);
              this.onFinishPart02Callback.splice(index, 1);
              break;
            case "onObjectSpawnedPart02":
              index = this.onObjectSpawnedPart02Callbacks.indexOf(fn);
              this.onObjectSpawnedPart02Callbacks.splice(index, 1);
              break;
          }
    },
    
    updateUI: function() {

    },
  
    tick: function() {

    },

    spawnItem(promise, position, entity, show, scale = new THREE.Vector3(1,1,1)) {
        promise.then(model => {
            entity.object3D.visible = false;
            const mesh = cloneObject3D(model.scene);
            mesh.scale.set(3, 3, 3);
            mesh.matrixNeedsUpdate = true;
            entity.setObject3D("mesh", mesh);
        
            if(show)
                entity.object3D.visible = true;
            entity.object3D.scale.set(scale.x, scale.y, scale.z);
            entity.setAttribute("position", {x: position.x, y: position.y, z: position.z});
            entity.object3D.matrixNeedsUpdate = true;
            

            this.checkModelSpawned();
        });
    },

    checkModelSpawned()
    {
        this.modelsSpawned++;

        if (this.modelsSpawned == this.totalModels)
        {
            this.tryTriggeringCallbacks();   
        }
        
    },

    tryTriggeringCallbacks()
    {
        if (this.onObjectSpawnedPart02Callbacks.length == 22)
        {
            console.log("all callback subscribed (" + this.onObjectSpawnedPart02Callbacks.length + ") callbacks");

            this.onObjectSpawnedPart02Callbacks.forEach(cb => {
                cb();
            });
            
            return;
        }

        console.log('All CB arent subscribed, delaying');
        
        setTimeout(this.tryTriggeringCallbacks, IMSIMITY_INIT_DELAY);
    },


    showExpItems() {

        console.log('Showing all models');

        this.hiddenOnSpawn.forEach( hs => {
            hs.object3D.visible = true;
        });
    },

    startPart02(groundSampleIndex) {
        this.sockets.forEach(s => {
            s.object3D.visible = true;
            s.components["entity-socket"].subscribe("onSnap", this.onPlacedExperimentItem);
        });
        this.movableEntities.forEach(e => {
            let name = e.className;
            e.className = "interactable " + name;
        });
        
        // Mannequin
        this.mannequin = this.el.sceneEl.systems["mannequin-manager"].getMannequinByGroupCode(this.experimentData.groupCode);
        this.mannequin.components["mannequin"].displayMessage(0);

        this.thermoEntity = this.el.querySelector(".thermo-entity");
        this.tempText = this.thermoEntity.querySelector(".thermo-text");
        this.tempText.object3D.visible = true;
    },

    skipAufbau() {
        for(let i = 0; i < this.sockets.length; i++) {
            this.sockets[i].components["entity-socket"].onSnap(this.movableEntities[i]);
        }
        this.sockets.forEach(s => {
            s.components["entity-socket"].unsubscribe("onSnap", this.onPlacedExperimentItem);
        });
        this.onFinishPart02Callbacks.forEach(cb => {
            cb();
        });
        this.skipBtn.object3D.visible = false;
    },

    onPlacedExperimentItem() {
        this.itemsPlaced++;
        if(this.itemsPlaced >= this.sockets.length) {

            this.mannequin = this.el.sceneEl.systems["mannequin-manager"].getMannequinByGroupCode(this.experimentData.groupCode);
            this.mannequin.components["mannequin"].displayMessage(1);

            this.sockets.forEach(s => {
                s.components["entity-socket"].unsubscribe("onSnap", this.onPlacedExperimentItem);
            });
            this.onFinishPart02Callbacks.forEach(cb => {
                cb();
            });
        }   
    },

    onPlacedMortar() {
        this.groundSampleSocket2.object3D.visible = true;
        this.groundSampleSocket2.components["entity-socket"].subscribe("onSnap", this.onPlacedMortar);
    },

    onInsertSample() {
        this.onFinishPart02Callbacks.forEach(cb => {
            cb();
        });
    },

    remove() {
        console.log("removing first-experiment 02");
        this.expSystem.deregisterTask("02", this.el, this.experimentData);
    }

  });