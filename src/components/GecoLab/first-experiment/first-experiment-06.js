import { cloneObject3D } from "../../../utils/three-utils";
import { waitForDOMContentLoaded } from "../../../utils/async-utils";
import { IMSIMITY_INIT_DELAY } from "../../../utils/imsimity";

/* Same as before: Buttons networked, maybe button called on spawn like in 03+04, entity-socket callbacks not yet  */

  AFRAME.registerComponent("first-experiment-06", {
    schema: {
        formulaPopupClosed: {default: false},
        onClickDiscussResult: {default: false},
        onClickTidyUp: {default: false},
    },
  

    // Somehow called twice
    init: function() {

        console.log('first-experiment-06 init');

        this.sceneEl = document.querySelector("a-scene");
        this.lastUpdate = performance.now();
        
        this.el.sceneEl.addEventListener("stateadded", () => this.updateUI());
        this.el.sceneEl.addEventListener("stateremoved", () => this.updateUI());

        this.localFormulaPopupClosed = false;
        this.localOnClickTidyUp = false;
        this.localOnClickDiscussResult = false;

        this.expSystem = this.el.sceneEl.systems["first-experiments"];
        this.expSystem.registerTask(this.el, "06");

        
        //bind Callback funtions:
        this.startPart06 = AFRAME.utils.bind(this.startPart06, this);
        this.tongPlacedOnCrucible = AFRAME.utils.bind(this.tongPlacedOnCrucible, this);
        this.onCruciblePlaced = AFRAME.utils.bind(this.onCruciblePlaced, this);
        this.chooseFormula = AFRAME.utils.bind(this.chooseFormula, this);
        this.discussResult = AFRAME.utils.bind(this.discussResult, this);
        this.setRightAnswerTxt = AFRAME.utils.bind(this.setRightAnswerTxt, this);
        this.onSubmitMultipleChoice06 = AFRAME.utils.bind(this.onSubmitMultipleChoice06, this);
        
        waitForDOMContentLoaded().then(() => { 
            setTimeout(() => {
                this.tongSocket06 = this.el.querySelector(".tong-socket-crucible-06");
                this.crucibleSocketScale = this.sceneEl.querySelector(".crucible-socket");

                this.crucibleEntity = this.sceneEl.querySelector(".crucible-entity");
                this.tongEntity = this.sceneEl.querySelector(".tong-entity");
                this.attachedTongEntity = this.crucibleEntity.querySelector(".attached-tong-entity");

                this.stopwatchEntity = this.sceneEl.querySelector(".stopwatch-tool");
                this.scaleEntity = this.sceneEl.querySelector(".scale-entity");

                this.discussResultBtn = document.querySelector(".discuss-result-btn");
                this.discussResultBtn.object3D.addEventListener("interact", this.onDiscussResultClicked);
                this.discussResultBtn.object3D.visible = false;

                this.multipleChoice06 = document.querySelector(".multiple-choice-wrapper-06");
                this.multipleChoice06.object3D.visible = false;
                this.answerOption2Txt = this.el.querySelector(".answer-option-2-txt");

                this.tidyUpBtn = this.el.querySelector(".tidy-up-btn");
                this.tidyUpBtn.object3D.addEventListener("interact", this.onTidyUpClicked);
                this.tidyUpBtn.object3D.visible = false;


                console.log(this.stopwatchEntity);
                this.stopwatchEntity.components["stopwatch-tool"].subscribe("minuteMark4", this.startPart06);
                this.firstExpPart01 = this.expSystem.getTaskById("01");
                this.firstExpPart01.components["first-experiment-01"].subscribe("groundSampleSelected", this.setRightAnswerTxt);
            }, IMSIMITY_INIT_DELAY);

        });
    },

    hotfix()
    {
        this.discussResultBtn = document.querySelector(".discuss-result-btn");
        this.multipleChoice06 = document.querySelector(".multiple-choice-wrapper-06");
    },

    subscribe(eventName, fn)
    {
    },

    unsubscribe(eventName, fn)
    {
    },

    update() {
        waitForDOMContentLoaded().then(() => { 
          this.updateUI();
        });
    },
    
    updateUI: function() {
        console.log(this.data);

        if(this.localFormulaPopupClosed != this.data.formulaPopupClosed) {
            this.proceedToDiscussResult();
            this.localFormulaPopupClosed = this.data.formulaPopupClosed;
        }

        if(this.localOnClickDiscussResult != this.data.onClickDiscussResult) {
            this.discussResult();
            this.localOnClickDiscussResult = this.data.onClickDiscussResult;
        }

        if(this.localOnClickTidyUp != this.data.onClickTidyUp) {
            this.tidyUp();
            this.localOnClickTidyUp = this.data.onClickTidyUp;
        }
    },
  
    tick: function() {
    },

    spawnItem(promise, position, entity, show) {
        promise.then(model => {
            entity.object3D.visible = false;
            const mesh = cloneObject3D(model.scene);
            mesh.scale.set(3, 3, 3);
            mesh.matrixNeedsUpdate = true;
            entity.setObject3D("mesh", mesh);
        
            if(show)
                entity.object3D.visible = true;
            entity.object3D.scale.set(1.0, 1.0, 1.0);
            entity.setAttribute("position", {x: position.x, y: position.y, z: position.z});
            entity.object3D.matrixNeedsUpdate = true;
        });
    },

    startPart06() {
        console.log('Starting Part 06');
        
        this.stopwatchEntity.components["stopwatch-tool"].adjustSpeed(1000);
        this.tongSocket06.components["entity-socket"].enableSocket();
        this.tongSocket06.components["entity-socket"].subscribe("onSnap", this.tongPlacedOnCrucible);
        this.scaleEntity.components["waage-tool"].subscribe("onGlowLossWeighed", this.chooseFormula);
    },

    tongPlacedOnCrucible() {
        this.tongEntity.object3D.visible = false;
        this.attachedTongEntity.object3D.visible = true;

        this.mannequin = this.el.sceneEl.systems["mannequin-manager"].getMyMannequin();
        this.mannequin.components["mannequin"].displayMessage(12);

        this.crucibleSocketScale.components["entity-socket"].enableSocket();
        this.crucibleSocketScale.components["entity-socket"].subscribe("onSnap", this.onCruciblePlaced);
        this.tongSocket06.components["entity-socket"].unsubscribe("onSnap", this.tongPlacedOnCrucible);
    },

    onCruciblePlaced() {
        this.scaleEntity.components["waage-tool"].measureGlowLoss();
        this.crucibleSocketScale.components["entity-socket"].unsubscribe("onSnap", this.onCruciblePlaced);

        this.mannequin = this.el.sceneEl.systems["mannequin-manager"].getMyMannequin();
        this.mannequin.components["mannequin"].displayMessage(13);
    },

    chooseFormula() {
        this.sceneEl.emit("gecolab_choose_formula");
    },

    onPopUpClosed() {
        console.log("boop"); // works all right
        NAF.utils.getNetworkedEntity(this.el).then(networkedEl => {
    
            NAF.utils.takeOwnership(networkedEl);
      
            this.el.setAttribute("first-experiment-06", "formulaPopupClosed", true);      
        });
    },

    proceedToDiscussResult() {
        this.discussResultBtn.object3D.visible = true; 

        this.mannequin = this.el.sceneEl.systems["mannequin-manager"].getMyMannequin();
        this.mannequin.components["mannequin"].displayMessage(14);
    },

    setRightAnswerTxt(index) {
        let percentage = 0;
        if(index == 1)
            percentage = 4.76;
        else if(index == 2)
            percentage = 1.7;

        let txt = percentage + "%";
        this.answerOption2Txt.setAttribute("text", { value: txt });
    },

    onDiscussResultClicked() {
        NAF.utils.getNetworkedEntity(this.el).then(networkedEl => {
    
            NAF.utils.takeOwnership(networkedEl);
      
            this.el.setAttribute("first-experiment-06", "onClickDiscussResult", true);      
        });
    },

    discussResult() {
        // one of those is empty
        this.hotfix();

        console.log(this.discussResultBtn);
        console.log(this.multipleChoice06);

        this.discussResultBtn.object3D.visible = false;

        // Shown for a few frames
        this.multipleChoice06.object3D.visible = true;
        this.multipleChoice06.components["multiple-choice-question"].subscribe("onSubmit", this.onSubmitMultipleChoice06);
    },

    onSubmitMultipleChoice06(correctAnswer, selectedAnswer) {
        if(correctAnswer == selectedAnswer) {
          console.log("Right Answer");
          setTimeout(() => {
            this.multipleChoice06.object3D.visible = false; 
            this.tidyUpBtn.object3D.visible = true;
          }, 500);
        }
    },

    onTidyUpClicked() {
        NAF.utils.getNetworkedEntity(this.el).then(networkedEl => {
    
            NAF.utils.takeOwnership(networkedEl);
      
            this.el.setAttribute("first-experiment-06", "onClickTidyUp", true);      
        });
    },

    tidyUp() {
        console.log("teleport Items back to initial pos");
    }
  });