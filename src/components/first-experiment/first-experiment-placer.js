import { waitForDOMContentLoaded } from "../../utils/async-utils";
import { cloneObject3D } from "../../utils/three-utils";

import { loadModel } from ".././gltf-model-plus";
import anchorModelSrc from "../../assets/models/GecoLab/scales.glb";

import { SOUND_SNAP_ENTITY } from "../../systems/sound-effects-system";
 
const anchorModelPromise = waitForDOMContentLoaded().then(() => loadModel(anchorModelSrc));

 AFRAME.registerComponent("first-experiment-placer", {
    schema: {
    },
  
    init: function() {

      console.log("Fist Experiment Placer");

      this.sceneEl = document.querySelector("a-scene");
      this.lastUpdate = performance.now();
     
      this.el.sceneEl.addEventListener("stateadded", () => this.updateUI());
      this.el.sceneEl.addEventListener("stateremoved", () => this.updateUI());

      this.updateUI();

      this.expSystem = this.el.sceneEl.systems["first-experiments"];
      this.expSystem.registerPlacer(this.el);

      waitForDOMContentLoaded().then(() => { 
         
        this.myPlaceButton = this.el.querySelector(".first-experiment-placer-button"); 
        this.myPlaceButton.object3D.addEventListener("interact", () => this.onPlaceButtonClick());

        anchorModelPromise.then(model => {

          console.log("Loaded mesh");

          const mesh = cloneObject3D(model.scene);
          mesh.scale.set(3, 3, 3);
          mesh.rotation.set(0, 1.5708, 0); // Rotate 90°
          mesh.matrixNeedsUpdate = true;
          this.el.setObject3D("mesh", mesh);
    
          this.el.object3D.visible = true;
          this.el.object3D.scale.set(1.0, 1.0, 1.0);
          this.el.object3D.matrixNeedsUpdate = true;
        });

      });
    },
    
    updateUI: function() {

    },
  
    tick: function() {

    },

    getAnchor: function () {
      return this.el;
    },

    remove: function () {
      this.expSystem.deregisterPlacer(this.el);
    },

    onPlaceButtonClick: function () {

      this.el.sceneEl.systems["hubs-systems"].soundEffectsSystem.playSoundOneShot(SOUND_SNAP_ENTITY);
      // Hide button & mesh
      this.myPlaceButton.object3D.visible = false;

      this.el.removeObject3D("mesh");
    }
  });