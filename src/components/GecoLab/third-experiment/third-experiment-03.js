import { waitForDOMContentLoaded } from "../../../utils/async-utils";
import { cloneObject3D } from "../../../utils/three-utils";
import { loadModel } from "../.././gltf-model-plus";
import { IMSIMITY_INIT_DELAY } from "../../../utils/imsimity";
import { decodeNetworkId, getNetworkIdFromEl } from "../../../utils/GecoLab/network-helper";

const growthCabinetPromise =  waitForDOMContentLoaded().then(() => loadModel(growthCabinetSrc));
const plantPromise =  waitForDOMContentLoaded().then(() => loadModel(plantSrc));

/* should be networked (buttons and multiple-choice), couldn't test yet, cause second user can't even go past the spawning of the experiment */
 
 AFRAME.registerComponent("third-experiment-03", {
    schema: {
      answer: {default: -1},
      answerRound: {default: 0},
    },
  
    init: function() {
      console.log("Third exp 3 started");
      
      this.lastUpdate = performance.now();
     
      this.el.sceneEl.addEventListener("stateadded", () => this.updateUI());
      this.el.sceneEl.addEventListener("stateremoved", () => this.updateUI());

      //local version of network variable:
      this.answer = -1;
      this.answerRound = 0;

      this.chosen;
      this.rightAnswer = -1;

      //Colors for buttons:
      this.initialColor = "#D4ECFA";
      this.selectColor = "#B5B5B5";
      this.wrongColor = "#761614";
      this.rightColor = "#18FF03";

      this.movableEntities = [];
      this.sockets = [];
 

      this.expSystem = this.el.sceneEl.systems["third-experiments"];

      this.delayedInit = AFRAME.utils.bind(this.delayedInit, this);

      waitForDOMContentLoaded().then(() => {
        console.log("Third exp 3 registered");
        var networkId = getNetworkIdFromEl(this.el);

        this.experimentData = decodeNetworkId(networkId);

        this.isMember = this.expSystem.getIsMemberForGroupCode(this.experimentData.groupCode);

        this.expSystem.registerTask("03", this.el, this.experimentData);
        
        setTimeout(() => {
          waitForDOMContentLoaded().then(() => {
            
            this.delayedInit();
          });  
        }, IMSIMITY_INIT_DELAY * 0.9);

      });
      
    },

    delayedInit()
    {
      console.log('Delayed Init FE-03');

      this.multipleChoice = this.el.querySelector(".multi-choice-wrapper");
      this.multipleChoice.object3D.visible = false; 
      this.answerOption0 = this.el.querySelector(".answer-option-0");
      this.answerOption0.object3D.addEventListener("interact", () => this.choice01());
      this.answerOption1 = this.el.querySelector(".answer-option-1");
      this.answerOption1.object3D.addEventListener("interact", () => this.choiceO2());
      this.answerOption2 = this.el.querySelector(".answer-option-2"); 
      this.answerOption2.object3D.addEventListener("interact", () => this.choice03());
      this.submitBtn = this.el.querySelector(".submit-button");
      this.submitBtn.object3D.addEventListener("interact", () => this.onClickSubmitChoice());

      this.answerText0 = this.el.querySelector(".answer-0-text");
      this.answerText0 = this.el.querySelector(".answer-1-text");
      this.answerText0 = this.el.querySelector(".answer-2-text");

      this.sockets.forEach(s => {
        s.object3D.visible = false; //hide holograms until needed
      });

    },

    subscribe(eventName, fn)
    {
        switch(eventName) {
            case "onFinishPart03":
              this.onFinishPart03Callbacks.push(fn);
              break;
            case "onObjectSpawnedPart03":
                this.onObjectSpawnedPart03Callbacks.push(fn);
                break;
          }
    },

    unsubscribe(eventName, fn)
    {
        var index = 0;
        switch(eventName) {
            case "onFinishPart03":
              index = this.onFinishPart03Callback.indexOf(fn);
              this.onFinishPart03Callback.splice(index, 1);
              break;
            case "onObjectSpawnedPart03":
              index = this.onObjectSpawnedPart03Callbacks.indexOf(fn);
              this.onObjectSpawnedPart03Callbacks.splice(index, 1);
              break;
          }
    },

    update() {
      waitForDOMContentLoaded().then(() => { 
        this.updateUI();
      });
    },
    
    updateUI: function() {
      if(this.data.answer != -1)
      {
        this.answer = this.data.answer;
        this.compileAnswer();
      }
    },
  
    tick: function() {

    },

    spawnItem(promise, position, entity, show) {
      promise.then(model => {
          entity.object3D.visible = false;
          const mesh = cloneObject3D(model.scene);
          mesh.scale.set(1, 1, 1);
          mesh.matrixNeedsUpdate = true;
          entity.setObject3D("mesh", mesh);
      
          if(show)
            entity.object3D.visible = true;

          entity.object3D.scale.set(1, 1, 1);
          entity.object3D.rotation.set(0, 0, 0);
          entity.setAttribute("position", {x: position.x, y: position.y, z: position.z});
          entity.object3D.matrixNeedsUpdate = true;

      });
    },

    startPart03() {
      this.mannequin = this.el.sceneEl.systems["mannequin-manager"].getMannequinByGroupCode(this.experimentData.groupCode);

      this.thirdExpPart02 = this.expSystem.getTaskById("02", this.experimentData.groupCode);
      this.chosen = this.thirdExpPart02.components["third-experiment-02"].chosen;

      //fill in right answer
      if(this.chosen == 0)
      {
        this.answerText0.setAttribute("text", { value: "wegwegwegwegwegwegwegwegwegwegwegwegwegwegwegwegwegwegwegweg"});
        this.rightAnswer = 0;
      }
      else if(this.chosen == 1)
      {
        this.answerText0.setAttribute("text", { value: "weg"});
        this.rightAnswer = 1;
      }
      else if(this.chosen == 2)
      {
        this.answerText0.setAttribute("text", { value: "weg"});
        this.rightAnswer = 2;
      }

      this.showQuestion();
    },

    showQuestion()
    {
      this.multipleChoice.object3D.visible = true;
    },

    choice01()
    {
      this.answer = 0;
      this.answerOption0.setAttribute("text-button", {backgroundColor: this.selectColor});
      this.answerOption1.setAttribute("text-button", {backgroundColor: this.initialColor});
      this.answerOption2.setAttribute("text-button", {backgroundColor: this.initialColor});
    },

    choiceO2()
    {
      this.answer = 1;
      this.answerOption0.setAttribute("text-button", {backgroundColor: this.initialColor});
      this.answerOption1.setAttribute("text-button", {backgroundColor: this.selectColor});
      this.answerOption2.setAttribute("text-button", {backgroundColor: this.initialColor});
    },

    choice03()
    {
      this.answer = 2;
      this.answerOption0.setAttribute("text-button", {backgroundColor: this.initialColor});
      this.answerOption1.setAttribute("text-button", {backgroundColor: this.initialColor});
      this.answerOption2.setAttribute("text-button", {backgroundColor: this.selectColor});
    },

    onClickSubmitChoice()
    {
      if(this.answer >= 0)
      {
          NAF.utils.getNetworkedEntity(this.el).then(networkedEl => {
      
          NAF.utils.takeOwnership(networkedEl);
    
          this.el.setAttribute("third-experiment-03", "answer", this.answer);      
    
          this.updateUI();
        });
      }
    },

    compileAnswer()
    {
      if(this.answerRound == 0)
      {
        if(this.rightAnswer == this.answer)
        {
          this.multipleChoice.object3D.visible = false;
          this.prepSkip();

          NAF.utils.getNetworkedEntity(this.el).then(networkedEl => {
        
            NAF.utils.takeOwnership(networkedEl);
      
            this.el.setAttribute("third-experiment-03", "answerRound", 2);  
          });
        }
        else
        {
          NAF.utils.getNetworkedEntity(this.el).then(networkedEl => {
        
            NAF.utils.takeOwnership(networkedEl);
      
            this.el.setAttribute("third-experiment-03", "answerRound", 1);  
          });
        }
      }
      else if(this.answerRound == 1)
      {
        if(this.rightAnswer == this.answer)
        {
          this.multipleChoice.object3D.visible = false;
        }
        else
        {
          
        }
        NAF.utils.getNetworkedEntity(this.el).then(networkedEl => {
        
          NAF.utils.takeOwnership(networkedEl);
    
          this.el.setAttribute("third-experiment-03", "answerRound", 2);  
        });

        this.prepSkip();
      }
    },

    prepSkip()
    {
      console.log("This is the end!");
    },
    
    remove() {
      console.log("removing third-experiment 03");
      this.expSystem.deregisterTask("03", this.el, this.experimentData);
    }

  });

