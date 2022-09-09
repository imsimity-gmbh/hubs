import { SOUND_GRIND_SOUND } from "../../../systems/sound-effects-system";
import { SOUND_ADD_SAMPLE } from "../../../systems/sound-effects-system";

import { cloneObject3D } from "../../../utils/three-utils";
import { loadModel } from "../.././gltf-model-plus";
import { waitForDOMContentLoaded } from "../../../utils/async-utils";
//Initial Models:
import grindedSampleSrc from "../../../assets/models/GecoLab/ground_sample_grinded.glb";
import scaleSrc from "../../../assets/models/GecoLab/scales.glb";
import curcibleSrc from "../../../assets/models/GecoLab/crucible.glb";
import { THREE } from "aframe";
import { IMSIMITY_INIT_DELAY, MANNEQUIN_TEXTS, MANNEQUIN_BUBBLE_LOW, MANNEQUIN_BUBBLE_HIGH } from "../../../utils/imsimity";

const grindedSampleModelPromise = waitForDOMContentLoaded().then(() => loadModel(grindedSampleSrc));
const scaleModelPromise = waitForDOMContentLoaded().then(() => loadModel(scaleSrc));
const curcibleModelPromise = waitForDOMContentLoaded().then(() => loadModel(curcibleSrc));

/* Networking: grind-btn networked but like the "startBurnerBtn" called on spawn for some reason, 
    all the other functions are callbacks that are subscribed to "onSnap" or "onPickedUp" of an entity-socket, which I don't know how to network */

  AFRAME.registerComponent("first-experiment-03", {
    schema: {
        grindBtnClicked: {default: false},
        taraPressed: {default: false},
        randomAmounts:  {default: []},
    },
  
    init: function() {
        this.sceneEl = document.querySelector("a-scene");
        this.lastUpdate = performance.now();
        
        this.el.sceneEl.addEventListener("stateadded", () => this.updateUI());
        this.el.sceneEl.addEventListener("stateremoved", () => this.updateUI());
    
        this.grindSampleClicks = 0;
        this.finishedGrinding = false;
        this.localGrindBtnClicked = false;
        this.weighedAmount = 0;
        this.localTaraPressed = false;

        this.sockets = [];
        
        this.onFinishPart03Callbacks = [];

        //bind Callback funtion:
        this.startPart03 = AFRAME.utils.bind(this.startPart03, this);
        this.onPlacedMortar = AFRAME.utils.bind(this.onPlacedMortar, this);
        this.onInsertSample = AFRAME.utils.bind(this.onInsertSample, this);
        this.showScale = AFRAME.utils.bind(this.showScale, this);
        this.changeCrucibleEntities = AFRAME.utils.bind(this.changeCrucibleEntities, this);
        this.onTaraPressed = AFRAME.utils.bind(this.onTaraPressed, this);
        this.getSampleFromMortar = AFRAME.utils.bind(this.getSampleFromMortar, this);
        this.addSampleToCrucible = AFRAME.utils.bind(this.addSampleToCrucible, this);
        this.onRightSampleAmount = AFRAME.utils.bind(this.onRightSampleAmount, this);

        this.expSystem = this.el.sceneEl.systems["first-experiments"];
        this.expSystem.registerTask(this.el, "03");

        this.amountsCount = 0;

        


        waitForDOMContentLoaded().then(() => { 

            // Network the Random vars
            if (NAF.utils.isMine(this.el))
            { 
                var array = [];

                for(var i = 0; i < 10; i++)
                {
                    array.push(Math.floor((Math.random() * 15) + 5));
                }

                this.el.setAttribute("first-experiment-03", "randomAmounts", array); 
            }

            // this.updateUI();
            setTimeout(() => {
                this.mortarSocket03 = this.el.querySelector(".mortar-socket-03");
                /// this.groundSampleSocket03 = this.el.querySelector(".ground-sample-socket-03");
                this.spoonSocket03 = this.el.querySelector(".spoon-socket-03");
                this.spoonSocketScale = this.el.querySelector(".spoon-socket-scale");

                this.grindSampleBtn = this.el.querySelector(".grind-sample-btn");
                this.grindSampleBtn.object3D.visible = false;
                this.grindSampleBtn.object3D.addEventListener("interact", () => this.onGrindBtnClicked());


                this.mortarEntity = this.sceneEl.querySelector(".mortar-entity");
                /// this.groundSampleEntity = this.sceneEl.querySelector(".ground-sample-entity");
                this.spoonEntity = this.sceneEl.querySelector(".spoon-entity");
                this.groundSampleSpoonEntity = this.sceneEl.querySelector(".ground-sample-spoon");

            
                this.scaleEntity = this.sceneEl.querySelector(".scale-entity");
                this.scaleEntity.object3D.visible = true;
                this.scaleSocket = this.el.querySelector(".scale-socket");

                this.crucibleEntity = this.sceneEl.querySelector(".crucible-entity");
                this.crucibleEntityScale = this.scaleEntity.querySelector(".crucible-entity-scale");

                //Subscribe to callback after placing mortar
                this.firstExpPart02 = this.expSystem.getTaskById("02");
                if(this.firstExpPart02 != null)
                    this.firstExpPart02.components["first-experiment-02"].subscribe("onFinishPart02", this.startPart03);
                else
                    console.log('ERRROR !!!! ');

            }, IMSIMITY_INIT_DELAY);


            
            
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
    
    update() {
        waitForDOMContentLoaded().then(() => { 
          this.updateUI();
        });
    },

    updateUI: function() {
        if(this.localGrindBtnClicked != this.data.grindBtnClicked) {
            this.grindSample();
            this.localGrindBtnClicked = this.data.grindBtnClicked;
        }

        if(this.localTaraPressed != this.data.taraPressed) {
            this.proceedToWeighingSample();
            this.localTaraPressed = this.data.taraPressed;
        }
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
        // Bug in enableSocket
        this.mortarSocket03.components["entity-socket"].enableSocket();
        this.mortarSocket03.components["entity-socket"].subscribe("onSnap", this.onPlacedMortar);
        this.mortarStick = this.sceneEl.querySelector(".mortar-stick-entity");
    },

    onPlacedMortar() {
        this.onInsertSample();
        /// this.groundSampleSocket03.components["entity-socket"].enableSocket();
        /// this.groundSampleSocket03.components["entity-socket"].subscribe("onSnap", this.onInsertSample);
    },

    onInsertSample() {
        this.grindSampleBtn.object3D.visible = true;
        this.mortarStick.setAttribute("position", {x: 0, y: 0.15, z: 0.04});
        this.mortarStick.setAttribute("rotation", {x: -70, y: 0, z: 0});
    },

    onGrindBtnClicked() {
        NAF.utils.getNetworkedEntity(this.el).then(networkedEl => {
    
            NAF.utils.takeOwnership(networkedEl);
      
            this.el.setAttribute("first-experiment-03", "grindBtnClicked", !this.data.grindBtnClicked);      
      
            this.updateUI();
        });
    },

    grindSample() {
        if(this.finishedGrinding)
            return;

        this.sceneEl.systems["hubs-systems"].soundEffectsSystem.playSoundOneShot(SOUND_GRIND_SOUND);
        this.grindSampleClicks++;
        if(this.grindSampleClicks >= 15) {
            /// this.groundSampleSocket03.components["entity-socket"].disableSocket();
            /// this.groundSampleEntity.object3D.visible = false;
            this.grindSampleEntity = this.el.querySelector(".grind-sample-entity");
            this.spawnItem(grindedSampleModelPromise, new THREE.Vector3(-0.55, 0.77, 0.2), this.grindSampleEntity, true);
            this.spoonSocket03.components["entity-socket"].enableSocket();
            this.spoonSocket03.components["entity-socket"].subscribe("onSnap", this.showScale);
            this.finishedGrinding = true;
            this.grindSampleBtn.object3D.visible = false;
            this.mortarStick.object3D.visible = false;

             // Mannequin
            this.mannequin = this.el.sceneEl.systems["mannequin-manager"].getMyMannequin();
            this.mannequin.components["mannequin"].displayMessage(MANNEQUIN_TEXTS[4], 16.0, MANNEQUIN_BUBBLE_HIGH);

        }
        
        //TODO: Mortar Stick is unkown
        let inintialPos = this.mortarStick.getAttribute("position");
        this.mortarStick.setAttribute("position", {x: inintialPos.x, y: (inintialPos.y - 0.03), z: inintialPos.z});
        setTimeout(() => {
            this.mortarStick.setAttribute("position", {x: inintialPos.x, y: (inintialPos.y + 0.03), z: inintialPos.z});
        }, 200);
    },

    showScale() {

        console.log('Show Scale');

        this.playSound(SOUND_ADD_SAMPLE);
        this.scaleEntity.object3D.visible = true;
        this.scaleSocket.components["entity-socket"].enableSocket();
        this.scaleSocket.components["entity-socket"].subscribe("onSnap", this.changeCrucibleEntities);
        this.scaleEntity.components["waage-tool"].subscribe("onTaraPressed", this.onTaraPressed);
        this.scaleEntity.components["waage-tool"].subscribe("onRightAmount", this.onRightSampleAmount);
        this.spoonSocket03.components["entity-socket"].unsubscribe("onSnap", this.showScale);
    },

    changeCrucibleEntities() {
        this.crucibleEntity.object3D.visible = true;
        this.crucibleEntityScale.object3D.visible = false;
    },

    onTaraPressed() {
        NAF.utils.getNetworkedEntity(this.el).then(networkedEl => {
    
            NAF.utils.takeOwnership(networkedEl);
      
            this.el.setAttribute("first-experiment-03", "taraPressed", true);      
      
            this.updateUI();
        });
    },

    proceedToWeighingSample() {
        this.spoonSocketScale.components["entity-socket"].enableSocket();
        this.groundSampleSpoonEntity.object3D.visible = true;
        this.spoonSocket03.components["entity-socket"].subscribe("onSnap", this.getSampleFromMortar);
        this.spoonSocketScale.components["entity-socket"].subscribe("onSnap", this.addSampleToCrucible);
        this.scaleEntity.components["waage-tool"].unsubscribe("onTaraPressed", this.onTaraPressed);
    },

    getSampleFromMortar() {
        this.playSound(SOUND_ADD_SAMPLE);
        this.spoonSocketScale.components["entity-socket"].enableSocket();
        this.groundSampleSpoonEntity.object3D.visible = true;
        this.scaleEntity.components["waage-tool"].removeWeight();
    },
    addSampleToCrucible() {
        let amount = this.data.randomAmounts[this.amountsCount];
        this.amountsCount++;        
        
        this.weighedAmount += amount;

        if(this.weighedAmount <= 50)
            this.groundSampleSpoonEntity.object3D.visible = false;
        else    
            this.playSound(SOUND_ADD_SAMPLE);

        this.scaleEntity.components["waage-tool"].addWeight(amount);

        // Hack to automaticaly snap back spoon to bowl
        this.spoonSocket03.components["entity-socket"].disableSocket();
        this.spoonSocket03.components["entity-socket"].enableSocket();
        this.spoonSocket03.components["entity-socket"].onSnap(this.spoonEntity);
        
        // Actiave this one again
        this.spoonSocketScale.components["entity-socket"].disableSocket();
        this.spoonSocketScale.components["entity-socket"].enableSocket();
    
    },
    onRightSampleAmount() {
        this.spoonEntity.object3D.visible = false;
        this.spoonSocketScale.components["entity-socket"].disableSocket();
        this.spoonSocket03.components["entity-socket"].disableSocket();

        
        // Mannequin
        this.mannequin = this.el.sceneEl.systems["mannequin-manager"].getMyMannequin();
        this.mannequin.components["mannequin"].displayMessage(MANNEQUIN_TEXTS[5], 6.0, MANNEQUIN_BUBBLE_HIGH);

        this.onFinishPart03Callbacks.forEach(cb => {
            cb();
        });
    },

    playSound(soundID) {
        this.sceneEl.systems["hubs-systems"].soundEffectsSystem.playSoundOneShot(soundID);
    }

  });