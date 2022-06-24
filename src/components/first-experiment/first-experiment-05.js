import { cloneObject3D } from "../../utils/three-utils";
import { loadModel } from ".././gltf-model-plus";
import { waitForDOMContentLoaded } from "../../utils/async-utils";

import { THREE } from "aframe";

/* Same as before: Buttons networked, maybe button called on spawn like in 03+04, entity-socket callbacks not yet  */

  AFRAME.registerComponent("first-experiment-05", {
    schema: {
        stirBtnHeld: {default: false},
        ctrlBtnClicked: {default: false},
        ctrlBtnIndex: {default: 2},
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

            this.stopwatchEntity = this.sceneEl.querySelector(".stopwatch-tool");
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

            this.ctrlBtn00 = this.sceneEl.querySelector(".burner-ctrl-btn-0");
            this.ctrlBtn00.object3D.addEventListener("interact", () => this.onClickCtrlBtn(0));
            this.ctrlBtn01 = this.sceneEl.querySelector(".burner-ctrl-btn-1");
            this.ctrlBtn01.object3D.addEventListener("interact", () => this.onClickCtrlBtn(1));
            this.ctrlBtn02 = this.sceneEl.querySelector(".burner-ctrl-btn-2");
            this.ctrlBtn02.object3D.addEventListener("interact", () => this.onClickCtrlBtn(2));
            this.ctrlBtn03 = this.sceneEl.querySelector(".burner-ctrl-btn-3");
            this.ctrlBtn03.object3D.addEventListener("interact", () => this.onClickCtrlBtn(3));

            this.ctrlBtnBlocked = true;
            this.localCtrlBtnClicked = false;
            this.localCtrlBtnIndex = 2;

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

        if(this.localCtrlBtnClicked != this.data.ctrlBtnClicked) {
            this.localCtrlBtnIndex = this.data.ctrlBtnIndex;
            if(this.localCtrlBtnIndex == 2)
                this.cutBunsenBurner();
            if(this.localCtrlBtnIndex == 1)
                this.turnOffBunsenBurner();
            this.localCtrlBtnClicked = this.data.ctrlBtnClicked;
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
                this.ctrlBtn02.object3D.visible = true;
                this.ctrlBtnBlocked = false;
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

    onClickCtrlBtn(index) {
        if(this.ctrlBtnBlocked)
            return;

        NAF.utils.getNetworkedEntity(this.el).then(networkedEl => {
    
            NAF.utils.takeOwnership(networkedEl);
      
            this.el.setAttribute("first-experiment-05", "ctrlBtnClicked", !this.data.ctrlBtnClicked);
            this.el.setAttribute("first-experiment-05", "ctrlBtnIndex", index)      
      
            this.updateUI();
        });
    },

    cutBunsenBurner() {
        this.ctrlBtnBlocked = true;
        this.measureTemp = false;
        this.ctrlBtn02.object3D.visible = false;
        this.ctrlBtn01.object3D.visible = true;
        setTimeout(() => {
            this.thermoSocketGeneral.components["entity-socket"].enableSocket();
            this.thermoSocketGeneral.components["entity-socket"].subscribe("onSnap", this.thermoOnTable);
            this.t = 0;
            this.ctrlBtn01.object3D.visible = false;
        }, 500);
    },

    waitForCoolingTask() {
        this.stopwatchEntity.components["stopwatch-tool"].adjustSpeed(100);
        this.glassStickSocket.components["entity-socket"].unsubscribe("onSnap", this.waitForCoolingTask);
    },

    startCoolingTask() {
        this.ctrlBtn01.object3D.visible= true;
        this.ctrlBtnBlocked = false;
        this.stopwatchEntity.components["stopwatch-tool"].adjustSpeed(1000);
    },

    turnOffBunsenBurner() {
        this.ctrlBtnBlocked = true;
        this.flameEntity.object3D.visible = false;
        this.ctrlBtn01.object3D.visible = false;
        this.ctrlBtn00.object3D.visible = true;
        this.stopBurnerSoundCallbacks.forEach(cb => {
            cb();
        });
        setTimeout(() => {
            this.ctrlBtn00.object3D.visible = false;
            this.tongSocketCrucible.components["entity-socket"].enableSocket();
            this.tongSocketCrucible.components["entity-socket"].subscribe("onSnap", this.tongPlacedOnCrucible);
        }, 500);
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