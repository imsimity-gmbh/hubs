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
        this.onSieve1Placed = AFRAME.utils.bind(this.onSieve1Placed, this);

        this.expSystem = this.el.sceneEl.systems["second-experiments"];


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

              
                this.sieve1Socket = this.el.querySelector(".sieve-1-final-socket");
                this.sockets.push(this.sieve1Socket);
                this.sieve2Socket = this.el.querySelector(".sieve-2-final-socket");
                this.sockets.push(this.sieve2Socket);

                this.sockets.forEach(s => {
                    s.object3D.visible = false; //hide holograms until needed
                });


            }, IMSIMITY_INIT_DELAY * 2);
                
        });
        
    },

    

    subscribe(eventName, fn)
    {
        switch(eventName) {
            case "onFinishPart05":
              this.onFinishPart04Callbacks.push(fn);
              break;
        }
    },

    unsubscribe(eventName, fn)
    {
        switch(eventName) {
            case "onFinishPart05":
              let index = this.onFinishPart04Callbacks.indexOf(fn);
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
       
    },
  
    tick: function() {

    },

   
    startPart05() {
        console.log("startig part 05");

        this.sieve2Socket.object3D.visible = true;
        var socket = this.sieve2Socket.components["entity-socket"];
        socket.subscribe("onSnap", this.onSieve2PutToSide);
        socket.delayedInitSocket();
    },

    onSieve2PutToSide()
    {
        console.log("sieve 2 put to side");

        this.sieve2Socket.object3D.visible = false;
        var socket2 = this.sieve2Socket.components["entity-socket"];
        socket2.unsubscribe("onSnap", this.onSieve2PutToSide);

        this.sieve1Socket.object3D.visible = true;
        var socket1 = this.sieve1Socket.components["entity-socket"];
        socket1.subscribe("onSnap", this.onSieve1Placed);
        socket1.delayedInitSocket();
    },

    onSieve1Placed()
    {
        this.sieve1Socket.object3D.visible = false;
        var socket1 = this.sieve1Socket.components["entity-socket"];
        socket1.unsubscribe("onSnap", this.onSieve1Placed);

        console.log("end of placing sieves");
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