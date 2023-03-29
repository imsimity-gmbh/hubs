import { waitForDOMContentLoaded } from "../../../utils/async-utils";
//Initial Models:
import { THREE } from "aframe";
import { IMSIMITY_INIT_DELAY } from "../../../utils/imsimity";
import { decodeNetworkId, getNetworkIdFromEl } from "../../../utils/GecoLab/network-helper";


/* Networking: grind-btn networked but like the "startBurnerBtn" called on spawn for some reason, 
    all the other functions are callbacks that are subscribed to "onSnap" or "onPickedUp" of an entity-socket, which I don't know how to network */

  AFRAME.registerComponent("second-experiment-04", {
    schema: {
        lockBtnClicked: {default: false},
        startBtnClicked: {default: false},
        unlockBtnClicked: {default: false},
    },
  
    init: function() {
        this.lastUpdate = performance.now();
        
        this.el.sceneEl.addEventListener("stateadded", () => this.updateUI());
        this.el.sceneEl.addEventListener("stateremoved", () => this.updateUI());
    
        this.localLockButtonClick = false;
        this.localStartButtonClick = false;
        this.localUnlockButtonClick = false;
        
        this.onFinishPart04Callbacks = [];

        //bind Callback funtion:
        this.startPart04 = AFRAME.utils.bind(this.startPart04, this);
        this.initMachines =  AFRAME.utils.bind(this.initMachines, this);
        this.onAnimFinished = AFRAME.utils.bind(this.onAnimFinished, this);

        this.expSystem = this.el.sceneEl.systems["second-experiments"];


        waitForDOMContentLoaded().then(() => { 

            var networkId = getNetworkIdFromEl(this.el);

            this.experimentData = decodeNetworkId(networkId);

            this.isMember = this.expSystem.getIsMemberForGroupCode(this.experimentData.groupCode);

            this.expSystem.registerTask("04", this.el, this.experimentData);
            
            setTimeout(() => {

                this.secondExpPart02 = this.expSystem.getTaskById("02", this.experimentData.groupCode);

                if(this.secondExpPart02 == null)
                {
                    console.log('Cound not find SECOND EXPERIMENT 02 !!!! ');
                    return;
                }
 
                
                this.secondExpPart02.components["second-experiment-02"].subscribe("onObjectSpawnedPart02", this.initMachines);
                this.secondExpPart02.components["second-experiment-02"].subscribe("onFinishPart02", this.startPart04);

                console.log("04 callback subscribed");

                this.lockMachineBtn = this.el.querySelector(".lock-machine-btn");
                this.lockMachineBtn.object3D.visible = false;
                this.lockMachineBtn.object3D.addEventListener("interact", () => this.onLockBtnClicked());

                this.startMachineBtn = this.el.querySelector(".start-machine-btn");
                this.startMachineBtn.object3D.visible = false;
                this.startMachineBtn.object3D.addEventListener("interact", () => this.onStartBtnClicked());

                this.unlockMachineBtn = this.el.querySelector(".unlock-machine-btn");
                this.unlockMachineBtn.object3D.visible = false;
                this.unlockMachineBtn.object3D.addEventListener("interact", () => this.onUnlockBtnClicked());
                


            }, IMSIMITY_INIT_DELAY);
                
        });
        
    },

    initMachines()
    {
        this.machineEmpty = this.secondExpPart02.querySelector(".sieve-machine-empty-entity");
        this.machineEmpty.components["simple-animation"].playClip("idle", false, true);

        this.sieveBase = this.secondExpPart02.querySelector(".sieve-base-entity");
        this.sieve1 = this.secondExpPart02.querySelector(".sieve-1-entity");
        this.sieve2 = this.secondExpPart02.querySelector(".sieve-2-entity");

        this.machineAnims = this.secondExpPart02.querySelector(".sieve-machine-anims-entity");
        
        this.simpleAnim = this.machineAnims.components["simple-animation"];
        this.simpleAnim.playClip("idle", true, false);
        this.simpleAnim.printAnimations();
    },

    subscribe(eventName, fn)
    {
        switch(eventName) {
            case "onFinishPart04":
              this.onFinishPart04Callbacks.push(fn);
              break;
        }
    },

    unsubscribe(eventName, fn)
    {
        switch(eventName) {
            case "onFinishPart04":
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
        if(this.localLockButtonClick != this.data.lockBtnClicked) {
            this.lockMachine();
            this.localLockButtonClick = this.data.lockBtnClicked;
        }
        if(this.localStartButtonClick != this.data.startBtnClicked) {
            this.startMachine();
            this.localStartButtonClick = this.data.startBtnClicked;
        }
        if(this.localUnlockButtonClick != this.data.unlockBtnClicked) {
            this.unlockMachine();
            this.localUnlockButtonClick = this.data.unlockBtnClicked;
        }
    },
  
    tick: function() {

    },

   
    startPart04() {
        this.lockMachineBtn.object3D.visible = true;
    },

    onLockBtnClicked() {
        NAF.utils.getNetworkedEntity(this.el).then(networkedEl => {
    
            NAF.utils.takeOwnership(networkedEl);
      
            this.el.setAttribute("second-experiment-04", "lockBtnClicked", true);      
      
            this.updateUI();
        });
    },

    onStartBtnClicked() {
        NAF.utils.getNetworkedEntity(this.el).then(networkedEl => {
    
            NAF.utils.takeOwnership(networkedEl);
      
            this.el.setAttribute("second-experiment-04", "startBtnClicked", true);      
      
            this.updateUI();
        });
    },

    onUnlockBtnClicked() {
        NAF.utils.getNetworkedEntity(this.el).then(networkedEl => {
    
            NAF.utils.takeOwnership(networkedEl);
      
            this.el.setAttribute("second-experiment-04", "unlockBtnClicked", true);      
      
            this.updateUI();
        });
    },

    showAnimatedMachine(toggle)
    {
        // hide the machine and its sieves
        this.machineEmpty.object3D.visible = !toggle;
        this.sieveBase.object3D.visible = !toggle;
        this.sieve1.object3D.visible = !toggle;
        this.sieve2.object3D.visible = !toggle;
        
        // shows the animated version
        this.machineAnims.object3D.visible = toggle;
    },

    lockMachine()
    {
        this.lockMachineBtn.object3D.visible = true;
        
        this.showAnimatedMachine(true);
        
        this.simpleAnim.printAnimations();

        this.simpleAnim.stopClip("idle");
        this.simpleAnim.playClip("anim_01");
        
        this.simpleAnim.initFinishedCallback(this.onAnimFinished);
    },

    startMachine()
    {
        this.startMachineBtn.object3D.visible = false;

        this.simpleAnim.playClip("anim_02");
    },

    unlockMachine()
    {
        this.unlockMachineBtn.object3D.visible = false;

        this.simpleAnim.playClip("anim_03");
    },

    onAnimFinished()
    {
        console.log("anim done");

        if (this.data.unlockBtnClicked == true)
        {
            //this.simpleAnim.stopClip("anim_03");
            this.showAnimatedMachine(false);

            this.onFinishPart04Callbacks.forEach(cb => {
                cb();
            });
        }
        else if (this.data.startBtnClicked == true)
        {
            //this.simpleAnim.stopClip("anim_02");
            
            this.unlockMachineBtn.object3D.visible = true;
        }
        else if (this.data.lockBtnClicked == true)
        {
            //this.simpleAnim.stopClip("anim_01");
            
            this.startMachineBtn.object3D.visible = true;
        }


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