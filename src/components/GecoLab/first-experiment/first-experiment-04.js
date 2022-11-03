import { SOUND_BURNER_SOUND } from "../../../systems/sound-effects-system";

import { cloneObject3D } from "../../../utils/three-utils";
import { loadModel } from "../.././gltf-model-plus";
import { waitForDOMContentLoaded } from "../../../utils/async-utils";

import flameModelSrc from "../../../assets/models/GecoLab/flame.glb";
import { THREE } from "aframe";
import { IMSIMITY_INIT_DELAY } from "../../../utils/imsimity";
import { decodeNetworkId, getNetworkIdFromEl } from "../../../utils/GecoLab/network-helper";

const flameModelPromise = waitForDOMContentLoaded().then(() => loadModel(flameModelSrc));

/* Same as before: Buttons networked, at least the startBurnerBtn called on spawn for some reason, entity-socket callbacks not yet  */

  AFRAME.registerComponent("first-experiment-04", {
    schema: {
        burnerStarted: {default: false},
        startBurnerClicked: {default: false},
        ctrlBtnClicked: {default: false},
        ctrlBtnIndex: {default: 0},
        stirBtnHeld: {default: false},
        stirBtnDone: {default: false},
    },
  
    init: function() {
        this.lastUpdate = performance.now();
        
        this.el.sceneEl.addEventListener("stateadded", () => this.updateUI());
        this.el.sceneEl.addEventListener("stateremoved", () => this.updateUI());

        this.stopStir = false;
        this.updatePos = false;
        this.x = 0;
        this.z = 0;
        this.t = 0;

        this.localburnerStarted = false;
        this.localStirBtnHeld = false;
        this.localStirBtnDone = false;
        this.localStartBurnerClicked = false;
        this.ctrlBtnBlocked = false;
        this.localCtrlBtnClicked = false;
        this.localCtrlBtnIndex = 0;

        this.localStirDoneEventSent = false;

        //bind Callback funtions:
        this.startPart04 = AFRAME.utils.bind(this.startPart04, this);
        this.onPlacedCrucible = AFRAME.utils.bind(this.onPlacedCrucible, this);
        this.onLightBurner = AFRAME.utils.bind(this.onLightBurner, this);
        this.onReplaceLighter = AFRAME.utils.bind(this.onReplaceLighter, this);
        this.onPlaceGlassstick = AFRAME.utils.bind(this.onPlaceGlassstick, this);
        this.stopBurnerSound = AFRAME.utils.bind(this.stopBurnerSound, this);
        
        this.expSystem = this.el.sceneEl.systems["first-experiments"];

        waitForDOMContentLoaded().then(() => { 

            var networkId = getNetworkIdFromEl(this.el);

            this.experimentData = decodeNetworkId(networkId);
    
            this.expSystem.registerTask("04", this.el, this.experimentData);

            setTimeout(() => {

                this.firstExpPart01 = this.expSystem.getTaskById("01", this.experimentData.groupCode);
                this.firstExpPart02 = this.expSystem.getTaskById("02", this.experimentData.groupCode);
                this.firstExpPart03 = this.expSystem.getTaskById("03", this.experimentData.groupCode);
                this.firstExpPart05 = this.expSystem.getTaskById("05", this.experimentData.groupCode);

                if(this.firstExpPart03 != null)
                    this.firstExpPart03.components["first-experiment-03"].subscribe("onFinishPart03", this.startPart04);

                this.crucibleEntity = this.firstExpPart02.querySelector(".crucible-entity");
                this.scaleEntity = this.firstExpPart02.querySelector(".scale-entity");
                this.firelighterEntity = this.firstExpPart02.querySelector(".firelighter-entity");
                this.flameEntity = this.firstExpPart02.querySelector(".flame-entity");
                this.glassstickEntity = this.firstExpPart02.querySelector(".glass-stick-entity");
                this.stopwatchEntity = this.expSystem.getTaskById("stopwatch", this.experimentData.groupCode);

                this.crucibleSocketTripod = this.el.querySelector(".crucible-socket-04");

                this.firelighterSocketGeneral = this.firstExpPart01.querySelector(".firelighter-socket");

                this.firelighterSocketTripod = this.el.querySelector(".firelighter-socket-04");

                this.glassstickSocket = this.el.querySelector(".glass-stick-socket-04");

                

                this.startBtn = this.el.querySelector(".start-burner-btn");
                this.startBtn.object3D.addEventListener("interact", () => this.onStartBurnerClicked());
                this.startBtn.object3D.visible = false;


                this.ctrlBtn00 = this.el.querySelector(".burner-ctrl-btn-0");
                this.ctrlBtn00.object3D.addEventListener("interact", () => this.onClickCtrlBtn(0));
                this.ctrlBtn00.object3D.visible = false;
                this.ctrlBtn01 = this.el.querySelector(".burner-ctrl-btn-1");
                this.ctrlBtn01.object3D.addEventListener("interact", () => this.onClickCtrlBtn(1));
                this.ctrlBtn01.object3D.visible = false;
                this.ctrlBtn02 = this.el.querySelector(".burner-ctrl-btn-2");
                this.ctrlBtn02.object3D.addEventListener("interact", () => this.onClickCtrlBtn(2));
                this.ctrlBtn02.object3D.visible = false;
                this.ctrlBtn03 = this.el.querySelector(".burner-ctrl-btn-3");
                this.ctrlBtn03.object3D.addEventListener("interact", () => this.onClickCtrlBtn(3));
                this.ctrlBtn03.object3D.visible = false;


                this.stiringBtn = this.el.querySelector(".stiring-btn");
                this.stiringBtn.object3D.addEventListener("holdable-button-down", () => this.onHoldStirBtnDown());
                this.stiringBtn.object3D.addEventListener("holdable-button-up", () => this.onReleaseStirBtn());
                this.stiringBtn.object3D.visible = false;



            

            }, IMSIMITY_INIT_DELAY);
        
        });


        
    },

    subscribe(eventName, fn)
    {
    },

    unsubscribe(eventName, fn)
    {
    },

    update() {
        waitForDOMContentLoaded().then(() => { 
          this.updateUI();
        });
    },
    
    updateUI: function() {

        console.log(this.data);

        if(this.localburnerStarted != this.data.burnerStarted) {
            this.proceedToStiring();
            this.localburnerStarted = this.data.burnerStarted;
        }


        if(this.localStirBtnDone != this.data.stirBtnDone) {
            
            this.stopStir = true;
            this.updatePos = false;
            this.stiringBtn.object3D.visible = false;
            console.log("ADJUSTING SPEED");
            this.stopwatchEntity.components["stopwatch-tool"].adjustSpeed(100);
            // Mannequin
            this.mannequin = this.el.sceneEl.systems["mannequin-manager"].getMannequinByGroupCode(this.experimentData.groupCode);
            this.mannequin.components["mannequin"].displayMessage(-1);

            this.localStirBtnDone = this.data.stirBtnDone;
        }



        if(this.localStartBurnerClicked != this.data.startBurnerClicked) {
            this.startBurner();
            this.localStartBurnerClicked = this.data.startBurnerClicked;
        }

        if(this.localCtrlBtnClicked != this.data.ctrlBtnClicked) {
            this.localCtrlBtnIndex = this.data.ctrlBtnIndex;
            this.controlBurnerPower();
            this.localCtrlBtnClicked = this.data.ctrlBtnClicked;
        }

        if(this.localStirBtnHeld != this.data.stirBtnHeld) {
            if(this.data.stirBtnHeld) 
                this.stirBtnDown();
            else if(this.data.stirBtnHeld == false)
                this.stirBtnUp();

            this.localStirBtnHeld = this.data.stirBtnHeld;
        }
    },
  
    tick: function() {
        if(this.updatePos && this.stopStir == false) {
            this.t += 0.03
            this.x = (Math.cos(this.t) * 0.0004);
            this.z = (Math.sin(this.t) * 0.0004);


            var pos = this.glassStickPosition;
            pos.x += this.x;
            pos.z += this.z;
            
            this.glassstickEntity.object3D.position.set(pos.x, pos.y, pos.z);

            if(this.t > 10 && this.localStirDoneEventSent != true) {
                this.stopStir = true;
                this.updatePos = false;
                this.localStirDoneEventSent = true;
                
                NAF.utils.getNetworkedEntity(this.el).then(networkedEl => {
    
                    NAF.utils.takeOwnership(networkedEl);
              
                    this.el.setAttribute("first-experiment-04", "stirBtnDone", true);      
              
                });
            }
        }
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

    onHoldStirBtnDown() {
        NAF.utils.getNetworkedEntity(this.el).then(networkedEl => {
    
            NAF.utils.takeOwnership(networkedEl);
      
            this.el.setAttribute("first-experiment-04", "stirBtnHeld", true);      
      
        });
    },

    onReleaseStirBtn() {
        NAF.utils.getNetworkedEntity(this.el).then(networkedEl => {
    
            NAF.utils.takeOwnership(networkedEl);
      
            this.el.setAttribute("first-experiment-04", "stirBtnHeld", false);      
      
        });
    },

    stirBtnDown() {
        this.updatePos = true;
    },

    stirBtnUp() {
        this.updatePos = false;
    },

    startPart04() {
        this.crucibleSocketTripod.components["entity-socket"].enableSocket();
        this.crucibleSocketTripod.components["entity-socket"].subscribe("onSnap", this.onPlacedCrucible);
        this.stopwatchEntity.object3D.visible = true;
    },

    onPlacedCrucible() {
        this.startBtn.object3D.visible = true;
        this.scaleEntity.components["waage-tool"].reset();
    },

    onStartBurnerClicked() {
        NAF.utils.getNetworkedEntity(this.el).then(networkedEl => {
    
            NAF.utils.takeOwnership(networkedEl);
      
            this.el.setAttribute("first-experiment-04", "startBurnerClicked", true);      
      
            this.updateUI();
        });
    },

    startBurner() {

        console.log("Starting Burner");

        this.firstExpPart05.components["first-experiment-05"].subscribe("stopBurnerSound", this.stopBurnerSound);
        this.startBtn.object3D.visible = false;

        // now showing gloves here
        this.el.sceneEl.emit("gecolab_choose_gloves", this.experimentData.groupCode);

        this.firelighterSocketTripod.components["entity-socket"].enableSocket();
        this.firelighterSocketTripod.components["entity-socket"].subscribe("onSnap", this.onLightBurner);
    },

    onLightBurner() {
        this.firelighterSocketGeneral.components["entity-socket"].enableSocket();
        this.firelighterSocketGeneral.components["entity-socket"].subscribe("onSnap", this.onReplaceLighter);
        this.loopedBurnerSound = this.el.sceneEl.systems["hubs-systems"].soundEffectsSystem.playSoundLooped(SOUND_BURNER_SOUND);
        this.spawnItem(flameModelPromise, new THREE.Vector3(0, 0.41, 0), this.flameEntity, true);
        this.flameEntity.components["simple-animation"].printAnimations();
        
        console.log(this.flameEntity.object3D);
    },

    onReplaceLighter() {
        this.ctrlBtn00.object3D.visible = true;

         // Mannequin
         this.mannequin = this.el.sceneEl.systems["mannequin-manager"].getMannequinByGroupCode(this.experimentData.groupCode);
         this.mannequin.components["mannequin"].displayMessage(6);
    },

    onClickCtrlBtn(index) {
        if(this.ctrlBtnBlocked)
            return;

        NAF.utils.getNetworkedEntity(this.el).then(networkedEl => {
    
            NAF.utils.takeOwnership(networkedEl);
      
            this.el.setAttribute("first-experiment-04", "ctrlBtnClicked", !this.data.ctrlBtnClicked); 
            this.el.setAttribute("first-experiment-04", "ctrlBtnIndex", index);         
      
            this.updateUI();
        });
    },

    controlBurnerPower() {
        console.log(this.localCtrlBtnIndex);
        if(this.localCtrlBtnIndex == 2)
            return;

        this.ctrlBtn00.object3D.visible = false;
        this.ctrlBtn01.object3D.visible = false;
        this.ctrlBtn02.object3D.visible = false;
        this.ctrlBtn03.object3D.visible = false;

        switch(this.localCtrlBtnIndex) {
            case 0: 
                this.ctrlBtn01.object3D.visible = true;
                break;
            case 1: 
                this.ctrlBtn02.object3D.visible = true;
                setTimeout(() => {
                    this.ctrlBtn02.object3D.visible = false;
                    this.ctrlBtnBlocked = true;
                    this.stopwatchEntity.components["stopwatch-tool"].onStartTimer();
                    
                    //Mannequin
                    this.mannequin = this.el.sceneEl.systems["mannequin-manager"].getMannequinByGroupCode(this.experimentData.groupCode);
                    this.mannequin.components["mannequin"].displayMessage(7);

                    this.el.setAttribute("first-experiment-04", "burnerStarted", true);  
                }, 500);
                break;
        }
    },

    onPopupClosed() {
        NAF.utils.getNetworkedEntity(this.el).then(networkedEl => {
    
            NAF.utils.takeOwnership(networkedEl);
      
                
      
            this.updateUI();
        });
    },

    proceedToStiring() {
        this.glassstickSocket.components["entity-socket"].enableSocket();
        this.glassstickSocket.components["entity-socket"].subscribe("onSnap", this.onPlaceGlassstick);
    },

    onPlaceGlassstick() {
        this.stiringBtn.object3D.visible = true;
        this.glassStickPosition = this.glassstickEntity.object3D.position.clone();
        this.glassstickSocket.components["entity-socket"].unsubscribe("onSnap", this.onPlaceGlassstick);
    },

    stopBurnerSound() {
        if (this.loopedBurnerSound)
            this.el.sceneEl.systems["hubs-systems"].soundEffectsSystem.stopSoundNode(this.loopedBurnerSound);
    },

    remove() {
        console.log("removing first-experiment 04");

        this.stopBurnerSound();

        this.expSystem.deregisterTask("04", this.el, this.experimentData);
    }

  });