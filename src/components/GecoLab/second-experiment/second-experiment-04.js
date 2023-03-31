import { SOUND_POURING_SOIL, SOUND_SCREWING_MACHINE, SOUND_VIBRATING_MACHINE } from "../../../systems/sound-effects-system";
import { waitForDOMContentLoaded } from "../../../utils/async-utils";

//Initial Models:
import { THREE } from "aframe";
import { IMSIMITY_INIT_DELAY } from "../../../utils/imsimity";
import { decodeNetworkId, getNetworkIdFromEl } from "../../../utils/GecoLab/network-helper";


/* Networking: grind-btn networked but like the "startBurnerBtn" called on spawn for some reason, 
    all the other functions are callbacks that are subscribed to "onSnap" or "onPickedUp" of an entity-socket, which I don't know how to network */

  AFRAME.registerComponent("second-experiment-04", {
    schema: {
        soilBtnClicked: {default: false},
        lockBtnClicked: {default: false},
        startBtnClicked: {default: false},
        unlockBtnClicked: {default: false},
    },
  
    init: function() {
        this.lastUpdate = performance.now();
        
        this.el.sceneEl.addEventListener("stateadded", () => this.updateUI());
        this.el.sceneEl.addEventListener("stateremoved", () => this.updateUI());
        
        this.localSoilButtonClick = false;
        this.localLockButtonClick = false;
        this.localStartButtonClick = false;
        this.localUnlockButtonClick = false;
        
        this.onFinishPart04Callbacks = [];

        //bind Callback funtion:
        this.startPart04 = AFRAME.utils.bind(this.startPart04, this);
        this.initMachines =  AFRAME.utils.bind(this.initMachines, this);
        this.onAnimFinished = AFRAME.utils.bind(this.onAnimFinished, this);

        this.expSystem = this.el.sceneEl.systems["second-experiments"];

        this.countingDown = false;
        this.countingDuration = 300;
        this.actualCountingDuration = 10;
        this.startTime = 0;

        waitForDOMContentLoaded().then(() => { 

            var networkId = getNetworkIdFromEl(this.el);

            this.experimentData = decodeNetworkId(networkId);

            this.isMember = this.expSystem.getIsMemberForGroupCode(this.experimentData.groupCode);

            console.log("SE-04 registered");
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

                this.fillSoilBtn = this.el.querySelector(".fill-soil-btn");
                this.fillSoilBtn.object3D.visible = false;
                this.fillSoilBtn.object3D.addEventListener("interact", () => this.onSoilBtnClicked());

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

        this.mortarEmpty = this.secondExpPart02.querySelector(".mortar-empty-entity");
        this.mortarWithSoil = this.secondExpPart02.querySelector(".mortar-with-soil-entity");

        this.sieveBase = this.secondExpPart02.querySelector(".sieve-base-entity");
        this.sieve1 = this.secondExpPart02.querySelector(".sieve-1-entity");
        this.sieve2 = this.secondExpPart02.querySelector(".sieve-2-entity");

        this.machineAnims = this.secondExpPart02.querySelector(".sieve-machine-anims-entity");
        this.machineClock = this.secondExpPart02.querySelector(".sieve-machine-clock-entity");
        this.machineClockText = this.secondExpPart02.querySelector(".machine-clock-display-text");

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
              this.onFinishPart04Callbacks.splice(index, 1);
              break;
        }
    },
    
    update() {
        waitForDOMContentLoaded().then(() => { 
          this.updateUI();
        });
    },

    updateUI: function() {
        if(this.localSoilButtonClick != this.data.soilBtnClicked) {
            this.fillMachine();
            this.localSoilButtonClick = this.data.soilBtnClicked;
        }
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

        if (this.countingDown == true)
        {
            var elapsed = (performance.now() - this.startTime)
            var scaledElapsed = Math.min(Math.max(elapsed	* this.actualCountingDuration / this.countingDuration, 0), this.countingDuration); ;
            
            var secondsLeft = Math.floor(this.countingDuration - scaledElapsed);

            console.log(scaledElapsed);

            let formattedTime = "";
    
            let minutes = Math.floor(secondsLeft / 60);
            let seconds = secondsLeft - minutes * 60;

            if(minutes < 10) {
                if(seconds < 10) 
                  formattedTime = "0" + minutes + ":0" + seconds;
                else if(seconds >= 10 && seconds < 60) 
                  formattedTime = "0" + minutes + ":" + seconds;
              } 
              else if(minutes >= 10) {
                if(seconds < 10) 
                  formattedTime = minutes + ":0" + seconds;
                else if(seconds >= 10 && seconds < 60) 
                  formattedTime = minutes + ":" + seconds;
              }

            this.machineClockText.setAttribute("text", { value: formattedTime });
        }
    },

   
    startPart04() {
        if (this.isMember)
        {
            this.fillSoilBtn.object3D.visible = true;

            // Mannequin
            this.mannequin = this.el.sceneEl.systems["mannequin-manager"].getMannequinByGroupCode(this.experimentData.groupCode);
            this.mannequin.components["mannequin"].displayMessage(32);
        }
    },

    onSoilBtnClicked() {
        NAF.utils.getNetworkedEntity(this.el).then(networkedEl => {
    
            NAF.utils.takeOwnership(networkedEl);
      
            this.el.setAttribute("second-experiment-04", "soilBtnClicked", true);      
      
            this.updateUI();
        });
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
        
        // shows the clock
        this.machineClock.object3D.visible = toggle;
    },

    fillMachine()
    {
        this.fillSoilBtn.object3D.visible = false;
        
        this.mortarWithSoil.object3D.visible = false;
        this.mortarEmpty.object3D.visible = true;
        
        
        this.playSound(SOUND_POURING_SOIL);

        if (this.isMember)
        {
            this.lockMachineBtn.object3D.visible = true;

            // Mannequin
            this.mannequin = this.el.sceneEl.systems["mannequin-manager"].getMannequinByGroupCode(this.experimentData.groupCode);
            this.mannequin.components["mannequin"].displayMessage(33);
        }
       
    },


    lockMachine()
    {
        this.lockMachineBtn.object3D.visible = false;
        
        this.showAnimatedMachine(true);
        

        this.playSound(SOUND_SCREWING_MACHINE);

        this.simpleAnim.printAnimations();

        this.simpleAnim.stopClip("idle");
        this.simpleAnim.playClip("anim_01");
        
        this.simpleAnim.initFinishedCallback(this.onAnimFinished);
    },

    startMachine()
    {
        this.startMachineBtn.object3D.visible = false;

        this.simpleAnim.playClip("anim_02", true, true);

        this.playLoopingSound(SOUND_VIBRATING_MACHINE);

        this.countingDown = true;
        this.startTime = performance.now();

        setTimeout(() => {

            this.countingDown = false;
            this.onAnimFinished();

        }, this.actualCountingDuration * 1000);
    },

    unlockMachine()
    {
        this.unlockMachineBtn.object3D.visible = false;

        this.playSound(SOUND_SCREWING_MACHINE);

        this.simpleAnim.playClip("anim_03");
    },

    onAnimFinished()
    {
        console.log("anim done");

        if (this.data.unlockBtnClicked == true)
        {
            this.showAnimatedMachine(false);

            this.onFinishPart04Callbacks.forEach(cb => {
                cb();
            });
        }
        else if (this.data.startBtnClicked == true)
        {
            this.stopLoopingSound();
            this.simpleAnim.stopClip("anim_02");
            
            if (this.isMember)
            {
                this.unlockMachineBtn.object3D.visible = true;

                // Mannequin
                this.mannequin = this.el.sceneEl.systems["mannequin-manager"].getMannequinByGroupCode(this.experimentData.groupCode);
                this.mannequin.components["mannequin"].displayMessage(34);
            }
        }
        else if (this.data.lockBtnClicked == true)
        {          
            if (this.isMember)
            {
                this.startMachineBtn.object3D.visible = true;
            }
        }


    },

    playSound(soundID) {
        if (this.isMember)
        {
            this.el.sceneEl.systems["hubs-systems"].soundEffectsSystem.playSoundOneShot(soundID);
        }
    },

    playLoopingSound(soundID) {
        if (this.isMember)
        {
            this.loopingNode = this.el.sceneEl.systems["hubs-systems"].soundEffectsSystem.playSoundLooped(soundID);
        }
    },

    stopLoopingSound() {
        if (this.isMember)
        {
            this.el.sceneEl.systems["hubs-systems"].soundEffectsSystem.stopSoundNode(this.loopingNode);
        }
    },

    remove() {
        console.log("removing second-experiment 04");
        this.expSystem.deregisterTask("04", this.el, this.experimentData);
    }

  });