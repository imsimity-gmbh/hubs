import { waitForDOMContentLoaded } from "../../../utils/async-utils";
import { THREE } from "aframe";
import { IMSIMITY_INIT_DELAY } from "../../../utils/imsimity";
import { decodeNetworkId, getNetworkIdFromEl } from "../../../utils/GecoLab/network-helper";

/**
 * First Experiment is the mangager class for the experiment
 * @component first-experiment
 */
 
 AFRAME.registerComponent("first-experiment", {
    schema: {
      startClicked: {default: false},
    },
  
    init: function() {
      this.lastUpdate = performance.now();
     
      this.el.sceneEl.addEventListener("stateadded", () => this.updateUI());
      this.el.sceneEl.addEventListener("stateremoved", () => this.updateUI());

      //local version of network variable:
      this.localStartClicked = false;

      this.expSystem = this.el.sceneEl.systems["first-experiments"];
     
      
      
      waitForDOMContentLoaded().then(() => {

        var networkId = getNetworkIdFromEl(this.el);
        this.experimentData = decodeNetworkId(networkId);

        this.isMember = this.expSystem.getIsMemberForGroupCode(this.experimentData.groupCode);

        console.log(this.experimentData);

        this.expSystem.register(this.el, this.experimentData);


        this.firstExpStartBtn = this.el.querySelector(".first-experiment-start-button");
        this.firstExpStartBtn.object3D.addEventListener("interact", () => this.onClickStart());
        this.firstExpStartBtn.object3D.visible = false;

        setTimeout(() => {

          if (this.isMember)
          {
            this.firstExpStartBtn.object3D.visible = true;
          }

           // Mannequin
          this.mannequin = this.el.sceneEl.systems["mannequin-manager"].getMannequinByGroupCode(this.experimentData.groupCode);
          this.mannequin.components["mannequin"].displayMessage(19);
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
      this.expSystem.deregister(this.el, this.experimentData);
    }
  });
  