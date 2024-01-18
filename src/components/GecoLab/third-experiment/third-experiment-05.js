import { waitForDOMContentLoaded } from "../../../utils/async-utils";
import { cloneObject3D } from "../../../utils/three-utils";
import { loadModel } from "../.././gltf-model-plus";
import { IMSIMITY_INIT_DELAY } from "../../../utils/imsimity";
import { decodeNetworkId, getNetworkIdFromEl } from "../../../utils/GecoLab/network-helper";

/* should be networked (buttons and multiple-choice), couldn't test yet, cause second user can't even go past the spawning of the experiment */
 
 AFRAME.registerComponent("third-experiment-05", {
    schema: {
      answer: {default: -1},
      nextBtnClicked: {default: false},
      skipBtnClicked: {default: false},
      tidyBtnClicked: {default: false},
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
      this.localTidyBtnClicked = false;
      this.localCountInfoField = 0;

      this.chosen;
      this.rightAnswer = -1;

      //Colors for buttons:
      this.initialColor = "#D4ECFA";
      this.selectColor = "#B5B5B5";
      this.wrongColor = "#761614";
      this.rightColor = "#18FF03";

      this.movableEntities = [];
      this.sockets = [];

      this.onClickNextBtn = AFRAME.utils.bind(this.onClickNextBtn, this);
      this.onClickSkipBtn = AFRAME.utils.bind(this.onClickSkipBtn, this);
      this.onClickTidyBtn = AFRAME.utils.bind(this.onClickTidyBtn, this);
      //this.onClickSubmitChoice = AFRAME.utils.bind(this.onClickSubmitChoice, this);
      //this.choice01 = AFRAME.utils.bind(this.choice01, this);
      //this.choice02 = AFRAME.utils.bind(this.choice02, this);
      //this.choice03 = AFRAME.utils.bind(this.choice03, this);
 

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
            this.tidyBtn.object3D.addEventListener("interact", () => this.onClickTidyBtn());
            
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
      this.questionText = this.el.querySelector(".question-text");

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
      if(this.data.answer != -1 && this.answer != -2)
      {
        this.answer = this.data.answer;
        this.compileAnswer();
      }
      if(this.localNextBtnClicked != this.data.nextBtnClicked) {
        this.showSkipButton();
        this.localNextBtnClicked = this.data.nextBtnClicked;
      }
      if(this.localSkipBtnClicked != this.data.skipBtnClicked) {
        this.showTidyButton();
        this.localSkipBtnClicked = this.data.skipBtnClicked;
      }
      if(this.localTidyBtnClicked != this.data.tidyBtnClicked) {
        this.onTidyUpClicked();
        this.localTidyBtnClicked = this.data.tidyBtnClicked;
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
        this.questionText.setAttribute("text",{ value: "Welchen Einfluss kann eine Erhöhung der Temperatur auf das Wachstum von Pflanzen haben?"});
        this.answerText0.setAttribute("text", { value: "Eine Änderung der Temperatur hat keinen Einfluss auf das Wachstum von Pflanzen, da Pflanzen nicht auf die Temperatur ihrer Umgebung reagieren."});
        this.answerText1.setAttribute("text", { value: "Eine leichte Erhöhung der Temperatur kann das Pflanzenwachstum fördern, indem sie die Stoffwechselprozesse beschleunigt und die Photosynthese steigert."});
        this.answerText2.setAttribute("text", { value: "Eine Änderung der Temperatur führt immer zu einem Rückgang des Pflanzenwachstums, da Pflanzen empfindlich auf Temperaturschwankungen reagieren."});
        this.rightAnswer = 1;
      }
      else if(this.chosen == 1)//CO₂
      {
        this.questionText.setAttribute("text",{ value: "Wie kann sich eine Steigerung der CO₂-Konzentration auf das Wachstum von Pflanzen auswirken?"});
        this.answerText0.setAttribute("text", { value: "Eine erhöhte CO₂-Konzentration kann das Wachstum von Pflanzen anregen, indem es die Effizienz der Fotosynthese verbessert."});
        this.answerText1.setAttribute("text", { value: "CO₂ beeinflusst nicht das Wachstum der Pflanze; es ist nur ein Abfallprodukt der tierischen Atmung."});
        this.answerText2.setAttribute("text", { value: "Eine erhöhte CO₂-Konzentration hemmt das Pflanzenwachstum und führt zu einem Rückgang der Pflanzenproduktion."});
        this.rightAnswer = 0;
      }
      else if(this.chosen == 2)//Ground
      {
        this.questionText.setAttribute("text",{ value: "Welche Auswirkungen hat eine Änderung der Bodenart auf das Wachstum der Pflanze?"});
        this.answerText0.setAttribute("text", { value: "Die Bodenart hat keinen Einfluss auf das Wachstum, da Pflanzen sich stets an verschiedene Bodenbedingungen anpassen können."});
        this.answerText1.setAttribute("text", { value: "Eine Bodenveränderung führt immer zu einem Absterben der Pflanze, da Pflanzen sehr empfindlich darauf reagieren und nicht in der Lage sind, sich anzupassen."});
        this.answerText2.setAttribute("text", { value: "Eine Änderung der Bodenart beeinflusst das Wachstum der Pflanze, da verschiedene Bodenarten unterschiedliche Nährstoffe und Wasserspeicherkapazitäten bieten."});
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
        this.answerRound = 1;
        if(this.rightAnswer == this.answer)
        {
          this.answer = -2;
          this.answerRound = 3;
          this.mannequin.components["mannequin"].displayMessage(78);
          this.prepSkip();
        }
        else
        {
          this.answer = -2;
          switch (this.chosen) {
            case 0:
              this.mannequin.components["mannequin"].displayMessage(82);
              break;
            case 1:
              this.mannequin.components["mannequin"].displayMessage(79);
              break;
            case 2:
              this.mannequin.components["mannequin"].displayMessage(84);
              break;
            default:
              break;
          }
        }
      }
      else if(this.answerRound == 1)
      {
        this.answerRound = 2;
        if(this.rightAnswer == this.answer)
        {
          this.answer = -2;
          this.answerRound = 3;
          this.mannequin.components["mannequin"].displayMessage(80);
          this.prepSkip();
        }
        else
        {
          this.answer = -2;
          switch (this.chosen) {
            case 0:
              this.mannequin.components["mannequin"].displayMessage(83);
              break;
            case 1:
              this.mannequin.components["mannequin"].displayMessage(81);
              break;
            case 2:
              this.mannequin.components["mannequin"].displayMessage(85);
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
        this.multipleChoice.object3D.visible = false;
        this.submitBtn.object3D.visible = false;
        
        this.infoFieldBackground.object3D.visible = true;
        this.mannequin.components["mannequin"].displayMessage(86);
        this.skipBtn.object3D.visible = true;
    },

    onClickSkipBtn()
    { 
      NAF.utils.getNetworkedEntity(this.el).then(networkedEl => {
    
        NAF.utils.takeOwnership(networkedEl);

        this.localCountInfoField++;
        switch (this.localCountInfoField) {
          case 1:
            this.infoFieldText.setAttribute("text", { value: "Eine gründliche Vorbereitung ist von großer Bedeutung: Stelle sicher, dass du das Experiment sowie seinen Ablauf vollständig verstehst, bevor du mit der Durchführung beginnst."});
            break;
          case 2:
            this.infoFieldText.setAttribute("text", { value: "Priorisiere Sicherheit: Trage stets die erforderliche Schutzausrüstung, einschließlich Laborkittel, Schutzbrille und Handschuhe."});
            break;
          case 3:
            this.infoFieldText.setAttribute("text", { value:  "Halte deine Arbeitsfläche sauber und ordentlich, um Verunreinigungen zu vermeiden."});
            break;
          case 4:
            this.infoFieldText.setAttribute("text", { value:  "Gewährleiste Messgenauigkeit: Verwende geeichte Instrumente und führe präzise Messungen durch, um genaue Ergebnisse zu erzielen."});
            break;
          case 5:
            this.infoFieldText.setAttribute("text", { value:  "Dokumentiere sorgfältig alle Beobachtungen und Messwerte sowie ihre Veränderungen."});
            break;
          case 6:
            this.infoFieldText.setAttribute("text", { value:  "Kollaboration ist entscheidend: Arbeite eng mit anderen im Labor zusammen, um Ideen auszutauschen und voneinander zu lernen."});
            break;
          case 7:
            this.infoFieldText.setAttribute("text", { value:  "Nutze Fehler als Gelegenheit zur Verbesserung und akzeptiere sie als wichtigen Bestandteil des wissenschaftlichen Prozesses."});
            break;
          case 8:
            this.infoFieldText.setAttribute("text", { value: "Ein Tipp für dich: Lies die Aufgaben aufmerksam und gründlich, bevor du antwortest."});
            this.el.setAttribute("third-experiment-05", "skipBtnClicked", true);  
            break;
            default:
            break;
        }
        this.updateUI();
      });
    },

    showTidyButton()
    {
      this.skipBtn.object3D.visible = false;
      
      this.tidyBtn.object3D.visible = true;
    },

    onClickTidyBtn()
    {
      NAF.utils.getNetworkedEntity(this.el).then(networkedEl => {
    
        NAF.utils.takeOwnership(networkedEl);
  
        this.el.setAttribute("third-experiment-05", "tidyBtnClicked", true);      
  
        this.updateUI();
      });
    },

    onTidyUpClicked() {
      this.tidyUp();
    },

    tidyUp() {
        this.tidyBtn.object3D.visible = false;
        this.infoFieldBackground.object3D.visible = false;
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

