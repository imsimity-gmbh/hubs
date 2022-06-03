import { SOUND_GRIND_SOUND } from "../../systems/sound-effects-system";
import { SOUND_ADD_SAMPLE } from "../../systems/sound-effects-system";

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
            this.mortarSocket03 = this.el.querySelector(".mortar-socket-03");
            this.groundSampleSocket03 = this.el.querySelector(".ground-sample-socket-03");
            this.spoonSocket03 = this.el.querySelector(".spoon-socket-03");
            this.spoonSocketScale = this.el.querySelector(".spoon-socket-scale");

            this.grindSampleBtn = this.el.querySelector(".grind-sample-btn");
            this.grindSampleBtn.object3D.visible = false;
            this.grindSampleBtn.object3D.addEventListener("interact", () => this.grindSample());

            this.mortarEntity = this.sceneEl.querySelector(".mortar-entity");
            this.groundSampleEntity = this.sceneEl.querySelector(".ground-sample-entity");
            this.spoonEntity = this.sceneEl.querySelector(".spoon-entity");
            this.groundSampleSpoonEntity = this.sceneEl.querySelector(".ground-sample-spoon");
            this.weighedAmount = 0;

            this.scaleEntity = this.sceneEl.querySelector(".scale-entity");
            this.scaleEntity.object3D.visible = true;
            this.scaleSocket = this.el.querySelector(".scale-socket");

            this.crucibleEntity = this.sceneEl.querySelector(".crucible-entity");
            this.crucibleEntity.object3D.visible = true;

            this.updateUI();

            this.expSystem.registerTask(this.el, "03");

            //bind Callback funtion:
            this.startPart03 = AFRAME.utils.bind(this.startPart03, this);
            this.onPlacedMortar = AFRAME.utils.bind(this.onPlacedMortar, this);
            this.onInsertSample = AFRAME.utils.bind(this.onInsertSample, this);
            this.showScale = AFRAME.utils.bind(this.showScale, this);
            this.onScaleContainerPlaced = AFRAME.utils.bind(this.onScaleContainerPlaced, this);
            this.getSampleFromMortar = AFRAME.utils.bind(this.getSampleFromMortar, this);
            this.addSampleToCrucible = AFRAME.utils.bind(this.addSampleToCrucible, this);
            this.onRightSampleAmount = AFRAME.utils.bind(this.onRightSampleAmount, this);

            //Subscribe to callback after placing mortar
            this.firstExpPart02 = this.expSystem.getTaskById("02");
            if(this.firstExpPart02 != null)
                this.firstExpPart02.components["first-experiment-02"].subscribe("onFinishPart02", this.startPart03);

            this.grindSampleClicks = 0;
            this.finishedGrinding = false;

            this.onFinishPart03Callbacks = [];
        });
    },

    subscribe(eventName, fn)
    {
        switch(eventName) {
            case "onFinishPart03":
              this.onFinishPart03Callbacks.push(fn);
              break;
        }
    },

    unsubscribe(eventName, fn)
    {
        switch(eventName) {
            case "onFinishPart03":
              let index = this.onFinishPart03Callbacks.indexOf(fn);
              this.onFinishPart03Callbacks.splice(index, 1);
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
        this.mortarSocket03.components["entity-socket"].enableSocket();
        this.mortarSocket03.components["entity-socket"].subscribe("onSnap", this.onPlacedMortar);
        this.mortarStick = this.sceneEl.querySelector(".mortar-stick-entity");
    },

    onPlacedMortar() {
        this.groundSampleSocket03.components["entity-socket"].enableSocket();
        this.groundSampleSocket03.components["entity-socket"].subscribe("onSnap", this.onInsertSample);
    },

    onInsertSample() {
        this.grindSampleBtn.object3D.visible = true;
    },

    grindSample() {
        if(this.finishedGrinding)
            return;

        this.sceneEl.systems["hubs-systems"].soundEffectsSystem.playSoundOneShot(SOUND_GRIND_SOUND);
        this.grindSampleClicks++;
        if(this.grindSampleClicks >= 2) {
            this.groundSampleSocket03.components["entity-socket"].disableSocket();
            this.groundSampleSocket03.object3D.visible = false;
            this.grindSampleEntity = this.el.querySelector(".grind-sample-entity");
            this.spawnItem(grindedSampleModelPromise, new THREE.Vector3(-0.55, 0.77, 0.2), this.grindSampleEntity, true);
            this.spoonSocket03.components["entity-socket"].enableSocket();
            this.spoonSocket03.components["entity-socket"].subscribe("onSnap", this.showScale);
            this.finishedGrinding = true;
            this.grindSampleBtn.object3D.visible = false;
            this.mortarStick.object3D.visible = false;
        }

        let inintialPos = this.mortarStick.getAttribute("position");
        this.mortarStick.setAttribute("position", {x: inintialPos.x, y: (inintialPos.y - 0.03), z: inintialPos.z});
        setTimeout(() => {
            this.mortarStick.setAttribute("position", {x: inintialPos.x, y: (inintialPos.y + 0.03), z: inintialPos.z});
        }, 200);
    },

    showScale() {
        this.playSound(SOUND_ADD_SAMPLE);
        this.scaleEntity.object3D.visible = true;
        this.scaleSocket.components["entity-socket"].enableSocket();
        this.crucibleEntity.object3D.visible = true;
        this.scaleEntity.components["waage-tool"].subscribe("onContainerPlaced", this.onScaleContainerPlaced);
        this.scaleEntity.components["waage-tool"].subscribe("onRightAmount", this.onRightSampleAmount);
        this.spoonSocket03.components["entity-socket"].unsubscribe("onSnap", this.showScale);
    },

    onScaleContainerPlaced() {
        this.spoonSocketScale.components["entity-socket"].enableSocket();
        this.groundSampleSpoonEntity.object3D.visible = true;
        this.spoonSocket03.components["entity-socket"].subscribe("onSnap", this.getSampleFromMortar);
        this.spoonSocketScale.components["entity-socket"].subscribe("onSnap", this.addSampleToCrucible);
    },

    getSampleFromMortar() {
        this.playSound(SOUND_ADD_SAMPLE);
        this.spoonSocketScale.components["entity-socket"].enableSocket();
        this.groundSampleSpoonEntity.object3D.visible = true;
        this.scaleEntity.components["waage-tool"].removeWeight();
    },
    addSampleToCrucible() {
        let amount = Math.floor((Math.random() * 15) + 5);
        this.weighedAmount += amount;

        if(this.weighedAmount <= 50)
            this.groundSampleSpoonEntity.object3D.visible = false;
        else    
            this.playSound(SOUND_ADD_SAMPLE);

        this.scaleEntity.components["waage-tool"].addWeight(amount);
        this.spoonSocket03.components["entity-socket"].enableSocket();
    },
    onRightSampleAmount() {
        this.spoonEntity.object3D.visible = false;
        this.spoonSocketScale.components["entity-socket"].disableSocket();
        this.spoonSocket03.components["entity-socket"].disableSocket();
        this.onFinishPart03Callbacks.forEach(cb => {
            cb();
        });
    },

    playSound(soundID) {
        this.sceneEl.systems["hubs-systems"].soundEffectsSystem.playSoundOneShot(soundID);
    }

  });