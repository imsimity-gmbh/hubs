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
        this.firstExpStartBtn.object3D.addEventListener("interact", () => this.startExperiment());

        //local version of network variable:
        this.localStartClicked = false;

        console.log(this.el);

        this.updateUI();

        this.expSystem.register(this.el);

        this.completedPart01 = AFRAME.utils.bind(this.completedPart01, this);
        this.completedPart02 = AFRAME.utils.bind(this.completedPart02, this);
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
  
        this.el.setAttribute("first-experiment", "startClicked", !this.data.startClicked);      
  
        this.updateUI();
      });
    },

    startExperiment() {
      let callbackId = "action_toggle_first_experiment_" + this.el.id + "_start";
      this.sceneEl.emit(callbackId);
      this.firstExpStartBtn.object3D.visible = false;

      setTimeout(() => {
        this.firstExpPart01 = this.expSystem.getTaskById("01");
          if(this.firstExpPart01 != null)
              this.firstExpPart01.components["first-experiment-01"].subscribe("onFinishPart01", this.completedPart01);
          else 
              console.log("Can't subscribe to firstExpPart01 callback, entity not found");
      }, 10);
    },

    completedPart01(correctAnswer, selectedAnswer) 
    {
      this.firstExpPart02 = this.expSystem.getTaskById("02");
      if(correctAnswer == selectedAnswer)
        this.firstExpPart02.components["first-experiment-02"].subscribe("onFinishPart02", this.completedPart02);
      else
        console.log("Wrong answer submitted");
    },

    completedPart02() {
      console.log("part 02 finished");
    }

  });

  /* Code structure idea:
  - first-experiment.js only contains the parent of all the experiment elements and global stuff like the start-button
  - if an event is triggered (ie. click on start-button) the object(s) that are required are spawned and first-experiment subscribes to the corresponding component-script
  - now all the action related to the spawned entity/component is happening in it's own script and only after recieving a callback from the subscribed script will the first-experiment 
  script initiate the next step
  - example: the selection and display of the ground sample happens in ground-samples.js, the entity which ground-samples.js is attached to is a child of this.el. After selecting one of
  the samples a callback is sent back to first-experiment.js
  - question: should I store the files in a seperate folder, as it will be a lot of stuff?
  - question2: will spawning all the entities of the components of first experiment work?
  */
  