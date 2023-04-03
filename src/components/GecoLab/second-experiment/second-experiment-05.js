import { SOUND_POURING_SOIL, SOUND_SCREWING_MACHINE } from "../../../systems/sound-effects-system";
import { waitForDOMContentLoaded } from "../../../utils/async-utils";

//Initial Models:
import { THREE } from "aframe";
import { IMSIMITY_INIT_DELAY } from "../../../utils/imsimity";
import { decodeNetworkId, getNetworkIdFromEl } from "../../../utils/GecoLab/network-helper";


/* Networking: grind-btn networked but like the "startBurnerBtn" called on spawn for some reason, 
    all the other functions are callbacks that are subscribed to "onSnap" or "onPickedUp" of an entity-socket, which I don't know how to network */

  AFRAME.registerComponent("second-experiment-05", {
    schema: {
    },
  
    init: function() {
        this.lastUpdate = performance.now();
        
        this.el.sceneEl.addEventListener("stateadded", () => this.updateUI());
        this.el.sceneEl.addEventListener("stateremoved", () => this.updateUI());
        
        this.sockets = [];

        this.onFinishPart05Callbacks = [];

        //bind Callback funtion:
        this.startPart05 = AFRAME.utils.bind(this.startPart05, this);
        this.onSieve2PutToSide = AFRAME.utils.bind(this.onSieve2PutToSide, this);
        this.onSieve1PlacedOnScale = AFRAME.utils.bind(this.onSieve1PlacedOnScale, this);
        this.onSieve1PutToSide = AFRAME.utils.bind(this.onSieve1PutToSide, this);
        this.onSieveBasePlacedOnScale = AFRAME.utils.bind(this.onSieveBasePlacedOnScale, this);

        this.expSystem = this.el.sceneEl.systems["second-experiments"];

        this.groundSampleIndex = 0;
        this.sieve1weights = ["279.1", "248.6", "267.5", "282.45"];
        this.sieveBaseWeights = ["300.9","331.4","312.5", "297.55"];

        waitForDOMContentLoaded().then(() => { 

            var networkId = getNetworkIdFromEl(this.el);

            this.experimentData = decodeNetworkId(networkId);

            this.isMember = this.expSystem.getIsMemberForGroupCode(this.experimentData.groupCode);

            this.expSystem.registerTask("05", this.el, this.experimentData);
            
            setTimeout(() => {

                this.secondExpPart04 = this.expSystem.getTaskById("04", this.experimentData.groupCode);

                if(this.secondExpPart04 == null)
                {
                    console.log('Cound not find SECOND EXPERIMENT 04 !!!! ');
                    return;
                }
 
                this.secondExpPart04.components["second-experiment-04"].subscribe("onFinishPart04", this.startPart05);

                console.log("05 callback subscribed");

              
                this.sieve1ScaleSocket = this.el.querySelector(".sieve-1-scale-socket");
                this.sockets.push(this.sieve1ScaleSocket);
                this.sieveBaseScaleSocket = this.el.querySelector(".sieve-base-scale-socket");
                this.sockets.push(this.sieveBaseScaleSocket);
                this.sieve1SideSocket = this.el.querySelector(".sieve-1-side-socket");
                this.sockets.push(this.sieve1SideSocket);
                this.sieve2SideSocket = this.el.querySelector(".sieve-2-side-socket");
                this.sockets.push(this.sieve2SideSocket);

                this.sockets.forEach(s => {
                    console.log(s);
                    s.object3D.visible = false; //hide holograms until needed
                });


            }, IMSIMITY_INIT_DELAY * 2);
                
        });
        
    },

    

    subscribe(eventName, fn)
    {
        switch(eventName) {
            case "onFinishPart05":
              this.onFinishPart05Callbacks.push(fn);
              break;
        }
    },

    unsubscribe(eventName, fn)
    {
        switch(eventName) {
            case "onFinishPart05":
              let index = this.onFinishPart05Callbacks.indexOf(fn);
              this.onFinishPart05Callbacks.splice(index, 1);
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

   
    startPart05() {
        console.log("startig part 05");

        var secondExpPart01 = this.expSystem.getTaskById("01", this.experimentData.groupCode);
        console.log(secondExpPart01);

        this.groundSampleIndex = secondExpPart01.components["second-experiment-01"].localGroundSampleIndex;
        console.log(this.groundSampleIndex); 


        this.secondExpPart02 = this.expSystem.getTaskById("02", this.experimentData.groupCode);
        this.scaleText = this.secondExpPart02.querySelector(".scale-entity").querySelector(".display-text");
        console.log(this.scaleText);

        this.sieve2SideSocket.object3D.visible = true;
        var socket = this.sieve2SideSocket.components["entity-socket"];
        socket.subscribe("onSnap", this.onSieve2PutToSide);
        socket.delayedInitSocket();
    },

    onSieve2PutToSide()
    {
        console.log("sieve 2 put to side");

        // Mannequin
        this.mannequin = this.el.sceneEl.systems["mannequin-manager"].getMannequinByGroupCode(this.experimentData.groupCode);
        this.mannequin.components["mannequin"].displayMessage(35);

        this.sieve2SideSocket.object3D.visible = false;
        var socket2 = this.sieve2SideSocket.components["entity-socket"];
        socket2.unsubscribe("onSnap", this.onSieve2PutToSide);

        this.sieve1ScaleSocket.object3D.visible = true;
        var socket1 = this.sieve1ScaleSocket.components["entity-socket"];
        socket1.subscribe("onSnap", this.onSieve1PlacedOnScale);
        socket1.delayedInitSocket();
    },

    onSieve1PlacedOnScale()
    {
        console.log(this.sieve1ScaleSocket);

        this.sieve1ScaleSocket.object3D.visible = false;
        var socket1 = this.sieve1ScaleSocket.components["entity-socket"];
        socket1.unsubscribe("onSnap", this.onSieve1PlacedOnScale);

        //TODO: use real values
        var weight = this.sieve1weights[this.groundSampleIndex];
        console.log("weight :"+weight);

        this.scaleText.setAttribute("text", { value: weight });

        this.sieve1SideSocket.object3D.visible = true;
        var socketSide = this.sieve1SideSocket.components["entity-socket"];
        socketSide.subscribe("onSnap", this.onSieve1PutToSide);
        socketSide.delayedInitSocket();
    },

    onSieve1PutToSide()
    {
        this.sieve1SideSocket.object3D.visible = false;
        var socket1 = this.sieve1SideSocket.components["entity-socket"];
        socket1.unsubscribe("onSnap", this.onSieve1PutToSide);

        this.scaleText.setAttribute("text", { value: "0.0g" });

        // Mannequin
        this.mannequin = this.el.sceneEl.systems["mannequin-manager"].getMannequinByGroupCode(this.experimentData.groupCode);
        this.mannequin.components["mannequin"].displayMessage(36);

        this.sieveBaseScaleSocket.object3D.visible = true;
        var socketScale = this.sieveBaseScaleSocket.components["entity-socket"];
        socketScale.subscribe("onSnap", this.onSieveBasePlacedOnScale);
        socketScale.delayedInitSocket();
    },

    onSieveBasePlacedOnScale()
    {
        this.sieveBaseScaleSocket.object3D.visible = false;
        var socketBase = this.sieveBaseScaleSocket.components["entity-socket"];
        socketBase.unsubscribe("onSnap", this.onSieveBasePlacedOnScale);

        var weight = this.sieveBaseWeights[this.groundSampleIndex];
        console.log("weight :"+weight);

        this.scaleText.setAttribute("text", { value: weight });

        console.log("experiment 05 done");

        this.onFinishPart05Callbacks.forEach(cb => {
            cb();
        });
    },
    
    playSound(soundID) {
        if (this.isMember)
        {
            this.el.sceneEl.systems["hubs-systems"].soundEffectsSystem.playSoundOneShot(soundID);
        }
    },

    remove() {
        console.log("removing second-experiment 05");
        this.expSystem.deregisterTask("05", this.el, this.experimentData);
    }

  });