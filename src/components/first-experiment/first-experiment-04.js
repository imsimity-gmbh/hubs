import { cloneObject3D } from "../../utils/three-utils";
import { loadModel } from ".././gltf-model-plus";
import { waitForDOMContentLoaded } from "../../utils/async-utils";

import stopwatchModelSrc from "../../assets/stopwatch_tool.glb";
import { THREE } from "aframe";

const stopwatchModelPromise = waitForDOMContentLoaded().then(() => loadModel(stopwatchModelSrc));

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

            this.crucibleSocketTripod = this.el.querySelector(".crucible-socket-04");
            this.crucibleSocketTripod.object3D.visible = false;

            this.crucibleSocketScale = this.sceneEl.querySelector(".crucible-socket");
            this.firelighterSocketGeneral = this.sceneEl.querySelector(".firelighter-socket");

            this.firelighterSocketTripod = this.el.querySelector(".firelighter-socket-04");
            this.firelighterSocketTripod.object3D.visible = false;

            this.startBtn = this.el.querySelector(".start-burner-btn");
            this.startBtn.object3D.addEventListener("interact", () => this.onStartBurner());
            this.startBtn.object3D.visible = false;

            this.stopwatchEntity = this.el.querySelector(".stopwatch-entity");
            this.stopwatchEntity.object3D.visible = false;

            this.updateUI();

            //bind Callback funtions:
            this.startPart04 = AFRAME.utils.bind(this.startPart04, this);
            this.onPlacedCrucible = AFRAME.utils.bind(this.onPlacedCrucible, this);
            this.onPlacedLighter = AFRAME.utils.bind(this.onPlacedLighter, this);

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

    },

    startPart04() {
        this.crucibleSocketTripod.object3D.visible = true;
        this.crucibleEntity.setAttribute("tags", {isHandCollisionTarget: true, isHoldable: true});
        this.crucibleSocketTripod.components["entity-socket"].subscribe("onSnap", this.onPlacedCrucible);
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
        this.crucibleSocketScale.object3D.visible = false;
        this.startBtn.object3D.visible = true;
    },

    onStartBurner() {
        this.startBtn.object3D.visible = false;
        this.firelighterSocketTripod.object3D.visible = true;
        this.firelighterSocketTripod.components["entity-socket"].subscribe("onSnap", this.onPlacedLighter);
        this.firelighterEntity.setAttribute("tags", {isHandCollisionTarget: true, isHoldable: true});
    },

    onPlacedLighter() {
        this.stopwatchEntity.object3D.visible = true;
        this.stopwatchEntity.components["stopwatch-tool"].onStartTimer();
        this.firelighterSocketGeneral.object3D.visible = true;
        this.firelighterEntity.setAttribute("tags", {isHandCollisionTarget: true, isHoldable: true});
    }

  });