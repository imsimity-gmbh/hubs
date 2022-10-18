
import { waitForDOMContentLoaded } from "../../../utils/async-utils";
import { THREE } from "aframe";
import { IMSIMITY_INIT_DELAY, decodeNetworkId, getNetworkIdFromEl } from "../../../utils/imsimity";

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

      var worldPos = new THREE.Vector3();
      worldPos.setFromMatrixPosition(this.el.object3D.matrixWorld);
      console.log(worldPos);

      // 0 0 0

      //local version of network variable:
      this.localStartClicked = false;

      this.expSystem = this.el.sceneEl.systems["first-experiments"];
     
      
      waitForDOMContentLoaded().then(() => {

        var networkId = getNetworkIdFromEl(this.el);

        console.log(networkId);

        this.experimentData = decodeNetworkId(networkId);

        console.log(this.experimentData);

        this.expSystem.register(this.el, this.experimentData);


        this.firstExpStartBtn = this.el.querySelector(".first-experiment-start-button");
        this.firstExpStartBtn.object3D.addEventListener("interact", () => this.onClickStart());
        this.firstExpStartBtn.object3D.visible = false;

        setTimeout(() => {
          this.firstExpStartBtn.object3D.visible = true;
        }, IMSIMITY_INIT_DELAY * 6);
                  
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
      this.firstExpPart01 = this.expSystem.getTaskById("01", this.experimentData.groupCode);
      

      this.firstExpPart01.components["first-experiment-01"].startPart01(); //for some reason this.firstExpPart01 is undefined for second user (observer)
     
      console.log("show stuff");
    },

    remove() {
      this.expSystem.deregister(this.el, this.experimentData.groupCode);
    }
  });
  