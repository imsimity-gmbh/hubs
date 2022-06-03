import { cloneObject3D } from "../../utils/three-utils";
import { loadModel } from ".././gltf-model-plus";
import { waitForDOMContentLoaded } from "../../utils/async-utils";

import { THREE } from "aframe";


  AFRAME.registerComponent("first-experiment-05", {
    schema: {
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

            this.stopwatchEntity = this.sceneEl.querySelector(".stopwatch-tool");
            this.thermoEntity = this.sceneEl.querySelector(".thermo-entity");
            this.glassstickEntity = this.sceneEl.querySelector(".glass-stick-entity");

            this.measureTemp = false;
            this.temp = 150;
            this.tempText = this.thermoEntity.querySelector(".thermo-text");

            this.stiringBtn = this.sceneEl.querySelector(".stiring-btn");
            this.stiringBtn.object3D.addEventListener("holdable-button-down", () => this.stirBtnDown());
            this.stiringBtn.object3D.addEventListener("holdable-button-up", () => this.stirBtnUp());

            this.stopStiring = true;
            this.updatePos = false;
            this.x = 0;
            this.z = 0;
            this.t = 0;

            this.updateUI();

            this.firstExpPart04 = this.expSystem.getTaskById("04");
            if(this.firstExpPart04 != null)
                // this.firstExpPart03.components["first-experiment-03"].subscribe("onFinishPart03", this.startPart04);

            //bind Callback funtions:
            this.startPart05 = AFRAME.utils.bind(this.startPart05, this);
            this.glassStickPlaced = AFRAME.utils.bind(this.glassStickPlaced, this);
            this.thermoRunning = AFRAME.utils.bind(this.thermoRunning, this);
            this.stopThermo = AFRAME.utils.bind(this.stopThermo, this);
            this.thermoOnTable = AFRAME.utils.bind(this.thermoOnTable, this);
            this.startStiring = AFRAME.utils.bind(this.startStiring, this);
            this.thermoRunning02 = AFRAME.utils.bind(this.thermoRunning02, this);

            setTimeout(() => {
                this.stopwatchEntity.components["stopwatch-tool"].subscribe("minuteMark1", this.startPart05);
                this.stopwatchEntity.components["stopwatch-tool"].subscribe("minuteMark2", this.thermoRunning02);
            }, 300);

            this.expSystem.registerTask(this.el, "05");
        });
    },

    subscribe(eventName, fn)
    {
    },

    unsubscribe(eventName, fn)
    {
    },
    
    updateUI: function() {
    },
  
    tick: function() {
        if(this.measureTemp) {
            this.temp += 0.01;
            let roundedTemp = Math.round(this.temp);
            let displayTemp = roundedTemp + " °C";
            console.log(displayTemp);
            this.tempText.setAttribute("text", { value: displayTemp });
        }

        if(this.updatePos && this.stopStiring == false) {
            this.t += 0.03
            this.x = (Math.cos(this.t) * 0.02);
            this.z = (Math.sin(this.t) * 0.02);
            this.glassstickEntity.setAttribute("position", {x: this.x, y: 0, z: this.z});
            if(this.t > 2) {
                this.stopStir = true;
                this.updatePos = false;
                this.stiringBtn.object3D.visible = false;
                this.stopwatchEntity.components["stopwatch-tool"].adjustSpeed(100);
            }
        }
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
        this.thermoSocket05.components["entity-socket"].subscribe("onSnap", this.thermoRunning);
    },

    thermoRunning() {
        this.measureTemp = true;
        
        setTimeout(() => {
            this.thermoSocketGeneral.components["entity-socket"].enableSocket();
            this.thermoSocketGeneral.components["entity-socket"].subscribe("onPickedUp", this.stopThermo);
            this.thermoSocketGeneral.components["entity-socket"].subscribe("onSnap", this.thermoOnTable);
        }, 4000);
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

    thermoRunning02() {
        this.measureTemp = true;
        this.stopwatchEntity.components["stopwatch-tool"].adjustSpeed(1000);
    }

  });