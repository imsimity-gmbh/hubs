import { cloneObject3D } from "../../utils/three-utils";
import { loadModel } from ".././gltf-model-plus";
import { waitForDOMContentLoaded } from "../../utils/async-utils";
//Initial Models:
import mortarSrc from "../../assets/models/GecoLab/mortar.glb";
import mortarStickSrc from "../../assets/models/GecoLab/mortar_stick.glb";
import groundSampleSrc from "../../assets/models/GecoLab/ground_sample.glb"
import bunsenBurnerSrc from "../../assets/models/GecoLab/bunsen_burner.glb";
import tripodSrc from "../../assets/models/GecoLab/tripod.glb";
import tripodPlateSrc from "../../assets/models/GecoLab/tripod_plate.glb";
import tripodTriangleSrc from "../../assets/models/GecoLab/tripod_triangle.glb";
import firelighterSrc from "../../assets/models/GecoLab/fireliter.glb";
import glassStickSrc from "../../assets/models/GecoLab/flask_stick.glb";
import thermoSrc from "../../assets/models/GecoLab/thermo.glb"; 
import { THREE } from "aframe";

// const robotModelPromise = waitForDOMContentLoaded().then(() => loadModel(robotModelSrc));

const mortarModelPromise = waitForDOMContentLoaded().then(() => loadModel(mortarSrc));
const mortarStickModelPromise = waitForDOMContentLoaded().then(() => loadModel(mortarStickSrc));
const groundSampleModelPromise = waitForDOMContentLoaded().then(() => loadModel(groundSampleSrc));
const bunsenBurnerModelPromise = waitForDOMContentLoaded().then(() => loadModel(bunsenBurnerSrc));
const tripodModelPromise = waitForDOMContentLoaded().then(() => loadModel(tripodSrc));
const tripodPlateModelPromise = waitForDOMContentLoaded().then(() => loadModel(tripodPlateSrc));
const tripodTriangleModelPromise = waitForDOMContentLoaded().then(() => loadModel(tripodTriangleSrc));
const firelighterModelPromise = waitForDOMContentLoaded().then(() => loadModel(firelighterSrc));
const glassStickModelPromise = waitForDOMContentLoaded().then(() => loadModel(glassStickSrc));
const thermoModelPromise = waitForDOMContentLoaded().then(() => loadModel(thermoSrc));

  AFRAME.registerComponent("first-experiment-02", {
    schema: {
    },
  
    init: function() {
        this.sceneEl = document.querySelector("a-scene");
        this.lastUpdate = performance.now();
        
        this.el.sceneEl.addEventListener("stateadded", () => this.updateUI());
        this.el.sceneEl.addEventListener("stateremoved", () => this.updateUI());

        waitForDOMContentLoaded().then(() => { 
            this.expSystem = this.el.sceneEl.systems["first-experiments"];

            //Get spawnEntity of Models
            this.movableEntities = [];
            this.mortarEntity = this.el.querySelector(".mortar-entity");
            this.movableEntities.push(this.mortarEntity);
            this.mortarStickEntity = this.el.querySelector(".mortar-stick-entity");
            this.groundSampleEntity = this.el.querySelector(".ground-sample-entity");
            this.movableEntities.push(this.groundSampleEntity);
            this.bunsenBurnerEntity = this.el.querySelector(".bunsen-burner-entity");
            this.movableEntities.push(this.bunsenBurnerEntity);
            this.tripod1Entity = this.el.querySelector(".tripod-1-entity");
            this.movableEntities.push(this.tripod1Entity);
            this.tripod2Entity = this.el.querySelector(".tripod-2-entity");
            this.movableEntities.push(this.tripod2Entity);
            this.tripodPlateEntity = this.el.querySelector(".tripod-plate-entity");
            this.tripodTriangleEntity = this.el.querySelector(".tripod-triangle-entity");
            this.firelighterEntity = this.el.querySelector(".firelighter-entity");
            this.movableEntities.push(this.firelighterEntity);
            this.glassStickEntity = this.el.querySelector(".glass-stick-entity");
            this.movableEntities.push(this.glassStickEntity);
            this.thermoEntity = this.el.querySelector(".thermo-entity");
            this.movableEntities.push(this.thermoEntity);

            //Get entity socket of placing positions:
            this.sockets = [];
            this.mortarSocket = this.el.querySelector(".mortar-socket");
            this.sockets.push(this.mortarSocket);
            this.groundSampleSocket = this.el.querySelector(".ground-sample-socket");
            this.sockets.push(this.groundSampleSocket);
            this.bunsenBurnerSocket = this.el.querySelector(".bunsen-burner-socket");
            this.sockets.push(this.bunsenBurnerSocket);
            this.tripod1Socket = this.el.querySelector(".tripod-1-socket");
            this.sockets.push(this.tripod1Socket);
            this.tripod2Socket = this.el.querySelector(".tripod-2-socket");
            this.sockets.push(this.tripod2Socket);
            this.firelighterSocket = this.el.querySelector(".firelighter-socket");
            this.sockets.push(this.firelighterSocket);
            this.glassStickSocket = this.el.querySelector(".glass-stick-socket");
            this.sockets.push(this.glassStickSocket);
            this.thermoSocket = this.el.querySelector(".thermo-socket");
            this.sockets.push(this.thermoSocket);

            this.onPlacedExperimentItem = AFRAME.utils.bind(this.onPlacedExperimentItem, this);
            this.onPlacedMortar = AFRAME.utils.bind(this.onPlacedMortar, this);
            this.onInsertSample = AFRAME.utils.bind(this.onInsertSample, this);
            this.sockets.forEach(s => {
                console.log(s);
                s.object3D.visible = false; //hide holograms until needed
            });

            this.itemsPlaced = 0;

            // this.spawnItem(robotModelPromise, new THREE.Vector3(0, 0, 0), this.bunsenBurnerEntity);
            this.spawnItem(mortarModelPromise, new THREE.Vector3(0, 0.8, 1.2), this.mortarEntity);
            this.spawnItem(mortarStickModelPromise, new THREE.Vector3(0, 0.1, 0), this.mortarStickEntity);
            this.spawnItem(groundSampleModelPromise, new THREE.Vector3(0, 0.8, 1.4), this.groundSampleEntity);
            this.spawnItem(bunsenBurnerModelPromise, new THREE.Vector3(0, 0.8, 0.9), this.bunsenBurnerEntity);
            this.spawnItem(tripodModelPromise, new THREE.Vector3(0, 0.8, 0.4), this.tripod1Entity);
            this.spawnItem(tripodModelPromise, new THREE.Vector3(0, 0.8, -0.2), this.tripod2Entity);
            this.spawnItem(tripodPlateModelPromise, new THREE.Vector3(0, 0.5, 0), this.tripodPlateEntity);
            this.spawnItem(tripodTriangleModelPromise, new THREE.Vector3(0, 0.5, 0), this.tripodTriangleEntity);
            this.spawnItem(firelighterModelPromise, new THREE.Vector3(0, 0.8, -0.6), this.firelighterEntity);
            this.spawnItem(glassStickModelPromise, new THREE.Vector3(0, 0.8, -0.9), this.glassStickEntity);
            this.spawnItem(thermoModelPromise, new THREE.Vector3(0, 0.8, -1.1), this.thermoEntity);

            this.updateUI();

            this.expSystem.registerTask(this.el, "02");

            //bind Callback funtion:
            this.startPart02 = AFRAME.utils.bind(this.startPart02, this);

            //Subscribe to callback after submitting multiple choice
            this.firstExpPart01 = this.expSystem.getTaskById("01");
            if(this.firstExpPart01 != null)
              this.firstExpPart01.components["first-experiment-01"].subscribe("onFinishPart01", this.startPart02);
            else 
              console.log("Can't subscribe to firstExpPart01 callback, entity not found");

            this.onFinishPart02Callbacks = [];
        });
    },

    subscribe(eventName, fn)
    {
        switch(eventName) {
            case "onFinishPart02":
              this.onFinishPart02Callbacks.push(fn);
              break;
          }
    },

    unsubscribe(eventName, fn)
    {
        switch(eventName) {
            case "onFinishPart02":
              let index = this.onFinishPart02Callback.indexOf(fn);
              this.onFinishPart02Callback.splice(index, 1);
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
            entity.object3D.scale.set(1.0, 1.0, 1.0);
            entity.setAttribute("position", {x: position.x, y: position.y, z: position.z});
            entity.object3D.matrixNeedsUpdate = true;
        });
    },

    startPart02() {
        this.sockets.forEach(s => {
            s.object3D.visible = true;
            s.components["entity-socket"].subscribe("onSnap", this.onPlacedExperimentItem);
        });
        this.movableEntities.forEach(e => {
            let name = e.className;
            e.className = "interactable " + name;
        });
    },

    onPlacedExperimentItem(entity) {
        let index = this.sockets.indexOf(entity);
        this.sockets.splice(index, 1);
        if(this.sockets.length <= 6) {
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
    }

  });