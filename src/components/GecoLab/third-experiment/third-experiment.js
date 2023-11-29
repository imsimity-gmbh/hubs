import { waitForDOMContentLoaded } from "../../../utils/async-utils";
import { THREE } from "aframe";
import { IMSIMITY_INIT_DELAY } from "../../../utils/imsimity";
import { decodeNetworkId, getNetworkIdFromEl } from "../../../utils/GecoLab/network-helper";

/**
 * Third Experiment is the mangager class for the experiment
 * @component Third-experiment
 */
 
 AFRAME.registerComponent("third-experiment", {
    schema: {
      startClicked: {default: false},
    },
  
    init: function() {
      this.lastUpdate = performance.now();
     
      this.el.sceneEl.addEventListener("stateadded", () => this.updateUI());
      this.el.sceneEl.addEventListener("stateremoved", () => this.updateUI());

      //local version of network variable:
      this.localStartClicked = false;

      this.expSystem = this.el.sceneEl.systems["third-experiments"];
     
      
      
      waitForDOMContentLoaded().then(() => {

        var networkId = getNetworkIdFromEl(this.el);
        this.experimentData = decodeNetworkId(networkId);

        this.isMember = this.expSystem.getIsMemberForGroupCode(this.experimentData.groupCode);

        console.log(this.experimentData);

        this.expSystem.register(this.el, this.experimentData);


        this.thirdExpStartBtn = this.el.querySelector(".third-experiment-start-button");
        this.thirdExpStartBtn.object3D.addEventListener("interact", () => this.onClickStart());
        this.thirdExpStartBtn.object3D.visible = false;

        setTimeout(() => {

          if (this.isMember)
          {
            this.thirdExpStartBtn.object3D.visible = true;
          }

           // Mannequin
          this.mannequin = this.el.sceneEl.systems["mannequin-manager"].getMannequinByGroupCode(this.experimentData.groupCode);
          this.mannequin.components["mannequin"].displayMessage(42);
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
    //Step 3
    onClickStart() {
      NAF.utils.getNetworkedEntity(this.el).then(networkedEl => {
    
        NAF.utils.takeOwnership(networkedEl);
  
        this.el.setAttribute("third-experiment", "startClicked", true);      
  
        this.updateUI();
      });
    },
    //after Step3
    startExperiment() { 
      this.thirdExpStartBtn.object3D.visible = false;
      this.thirdExpPart01 = this.expSystem.getTaskById("01", this.experimentData.groupCode);
      
      console.log(this.expSystem);

      this.thirdExpPart01.components["third-experiment-01"].startPart01(); //for some reason this.thirdExpPart01 is undefined for second user (observer)
      this.mannequin.components["mannequin"].displayMessage(43);
      console.log("show stuff third-experiment");
    },

    remove() {
      this.expSystem.deregister(this.el, this.experimentData);
    }
  });
  