import { waitForDOMContentLoaded } from "../../../utils/async-utils";

//Initial Models:
import { THREE } from "aframe";
import { IMSIMITY_INIT_DELAY } from "../../../utils/imsimity";
import { decodeNetworkId, getNetworkIdFromEl } from "../../../utils/GecoLab/network-helper";


/* Networking: grind-btn networked but like the "startBurnerBtn" called on spawn for some reason, 
    all the other functions are callbacks that are subscribed to "onSnap" or "onPickedUp" of an entity-socket, which I don't know how to network */

  AFRAME.registerComponent("second-experiment-06", {
    schema: {
    },
  
    init: function() {
        this.lastUpdate = performance.now();
        
        this.el.sceneEl.addEventListener("stateadded", () => this.updateUI());
        this.el.sceneEl.addEventListener("stateremoved", () => this.updateUI());
      
        this.resultClicks = 0;

        this.onFinishPart06Callbacks = [];

        //bind Callback funtion:
        this.startPart06 = AFRAME.utils.bind(this.startPart06, this);
        this.onStartCalculations = AFRAME.utils.bind(this.onStartCalculations, this);
        this.onFeedbackClick = AFRAME.utils.bind(this.onFeedbackClick, this);

        this.onGroundDone = AFRAME.utils.bind(this.onGroundDone, this);
        this.onSandDone = AFRAME.utils.bind(this.onSandDone, this);
        this.onClayDone = AFRAME.utils.bind(this.onClayDone, this);

        this.expSystem = this.el.sceneEl.systems["second-experiments"];

        console.log(this.expSystem);

        waitForDOMContentLoaded().then(() => { 

            var networkId = getNetworkIdFromEl(this.el);

            this.experimentData = decodeNetworkId(networkId);

            this.isMember = this.expSystem.getIsMemberForGroupCode(this.experimentData.groupCode);

            console.log("SE-06 registered");
            this.expSystem.registerTask("06", this.el, this.experimentData);
            
            setTimeout(() => {

                this.secondExpPart05 = this.expSystem.getTaskById("05", this.experimentData.groupCode);

                if(this.secondExpPart05 == null)
                {
                    console.log('Cound not find SECOND EXPERIMENT 06 !!!! ');
                    return;
                }
 
                
                this.secondExpPart05.components["second-experiment-05"].subscribe("onFinishPart05", this.startPart06);

                console.log("06 callback subscribed");

                this.resultBtn = this.el.querySelector(".result-btn");
                this.resultBtn.object3D.visible = false;
                this.resultBtn.object3D.addEventListener("interact", () => this.onStartCalculations());
                this.resultBtnText = this.resultBtn.querySelector(".result-btn-text");

                this.feedbackBtn = this.el.querySelector(".feedback-btn");
                this.feedbackBtn.object3D.visible = false;
                this.feedbackBtn.object3D.addEventListener("interact", () => this.onFeedbackClick());

            }, IMSIMITY_INIT_DELAY);
                
        });
        
    },

  

    subscribe(eventName, fn)
    {
        switch(eventName) {
            case "onFinishPart06":
              this.onFinishPart06Callbacks.push(fn);
              break;
        }
    },

    unsubscribe(eventName, fn)
    {
        switch(eventName) {
            case "onFinishPart06":
              let index = this.onFinishPart06Callbacks.indexOf(fn);
              this.onFinishPart06Callbacks.splice(index, 1);
              break;
        }
    },
    
    update() {
        waitForDOMContentLoaded().then(() => { 
          this.updateUI();
        });
    },

    updateUI: function() {
       
    },
  
    tick: function() {

    },

   
    startPart06() {
        if (this.isMember)
        {
            this.resultBtn.object3D.visible = true;
            this.resultBtnText.setAttribute("text", { value: "Gesamtmasse Boden\nberechnen" });
        }
    },

    onStartCalculations()
    {
        this.resultBtn.object3D.visible = false;

        this.resultClicks++;

        if (this.isMember)
        {
            switch(this.resultClicks)
            {
                case 1:
                    this.el.sceneEl.emit("gecolab_second_experiment_modal_ground", this.experimentData.groupCode);
                    break;
                case 2:
                    this.el.sceneEl.emit("gecolab_second_experiment_modal_sand", this.experimentData.groupCode);
                    break;
                case 3:
                    this.el.sceneEl.emit("gecolab_second_experiment_modal_clay", this.experimentData.groupCode);
                    break;
            }
        }

    },


    onFeedbackClick()
    {
       this.feedbackBtn.object3D.visible = false;

        if (this.isMember)
        {
            this.el.sceneEl.emit("gecolab_feedback", this.experimentData.groupCode);

            // Mannequin
            this.mannequin = this.el.sceneEl.systems["mannequin-manager"].getMannequinByGroupCode(this.experimentData.groupCode);
            this.mannequin.components["mannequin"].displayMessage(37);
        }
    },

    onGroundDone()
    {
        if (this.isMember)
        {
            setTimeout(() => {
                this.resultBtn.object3D.visible = true;
                this.resultBtnText.setAttribute("text", { value: "Sandfraktion\nberechnen" });
            }, IMSIMITY_INIT_DELAY);
        }
    },

    onSandDone()
    {
        if (this.isMember)
        { 
            setTimeout(() => {
                this.resultBtn.object3D.visible = true;
                this.resultBtnText.setAttribute("text", { value: "Ton-/ Schlufffraktion\nberechnen" });
            }, IMSIMITY_INIT_DELAY);
        }
    },

    onClayDone()
    {
        if (this.isMember)
        {   
            setTimeout(() => {
                this.feedbackBtn.object3D.visible = true;
            }, IMSIMITY_INIT_DELAY);
        }
    },



    remove() {
        console.log("removing second-experiment 04");
        this.expSystem.deregisterTask("06", this.el, this.experimentData);
    }

  });