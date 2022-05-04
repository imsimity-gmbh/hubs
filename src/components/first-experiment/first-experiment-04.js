import { cloneObject3D } from "../../utils/three-utils";
import { loadModel } from ".././gltf-model-plus";
import { waitForDOMContentLoaded } from "../../utils/async-utils";

import stopwatchModelSrc from "../../assets/stopwatch_tool.glb";
import { THREE } from "aframe";

const stopwatchModelPromise = waitForDOMContentLoaded().then(() => loadModel(stopwatchModelSrc));

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

            this.stopwatchEntity = this.sceneEl.querySelector(".stopwatch-entity");
            this.spawnItem(stopwatchModelPromise, new THREE.Vector3(0, 1.8, -0.5), 0.03, this.stopwatchEntity, true);

            this.updateUI();

            console.log("04");

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

  });