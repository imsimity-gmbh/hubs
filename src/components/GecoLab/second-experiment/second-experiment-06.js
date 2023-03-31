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
      
        
        this.onFinishPart06Callbacks = [];

        //bind Callback funtion:
        this.startPart04 = AFRAME.utils.bind(this.startPart04, this);

        this.expSystem = this.el.sceneEl.systems["second-experiments"];


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
                    console.log('Cound not find SECOND EXPERIMENT 02 !!!! ');
                    return;
                }
 
                
                this.secondExpPart02.components["second-experiment-05"].subscribe("onFinishPart05", this.startPart04);

                console.log("06 callback subscribed");

             

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

    },


    remove() {
        console.log("removing second-experiment 04");
        this.expSystem.deregisterTask("06", this.el, this.experimentData);
    }

  });