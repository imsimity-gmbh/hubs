import { SOUND_GRIND_SOUND } from "../../../systems/sound-effects-system";
import { SOUND_ADD_SAMPLE } from "../../../systems/sound-effects-system";

import { cloneObject3D } from "../../../utils/three-utils";
import { loadModel } from "../../gltf-model-plus";
import { waitForDOMContentLoaded } from "../../../utils/async-utils";
//Initial Models:
import grindedSampleSrc from "../../../assets/models/GecoLab/ground_sample_grinded.glb";
import scaleSrc from "../../../assets/models/GecoLab/scales.glb";
import curcibleSrc from "../../../assets/models/GecoLab/crucible.glb";
import { THREE } from "aframe";
import { IMSIMITY_INIT_DELAY } from "../../../utils/imsimity";
import { decodeNetworkId, getNetworkIdFromEl } from "../../../utils/GecoLab/network-helper";

const grindedSampleModelPromise = waitForDOMContentLoaded().then(() => loadModel(grindedSampleSrc));
const scaleModelPromise = waitForDOMContentLoaded().then(() => loadModel(scaleSrc));
const curcibleModelPromise = waitForDOMContentLoaded().then(() => loadModel(curcibleSrc));

/* Networking: grind-btn networked but like the "startBurnerBtn" called on spawn for some reason, 
    all the other functions are callbacks that are subscribed to "onSnap" or "onPickedUp" of an entity-socket, which I don't know how to network */

  AFRAME.registerComponent("second-experiment-03", {
    schema: {
        grindBtnClicked: {default: false},
    },
  
    init: function() {
        this.lastUpdate = performance.now();
        
        this.el.sceneEl.addEventListener("stateadded", () => this.updateUI());
        this.el.sceneEl.addEventListener("stateremoved", () => this.updateUI());
    
        this.grindSampleClicks = 0;
        this.finishedGrinding = false;
        this.localGrindBtnClicked = false;

        this.sockets = [];
        
        this.onFinishPart03Callbacks = [];

        //bind Callback funtion:
        this.startPart03 = AFRAME.utils.bind(this.startPart03, this);

        this.expSystem = this.el.sceneEl.systems["second-experiments"];

        this.amountsCount = 0;


        waitForDOMContentLoaded().then(() => { 

            var networkId = getNetworkIdFromEl(this.el);

            this.experimentData = decodeNetworkId(networkId);

            this.isMember = this.expSystem.getIsMemberForGroupCode(this.experimentData.groupCode);

            this.expSystem.registerTask("03", this.el, this.experimentData);
            


            // this.updateUI();
            setTimeout(() => {

                this.secondExpPart01 = this.expSystem.getTaskById("01", this.experimentData.groupCode);
                this.secondExpPart02 = this.expSystem.getTaskById("02", this.experimentData.groupCode);

                if(this.secondExpPart01 == null)
                {
                    console.log('Cound not find SECOND EXPERIMENT 01 !!!! ');
                    return;
                }
 
                
                //Subscribe to callback after placing mortar    
                this.secondExpPart01.components["second-experiment-01"].subscribe("onFinishPart01", this.startPart03);
                console.log("03 callback subscribed");

                this.grindSampleBtn = this.el.querySelector(".grind-sample-btn");
                this.grindSampleBtn.object3D.visible = false;
                this.grindSampleBtn.object3D.addEventListener("interact", () => this.onGrindBtnClicked());


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
    },
  
    tick: function() {

    },

   
    startPart03() {
        this.grindSampleBtn.object3D.visible = true;
        this.mortarStick = this.secondExpPart02.querySelector(".mortar-stick-entity");
        this.mortarStick.setAttribute("position", {x: 0, y: 0.15, z: 0.04});
        this.mortarStick.setAttribute("rotation", {x: -70, y: 0, z: 0});
    },

    onGrindBtnClicked() {
        NAF.utils.getNetworkedEntity(this.el).then(networkedEl => {
    
            NAF.utils.takeOwnership(networkedEl);
      
            this.el.setAttribute("second-experiment-03", "grindBtnClicked", !this.data.grindBtnClicked);      
      
            this.updateUI();
        });
    },

    grindSample() {
        if(this.finishedGrinding)
            return;

        this.el.sceneEl.systems["hubs-systems"].soundEffectsSystem.playSoundOneShot(SOUND_GRIND_SOUND);
        this.grindSampleClicks++;

        if(this.grindSampleClicks >= 15) {

            this.finishedGrinding = true;
            this.grindSampleBtn.object3D.visible = false;
            this.mortarStick.object3D.visible = false;

             // Mannequin
            this.mannequin = this.el.sceneEl.systems["mannequin-manager"].getMannequinByGroupCode(this.experimentData.groupCode);
            //this.mannequin.components["mannequin"].displayMessage(2);
            
            this.onFinishPart03Callbacks.forEach(cb => {
                cb();
            });
        }
        
        //TODO: Mortar Stick is unkown
        let inintialPos = this.mortarStick.getAttribute("position");
        this.mortarStick.setAttribute("position", {x: inintialPos.x, y: (inintialPos.y - 0.03), z: inintialPos.z});
        setTimeout(() => {
            this.mortarStick.setAttribute("position", {x: inintialPos.x, y: (inintialPos.y + 0.03), z: inintialPos.z});
        }, 200);
    },

    playSound(soundID) {
        if (this.isMember)
        {
            this.el.sceneEl.systems["hubs-systems"].soundEffectsSystem.playSoundOneShot(soundID);
        }
    },

    remove() {
        console.log("removing second-experiment 03");
        this.expSystem.deregisterTask("03", this.el, this.experimentData);
    }

  });