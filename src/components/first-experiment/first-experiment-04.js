import { cloneObject3D } from "../../utils/three-utils";
import { loadModel } from ".././gltf-model-plus";
import { waitForDOMContentLoaded } from "../../utils/async-utils";

import stopwatchModelSrc from "../../assets/stopwatch_tool.glb";
import { THREE } from "aframe";

const stopwatchModelPromise = waitForDOMContentLoaded().then(() => loadModel(stopwatchModelSrc));

//!! Hide Sockets onPickedUp!!
/*-Get crucible and make it placable on tripod (done)
- After clicking start place lighter on socket -> ignite
- Stoppuhr appears (rewrite component for automatic interaction)
- Add btns for different power levels and give feedback on which is best
---> done, next step  */

  AFRAME.registerComponent("first-experiment-04", {
    schema: {
    },
  
    init: function() {
        this.sceneEl = document.querySelector("a-scene");
        this.lastUpdate = performance.now();
        
        this.el.sceneEl.addEventListener("stateadded", () => this.updateUI());
        this.el.sceneEl.addEventListener("stateremoved", () => this.updateUI());

        waitForDOMContentLoaded().then(() => { 
            this.expSystem = this.el.sceneEl.systems["first-experiments"];

            this.crucibleEntity = this.sceneEl.querySelector(".crucible-entity");
            this.firelighterEntity = this.sceneEl.querySelector(".firelighter-entity");
            this.glassstickEntity = this.sceneEl.querySelector(".glass-stick-entity");

            this.crucibleSocketTripod = this.el.querySelector(".crucible-socket-04");
            this.crucibleSocketTripod.object3D.visible = false;

            this.firelighterSocketGeneral = this.sceneEl.querySelector(".firelighter-socket");

            this.firelighterSocketTripod = this.el.querySelector(".firelighter-socket-04");
            this.firelighterSocketTripod.object3D.visible = false;

            this.glassstickSocket = this.el.querySelector(".glass-stick-socket-04");
            this.glassstickSocket.object3D.visible = false;
            this.x = 0;
            this.z = 0;
            this.t = 0;

            this.startBtn = this.el.querySelector(".start-burner-btn");
            this.startBtn.object3D.addEventListener("interact", () => this.onStartBurner());
            this.startBtn.object3D.visible = false;

            this.startStiring = false;

            this.updateUI();

            //bind Callback funtions:
            this.startPart04 = AFRAME.utils.bind(this.startPart04, this);
            this.onPlacedCrucible = AFRAME.utils.bind(this.onPlacedCrucible, this);
            this.onLightBurner = AFRAME.utils.bind(this.onLightBurner, this);
            this.onReplaceLighter = AFRAME.utils.bind(this.onReplaceLighter, this);
            this.onPlaceGlassstick = AFRAME.utils.bind(this.onPlaceGlassstick, this);

            this.firstExpPart03 = this.expSystem.getTaskById("03");
            this.firstExpPart03.components["first-experiment-03"].subscribe("onFinishPart03", this.startPart04);

            this.expSystem.registerTask(this.el, "04");
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
        if(this.startStiring == false)
            return;

        let x = 0;
        let z = 0;
        let t = 0;

        let updatePos = false;

        document.addEventListener('keydown', function(event) {
            if(event.keyCode == 66) {
                t += 1
                x = (Math.cos(t) * 0.3);
                console.log(x);
                z = (Math.sin(t) * 0.3);
                console.log(z);
                updatePos = true;
            }
            else if(event.keyCode == 78) {
                t -= 1
                x = (Math.cos(t) * 0.3);
                console.log(x);
                z = (Math.sin(t) * 0.3);
                console.log(z);
                updatePos = true;
            }
        });

        if(updatePos) {
            this.glassstickEntity.setAttribute("position", {x: x, y: 0, z: z});
        }
    },

    startPart04() {
        this.crucibleSocketTripod.object3D.visible = true;
        this.crucibleSocketTripod.components["entity-socket"].showSocket();
        this.crucibleEntity.setAttribute("tags", {isHandCollisionTarget: true, isHoldable: true});
        this.crucibleSocketTripod.components["entity-socket"].subscribe("onSnap", this.onPlacedCrucible);
        this.sceneEl.emit("action_toggle_stopwatch");
    },

    spawnItem(promise, position, scale, entity, show) {
        promise.then(model => {
            entity.object3D.visible = false;
            const mesh = cloneObject3D(model.scene);
            mesh.scale.set(scale, scale, scale);
            mesh.matrixNeedsUpdate = true;
            entity.setObject3D("mesh", mesh);
        
            if(show)
                entity.object3D.visible = true;

            entity.object3D.scale.set(1.0, 1.0, 1.0);
            entity.setAttribute("position", {x: position.x, y: position.y, z: position.z});
            entity.object3D.matrixNeedsUpdate = true;
        });
    },

    onPlacedCrucible() {
        this.startBtn.object3D.visible = true;
    },

    onStartBurner() {
        this.startBtn.object3D.visible = false;
        this.firelighterSocketTripod.object3D.visible = true;
        this.firelighterSocketTripod.components["entity-socket"].showSocket();
        this.firelighterSocketTripod.components["entity-socket"].subscribe("onSnap", this.onLightBurner);
        this.firelighterEntity.setAttribute("tags", {isHandCollisionTarget: true, isHoldable: true});
    },

    onLightBurner() {
        this.stopwatchEntity = this.sceneEl.querySelector(".stopwatch-tool");
        this.stopwatchEntity.components["stopwatch-tool"].onStartTimer();
        this.firelighterSocketGeneral.object3D.visible = true;
        this.firelighterSocketGeneral.components["entity-socket"].showSocket();
        this.firelighterSocketGeneral.components["entity-socket"].subscribe("onSnap", this.onReplaceLighter);
        this.firelighterEntity.setAttribute("tags", {isHandCollisionTarget: true, isHoldable: true});
    },

    onReplaceLighter() {
        this.glassstickSocket.object3D.visible = true;
        this.glassstickSocket.components["entity-socket"].showSocket();
        this.glassstickSocket.components["entity-socket"].subscribe("onSnap", this.onPlaceGlassstick);
        this.glassstickEntity.setAttribute("tags", {isHandCollisionTarget: true, isHoldable: true});
    },

    onPlaceGlassstick() {
        this.startStiring = true;
    },

    stirLeft(t) {
        let x = Math.sin(t) + 1.5;
        let z = Math.cos(t) - 0.3;
        this.glassstickEntity.setAttribute("position", {x: x, y: 0.79, z: z});
    },
    
    stirRight() {

    }

  });