import { cloneObject3D } from "../../../utils/three-utils";
import { waitForDOMContentLoaded } from "../../../utils/async-utils";

import { IMSIMITY_INIT_DELAY, decodeNetworkId, getNetworkIdFromEl } from "../../../utils/imsimity";

/* Same as before: Buttons networked, maybe button called on spawn like in 03+04, entity-socket callbacks not yet  */

  AFRAME.registerComponent("first-experiment-06", {
    schema: {
        formulaPopupClosed: {default: false},
        onClickDiscussResult: {default: false},
        onClickTidyUp: {default: false},
        minuteMark4: {default: false},
    },
  

    // Somehow called twice
    init: function() {

        console.log('first-experiment-06 init');

        this.lastUpdate = performance.now();
        
        this.el.sceneEl.addEventListener("stateadded", () => this.updateUI());
        this.el.sceneEl.addEventListener("stateremoved", () => this.updateUI());

        this.localFormulaPopupClosed = false;
        this.localOnClickTidyUp = false;
        this.localOnClickDiscussResult = false;
        this.localMinuteMark4 = false;

        this.expSystem = this.el.sceneEl.systems["first-experiments"];

        
        //bind Callback funtions:
        this.startPart06 = AFRAME.utils.bind(this.startPart06, this);
        this.tongPlacedOnCrucible = AFRAME.utils.bind(this.tongPlacedOnCrucible, this);
        this.onCruciblePlaced = AFRAME.utils.bind(this.onCruciblePlaced, this);
        this.chooseFormula = AFRAME.utils.bind(this.chooseFormula, this);
        this.discussResult = AFRAME.utils.bind(this.discussResult, this);
        this.setRightAnswerTxt = AFRAME.utils.bind(this.setRightAnswerTxt, this);
        this.onSubmitMultipleChoice06 = AFRAME.utils.bind(this.onSubmitMultipleChoice06, this);

        this.onPopUpClosed = AFRAME.utils.bind(this.onPopUpClosed, this);
        this.proceedToDiscussResult = AFRAME.utils.bind(this.proceedToDiscussResult, this); 
        this.onDiscussResultClicked = AFRAME.utils.bind(this.onDiscussResultClicked, this); 
        this.onTidyUpClicked = AFRAME.utils.bind(this.onTidyUpClicked, this);
        this.tidyUp = AFRAME.utils.bind(this.tidyUp, this);

        this.onMinuteMark4 = AFRAME.utils.bind(this.onMinuteMark4, this);
        
       

        waitForDOMContentLoaded().then(() => { 


            var networkId = getNetworkIdFromEl(this.el);

            this.experimentData = decodeNetworkId(networkId);
    
            this.expSystem.registerTask("06", this.el, this.experimentData);


            setTimeout(() => {

                this.firstExpPart01 = this.expSystem.getTaskById("01", this.experimentData.groupCode);
                this.firstExpPart02 = this.expSystem.getTaskById("02", this.experimentData.groupCode);
                this.firstExpPart03 = this.expSystem.getTaskById("03", this.experimentData.groupCode);
                

                this.tongSocket06 = this.el.querySelector(".tong-socket-crucible-06");
                this.crucibleSocketScale = this.firstExpPart03.querySelector(".crucible-socket");

                this.crucibleEntity = this.firstExpPart02.querySelector(".crucible-entity");
                this.tongEntity = this.firstExpPart02.querySelector(".tong-entity");
                this.attachedTongEntity = this.crucibleEntity.querySelector(".attached-tong-entity");

                this.stopwatchEntity = this.expSystem.getTaskById('stopwatch', this.experimentData.groupCode);
                this.scaleEntity = this.firstExpPart02.querySelector(".scale-entity");

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
                this.stopwatchEntity.components["stopwatch-tool"].subscribe("minuteMark4", this.onMinuteMark4);

                this.firstExpPart01.components["first-experiment-01"].subscribe("groundSampleSelected", this.setRightAnswerTxt);
            }, IMSIMITY_INIT_DELAY);

        });

    },

    subscribe(eventName, fn)
    {
    },

    unsubscribe(eventName, fn)
    {
    },

    onMinuteMark4()
    {
        NAF.utils.getNetworkedEntity(this.el).then(networkedEl => {
            NAF.utils.takeOwnership(networkedEl);
      
            this.el.setAttribute("first-experiment-06", "minuteMark4", true);      
        });
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

        if(this.localMinuteMark4 != this.data.minuteMark4) {
            this.startPart06();

            this.localMinuteMark4 = this.data.minuteMark4;
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

        this.mannequin = this.el.sceneEl.systems["mannequin-manager"].getMannequinByGroupCode(this.experimentData.groupCode);
        this.mannequin.components["mannequin"].displayMessage(12);
    },

    tongPlacedOnCrucible() {
        this.tongEntity.object3D.visible = false;
        this.attachedTongEntity.object3D.visible = true;

        this.crucibleSocketScale.components["entity-socket"].enableSocket();
        this.crucibleSocketScale.components["entity-socket"].subscribe("onSnap", this.onCruciblePlaced);
        this.tongSocket06.components["entity-socket"].unsubscribe("onSnap", this.tongPlacedOnCrucible);
    },

    onCruciblePlaced() {
        this.scaleEntity.components["waage-tool"].measureGlowLoss();
        this.crucibleSocketScale.components["entity-socket"].unsubscribe("onSnap", this.onCruciblePlaced);

        this.mannequin = this.el.sceneEl.systems["mannequin-manager"].getMannequinByGroupCode(this.experimentData.groupCode);
        this.mannequin.components["mannequin"].displayMessage(13);
    },

    chooseFormula() {
        this.el.sceneEl.emit("gecolab_choose_formula", this.experimentData.groupCode);
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

        this.mannequin = this.el.sceneEl.systems["mannequin-manager"].getMannequinByGroupCode(this.experimentData.groupCode);
        this.mannequin.components["mannequin"].displayMessage(14);
    },

    setRightAnswerTxt(index) {
        let percentage = 0;

        if (index == 1)
            percentage = 4.76;
        else if (index == 2)
            percentage = 1.52;
        else if (index == 3)
            percentage = 1.8;
        else if (index == 4)
            percentage = 0.91;
            
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
            
             // Mannequin
            this.mannequin = this.el.sceneEl.systems["mannequin-manager"].getMannequinByGroupCode(this.experimentData.groupCode);
            this.mannequin.components["mannequin"].displayMessage(-1);

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
        this.tidyUpBtn.object3D.visible = false;
        this.sceneEl.emit("gecolab_feedback", this.experimentData.groupCode);
    },

    remove() {
        console.log("removing first-experiment 06");
        this.expSystem.deregisterTask("06", this.el, this.experimentData);
    }
  });