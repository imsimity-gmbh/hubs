import { cloneObject3D } from "../../utils/three-utils";
import { loadModel } from ".././gltf-model-plus";
import { waitForDOMContentLoaded } from "../../utils/async-utils";
//Initial Models:
import grindedSampleSrc from "../../assets/models/GecoLab/ground_sample_grinded.glb";
import scaleSrc from "../../assets/models/GecoLab/scales.glb";
import curcibleSrc from "../../assets/models/GecoLab/crucible.glb";
import { THREE } from "aframe";

const grindedSampleModelPromise = waitForDOMContentLoaded().then(() => loadModel(grindedSampleSrc));
const scaleModelPromise = waitForDOMContentLoaded().then(() => loadModel(scaleSrc));
const curcibleModelPromise = waitForDOMContentLoaded().then(() => loadModel(curcibleSrc));

  AFRAME.registerComponent("first-experiment-03", {
    schema: {
    },
  
    init: function() {
        this.sceneEl = document.querySelector("a-scene");
        this.lastUpdate = performance.now();
        
        this.el.sceneEl.addEventListener("stateadded", () => this.updateUI());
        this.el.sceneEl.addEventListener("stateremoved", () => this.updateUI());

        waitForDOMContentLoaded().then(() => { 
            //Get entity socket of placing positions:
            this.sockets = [];
            this.mortarSocket2 = this.el.querySelector(".mortar-socket-2");
            this.mortarSocket2.object3D.visible = false;
            this.groundSampleSocket2 = this.el.querySelector(".ground-sample-socket-2");
            this.groundSampleSocket2.object3D.visible = false;

            this.grindSampleBtn = this.el.querySelector(".grind-sample-btn");
            this.grindSampleBtn.object3D.addEventListener("interact", () => this.grindSample());
            this.grindSampleBtn.object3D.visible = false;

            this.scaleEntity = this.el.querySelector("scale-entity");
            this.spawnItem(scaleModelPromise, new THREE.Vector3(0, 1, -1.3), this.scaleEntity);
            this.crucibleEntity = this.el.querySelector("crucible-entity");
            this.spawnItem(curcibleModelPromise, new THREE.Vector3(0, 1, -1.5), this.crucibleEntity);

            this.onPlacedMortar = AFRAME.utils.bind(this.onPlacedMortar, this);
            this.onInsertSample = AFRAME.utils.bind(this.onInsertSample, this);

            this.updateUI();

            this.expSystem = this.el.sceneEl.systems["first-experiments"];
            this.expSystem.registerTask(this.el, "03");

            //bind Callback funtion:
            this.startPart03 = AFRAME.utils.bind(this.startPart03, this);
            this.onPlacedMortar = AFRAME.utils.bind(this.onPlacedMortar, this);

            //Subscribe to callback after placing mortar
            this.firstExpPart02 = this.expSystem.getTaskById("02");
            this.firstExpPart02.components["first-experiment-02"].subscribe("onFinishPart02", this.startPart03);
        });
    },

    subscribe(eventName, fn)
    {
        switch(eventName) {
            case "onSampleGrinded":
              this.onFinishPart02Callbacks.push(fn);
              break;
        }
    },

    unsubscribe(eventName, fn)
    {
        switch(eventName) {
            case "onSampleGrinded":
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

    startPart03() {
        this.mortarSocket2.object3D.visible = true;
        this.mortarSocket2.components["entity-socket"].subscribe("onSnap", this.onPlacedMortar);
    },

    onPlacedMortar() {
        this.groundSampleSocket2.object3D.visible = true;
        this.groundSampleSocket2.components["entity-socket"].subscribe("onSnap", this.onInsertSample);
    },

    onInsertSample() {
        this.grindSampleBtn.object3D.visible = true;
    },

    grindSample() {
        console.log("grind");
        this.groundSampleSocket2.object3D.visible = false;
        this.grindSampleEntity = this.el.querySelector(".grind-sample-entity");
        this.spawnItem(grindedSampleModelPromise, new THREE.Vector3(-0.6, 1.06, -0.2), this.grindSampleEntity);
    }

  });