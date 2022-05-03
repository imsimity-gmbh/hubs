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
            this.expSystem = this.el.sceneEl.systems["first-experiments"];

            //Get entity socket of placing positions:
            this.sockets = [];
            this.mortarSocket2 = this.el.querySelector(".mortar-socket-2");
            this.mortarSocket2.object3D.visible = false;
            this.groundSampleSocket2 = this.el.querySelector(".ground-sample-socket-2");
            this.groundSampleSocket2.object3D.visible = false;

            this.grindSampleBtn = this.el.querySelector(".grind-sample-btn");
            this.grindSampleBtn.object3D.addEventListener("interact", () => this.grindSample());
            this.grindSampleBtn.object3D.visible = false;

            this.mortarEntity = this.sceneEl.querySelector(".mortar-entity");
            this.groundSampleEntity = this.sceneEl.querySelector(".ground-sample-entity");

            this.scaleEntity = this.el.querySelector(".scale-entity");
            this.spawnItem(scaleModelPromise, new THREE.Vector3(-2.5, 0.8, -0.2), this.scaleEntity, false);
            this.scaleSocket = this.el.querySelector(".scale-socket");
            this.scaleSocket.object3D.visible = false;

            this.crucibleEntity = this.el.querySelector(".crucible-entity");
            this.spawnItem(curcibleModelPromise, new THREE.Vector3(-2.5, 0.8, -0.2), this.crucibleEntity, false);

            this.updateUI();

            this.expSystem.registerTask(this.el, "03");

            //bind Callback funtion:
            this.startPart03 = AFRAME.utils.bind(this.startPart03, this);
            this.onPlacedMortar = AFRAME.utils.bind(this.onPlacedMortar, this);
            this.onInsertSample = AFRAME.utils.bind(this.onInsertSample, this);
            // this.onRightSampleAmount = AFRAME.utils.bind(this.onRightSampleAmount, this);

            //Subscribe to callback after placing mortar
            this.firstExpPart02 = this.expSystem.getTaskById("02");
            this.firstExpPart02.components["first-experiment-02"].subscribe("onFinishPart02", this.startPart03);

            this.grindSampleClicks = 0;
            this.finishedGrinding = false;
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

    spawnItem(promise, position, entity, show) {
        promise.then(model => {
            entity.object3D.visible = false;
            const mesh = cloneObject3D(model.scene);
            mesh.scale.set(3, 3, 3);
            mesh.matrixNeedsUpdate = true;
            entity.setObject3D("mesh", mesh);
        
            if(show)
                entity.object3D.visible = true;
            entity.object3D.scale.set(1.0, 1.0, 1.0);
            entity.setAttribute("position", {x: position.x, y: position.y, z: position.z});
            entity.object3D.matrixNeedsUpdate = true;
        });
    },

    startPart03() {
        this.mortarSocket2.object3D.visible = true;
        this.mortarSocket2.components["entity-socket"].subscribe("onSnap", this.onPlacedMortar);
        this.mortarStick = this.sceneEl.querySelector(".mortar-stick-entity");
        this.mortarEntity.setAttribute("tags", {isHandCollisionTarget: true, isHoldable: true});
        this.groundSampleEntity.setAttribute("tags", {isHandCollisionTarget: true, isHoldable: true});
    },

    onPlacedMortar() {
        this.groundSampleSocket2.object3D.visible = true;
        this.groundSampleSocket2.components["entity-socket"].subscribe("onSnap", this.onInsertSample);
        this.mortarSocket1 = this.sceneEl.querySelector(".mortar-socket");
        this.mortarSocket1.object3D.visible = false;
    },

    onInsertSample() {
        this.grindSampleBtn.object3D.visible = true;
        this.groundSampleSocket1 = this.sceneEl.querySelector(".ground-sample-socket");
        this.groundSampleSocket1.object3D.visible = false;
    },

    grindSample() {
        if(this.finishedGrinding)
            return;

        this.grindSampleClicks++;
        if(this.grindSampleClicks >= 15) {
            this.groundSampleSocket2.object3D.visible = false;
            this.grindSampleEntity = this.el.querySelector(".grind-sample-entity");
            this.spawnItem(grindedSampleModelPromise, new THREE.Vector3(-0.6, 0.9, -0.2), this.grindSampleEntity, true);
            this.scaleEntity.object3D.visible = true;
            this.scaleSocket.object3D.visible = true;
            this.crucibleEntity.object3D.visible = true;
            this.scaleEntity.components["waage-tool"].subscribe("onRightAmount", this.onRightSampleAmount);
            this.finishedGrinding = true;
        }

        let inintialPos = this.mortarStick.getAttribute("position");
        this.mortarStick.setAttribute("position", {x: inintialPos.x, y: (inintialPos.y - 0.03), z: inintialPos.z});
        setTimeout(() => {
            this.mortarStick.setAttribute("position", {x: inintialPos.x, y: (inintialPos.y + 0.03), z: inintialPos.z});
        }, 200);
    },

    // addSampleToCrucible() {
    //     this.scaleEntity.components["waage-tool"].addWeight(10);
    // },
    // removeSampleFromCrucible() {
    //     this.scaleEntity.components["waage-tool"].removeWeight(10);
    // },
    // onRightSampleAmount() {
    //     console.log("Richtige Menge abgewogen");
    // }

  });