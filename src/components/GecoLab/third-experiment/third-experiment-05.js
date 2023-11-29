import { waitForDOMContentLoaded } from "../../../utils/async-utils";
import { cloneObject3D } from "../../../utils/three-utils";
import { loadModel } from "../.././gltf-model-plus";
import { IMSIMITY_INIT_DELAY } from "../../../utils/imsimity";
import { decodeNetworkId, getNetworkIdFromEl } from "../../../utils/GecoLab/network-helper";

const sleep = ms => new Promise(
  resolve => setTimeout(resolve, ms)
);


/* should be networked (buttons and multiple-choice), couldn't test yet, cause second user can't even go past the spawning of the experiment */
 
 AFRAME.registerComponent("third-experiment-05", {
    schema: {
      answer: {default: -1},
      answerRound: {default: 0},
      nextBtnClicked: {default: false},
      skipBtnClicked: {default: false},
    },
  
    init: function() {
      console.log("Third exp 5 started");
      
      this.lastUpdate = performance.now();
     
      this.el.sceneEl.addEventListener("stateadded", () => this.updateUI());
      this.el.sceneEl.addEventListener("stateremoved", () => this.updateUI());

      //local version of network variable:
      this.answer = -1;
      this.answerRound = 0;
      this.localNextBtnClicked = false;
      this.localSkipBtnClicked = false;

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
        console.log("Third exp 5 registered");
        var networkId = getNetworkIdFromEl(this.el);

        this.experimentData = decodeNetworkId(networkId);

        this.isMember = this.expSystem.getIsMemberForGroupCode(this.experimentData.groupCode);

        this.expSystem.registerTask("05", this.el, this.experimentData);
        
        setTimeout(() => {
          waitForDOMContentLoaded().then(() => {

            this.nextBtn = this.el.querySelector(".next-btn-3-5");
            this.nextBtn.object3D.visible = false;
            this.nextBtn.object3D.addEventListener("interact", () => this.onClickNextBtn());

            this.skipBtn = this.el.querySelector(".skip-btn-3-5");
            this.skipBtn.object3D.visible = false;
            this.skipBtn.object3D.addEventListener("interact", () => this.onClickSkipBtn());

            this.tidyBtn = this.el.querySelector(".tidy-btn-3-5");
            this.tidyBtn.object3D.visible = false;
            this.tidyBtn.object3D.addEventListener("interact", () => this.onClickOpenButton());
            
            this.delayedInit();
          });  
        }, IMSIMITY_INIT_DELAY * 0.9);

      });
      
    },

    delayedInit()
    {
      console.log('Delayed Init FE-05');

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
      this.answerText1 = this.el.querySelector(".answer-1-text");
      this.answerText2 = this.el.querySelector(".answer-2-text");

      this.infoFieldBackground = this.el.querySelector(".info-field-background");
      this.infoFieldBackground.setAttribute("text-button", {backgroundColor: "#FFFFFF"});
      this.infoFieldText = this.el.querySelector(".info-field-text");

      this.sockets.forEach(s => {
        s.object3D.visible = false; //hide holograms until needed
      });

    },

    subscribe(eventName, fn)
    {
        switch(eventName) {
            case "onFinishPart05":
              this.onFinishPart05Callbacks.push(fn);
              break;
            case "onObjectSpawnedPart05":
                this.onObjectSpawnedPart05Callbacks.push(fn);
                break;
          }
    },

    unsubscribe(eventName, fn)
    {
        var index = 0;
        switch(eventName) {
            case "onFinishPart05":
              index = this.onFinishPart05Callback.indexOf(fn);
              this.onFinishPart05Callback.splice(index, 1);
              break;
            case "onObjectSpawnedPart05":
              index = this.onObjectSpawnedPart05Callbacks.indexOf(fn);
              this.onObjectSpawnedPart05Callbacks.splice(index, 1);
              break;
          }
    },

    update() {
      waitForDOMContentLoaded().then(() => { 
        this.updateUI();
      });
    },
    
    updateUI: function() {
      if(this.data.answer != -1 && this.answerRound == this.data.answerRound)
      {
        this.answer = this.data.answer;
        this.compileAnswer();
      }
      if(this.answerRound != this.data.answerRound)
      {
        this.answerRound = this.data.answerRound;
      }
      if(this.localNextBtnClicked != this.data.nextBtnClicked) {
        this.showSkipButton();
        this.localNextBtnClicked = this.data.nextBtnClicked;
      }

      if(this.localSkipBtnClicked != this.data.skipBtnClicked) {
        this.showTidyButton();
        this.localSkipBtnClicked = this.data.skipBtnClicked;
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

    startPart05() {
      this.mannequin = this.el.sceneEl.systems["mannequin-manager"].getMannequinByGroupCode(this.experimentData.groupCode);

      this.thirdExpPart02 = this.expSystem.getTaskById("02", this.experimentData.groupCode);
      this.chosen = this.thirdExpPart02.components["third-experiment-02"].chosen;

      //fill in right answer
      if(this.chosen == 0)//Temp
      {
        this.answerText0.setAttribute("text", { value: "Alle 3 Pflanzen zeigen eine vergleichbare Entwicklung."});
        this.answerText1.setAttribute("text", { value: "Die Weizenpflanze 3, die den höchsten Temperaturen aus-gesetzt ist, zeigt vereinzelte gelbe Flecken auf den Blättern."});
        this.answerText2.setAttribute("text", { value: "Weizenpflanzen wachsen am besten bei einer Temperatur von 33°C."});
        this.rightAnswer = 1;
      }
      else if(this.chosen == 1)//CO2
      {
        this.answerText0.setAttribute("text", { value: "Alle Pflanzen haben das gleiche Erscheinungsbild."});
        this.answerText1.setAttribute("text", { value: "Die Pflanze, die der höchsten CO2-Konzentration ausgesetzt ist, zeigt das das stärkste Wachstum."});
        this.answerText2.setAttribute("text", { value: "Eine erhöhte CO2-Konzentration führt zu vermindertem Wachstum."});
        this.rightAnswer = 0;
      }
      else if(this.chosen == 2)//Ground
      {
        this.answerText0.setAttribute("text", { value: "Durch die ungünstigen Bodenverhältnisse ist das Wachstum der Pflanze 2 beeinträchtigt."});
        this.answerText1.setAttribute("text", { value: "Es gibt keine Unterschiede in der Entwicklung aller Pflanzen."});
        this.answerText2.setAttribute("text", { value: "Pflanze 2 und 3 zeigen eine vergleichbare Entwicklung."});
        this.rightAnswer = 0;
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
    
          this.el.setAttribute("third-experiment-05", "answer", this.answer);      
    
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
          //this.multipleChoice.object3D.visible = false;
          this.mannequin.components["mannequin"].displayMessage(62);
          this.prepSkip();

          NAF.utils.getNetworkedEntity(this.el).then(networkedEl => {
        
            NAF.utils.takeOwnership(networkedEl);
      
            this.el.setAttribute("third-experiment-05", "answerRound", 2);
            
            this.updateUI();
          });
        }
        else
        {
          this.mannequin.components["mannequin"].displayMessage(63);
          NAF.utils.getNetworkedEntity(this.el).then(networkedEl => {
        
            NAF.utils.takeOwnership(networkedEl);
      
            this.el.setAttribute("third-experiment-05", "answerRound", 1);  

            this.updateUI();
          });
        }
      }
      else if(this.answerRound == 1)
      {
        if(this.rightAnswer == this.answer)
        {
          this.mannequin.components["mannequin"].displayMessage(64);
          //this.multipleChoice.object3D.visible = false;
        }
        else
        {
          switch (this.chosen) {
            case 0:
              this.mannequin.components["mannequin"].displayMessage(66);
              break;
            case 1:
              this.mannequin.components["mannequin"].displayMessage(65);
              break;
            case 2:
              this.mannequin.components["mannequin"].displayMessage(67);
              break;
            default:
              break;
          }
        }
        NAF.utils.getNetworkedEntity(this.el).then(networkedEl => {
        
          NAF.utils.takeOwnership(networkedEl);
    
          this.el.setAttribute("third-experiment-05", "answerRound", 2); 
          
          this.updateUI();
        });

        this.prepSkip();
      }
    },

    prepSkip()
    { 
      this.nextBtn.object3D.visible = true;
      this.mannequin.components["mannequin"].displayMessage(68);
    },

    onClickNextBtn()
    {
      NAF.utils.getNetworkedEntity(this.el).then(networkedEl => {
    
        NAF.utils.takeOwnership(networkedEl);
  
        this.el.setAttribute("third-experiment-05", "nextBtnClicked", true);      
  
        this.updateUI();
      });
    },

    showSkipButton()
    {
      this.nextBtn.object3D.visible = false;
      
      this.infoFieldBackground.object3D.visible = true;

      this.skipBtn.object3D.visible = true;
    },

    onClickSkipBtn()
    {
      NAF.utils.getNetworkedEntity(this.el).then(networkedEl => {
    
        NAF.utils.takeOwnership(networkedEl);
  
        this.el.setAttribute("third-experiment-05", "skipBtnClicked", true);      
  
        this.updateUI();
      });
    },

    showTidyButton()
    {
      this.infoFieldBackground.object3D.visible = false;
      this.skipBtn.object3D.visible = false;
      
      this.tidyBtn.object3D.visible = true;
    },

    onTidyUpClicked() {
      this.tidyUp();
  },

  tidyUp() {
      this.tidyUpBtn.object3D.visible = false;
      
      if (this.isMember)
      {
          this.el.sceneEl.emit("gecolab_feedback", this.experimentData.groupCode);
      }
  },
    
    remove() {
      console.log("removing third-experiment 05");
      this.expSystem.deregisterTask("05", this.el, this.experimentData);
    }

  });

