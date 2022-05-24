//TODO_LAURA_SOUND: import your new sounds here !
import { SOUND_MEDIA_LOADED, SOUND_ERROR_BUTTON, SOUND_SUCCESS_BUTTON, SOUND_STOPWATCH_TICKING } from "../systems/sound-effects-system";

import { cloneObject3D } from "../utils/three-utils";
import { loadModel } from "./gltf-model-plus";
import { waitForDOMContentLoaded } from "../utils/async-utils";
import stopwatchModelSrc from "../assets/stopwatch_tool.glb";
import pinnedEntityToGltf from "../utils//pinned-entity-to-gltf.js";

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

    // Load the 3D model
    stopwatchModelPromise.then(model => {
      const mesh = cloneObject3D(model.scene);
      mesh.scale.set(0.02, 0.02, 0.02);
      mesh.matrixNeedsUpdate = true;
      this.el.setObject3D("mesh", mesh);

      this.el.object3D.visible = true;
      this.el.object3D.scale.set(1.0, 1.0, 1.0);
      this.el.object3D.matrixNeedsUpdate = true;
      
      this.myDisplayText = this.el.querySelector(".stopwatch-display-text");

      //Variables needed for stopwatch logic:
      this.timerRunning = false;
      this.timeUntilPause = 0;

      //Local versions of network-variables:
      this.localStartClicked = false;
      this.localResetClicked = false;
      this.localCurrentTime = 0;
      this.localDisplayTime = "00:00";
    
      this.updateUI();

      this.stopwatchSystem = this.el.sceneEl.systems["stopwatch-tools"];
      this.stopwatchSystem.register(this.el);

    });
  },

  remove() {
    this.stopwatchSystem.deregister(this.el);
  },

  update() {
    this.updateUI();
  },

  updateUI() {  
    //check if variables initialized:
    if(!this.myStartButton)
      return;

    //Check if start button has been clicked by anyone:
    if(this.localStartClicked != this.data.startClicked) {

      if(this.timerRunning == false) {
        this.startTime = performance.now();
        this.timerRunning = true;
      }
    
      else {
        this.timeUntilPause = this.localCurrentTime * 1000;
        this.timerRunning = false;
      }
      
      this.localStartClicked = this.data.startClicked;
      console.log(this.timerRunning);
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
    if(this.timerRunning) {
      this.myDisplayText.setAttribute("text", { value: this.data.currentTime });
    }
  },

  
  // Like Update() in Unity
  tick() {
    //If timer activated, calculate elapsed time since start and update UI
    if(this.timerRunning) {

      NAF.utils.getNetworkedEntity(this.el).then(networkedEl => {

        if(NAF.utils.isMine(networkedEl)) {

          let now = performance.now();
          this.localCurrentTime = ((now - this.startTime) + this.timeUntilPause) / 1000;
          let roundedlocalCurrentTime = Math.round(this.localCurrentTime);

          //Set display-format:
          let formattedTime = "";
          let minutes = Math.floor(roundedlocalCurrentTime / 60);
          let seconds = roundedlocalCurrentTime - minutes*60;
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

          //Send value of formattedTime to Server, if different from stored value
          if(formattedTime != this.data.currentTime) 
          {
              this.el.setAttribute("stopwatch-tool", "currentTime", formattedTime);      

              this.playSound(SOUND_STOPWATCH_TICKING);

              this.updateUI();
          }
        } 
        else {
          if(this.localDisplayTime != this.data.currentTime) {
            this.playSound(SOUND_STOPWATCH_TICKING);
            this.localDisplayTime = this.data.currentTime;
          }
        }

      });

    }

  },

  onStartTimer()
  {
    NAF.utils.getNetworkedEntity(this.el).then(networkedEl => {
    
      NAF.utils.takeOwnership(networkedEl);

      this.el.setAttribute("stopwatch-tool", "startClicked", !this.data.startClicked);      
      console.log("changed value");

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
    sceneEl.systems["hubs-systems"].soundEffectsSystem.playSoundOneShot(soundId);
  },

});