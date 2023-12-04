import { waitForDOMContentLoaded } from "../../../utils/async-utils";
import { cloneObject3D } from "../../../utils/three-utils";
import { loadModel } from "../.././gltf-model-plus";
import { IMSIMITY_INIT_DELAY } from "../../../utils/imsimity";
import { decodeNetworkId, getNetworkIdFromEl } from "../../../utils/GecoLab/network-helper";

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
      this.localChosen = -1;

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

      this.explainParameter = AFRAME.utils.bind(this.explainParameter, this);
      this.explainParameter2 = AFRAME.utils.bind(this.explainParameter2, this);
      this.explainParameter3 = AFRAME.utils.bind(this.explainParameter3, this);
      this.explainParameter4 = AFRAME.utils.bind(this.explainParameter4, this);

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

      if(this.localChosen != this.data.chosen)
      {
        this.chosen = this.data.chosen;
        this.localChosen = this.data.chosen;
        this.explainParameter();
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
        console.log("Count:", this.localNextButtonClickCount);
        this.updateUI();
      });
    },

    startPart02() {
      this.mannequin = this.el.sceneEl.systems["mannequin-manager"].getMannequinByGroupCode(this.experimentData.groupCode);

      this.cabinet1background.object3D.visible = true;
      this.cabinet2background.object3D.visible = true; 
      this.cabinet3background.object3D.visible = true; 

      this.cabinet1Text.setAttribute("text", { value: "CO2 (ppm)\nTemperatur (°C)\nLicht (%)\nLuftfeuchtigkeit (%)\nBodenart"});
      this.cabinet2Text.setAttribute("text", { value: "CO2 (ppm)\nTemperatur (°C)\nLicht (%)\nLuftfeuchtigkeit (%)\nBodenart"});
      this.cabinet3Text.setAttribute("text", { value: "CO2 (ppm)\nTemperatur (°C)\nLicht (%)\nLuftfeuchtigkeit (%)\nBodenart"});

      this.mannequin.components["mannequin"].displayMessage(46);

      //this.nextBtn.onclick = function(){onNextButtonClick()};
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

      this.mannequin.components["mannequin"].displayMessage(-1);

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
      if(this.chosen >= 0)
      {
          NAF.utils.getNetworkedEntity(this.el).then(networkedEl => {
      
          NAF.utils.takeOwnership(networkedEl);
    
          this.el.setAttribute("third-experiment-02", "chosen", this.chosen);      
    
          this.nextBtn.object3D.visible = true;

          this.updateUI();
        });
      }
    },

    explainParameter()
    {
      this.multipleChoice.object3D.visible = false;

      switch (this.chosen) {
        case 0://Temp 52
        this.mannequin.components["mannequin"].displayMessage(52);
          break;
        case 1://CO2 48
        this.mannequin.components["mannequin"].displayMessage(48);
          break;
        case 2://Ground 56
        this.mannequin.components["mannequin"].displayMessage(56);
          break;
      }
      //this.nextBtn.object3D.visible = true;
    },

    explainParameter2()
    {
      //Mannequin depending on Parameter
      switch (this.data.chosen) {
        case 0://Temp 
        this.mannequin.components["mannequin"].displayMessage(53);
          break;
        case 1://CO2 
        this.mannequin.components["mannequin"].displayMessage(49);
          break;
        case 2://Ground 
        this.mannequin.components["mannequin"].displayMessage(57);
          break;
      }
    },

    explainParameter3()
    {
      //Mannequin depending on Parameter
      switch (this.chosen) {
        case 0://Temp 
        this.mannequin.components["mannequin"].displayMessage(54);
        this.cabinet1Text.setAttribute("text", { value: "CO2 550ppm\nTemperatur 25°C\nLicht (%)\nLuftfeuchtigkeit 90%\nSchluffiger Lehmboden"});
        this.cabinet2Text.setAttribute("text", { value: "CO2 550ppm\nTemperatur 29°C\nLicht (%)\nLuftfeuchtigkeit 90%\nSchluffiger Lehmboden"});
        this.cabinet3Text.setAttribute("text", { value: "CO2 550ppm\nTemperatur 33°C\nLicht (%)\nLuftfeuchtigkeit 90%\nSchluffiger Lehmboden"});
          break;
        case 1://CO2 
        this.mannequin.components["mannequin"].displayMessage(50);
        this.cabinet1Text.setAttribute("text", { value: "CO2 419ppm\nTemperatur 25°C\nLicht (%)\nLuftfeuchtigkeit 90%\nSchluffiger Lehmboden"});
        this.cabinet2Text.setAttribute("text", { value: "CO2 550ppm\nTemperatur 25°C\nLicht (%)\nLuftfeuchtigkeit 90%\nSchluffiger Lehmboden"});
        this.cabinet3Text.setAttribute("text", { value: "CO2 650ppm\nTemperatur 25°C\nLicht (%)\nLuftfeuchtigkeit 90%\nSchluffiger Lehmboden"});
          break;
        case 2://Ground 
        this.mannequin.components["mannequin"].displayMessage(58);
        this.cabinet1Text.setAttribute("text", { value: "CO2 550ppm\nTemperatur 25°C\nLicht (%)\nLuftfeuchtigkeit 90%\nSchluffiger Lehmboden"});
        this.cabinet2Text.setAttribute("text", { value: "CO2 550ppm\nTemperatur 25°C\nLicht (%)\nLuftfeuchtigkeit 90%\nLehmiger Ton"});
        this.cabinet3Text.setAttribute("text", { value: "CO2 550ppm\nTemperatur 25°C\nLicht (%)\nLuftfeuchtigkeit 90%\nSchwach schluffiger Sand"});
          break;
      }
    },

    explainParameter4()
    {
      //Mannequin depending on Parameter
      switch (this.chosen) {
        case 0://Temp 
        this.mannequin.components["mannequin"].displayMessage(55);
          break;
        case 1://CO2 
        this.mannequin.components["mannequin"].displayMessage(51);
          break;
        case 2://Ground 
        this.mannequin.components["mannequin"].displayMessage(59);
          break;
    }
    },

    saySpeedUp()
    {
      this.nextBtn.object3D.visible = false;
      this.skipBtn.object3D.visible = true;

      this.timeText.object3D.visible = true;
      this.mannequin.components["mannequin"].displayMessage(60);
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

      this.mannequin.components["mannequin"].displayMessage(-1);

      this.timeText.setAttribute("text", { value: "0 Wochen"});

      setTimeout(() => this.sayText1(),1000);
      setTimeout(() => this.sayText2(),2000);
      setTimeout(() => this.sayText3(),3000);
      setTimeout(() => this.sayText4(),4000);
      setTimeout(() => this.sayText5(),5000);
      setTimeout(() => this.sayText6(),6000);
    },
    sayText1(){
      this.timeText.setAttribute("text", { value: "1 Wochen"});
    },
    sayText2(){
      this.timeText.setAttribute("text", { value: "2 Wochen"});
    },
    sayText3(){
      this.timeText.setAttribute("text", { value: "3 Wochen"});
    },
    sayText4(){
      this.timeText.setAttribute("text", { value: "4 Wochen"});
    },
    sayText5(){
      this.timeText.setAttribute("text", { value: "5 Wochen"});
    },
    sayText6(){
      this.timeText.setAttribute("text", { value: "6 Wochen"});
      this.showOpenButton();
      this.mannequin.components["mannequin"].displayMessage(61);
    },

    showOpenButton()
    {
      this.timeText.object3D.visible = false;
      this.nextBtn.object3D.visible = false;
      this.skipBtn.object3D.visible = false;
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
      this.mannequin.components["mannequin"].displayMessage(-1);
      this.thirdExpPart03 = this.expSystem.getTaskById("03", this.experimentData.groupCode);
      this.thirdExpPart03.components["third-experiment-03"].startPart03();
    },

    remove() {
      console.log("removing third-experiment 02");
      this.expSystem.deregisterTask("02", this.el, this.experimentData);
    }

  });

