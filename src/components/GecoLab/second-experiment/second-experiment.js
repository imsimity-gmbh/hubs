import { waitForDOMContentLoaded } from "../../../utils/async-utils";
import { THREE } from "aframe";
import { IMSIMITY_INIT_DELAY } from "../../../utils/imsimity";
import { decodeNetworkId, getNetworkIdFromEl } from "../../../utils/GecoLab/network-helper";

/**
 * Second Experiment is the mangager class for the 2nd experiment
 * @component second-experiment
 */
 
 AFRAME.registerComponent("second-experiment", {
    schema: {
      startClicked: {default: false},
    },
  
    init: function() {
      this.lastUpdate = performance.now();
     
      this.el.sceneEl.addEventListener("stateadded", () => this.updateUI());
      this.el.sceneEl.addEventListener("stateremoved", () => this.updateUI());

      //local version of network variable:
      this.localStartClicked = false;

      this.expSystem = this.el.sceneEl.systems["second-experiments"];
     
      
      
      waitForDOMContentLoaded().then(() => {

        var networkId = getNetworkIdFromEl(this.el);
        this.experimentData = decodeNetworkId(networkId);

        this.isMember = this.expSystem.getIsMemberForGroupCode(this.experimentData.groupCode);

        console.log("Second Experiment");
        console.log(this.experimentData);

        this.expSystem.register(this.el, this.experimentData);


        this.secondExpStartBtn = this.el.querySelector(".second-experiment-start-button");
        this.secondExpStartBtn.object3D.addEventListener("interact", () => this.onClickStart());
        this.secondExpStartBtn.object3D.visible = false;

        setTimeout(() => {

          if (this.isMember)
          {
            this.secondExpStartBtn.object3D.visible = true;
          }

           // Mannequin
          //this.mannequin = this.el.sceneEl.systems["mannequin-manager"].getMannequinByGroupCode(this.experimentData.groupCode);
          //this.mannequin.components["mannequin"].displayMessage(25);
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
  
        this.el.setAttribute("second-experiment", "startClicked", true);      
  
        this.updateUI();
      });
    },

    startExperiment() { 
      this.secondExpStartBtn.object3D.visible = false;
      this.secondExpPart01 = this.expSystem.getTaskById("01", this.experimentData.groupCode);

      // Mannequin
      this.mannequin = this.el.sceneEl.systems["mannequin-manager"].getMannequinByGroupCode(this.experimentData.groupCode);
      this.mannequin.components["mannequin"].displayMessage(26);
      
      this.secondExpPart01.components["second-experiment-01"].startPart01(); //for some reason this.firstExpPart01 is undefined for second user (observer)

      console.log("show stuff");
    },

    remove() {
      this.expSystem.deregister(this.el, this.experimentData);
    }
  });
  