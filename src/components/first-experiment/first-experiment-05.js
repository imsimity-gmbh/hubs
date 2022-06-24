import { cloneObject3D } from "../../utils/three-utils";
import { loadModel } from ".././gltf-model-plus";
import { waitForDOMContentLoaded } from "../../utils/async-utils";

import { THREE } from "aframe";

/* Same as before: Buttons networked, maybe button called on spawn like in 03+04, entity-socket callbacks not yet  */

  AFRAME.registerComponent("first-experiment-05", {
    schema: {
        stirBtnHeld: {default: false},
        onClickCutBunsenBurner: {default: false},
        onClickTurnOffBunsenBurner: {default: false},
    },
  
    init: function() {
        this.sceneEl = document.querySelector("a-scene");
        this.lastUpdate = performance.now();
        
        this.el.sceneEl.addEventListener("stateadded", () => this.updateUI());
        this.el.sceneEl.addEventListener("stateremoved", () => this.updateUI());

        waitForDOMContentLoaded().then(() => { 
            this.expSystem = this.el.sceneEl.systems["first-experiments"];

            this.thermoSocket05 = this.el.querySelector(".thermo-socket-05");
            this.thermoSocketGeneral = this.sceneEl.querySelector(".thermo-socket")
            this.glassStickSocket = this.sceneEl.querySelector(".glass-stick-socket");
            this.glassStickSocketCrucible = this.sceneEl.querySelector(".glass-stick-socket-04");
            this.tongSocketCrucible = this.el.querySelector(".tong-socket-crucible");
            this.tongSocketGeneral = this.sceneEl.querySelector(".tong-socket");
            this.crucibleSocket05 = this.el.querySelector(".crucible-socket-05");

            this.stopwatchEntity = this.sceneEl.querySelector(".stopwatch-entity");
            this.thermoEntity = this.sceneEl.querySelector(".thermo-entity");
            this.glassstickEntity = this.sceneEl.querySelector(".glass-stick-entity");
            this.flameEntity = this.sceneEl.querySelector(".flame-entity");
            this.crucibleEntity = this.sceneEl.querySelector(".crucible-entity");
            this.tongEntity = this.sceneEl.querySelector(".tong-entity");
            this.attachedTongEntity = this.crucibleEntity.querySelector(".attached-tong-entity");

            this.measureTemp = false;
            this.temp = 340;
            this.tempText = this.thermoEntity.querySelector(".thermo-text");
            this.measuredCounter = 0;

            this.stiringBtn = this.sceneEl.querySelector(".stiring-btn");
            this.stiringBtn.object3D.addEventListener("holdable-button-down", () => this.onHoldStirBtnDown());
            this.stiringBtn.object3D.addEventListener("holdable-button-up", () => this.onReleaseStirBtn());
            this.localStirBtnHeld = false;

            this.stopStiring = true;
            this.updatePos = false;
            this.x = 0;
            this.z = 0;
            this.t = 0;

            this.lowerBurnerTempBtn = this.el.querySelector(".lower-burner-temp-btn");
            this.lowerBurnerTempBtn.object3D.addEventListener("interact", () => this.onCutBunsenBurnerClicked());
            this.lowerBurnerTempBtn.object3D.visible = false;
            this.localOnClickCutBunsenBurner = false;

            this.turnOffBurnerBtn = this.el.querySelector(".stop-burner-btn");
            this.turnOffBurnerBtn.object3D.addEventListener("interact", () => this.onTurnOffBunsenBurnerClicked());
            this.turnOffBurnerBtn.object3D.visible = false;
            this.localOnClickTurnOffBunsenBurner = false;

            this.updateUI();

            //bind Callback funtions:
            this.startPart05 = AFRAME.utils.bind(this.startPart05, this);
            this.glassStickPlaced = AFRAME.utils.bind(this.glassStickPlaced, this);
            this.thermoRunning = AFRAME.utils.bind(this.thermoRunning, this);
            this.stopThermo = AFRAME.utils.bind(this.stopThermo, this);
            this.thermoOnTable = AFRAME.utils.bind(this.thermoOnTable, this);
            this.startStiring = AFRAME.utils.bind(this.startStiring, this);
            this.cutBunsenBurner = AFRAME.utils.bind(this.cutBunsenBurner, this);
            this.waitForCoolingTask = AFRAME.utils.bind(this.waitForCoolingTask, this);
            this.startCoolingTask = AFRAME.utils.bind(this.startCoolingTask, this);
            this.turnOffBunsenBurner = AFRAME.utils.bind(this.turnOffBunsenBurner, this);
            this.tongPlacedOnCrucible = AFRAME.utils.bind(this.tongPlacedOnCrucible, this);
            this.cruciblePlacedOnTripod2 = AFRAME.utils.bind(this.cruciblePlacedOnTripod2, this);
            this.tongReplacedOnTable = AFRAME.utils.bind(this.tongReplacedOnTable, this);

            setTimeout(() => {
                this.stopwatchEntity.components["stopwatch-tool"].subscribe("minuteMark1", this.startPart05);
                this.stopwatchEntity.components["stopwatch-tool"].subscribe("minuteMark2", this.startPart05);
                this.stopwatchEntity.components["stopwatch-tool"].subscribe("minuteMark3", this.startCoolingTask);
            }, 300);

            this.minuteMark1FinishedCallbacks = [];
            this.stopBurnerSoundCallbacks = [];

            this.expSystem.registerTask(this.el, "05");
        });
    },

    subscribe(eventName, fn)
    {
        switch(eventName) {
            case "minuteMark1Finished":
              this.minuteMark1FinishedCallbacks.push(fn);
              break;
            case "stopBurnerSound":
                this.stopBurnerSoundCallbacks.push(fn);
                console.log(this.stopBurnerSoundCallbacks);
                break;
        }
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
        if(this.localStirBtnHeld != this.data.stirBtnHeld) {
            if(this.data.stirBtnHeld) 
                this.stirBtnDown();
            else if(this.data.stirBtnHeld == false)
                this.stirBtnUp();

            this.localStirBtnHeld = this.data.stirBtnHeld;
        }

        if(this.localOnClickCutBunsenBurner != this.data.onClickCutBunsenBurner) {
            this.cutBunsenBurner();
            this.localOnClickCutBunsenBurner = this.data.onClickCutBunsenBurner;
        }

        if(this.localOnClickTurnOffBunsenBurner != this.data.onClickTurnOffBunsenBurner) {
            this.turnOffBunsenBurner();
            this.localOnClickTurnOffBunsenBurner = this.data.onClickTurnOffBunsenBurner;
        }
    },
  
    tick: function() {
        if(this.measureTemp) {
            this.temp += 0.01;
            let roundedTemp = Math.round(this.temp);
            let displayTemp = roundedTemp + " °C";
            this.tempText.setAttribute("text", { value: displayTemp });
            if(this.temp > 500) {
                this.lowerBurnerTempBtn.object3D.visible = true;
            }
        }

        if(this.updatePos && this.stopStiring == false) {
            this.t += 0.03
            this.x = (Math.cos(this.t) * 0.02);
            this.z = (Math.sin(this.t) * 0.02);
            this.glassstickEntity.setAttribute("position", {x: this.x, y: 0, z: this.z});
            if(this.t > 10) {
                if(this.temp < 500) {
                    this.stopStir = true;
                    this.updatePos = false;
                    this.stiringBtn.object3D.visible = false;
                    this.stopwatchEntity.components["stopwatch-tool"].adjustSpeed(100);
                    this.minuteMark1FinishedCallbacks.forEach(cb => {
                        cb();
                    });
                }
                else if(this.temp >= 500) {
                    this.stopStir = true;
                    this.updatePos = false;
                    this.stiringBtn.object3D.visible = false;
                    this.glassStickSocket.components["entity-socket"].enableSocket();
                    this.glassStickSocket.components["entity-socket"].subscribe("onSnap", this.waitForCoolingTask);
                }
            }
        }
    },

    onHoldStirBtnDown() {
        NAF.utils.getNetworkedEntity(this.el).then(networkedEl => {
    
            NAF.utils.takeOwnership(networkedEl);
      
            this.el.setAttribute("first-experiment-05", "stirBtnHeld", true);      
      
            this.updateUI();
        });
    },

    onReleaseStirBtn() {
        NAF.utils.getNetworkedEntity(this.el).then(networkedEl => {
    
            NAF.utils.takeOwnership(networkedEl);
      
            this.el.setAttribute("first-experiment-05", "stirBtnHeld", false);      
      
            this.updateUI();
        });
    },

    stirBtnDown() {
        this.updatePos = true;
    },

    stirBtnUp() {
        this.updatePos = false;
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

    startPart05() {
        this.stopwatchEntity.components["stopwatch-tool"].adjustSpeed(1000);
        this.glassStickSocket.components["entity-socket"].enableSocket();
        this.glassStickSocket.components["entity-socket"].subscribe("onSnap", this.glassStickPlaced);
    },

    glassStickPlaced() {
        this.thermoSocket05.components["entity-socket"].enableSocket();
        this.glassStickSocket.components["entity-socket"].unsubscribe("onSnap", this.glassStickPlaced);
        this.thermoSocket05.components["entity-socket"].subscribe("onSnap", this.thermoRunning);
    },

    thermoRunning() {
        this.measureTemp = true;
        this.thermoSocket05.components["entity-socket"].unsubscribe("onSnap", this.thermoRunning);
        
        if(this.measuredCounter == 0) {
            setTimeout(() => {
                this.measuredCounter++;
                this.thermoSocketGeneral.components["entity-socket"].enableSocket();
                this.thermoSocketGeneral.components["entity-socket"].subscribe("onPickedUp", this.stopThermo);
                this.thermoSocketGeneral.components["entity-socket"].subscribe("onSnap", this.thermoOnTable);
            }, 4000);
        }

        if(this.measuredCounter > 0) {
            this.temp = 497;
            this.stopwatchEntity.components["stopwatch-tool"].adjustSpeed(1000);
        }
    },

    stopThermo() {
        this.measureTemp = false;
        this.tempText.setAttribute("text", { value: "0 °C" });
    },

    thermoOnTable() {
        this.glassStickSocketCrucible.components["entity-socket"].enableSocket();
        this.glassStickSocketCrucible.components["entity-socket"].subscribe("onSnap", this.startStiring);
    },

    startStiring() {
        this.stiringBtn.object3D.visible = true;
        this.stopStiring = false;
        this.glassStickSocketCrucible.components["entity-socket"].unsubscribe("onSnap", this.startStiring);
    },

    onCutBunsenBurnerClicked() {
        NAF.utils.getNetworkedEntity(this.el).then(networkedEl => {
    
            NAF.utils.takeOwnership(networkedEl);
      
            this.el.setAttribute("first-experiment-05", "onClickCutBunsenBurner", true);      
      
            this.updateUI();
        });
    },

    cutBunsenBurner() {
        this.measureTemp = false;
        console.log("feedback for lowering burner power missing...");
        this.thermoSocketGeneral.components["entity-socket"].enableSocket();
        this.thermoSocketGeneral.components["entity-socket"].subscribe("onSnap", this.thermoOnTable);
        this.lowerBurnerTempBtn.object3D.visible = false;
        this.t = 0;
    },

    waitForCoolingTask() {
        this.stopwatchEntity.components["stopwatch-tool"].adjustSpeed(100);
        this.glassStickSocket.components["entity-socket"].unsubscribe("onSnap", this.waitForCoolingTask);
    },

    startCoolingTask() {
        this.turnOffBurnerBtn.object3D.visible = true;
        this.stopwatchEntity.components["stopwatch-tool"].adjustSpeed(1000);
    },

    onTurnOffBunsenBurnerClicked() {
        NAF.utils.getNetworkedEntity(this.el).then(networkedEl => {
    
            NAF.utils.takeOwnership(networkedEl);
      
            this.el.setAttribute("first-experiment-05", "onClickTurnOffBunsenBurner", true);      
      
            this.updateUI();
        });
    },

    turnOffBunsenBurner() {
        this.turnOffBurnerBtn.object3D.visible = false;
        this.flameEntity.object3D.visible = false;
        this.stopBurnerSoundCallbacks.forEach(cb => {
            cb();
        });
        
        this.tongSocketCrucible.components["entity-socket"].enableSocket();
        this.tongSocketCrucible.components["entity-socket"].subscribe("onSnap", this.tongPlacedOnCrucible);
    },

    tongPlacedOnCrucible() {
        this.tongEntity.object3D.visible = false;
        this.attachedTongEntity.object3D.visible = true;
        this.crucibleSocket05.components["entity-socket"].enableSocket();
        this.crucibleSocket05.components["entity-socket"].subscribe("onSnap", this.cruciblePlacedOnTripod2);
        this.tongSocketCrucible.components["entity-socket"].unsubscribe("onSnap", this.tongPlacedOnCrucible);
    },

    cruciblePlacedOnTripod2() {
        this.tongEntity.setAttribute("position", {x: 0.6, y: 0, z: 0});
        this.tongEntity.object3D.visible = true;
        this.attachedTongEntity.object3D.visible = false;
        this.tongSocketGeneral.components["entity-socket"].enableSocket();
        this.tongSocketGeneral.components["entity-socket"].subscribe("onSnap", this.tongReplacedOnTable);
        this.crucibleSocket05.components["entity-socket"].unsubscribe("onSnap", this.cruciblePlacedOnTripod2);
    },

    tongReplacedOnTable() {
        this.tongSocketGeneral.components["entity-socket"].unsubscribe("onSnap", this.tongReplacedOnTable);
        this.stopwatchEntity.components["stopwatch-tool"].adjustSpeed(100);
    }

  });