import { cloneObject3D } from "../../../utils/three-utils";
import { loadModel } from "../../gltf-model-plus";
import { waitForDOMContentLoaded } from "../../../utils/async-utils";

import { IMSIMITY_INIT_DELAY } from "../../../utils/imsimity";
import { decodeNetworkId, getNetworkIdFromEl } from "../../../utils/GecoLab/network-helper";
//Models shared with first-experiment
import mortarStickSrc from "../../../assets/models/GecoLab/mortar_stick.glb";
import mortarSrc from "../../../assets/models/GecoLab/mortar.glb";
import groundSampleInMortarSrc from "../../../assets/models/GecoLab/mortar_with_sample_1.glb";
import scaleSrc from "../../../assets/models/GecoLab/scales.glb";

//Models made for second-experiment
import sieveBaseSrc from "../../../assets/models/GecoLab/second-experiment/sieve_base.glb";
import sieve1Src from "../../../assets/models/GecoLab/second-experiment/sieve_63µm.glb";
import sieve2Src from "../../../assets/models/GecoLab/second-experiment/sieve_2mm.glb";
import sieveMachineEmptySrc from "../../../assets/models/GecoLab/second-experiment/sieve_machine_empty.glb";
import sieveMachineAnimsSrc from "../../../assets/models/GecoLab/second-experiment/sieve_machine_w_anims.glb";



import { THREE } from "aframe";

const mortarStickModelPromise = waitForDOMContentLoaded().then(() => loadModel(mortarStickSrc));
const mortarModelPromise = waitForDOMContentLoaded().then(() => loadModel(mortarSrc));
const groundSampleInMortarPromise = waitForDOMContentLoaded().then(() => loadModel(groundSampleInMortarSrc));
const scaleModelPromise = waitForDOMContentLoaded().then(() => loadModel(scaleSrc));

const sieveBasePromise = waitForDOMContentLoaded().then(() => loadModel(sieveBaseSrc));
const sieve1Promise = waitForDOMContentLoaded().then(() => loadModel(sieve1Src));
const sieve2Promise = waitForDOMContentLoaded().then(() => loadModel(sieve2Src));

const sieveMachineEmptyPromise = waitForDOMContentLoaded().then(() => loadModel(sieveMachineEmptySrc));
const sieveMachineAnimsPromise = waitForDOMContentLoaded().then(() => loadModel(sieveMachineAnimsSrc))

const secondExpModelsScale = new THREE.Vector3(0.33, 0.33, 0.33);

/* Networking: How to network entity-socket properly? If callback from onSnap works, part02 should too*/

  AFRAME.registerComponent("second-experiment-02", {
    schema: {
        //Socket-Snapping-Radius as in-between saves
        defaultRadius: {default: 1.2},
        smallerRadius: {default:  1.1},
        lighterRadius: {default:  0.4},
        bigRadius: {default: 2.0} //startValue, if needed later
    },
  
    init: function() {
        this.lastUpdate = performance.now();
        
        this.el.sceneEl.addEventListener("stateadded", () => this.updateUI());
        this.el.sceneEl.addEventListener("stateremoved", () => this.updateUI());

        this.movableEntities = [];
        this.hiddenOnSpawn = [];

        this.sockets = [];
        
        this.onInitPart02Callbacks = [];
        this.onObjectSpawnedPart02Callbacks = [];
        this.onFinishPart02Callbacks = [];

        this.modelsSpawned = 0;
        this.totalModels = 9;

        this.expSystem = this.el.sceneEl.systems["second-experiments"];

        this.delayedInit = AFRAME.utils.bind(this.delayedInit, this);
        this.tryTriggeringCallbacks = AFRAME.utils.bind(this.tryTriggeringCallbacks, this);
        this.startPart02 = AFRAME.utils.bind(this.startPart02, this);
        this.enableInteractables = AFRAME.utils.bind(this.enableInteractables, this);
        this.onPlacedExperimentItem = AFRAME.utils.bind(this.onPlacedExperimentItem, this);

        waitForDOMContentLoaded().then(() => { 
            var networkId = getNetworkIdFromEl(this.el);
    
            this.experimentData = decodeNetworkId(networkId);

            this.isMember = this.expSystem.getIsMemberForGroupCode(this.experimentData.groupCode);
    
            this.expSystem.registerTask("02", this.el, this.experimentData);

            setTimeout(() => {
                this.delayedInit();
                
            }, IMSIMITY_INIT_DELAY);
            
        });
    },

    delayedInit()
    {
        //Sockets
        this.sieveBaseSocket = this.el.querySelector(".sieve-base-socket");
        this.sockets.push(this.sieveBaseSocket);
        this.sieve1Socket = this.el.querySelector(".sieve-1-socket");
        this.sockets.push(this.sieve1Socket);
        this.sieve2Socket = this.el.querySelector(".sieve-2-socket");
        this.sockets.push(this.sieve2Socket);

        this.objectsPlacedSockets = [...this.sockets];

        this.sockets.forEach(s => {
            s.object3D.visible = false; //hide holograms until needed
        });


        //Get spawnEntity of Models
        this.sieveBaseEntity = this.el.querySelector(".sieve-base-entity");
        this.movableEntities.push(this.sieveBaseEntity);
        this.hiddenOnSpawn.push(this.sieveBaseEntity);

        this.sieve1Entity = this.el.querySelector(".sieve-1-entity");
        this.movableEntities.push(this.sieve1Entity);
        this.hiddenOnSpawn.push(this.sieve1Entity);

        this.sieve2Entity = this.el.querySelector(".sieve-2-entity");
        this.movableEntities.push(this.sieve2Entity);
        this.hiddenOnSpawn.push(this.sieve2Entity);

        
        this.mortarWithSoilEntity = this.el.querySelector(".mortar-with-soil-entity");
        this.hiddenOnSpawn.push(this.mortarWithSoilEntity);

        this.mortarStickEntity = this.el.querySelector(".mortar-stick-entity");
        this.hiddenOnSpawn.push(this.mortarStickEntity);

        this.mortarEmptyEntity = this.el.querySelector(".mortar-empty-entity");


        
        this.scaleEntity = this.el.querySelector(".scale-entity");
        this.hiddenOnSpawn.push(this.scaleEntity);

        this.sieveMachineEmptyEntity = this.el.querySelector(".sieve-machine-empty-entity");
        this.hiddenOnSpawn.push(this.sieveMachineEmptyEntity);

        this.sieveMachineAnimsEntity = this.el.querySelector(".sieve-machine-anims-entity");


        this.spawnItem(sieveBasePromise, new THREE.Vector3(-0.15, 0.75, 0), this.sieveBaseEntity, false, secondExpModelsScale);
        this.spawnItem(sieve1Promise, new THREE.Vector3(-0.65, 0.7, -0.1), this.sieve1Entity, false, secondExpModelsScale);
        this.spawnItem(sieve2Promise, new THREE.Vector3(-1.15, 0.6, 0), this.sieve2Entity, false, secondExpModelsScale);
        
        
        // Crucible entity needs special care...
        var mainTableAnchor = this.expSystem.getTaskById('01', this.experimentData.groupCode).object3D;
        var sideTableAnchor = this.el.object3D;

        sideTableAnchor.remove(this.sieveMachineEmptyEntity.object3D);
        mainTableAnchor.add(this.sieveMachineEmptyEntity.object3D);

        this.spawnItem(sieveMachineEmptyPromise, new THREE.Vector3(-0.5, 0.9, -0.1), this.sieveMachineEmptyEntity, false, secondExpModelsScale, true);
        
        sideTableAnchor.remove(this.sieveMachineAnimsEntity.object3D);
        mainTableAnchor.add(this.sieveMachineAnimsEntity.object3D);

        this.spawnItem(sieveMachineAnimsPromise, new THREE.Vector3(-0.5, 0.9, -0.1), this.sieveMachineAnimsEntity, false, secondExpModelsScale, true);


        sideTableAnchor.remove(this.mortarEmptyEntity.object3D);
        mainTableAnchor.add(this.mortarEmptyEntity.object3D);
        
        this.spawnItem(mortarModelPromise, new THREE.Vector3(0.3, 0.7, -0.5), this.mortarEmptyEntity, false);
        
        sideTableAnchor.remove(this.mortarWithSoilEntity.object3D);
        mainTableAnchor.add(this.mortarWithSoilEntity.object3D);

        this.spawnItem(groundSampleInMortarPromise, new THREE.Vector3(0.3, 0.7, 0), this.mortarWithSoilEntity, false);
        // This one is a child of the mortarWithSoilEntity
        this.spawnItem(mortarStickModelPromise, new THREE.Vector3(0, 0.1, 0.05), this.mortarStickEntity, false);


        sideTableAnchor.remove(this.scaleEntity.object3D);
        mainTableAnchor.add(this.scaleEntity.object3D);

        this.spawnItem(scaleModelPromise, new THREE.Vector3(1, 0.7, 0.1), this.scaleEntity, false);

        this.secondExpPart01 = this.expSystem.getTaskById("01", this.experimentData.groupCode);
        this.secondExpPart03 = this.expSystem.getTaskById("03", this.experimentData.groupCode);

        if(this.secondExpPart01 == null)
        {
            console.log('Cound not find SECOND EXPERIMENT 01 !!!! ');
            return;
        }

        if(this.secondExpPart03 == null)
        {
            console.log('Cound not find SECOND EXPERIMENT 03 !!!! ');
            return;
        }
        
        //Subscribe to callback after placing mortar    
        this.secondExpPart01.components["second-experiment-01"].subscribe("onFinishPart01", this.startPart02);
        this.secondExpPart03.components["second-experiment-03"].subscribe("onFinishPart03", this.enableInteractables);
        console.log("02 callbacks subscribed");

        this.updateUI();
    

    },

    subscribe(eventName, fn)
    {
        switch(eventName) {
            case "onInitPart02":
              this.onInitPart02Callbacks.push(fn);
              break;
            case "onObjectSpawnedPart02":
                this.onObjectSpawnedPart02Callbacks.push(fn);
                break;
            case "onFinishPart02":
                this.onFinishPart02Callbacks.push(fn);
                break;
          }
    },

    unsubscribe(eventName, fn)
    {
        var index = 0;
        switch(eventName) {
            case "onInitPart02":
              index = this.onInitPart02Callbacks.indexOf(fn);
              this.onInitPart02Callbacks.splice(index, 1);
              break;
            case "onObjectSpawnedPart02":
              index = this.onObjectSpawnedPart02Callbacks.indexOf(fn);
              this.onObjectSpawnedPart02Callbacks.splice(index, 1);
              break;
            case "onFinishPart02":
              index = this.onFinishPart02Callbacks.indexOf(fn);
              this.onFinishPart02Callbacks.splice(index, 1);
              break;
          }
    },
    
    updateUI: function() {

    },
  
    tick: function() {

    },

    spawnItem(promise, position, entity, show, scale = new THREE.Vector3(1,1,1), animated = false) {
        promise.then(model => {
            entity.object3D.visible = false;
            const mesh = cloneObject3D(model.scene);
            mesh.scale.set(3, 3, 3);
            mesh.matrixNeedsUpdate = true;
            entity.setObject3D("mesh", mesh);
        
            entity.object3D.visible = show;

            entity.object3D.scale.set(scale.x, scale.y, scale.z);
            entity.setAttribute("position", {x: position.x, y: position.y, z: position.z});
            entity.object3D.matrixNeedsUpdate = true;
            
            if (animated)
            {
                console.log(mesh.animations);
                entity.setAttribute("animation-mixer", {});
                entity.components["animation-mixer"].initMixer(mesh.animations);
            }

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
        // Failsafe to make sure that second-experiment-01 & 04 have subscribed to this callback
        if (this.onObjectSpawnedPart02Callbacks.length == 2)
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

    startPart02() {
        
        this.showExpItems();
        
        // Mannequin
        this.mannequin = this.el.sceneEl.systems["mannequin-manager"].getMannequinByGroupCode(this.experimentData.groupCode);
        //this.mannequin.components["mannequin"].displayMessage(0);

        
        this.onInitPart02Callbacks.forEach(cb => {
            cb();
        });
    },

    
    enableInteractables() {

        console.log("enabling interaction on movableEntities");

        this.sockets.forEach(s => {
            s.object3D.visible = true;
            var socket = s.components["entity-socket"];
            socket.subscribe("onSnap", this.onPlacedExperimentItem);
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

    onPlacedExperimentItem(socket) {

        if (this.objectsPlacedSockets.some(({object3D}) => object3D.id === socket.object3D.id))
        {
            this.objectsPlacedSockets.splice(this.objectsPlacedSockets.indexOf(socket), 1);
            
            if(this.objectsPlacedSockets.length == 0) {

                this.mannequin = this.el.sceneEl.systems["mannequin-manager"].getMannequinByGroupCode(this.experimentData.groupCode);
                //this.mannequin.components["mannequin"].displayMessage(1);

                this.sockets.forEach(s => {
                    s.components["entity-socket"].unsubscribe("onSnap", this.onPlacedExperimentItem);
                });

                console.log("Sieves placed");

                this.onFinishPart02Callbacks.forEach(cb => {
                    cb();
                });
            }   
        }
    },



    remove() {
        console.log("removing second-experiment 02");
        this.expSystem.deregisterTask("02", this.el, this.experimentData);
    }

  });