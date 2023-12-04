import { waitForDOMContentLoaded } from "../../../utils/async-utils";
import { cloneObject3D } from "../../../utils/three-utils";
import { loadModel } from "../.././gltf-model-plus";
import { IMSIMITY_INIT_DELAY } from "../../../utils/imsimity";
import { decodeNetworkId, getNetworkIdFromEl } from "../../../utils/GecoLab/network-helper";

/* should be networked (buttons and multiple-choice), couldn't test yet, cause second user can't even go past the spawning of the experiment */
 
 AFRAME.registerComponent("third-experiment-03", {
    schema: {
      answer: {default: -1},
      nextBtnClicked: {default: false},
      skipBtnClicked: {default: false},
      openBtnClicked: {default: false},
    },
  
    init: function() {
      console.log("Third exp 3 started");
      
      this.lastUpdate = performance.now();
     
      this.el.sceneEl.addEventListener("stateadded", () => this.updateUI());
      this.el.sceneEl.addEventListener("stateremoved", () => this.updateUI());
      this.el.sceneEl.addEventListener("stateadded", () => this.updateUI2());
      this.el.sceneEl.addEventListener("stateremoved", () => this.updateUI2());

      //local version of network variable:
      this.answer = -1;
      this.answerRound = 0;
      this.localNextBtnClicked = false;
      this.localSkipBtnClicked = false;
      this.localOpenBtnClicked = false;

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

            this.nextBtn = this.el.querySelector(".next-btn-3-3");
            this.nextBtn.object3D.visible = false;
            this.nextBtn.object3D.addEventListener("interact", () => this.onClickNextBtn());

            this.skipBtn = this.el.querySelector(".skip-btn-3-3");
            this.skipBtn.object3D.visible = false;
            this.skipBtn.object3D.addEventListener("interact", () => this.onClickSkipBtn());

            this.openBtn = this.el.querySelector(".open-btn-3-3");
            this.openBtn.object3D.visible = false;
            this.openBtn.object3D.addEventListener("interact", () => this.onClickOpenButton());
            
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
      this.answerText1 = this.el.querySelector(".answer-1-text");
      this.answerText2 = this.el.querySelector(".answer-2-text");

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
      if(this.data.answer != -1 && this.answer != -2)
      {
        this.answer = this.data.answer;
        this.compileAnswer();
      }  
      if(this.localNextBtnClicked != this.data.nextBtnClicked) {
        this.localNextBtnClicked = this.data.nextBtnClicked;
        this.showSkipButton();
      }

      if(this.localSkipBtnClicked != this.data.skipBtnClicked) {
        this.localSkipBtnClicked = this.data.skipBtnClicked;
        this.speedUp();
      }

      if(this.localOpenBtnClicked != this.data.openBtnClicked) {
        this.localOpenBtnClicked = this.data.openBtnClicked;
        this.openCabinet();
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
    
          this.el.setAttribute("third-experiment-03", "answer", this.answer);      
    
          this.updateUI();
        });
      }
    },

    compileAnswer()
    {
      
      if(this.answerRound == 0)
      {
        this.answerRound = 1;
        if(this.rightAnswer == this.answer)
        {
          this.answer = -2;
          this.answerRound = 3;
          this.mannequin.components["mannequin"].displayMessage(62);
          this.prepSkip();
        }
        else
        {
          this.answer = -2;
          this.mannequin.components["mannequin"].displayMessage(63);
        }
      }
      else if(this.answerRound == 1)
      {
        this.answerRound = 2;
        if(this.rightAnswer == this.answer)
        {
          this.answer = -2;
          this.answerRound = 3;
          this.mannequin.components["mannequin"].displayMessage(64);
          this.prepSkip();
        }
        else
        {
          this.answer = -2;
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
      }
      else if(this.answerRound == 2)
      {
        if(this.rightAnswer == this.answer)
        {
          this.answer = -2;
          this.prepSkip();
        }
        else
        {
          this.answer = -2;
        }
      }
    },

    prepSkip()
    { 
      this.nextBtn.object3D.visible = true;
      this.multipleChoice.object3D.visible = false;
      this.submitBtn.object3D.visible = false;
    },

    onClickNextBtn()
    {
      NAF.utils.getNetworkedEntity(this.el).then(networkedEl => {
    
        NAF.utils.takeOwnership(networkedEl);
        this.mannequin.components["mannequin"].displayMessage(68);
        this.el.setAttribute("third-experiment-03", "nextBtnClicked", true);      
  
        this.updateUI();
      });
    },

    showSkipButton()
    {
      this.nextBtn.object3D.visible = false;
      this.multipleChoice.object3D.visible = false;
      this.submitBtn.object3D.visible = false;
      this.skipBtn.object3D.visible = true;
    },

    onClickSkipBtn()
    {
      NAF.utils.getNetworkedEntity(this.el).then(networkedEl => {
    
        NAF.utils.takeOwnership(networkedEl);
  
        this.el.setAttribute("third-experiment-03", "skipBtnClicked", true);      
  
        this.updateUI();
      });
    },

    speedUp()
    {
      this.skipBtn.object3D.visible = false;

      this.thirdExpPart02 = this.expSystem.getTaskById("02", this.experimentData.groupCode);
      this.timeText = this.thirdExpPart02.components["third-experiment-02"].timeText;

      this.timeText.object3D.visible = true;
      this.timeText.setAttribute("text", { value: "6 Wochen"});

      setTimeout(() => this.sayText1(),1000);
      setTimeout(() => this.sayText2(),2000);
      setTimeout(() => this.sayText3(),3000);
      setTimeout(() => this.sayText4(),4000);
      setTimeout(() => this.sayText5(),5000);
      setTimeout(() => this.sayText6(),6000);
    },
    sayText1(){
      this.timeText.setAttribute("text", { value: "7 Wochen"});
    },
    sayText2(){
      this.timeText.setAttribute("text", { value: "8 Wochen"});
    },
    sayText3(){
      this.timeText.setAttribute("text", { value: "9 Wochen"});
    },
    sayText4(){
      this.timeText.setAttribute("text", { value: "10 Wochen"});
    },
    sayText5(){
      this.timeText.setAttribute("text", { value: "11 Wochen"});
    },
    sayText6(){
      this.timeText.setAttribute("text", { value: "12 Wochen"});
      this.showOpenButton();
    },

    showOpenButton()
    {
      this.thirdExpPart02 = this.expSystem.getTaskById("02", this.experimentData.groupCode);
      this.timeText = this.thirdExpPart02.components["third-experiment-02"].timeText;
      
      this.mannequin.components["mannequin"].displayMessage(69);
      this.timeText.object3D.visible = false;
      this.openBtn.object3D.visible = true;
    },

    onClickOpenButton()
    {
      NAF.utils.getNetworkedEntity(this.el).then(networkedEl => {
    
        NAF.utils.takeOwnership(networkedEl);
  
        this.el.setAttribute("third-experiment-03", "openBtnClicked", true);      

        this.mannequin.components["mannequin"].displayMessage(70);
  
        this.updateUI();
      });
    },

    openCabinet()
    {
      this.openBtn.object3D.visible = false;

      this.thirdExpPart04 = this.expSystem.getTaskById("04", this.experimentData.groupCode);
      this.thirdExpPart04.components["third-experiment-04"].startPart04();
    },
    
    remove() {
      console.log("removing third-experiment 03");
      this.expSystem.deregisterTask("03", this.el, this.experimentData);
    }

  });

