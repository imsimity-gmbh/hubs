import { SOUND_BURNER_SOUND } from "../../systems/sound-effects-system";

import { cloneObject3D } from "../../utils/three-utils";
import { loadModel } from ".././gltf-model-plus";
import { waitForDOMContentLoaded } from "../../utils/async-utils";

import flameModelSrc from "../../assets/models/GecoLab/flame.glb";
import { THREE } from "aframe";

const flameModelPromise = waitForDOMContentLoaded().then(() => loadModel(flameModelSrc));

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
            this.scaleEntity = this.sceneEl.querySelector(".scale-entity");
            this.firelighterEntity = this.sceneEl.querySelector(".firelighter-entity");
            this.flameEntity = this.sceneEl.querySelector(".flame-entity");
            this.glassstickEntity = this.sceneEl.querySelector(".glass-stick-entity");
            this.stopwatchEntity = this.sceneEl.querySelector(".stopwatch-tool");

            this.crucibleSocketTripod = this.el.querySelector(".crucible-socket-04");

            this.firelighterSocketGeneral = this.sceneEl.querySelector(".firelighter-socket");

            this.firelighterSocketTripod = this.el.querySelector(".firelighter-socket-04");

            this.glassstickSocket = this.el.querySelector(".glass-stick-socket-04");

            this.stopStir = false;
            this.updatePos = false;
            this.x = 0;
            this.z = 0;
            this.t = 0;

            this.startBtn = this.el.querySelector(".start-burner-btn");
            this.startBtn.object3D.addEventListener("interact", () => this.onStartBurner());
            this.startBtn.object3D.visible = false;

            this.stiringBtn = this.el.querySelector(".stiring-btn");
            this.stiringBtn.object3D.addEventListener("holdable-button-down", () => this.stirBtnDown());
            this.stiringBtn.object3D.addEventListener("holdable-button-up", () => this.stirBtnUp());
            this.stiringBtn.object3D.visible = false;

            this.updateUI();

            //bind Callback funtions:
            this.startPart04 = AFRAME.utils.bind(this.startPart04, this);
            this.onPlacedCrucible = AFRAME.utils.bind(this.onPlacedCrucible, this);
            this.onLightBurner = AFRAME.utils.bind(this.onLightBurner, this);
            this.onReplaceLighter = AFRAME.utils.bind(this.onReplaceLighter, this);
            this.onPlaceGlassstick = AFRAME.utils.bind(this.onPlaceGlassstick, this);
            this.stopBurnerSound = AFRAME.utils.bind(this.stopBurnerSound, this);

            this.firstExpPart03 = this.expSystem.getTaskById("03");
            this.firstExpPart05 = this.sceneEl.querySelector(".part05-wrapper");
            if(this.firstExpPart03 != null)
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
        if(this.updatePos && this.stopStir == false) {
            this.t += 0.03
            this.x = (Math.cos(this.t) * 0.02);
            this.z = (Math.sin(this.t) * 0.02);
            this.glassstickEntity.setAttribute("position", {x: this.x, y: 0, z: this.z});
            if(this.t > 10) {
                this.stopStir = true;
                this.updatePos = false;
                this.stiringBtn.object3D.visible = false;
                this.stopwatchEntity.components["stopwatch-tool"].adjustSpeed(100);
            }
        }
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

    stirBtnDown() {
        this.updatePos = true;
    },

    stirBtnUp() {
        this.updatePos = false;
    },

    startPart04() {
        this.crucibleSocketTripod.components["entity-socket"].enableSocket();
        this.crucibleSocketTripod.components["entity-socket"].subscribe("onSnap", this.onPlacedCrucible);
        this.stopwatchEntity = this.sceneEl.querySelector(".stopwatch-tool");
        this.stopwatchEntity.object3D.visible = true;
    },

    onPlacedCrucible() {
        this.startBtn.object3D.visible = true;
        this.scaleEntity.components["waage-tool"].tara(false);
    },

    onStartBurner() {
        this.loopedBurnerSound = this.sceneEl.systems["hubs-systems"].soundEffectsSystem.playSoundLooped(SOUND_BURNER_SOUND);
        this.firstExpPart05.components["first-experiment-05"].subscribe("stopBurnerSound", this.stopBurnerSound);
        this.startBtn.object3D.visible = false;
        this.firelighterSocketTripod.components["entity-socket"].enableSocket();
        this.firelighterSocketTripod.components["entity-socket"].subscribe("onSnap", this.onLightBurner);
    },

    onLightBurner() {
        this.stopwatchEntity.components["stopwatch-tool"].onStartTimer();
        this.firelighterSocketGeneral.components["entity-socket"].enableSocket();
        this.firelighterSocketGeneral.components["entity-socket"].subscribe("onSnap", this.onReplaceLighter);
        this.spawnItem(flameModelPromise, new THREE.Vector3(0, 0.41, 0), this.flameEntity, true);
        this.flameEntity.components["simple-animation"].printAnimations();
        console.log(this.flameEntity.object3D);
    },

    onReplaceLighter() {
        this.glassstickSocket.components["entity-socket"].enableSocket();
        this.glassstickSocket.components["entity-socket"].subscribe("onSnap", this.onPlaceGlassstick);
    },

    onPlaceGlassstick() {
        this.stiringBtn.object3D.visible = true;
        this.glassstickSocket.components["entity-socket"].unsubscribe("onSnap", this.onPlaceGlassstick);
    },

    stopBurnerSound() {
        this.sceneEl.systems["hubs-systems"].soundEffectsSystem.stopSoundNode(this.loopedBurnerSound);
    }

  });