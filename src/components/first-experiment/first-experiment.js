import { cloneObject3D } from "../../utils/three-utils";
import { loadModel } from "../gltf-model-plus";
import { waitForDOMContentLoaded } from "../../utils/async-utils";

/**
 * First Experiment is the mangager class for the experiment
 * @component first-experiment
 */
 
 AFRAME.registerComponent("first-experiment", {
    schema: {
      startClicked: {default: false},
    },
  
    init: function() {
      this.sceneEl = document.querySelector("a-scene");
      this.lastUpdate = performance.now();
     
      this.el.sceneEl.addEventListener("stateadded", () => this.updateUI());
      this.el.sceneEl.addEventListener("stateremoved", () => this.updateUI());

      waitForDOMContentLoaded().then(() => {
        this.expSystem = this.el.sceneEl.systems["first-experiments"];

        this.firstExpStartBtn = this.el.querySelector(".first-experiment-start-button");
        this.firstExpStartBtn.object3D.addEventListener("interact", () => this.onClickStart());

        //local version of network variable:
        this.localStartClicked = false;

        //Get all Exp-parts and show them when start is clicked:
        

        this.updateUI();

        this.expSystem.register(this.el);
      });

    },

    update() {
      waitForDOMContentLoaded().then(() => { 
        this.updateUI();
      });
    },
    
    updateUI: function() {
      if(this.localStartClicked != this.data.startClicked) {
        this.startExperiment();
        this.localStartClicked = this.data.startClicked;
      }
    },
  
    tick: function() {

    },

    onClickStart() {
      NAF.utils.getNetworkedEntity(this.el).then(networkedEl => {
    
        NAF.utils.takeOwnership(networkedEl);
  
        this.el.setAttribute("first-experiment", "startClicked", true);      
  
        this.updateUI();
      });
    },

    startExperiment() { 
      this.firstExpStartBtn.object3D.visible = false;
      this.firstExpPart01 = this.expSystem.getTaskById("01");
      this.firstExpPart02 = this.expSystem.getTaskById("02");

      this.firstExpPart01.components["first-experiment-01"].startPart01(); //for some reason this.firstExpPart01 is undefined for second user (observer)
      this.firstExpPart02.components["first-experiment-02"].showExpItems();

      console.log("show stuff");
    },
  });
  