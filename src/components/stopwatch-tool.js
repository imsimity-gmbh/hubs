//TODO_LAURA_SOUND: import your new sounds here !
import { SOUND_STOPWATCH_TICKING } from "../systems/sound-effects-system";

import { cloneObject3D } from "../utils/three-utils";
import { loadModel } from "./gltf-model-plus";
import { waitForDOMContentLoaded } from "../utils/async-utils";
import stopwatchModelSrc from "../assets/models/GecoLab/stopwatch.glb";
import pinnedEntityToGltf from "../utils//pinned-entity-to-gltf.js";
import { IMSIMITY_INIT_DELAY } from "../utils/imsimity";

// Change stopwatchModelSrc to your model
const stopwatchModelPromise = waitForDOMContentLoaded().then(() => loadModel(stopwatchModelSrc));

AFRAME.registerComponent("stopwatch-tool", {
  // TODO: network the right variables
  schema: {
      startClicked: {default: false},
      resetClicked: {default: false},
      currentTime: {default: "00:00"},
  },


  // like Start() in Unity
  init() {

    this.el.object3D.visible = false; // Make invisible until model ready
    this.lastUpdate = performance.now();

    this.el.sceneEl.addEventListener("stateadded", () => this.updateUI());
    this.el.sceneEl.addEventListener("stateremoved", () => this.updateUI());


    
    this.myDisplayText = this.el.querySelector(".stopwatch-display-text");

    //Variables needed for stopwatch logic:
    this.timerRunning = false;
    this.timeUntilPause = 0;

    //Local versions of network-variables:
    this.localStartClicked = false;
    this.localResetClicked = false;
    this.secondPassed = true;
    this.localCurrentTime = 0;

    this.speedVariable = 1000;

    this.minuteMark1 = 7;
    this.minuteMark2 = 60;
    this.minuteMark3 = 16; //eigtl. 25
    this.minuteMark4 = 22; //eigtl. 45
    this.minuteMark1Reached = false;
    this.minuteMark2Reached = false;
    this.minuteMark3Reached = false;
    this.minuteMark4Reached = false;
    this.minuteMark1Callbacks = [];
    this.minuteMark2Callbacks = [];
    this.minuteMark3Callbacks = [];
    this.minuteMark4Callbacks = [];


    this.setMinuteMark2 = AFRAME.utils.bind(this.setMinuteMark2, this);

    this.expSystem = this.el.sceneEl.systems["first-experiments"];

    this.stopwatchSystem = this.el.sceneEl.systems["stopwatch-tools"];
    this.stopwatchSystem.register(this.el);


    // Load the 3D model
    stopwatchModelPromise.then(model => {
      const mesh = cloneObject3D(model.scene);
      mesh.scale.set(4.00, 4.00, 4.00);
      mesh.matrixNeedsUpdate = true;
      this.el.setObject3D("mesh", mesh);

      // this.el.object3D.visible = true;
      this.el.object3D.scale.set(1.0, 1.0, 1.0);
      this.el.object3D.matrixNeedsUpdate = true;
      

      setTimeout(() => {
        this.firstExp05 = this.expSystem.getTaskById("05");
      
        if(this.firstExp05 != null) {
          this.firstExp05.components["first-experiment-05"].subscribe("minuteMark1Finished", this.setMinuteMark2);
        }
        else
        {
          console.log('ERROR !! first-experiment-05 isnt spawned yet' );
        }
      }, IMSIMITY_INIT_DELAY);
     
    
    });
  },

  remove() {
    this.stopwatchSystem.deregister(this.el);
  },

  subscribe(eventName, fn)
  {
    switch(eventName) {
      case "minuteMark1":
        this.minuteMark1Callbacks.push(fn);
        break;
      case "minuteMark2":
        this.minuteMark2Callbacks.push(fn);
        break;
      case "minuteMark3":
        this.minuteMark3Callbacks.push(fn);
        break;
      case "minuteMark4":
        this.minuteMark4Callbacks.push(fn);
        break;
    }
  },

  unsubscribe(eventName, fn)
  {
    switch(eventName) {
      case "minuteMark1":
        let index = this.minuteMark1Callbacks.indexOf(fn);
        this.minuteMark1Callbacks.splice(index, 1);
        break;
      case "minuteMark2":
        let index2 = this.minuteMark2Callbacks.indexOf(fn);
        this.minuteMark2Callbacks.splice(index2, 1);
        break;
      case "minuteMark3":
        let index3 = this.minuteMark3Callbacks.indexOf(fn);
        this.minuteMark3Callbacks.splice(index3, 1);
        break;
      case "minuteMark4":
        let index4 = this.minuteMark3Callbacks.indexOf(fn);
        this.minuteMark3Callbacks.splice(index4, 1);
        break;
    }
  },

  update() {
    waitForDOMContentLoaded().then(() => { 
      this.updateUI();
    });
  },

  updateUI() {  
    //Check if start button has been clicked by anyone:
    if(this.localStartClicked != this.data.startClicked) {
      this.timerRunning = true;
      this.localStartClicked = this.data.startClicked;
    }

    //Check if reset-button has been clicked by anyone
    if(this.localResetClicked != this.data.resetClicked) {

      if(this.timerRunning) {
        this.startTime = performance.now();
      }

      this.localCurrentTime = 0;
      this.timeUntilPause = 0;
      this.timerRunning = false;
      this.myDisplayText.setAttribute("text", { value: "00:00" });
      console.log(this.data.currentTime);

      this.localResetClicked = this.data.resetClicked;
    }

    //Update display of stopwatch to current time:
    // if(this.timerRunning) {
    //   this.myDisplayText.setAttribute("text", { value: this.data.currentTime });
    // }
  },

  
  // Like Update() in Unity
  tick() {
    //If timer activated, calculate elapsed time since start and update UI
    if(this.timerRunning) {

      if(this.secondPassed) {
        this.secondPassed = false;
    
        this.localCurrentTime++;
    
        let formattedTime = "";
    
        let minutes = Math.floor(this.localCurrentTime / 60);
        let seconds = this.localCurrentTime - minutes*60;
    
        //Check minute marks:
        if(minutes >= this.minuteMark1 && this.minuteMark1Reached == false) {
            this.minuteMark1Callbacks.forEach(cb => {
              cb();
            });
            this.minuteMark1Reached = true;
          }
    
          if(minutes >= this.minuteMark2 && this.minuteMark2Reached == false) {
            this.minuteMark2Callbacks.forEach(cb => {
              cb();
            });
            this.minuteMark2Reached = true;
          }
    
          if(minutes >= this.minuteMark3 && this.minuteMark3Reached == false) {
            this.minuteMark3Callbacks.forEach(cb => {
              cb();
            });
            this.minuteMark3Reached = true;
          }
    
          if(minutes >= this.minuteMark4 && this.minuteMark4Reached == false) {
            this.minuteMark4Callbacks.forEach(cb => {
              cb();
            });
            this.minuteMark4Reached = true;
          }
    
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
    
          setTimeout(() => {
            this.myDisplayText.setAttribute("text", { value: formattedTime });
            this.secondPassed = true;
          }, this.speedVariable);
      }

      // NAF.utils.getNetworkedEntity(this.el).then(networkedEl => {

      //   if(NAF.utils.isMine(networkedEl)) {

      //     let now = performance.now();
      //     this.localCurrentTime = ((now - this.startTime) + this.timeUntilPause) / this.speedVariable;
      //     let roundedlocalCurrentTime = Math.round(this.localCurrentTime);

      //     //Set display-format:
      //     let formattedTime = "";
      //     let minutes = Math.floor(roundedlocalCurrentTime / 60);

      //     //Check minute marks:
      //     if(minutes >= this.minuteMark1 && this.minuteMark1Reached == false) {
      //       this.minuteMark1Callbacks.forEach(cb => {
      //         cb();
      //       });
      //       this.minuteMark1Reached = true;
      //     }

      //     if(minutes >= this.minuteMark2 && this.minuteMark2Reached == false) {
      //       this.minuteMark2Callbacks.forEach(cb => {
      //         cb();
      //       });
      //       this.minuteMark2Reached = true;
      //     }

      //     if(minutes >= this.minuteMark3 && this.minuteMark3Reached == false) {
      //       this.minuteMark3Callbacks.forEach(cb => {
      //         cb();
      //       });
      //       this.minuteMark3Reached = true;
      //     }

      //     if(minutes >= this.minuteMark4 && this.minuteMark4Reached == false) {
      //       this.minuteMark4Callbacks.forEach(cb => {
      //         cb();
      //       });
      //       this.minuteMark4Reached = true;
      //     }

      //     let seconds = roundedlocalCurrentTime - minutes*60;
      //     if(minutes < 10) {
      //       if(seconds < 10) 
      //         formattedTime = "0" + minutes + ":0" + seconds;
      //       else if(seconds >= 10 && seconds < 60) 
      //         formattedTime = "0" + minutes + ":" + seconds;
      //     } 
      //     else if(minutes >= 10) {
      //       if(seconds < 10) 
      //         formattedTime = minutes + ":0" + seconds;
      //       else if(seconds >= 10 && seconds < 60) 
      //         formattedTime = minutes + ":" + seconds;
      //     }

      //     //Send value of formattedTime to Server, if different from stored value
      //     if(formattedTime != this.data.currentTime) 
      //     {
      //         this.el.setAttribute("stopwatch-tool", "currentTime", formattedTime);     

      //         this.updateUI();
      //     }
      //   } 
      //   else {
      //     if(this.localDisplayTime != this.data.currentTime) {
      //       this.playSound(SOUND_STOPWATCH_TICKING);
      //       this.localDisplayTime = this.data.currentTime;
      //     }
      //   }
      // });
    }

  },

  onStartTimer()
  {
    NAF.utils.getNetworkedEntity(this.el).then(networkedEl => {
    
      NAF.utils.takeOwnership(networkedEl);

      this.el.setAttribute("stopwatch-tool", "startClicked", true);      

      this.updateUI();
    });
  },

  onResetTimer()
  {
    NAF.utils.getNetworkedEntity(this.el).then(networkedEl => {
      
      NAF.utils.takeOwnership(networkedEl);

      this.el.setAttribute("stopwatch-tool", "resetClicked", !this.data.resetClicked);   
      this.el.setAttribute("stopwatch-tool", "currentTime", "00:00");   

      this.updateUI();
    });
  },

  adjustSpeed(value) {
    this.speedVariable = value;
  },

  setMinuteMark2() {
    let roundedlocalCurrentTime = Math.round(this.localCurrentTime);
    let minutes = Math.floor(roundedlocalCurrentTime / 60);

    this.minuteMark2 = minutes + 8;
  },

  onPinButtonClick()
  {
    const node = pinnedEntityToGltf(this.el);

    NAF.utils.getNetworkedEntity(this.el).then(async function(networkedEl) {
      
      const networkId = NAF.utils.getNetworkId(networkedEl);

      await window.APP.hubChannel.pin(networkId, node);
    });
    this.myPinButtonIcon.setAttribute("icon-button", "active", true);
    console.log("stopwatch pinned.");
  },

  playSound(soundId)
  {
    const sceneEl = this.el.sceneEl;
    sceneEl.systems["hubs-systems"].soundEffectsSystem.playSoundLooped(soundId);
  },

  stopSound()
  {
    const sceneEl = this.el.sceneEl;
    sceneEl.systems["hubs-systems"].soundEffectsSystem.stopSoundNode(soundId);
  },

});
