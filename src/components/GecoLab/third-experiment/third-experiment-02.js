import { waitForDOMContentLoaded } from "../../../utils/async-utils";
import { cloneObject3D } from "../../../utils/three-utils";
import { loadModel } from "../.././gltf-model-plus";
import { IMSIMITY_INIT_DELAY } from "../../../utils/imsimity";
import { decodeNetworkId, getNetworkIdFromEl } from "../../../utils/GecoLab/network-helper";

const growthCabinetPromise =  waitForDOMContentLoaded().then(() => loadModel(growthCabinetSrc));
const plantPromise =  waitForDOMContentLoaded().then(() => loadModel(plantSrc));

/* should be networked (buttons and multiple-choice), couldn't test yet, cause second user can't even go past the spawning of the experiment */
 
 AFRAME.registerComponent("third-experiment-02", {
    schema: {
      parameterClicked: {default: false},
      chosen: {default: -1},
      nextBtnClickCount: {default: 0},
      skipBtnClicked: {default: false},
      openBtnClicked: {default: false},
    },
  
    init: function() {
      console.log("Third exp 2 started");
      
      this.lastUpdate = performance.now();
     
      this.el.sceneEl.addEventListener("stateadded", () => this.updateUI());
      this.el.sceneEl.addEventListener("stateremoved", () => this.updateUI());

      //local version of network variable:
      this.localParameterClicked = false;
      this.localNextButtonClickCount = 0;
      this.localSkipBtnClicked = false;
      this.localOpenBtnClicked = false;


      this.movableEntities = [];
      this.sockets = [];

      this.chosen = -1;

      //Colors for buttons:
      this.initialColor = "#D4ECFA";
      this.selectColor = "#B5B5B5";
      this.wrongColor = "#761614";
      this.rightColor = "#18FF03";
 

      this.expSystem = this.el.sceneEl.systems["third-experiments"];

      this.delayedInit = AFRAME.utils.bind(this.delayedInit, this);

      waitForDOMContentLoaded().then(() => {
        console.log("Third exp 2 registered");
        var networkId = getNetworkIdFromEl(this.el);

        this.experimentData = decodeNetworkId(networkId);

        this.isMember = this.expSystem.getIsMemberForGroupCode(this.experimentData.groupCode);

        this.expSystem.registerTask("02", this.el, this.experimentData);
        
        setTimeout(() => {
          waitForDOMContentLoaded().then(() => {

            this.thirdParameterBtn = this.el.querySelector(".parameter-button");
            this.thirdParameterBtn.object3D.addEventListener("interact", () => this.onClickParameter());
            this.thirdParameterBtn.object3D.visible = false;

            this.skipBtn = this.el.querySelector(".skip-btn-3-2");
            this.skipBtn.object3D.visible = false;
            this.skipBtn.object3D.addEventListener("interact", () => this.onClickSkipBtn());

            this.openBtn = this.el.querySelector(".open-btn-3-2");
            this.openBtn.object3D.visible = false;
            this.openBtn.object3D.addEventListener("interact", () => this.onClickOpenButton());
            
            this.delayedInit();

            this.nextBtn = this.el.querySelector(".next-btn-3-2");
            this.nextBtn.object3D.visible = false;
            this.nextBtn.object3D.addEventListener("interact", () => this.onNextButtonClick());
          });  
        }, IMSIMITY_INIT_DELAY * 0.9);

      });

      
      
      
    },

    delayedInit()
    {
      console.log('Delayed Init FE-02');

      this.cabinet1background = this.el.querySelector(".cabinet-1-background");
      this.cabinet1background.setAttribute("text-button", {backgroundColor: "#FFFFFF"});
      this.cabinet1Text = this.el.querySelector(".cabinet-1-text");
      this.cabinet2background = this.el.querySelector(".cabinet-2-background");
      this.cabinet2background.setAttribute("text-button", {backgroundColor: "#FFFFFF"});
      this.cabinet2Text = this.el.querySelector(".cabinet-2-text");
      this.cabinet3background = this.el.querySelector(".cabinet-3-background");
      this.cabinet3background.setAttribute("text-button", {backgroundColor: "#FFFFFF"});
      this.cabinet3Text = this.el.querySelector(".cabinet-3-text");

      this.multipleChoice = this.el.querySelector(".multi-choice-wrapper");
      this.multipleChoice.object3D.visible = false; 
      this.answerOption0 = this.el.querySelector(".answer-option-0");
      this.answerOption0.object3D.addEventListener("interact", () => this.choiceTemp());
      this.answerOption1 = this.el.querySelector(".answer-option-1");
      this.answerOption1.object3D.addEventListener("interact", () => this.choiceCO2());
      this.answerOption2 = this.el.querySelector(".answer-option-2"); 
      this.answerOption2.object3D.addEventListener("interact", () => this.choiceGround());
      this.submitBtn = this.el.querySelector(".submit-button");
      this.submitBtn.object3D.addEventListener("interact", () => this.onClickSubmitChoice());

      this.timeText = this.el.querySelector(".time-text");
      this.timeText.object3D.visible = false;

      this.sockets.forEach(s => {
        s.object3D.visible = false; //hide holograms until needed
      });

    },

    subscribe(eventName, fn)
    {
        switch(eventName) {
            case "onFinishPart02":
              this.onFinishPart02Callbacks.push(fn);
              break;
            case "onObjectSpawnedPart02":
                this.onObjectSpawnedPart02Callbacks.push(fn);
                break;
          }
    },

    unsubscribe(eventName, fn)
    {
        var index = 0;
        switch(eventName) {
            case "onFinishPart02":
              index = this.onFinishPart02Callback.indexOf(fn);
              this.onFinishPart02Callback.splice(index, 1);
              break;
            case "onObjectSpawnedPart02":
              index = this.onObjectSpawnedPart02Callbacks.indexOf(fn);
              this.onObjectSpawnedPart02Callbacks.splice(index, 1);
              break;
          }
    },

    update() {
      waitForDOMContentLoaded().then(() => { 
        this.updateUI();
      });
    },
    
    updateUI: function() {
      if(this.localParameterClicked != this.data.parameterClicked) {
        this.showChoice();
        this.localParameterClicked = this.data.parameterClicked;
      }

      if(this.localSkipBtnClicked != this.data.skipBtnClicked) {
        this.speedUp();
        this.localSkipBtnClicked = this.data.skipBtnClicked;
      }

      if(this.localOpenBtnClicked != this.data.openBtnClicked) {
        this.openCabinet();
        this.localOpenBtnClicked = this.data.openBtnClicked;
      }

      if(this.data.chosen != -1)
      {
        this.explainParameter();
        this.chosen = this.data.chosen;
      }

      if (this.localNextButtonClickCount != this.data.nextBtnClickCount)
      {
        this.localNextButtonClickCount = this.data.nextBtnClickCount;

        if (this.localNextButtonClickCount == 1)
        {
          this.explainParameter2();
        } 
        else if (this.localNextButtonClickCount == 2)
        {
          this.explainParameter3();
        }
        else if (this.localNextButtonClickCount == 3)
        {
          this.explainParameter4();
        }
        else if (this.localNextButtonClickCount == 4)
        {
          //this.nextBtn.object3D.visible = false;
          this.saySpeedUp();
        }
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

    onNextButtonClick()
    {
      NAF.utils.getNetworkedEntity(this.el).then(networkedEl => {
    
        NAF.utils.takeOwnership(networkedEl);
  
        this.el.setAttribute("third-experiment-02", "nextBtnClickCount", this.localNextButtonClickCount + 1); 
        
        this.updateUI();
      });
    },

    startPart02() {
      this.mannequin = this.el.sceneEl.systems["mannequin-manager"].getMannequinByGroupCode(this.experimentData.groupCode);

      this.cabinet1background.object3D.visible = true;
      this.cabinet2background.object3D.visible = true; 
      this.cabinet3background.object3D.visible = true; 
      //this.cabinet1Text.setAttribute("text", { value: "weg"});
      //this.cabinet2Text.setAttribute("text", { value: "war"});
      //this.cabinet3Text.setAttribute("text", { value: "er"});

      this.thirdParameterBtn.object3D.visible = true;
    },

    onClickParameter()
    {
      NAF.utils.getNetworkedEntity(this.el).then(networkedEl => {
    
        NAF.utils.takeOwnership(networkedEl);
  
        this.el.setAttribute("third-experiment-02", "parameterClicked", true);      
  
        this.updateUI();
      });
    },

    showChoice()
    {
      this.thirdParameterBtn.object3D.visible = false;

      this.multipleChoice.object3D.visible = true;
    },

    choiceTemp()
    {
      this.chosen = 0;
      this.answerOption0.setAttribute("text-button", {backgroundColor: this.selectColor});
      this.answerOption1.setAttribute("text-button", {backgroundColor: this.initialColor});
      this.answerOption2.setAttribute("text-button", {backgroundColor: this.initialColor});
    },

    choiceCO2()
    {
      this.chosen = 1;
      this.answerOption0.setAttribute("text-button", {backgroundColor: this.initialColor});
      this.answerOption1.setAttribute("text-button", {backgroundColor: this.selectColor});
      this.answerOption2.setAttribute("text-button", {backgroundColor: this.initialColor});
    },

    choiceGround()
    {
      this.chosen = 2;
      this.answerOption0.setAttribute("text-button", {backgroundColor: this.initialColor});
      this.answerOption1.setAttribute("text-button", {backgroundColor: this.initialColor});
      this.answerOption2.setAttribute("text-button", {backgroundColor: this.selectColor});
    },

    onClickSubmitChoice()
    {
      NAF.utils.getNetworkedEntity(this.el).then(networkedEl => {
    
        NAF.utils.takeOwnership(networkedEl);
  
        this.el.setAttribute("third-experiment-02", "chosen", this.chosen);      
  
        this.updateUI();
      });
    },

    explainParameter()
    {
      this.multipleChoice.object3D.visible = false;

      //text depending on Parameter
      //this.cabinet1Text.setAttribute("text", { value: "weg"});
      //this.cabinet2Text.setAttribute("text", { value: "war"});
      //this.cabinet3Text.setAttribute("text", { value: "er"});
      
      //Mannequin depending on Parameter

      this.nextBtn.object3D.visible = true;
    },

    explainParameter2()
    {
      //Mannequin depending on Parameter
    },

    explainParameter3()
    {
      //Mannequin depending on Parameter
    },

    explainParameter4()
    {
      //Mannequin depending on Parameter
    },

    saySpeedUp()
    {
      this.nextBtn.object3D.visible = false;
      this.skipBtn.object3D.visible = true;

      this.timeText.object3D.visible = true;

      //Mannequin Vorspulen

      
    },

    onClickSkipBtn()
    {
      NAF.utils.getNetworkedEntity(this.el).then(networkedEl => {
    
        NAF.utils.takeOwnership(networkedEl);
  
        this.el.setAttribute("third-experiment-02", "skipBtnClicked", true);      
  
        this.updateUI();
      });
    },

    speedUp()
    {
      this.skipBtn.object3D.visible = false;

      this.timeText.setAttribute("text", { value: "0 Woche"});

      setTimeout(() => {
        this.timeText.setAttribute("text", { value: "1 Woche"});
      }, 1000);

      setTimeout(() => {
        this.timeText.setAttribute("text", { value: "2 Woche"});
      }, 2000);

      setTimeout(() => {
        this.timeText.setAttribute("text", { value: "3 Woche"});
      }, 3000);

      setTimeout(() => {
        this.timeText.setAttribute("text", { value: "4 Woche"});
      }, 4000);

      setTimeout(() => {
        this.timeText.setAttribute("text", { value: "5 Woche"});
      }, 5000);

      setTimeout(() => {
        this.timeText.setAttribute("text", { value: "6 Woche"});
        this.showOpenButton();
      }, 6000);
    },

    showOpenButton()
    {
      this.timeText.object3D.visible = false;
      this.openBtn.object3D.visible = true;
    },

    onClickOpenButton()
    {
      NAF.utils.getNetworkedEntity(this.el).then(networkedEl => {
    
        NAF.utils.takeOwnership(networkedEl);
  
        this.el.setAttribute("third-experiment-02", "openBtnClicked", true);      
  
        this.updateUI();
      });
    },

    openCabinet()
    {
      this.openBtn.object3D.visible = false;
      console.log("This is the end!");
    },

    remove() {
      console.log("removing third-experiment 02");
      this.expSystem.deregisterTask("02", this.el, this.experimentData);
    }

  });

