import { cloneObject3D } from "../../utils/three-utils";
import { loadModel } from ".././gltf-model-plus";
import { waitForDOMContentLoaded } from "../../utils/async-utils";

/* Same as before: Buttons networked, maybe button called on spawn like in 03+04, entity-socket callbacks not yet  */

  AFRAME.registerComponent("first-experiment-06", {
    schema: {
        formulaPopupClosed: {default: false},
        onClickDiscussResult: {default: false},
        onClickTidyUp: {default: false},
    },
  
    init: function() {
        this.sceneEl = document.querySelector("a-scene");
        this.lastUpdate = performance.now();
        
        this.el.sceneEl.addEventListener("stateadded", () => this.updateUI());
        this.el.sceneEl.addEventListener("stateremoved", () => this.updateUI());

        waitForDOMContentLoaded().then(() => { 
            this.expSystem = this.el.sceneEl.systems["first-experiments"];

            this.tongSocket06 = this.el.querySelector(".tong-socket-crucible-06");
            this.crucibleSocketScale = this.sceneEl.querySelector(".crucible-socket");

            this.crucibleEntity = this.sceneEl.querySelector(".crucible-entity");
            this.tongEntity = this.sceneEl.querySelector(".tong-entity");
            this.attachedTongEntity = this.crucibleEntity.querySelector(".attached-tong-entity");

            this.stopwatchEntity = this.sceneEl.querySelector(".stopwatch-tool");
            this.scaleEntity = this.sceneEl.querySelector(".scale-entity");

            this.localFormulaPopupClosed = false;

            this.discussResultBtn = this.el.querySelector(".discuss-result-btn");
            this.discussResultBtn.object3D.addEventListener("interact", () => this.onDiscussResultClicked());
            this.discussResultBtn.object3D.visible = false;
            this.localOnClickDiscussResult = false;

            this.multipleChoice06 = this.el.querySelector(".multiple-choice-wrapper-06");
            this.multipleChoice06.object3D.visible = false;

            this.tidyUpBtn = this.el.querySelector(".tidy-up-btn");
            this.tidyUpBtn.object3D.addEventListener("interact", () => this.onTidyUpClicked());
            this.tidyUpBtn.object3D.visible = false;
            this.localOnClickTidyUp = false;

            this.updateUI();

            //bind Callback funtions:
            this.startPart06 = AFRAME.utils.bind(this.startPart06, this);
            this.tongPlacedOnCrucible = AFRAME.utils.bind(this.tongPlacedOnCrucible, this);
            this.onCruciblePlaced = AFRAME.utils.bind(this.onCruciblePlaced, this);
            this.chooseFormula = AFRAME.utils.bind(this.chooseFormula, this);
            this.discussResult = AFRAME.utils.bind(this.discussResult, this);
            this.onSubmitMultipleChoice06 = AFRAME.utils.bind(this.onSubmitMultipleChoice06, this);

            setTimeout(() => {
                this.stopwatchEntity.components["stopwatch-tool"].subscribe("minuteMark4", this.startPart06);
            }, 300);

            this.expSystem.registerTask(this.el, "06");
        });
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
        this.stopwatchEntity.components["stopwatch-tool"].adjustSpeed(1000);
        this.tongSocket06.components["entity-socket"].enableSocket();
        this.tongSocket06.components["entity-socket"].subscribe("onSnap", this.tongPlacedOnCrucible);
        this.scaleEntity.components["waage-tool"].subscribe("onGlowLossWeighed", this.chooseFormula);
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
    },

    chooseFormula() {
        this.sceneEl.emit("gecolab_choose_formula");
    },

    onPopUpClosed() {
        NAF.utils.getNetworkedEntity(this.el).then(networkedEl => {
    
            NAF.utils.takeOwnership(networkedEl);
      
            this.el.setAttribute("first-experiment-06", "formulaPopupClosed", true);      
      
            this.updateUI();
        });
    },

    proceedToDiscussResult() {
        this.discussResultBtn.object3D.visible = true; 
    },

    onDiscussResultClicked() {
        NAF.utils.getNetworkedEntity(this.el).then(networkedEl => {
    
            NAF.utils.takeOwnership(networkedEl);
      
            this.el.setAttribute("first-experiment-06", "onClickDiscussResult", true);      
      
            this.updateUI();
        });
    },

    discussResult() {
        this.discussResultBtn.object3D.visible = false;
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
      
            this.updateUI();
        });
    },

    tidyUp() {
        console.log("teleport Items back to initial pos");
    }
  });