/**
 * Entity Socket for snapping objects into places
 * @component entity-socket
 */

/* 
Fixing plan:
1. new schema to define of socket is disabled on start
2. function "hide" to disable functionality from another script
3. function "show" to enable functionality from another script
*/

import { SOUND_HOVER_ENTER, SOUND_SNAP_ENTITY } from "../systems/sound-effects-system";

import { waitForDOMContentLoaded } from "../utils/async-utils";

import { IMSIMITY_INIT_DELAY } from '../utils/imsimity';

import { Vector3 } from "three";

const blueRGB = new Vector3(0.165, 0.38, 0.749);
const greenRGB = new Vector3(0.36, 0.91, 0.47);

 AFRAME.registerComponent("entity-socket", {
    schema: {
      triggerOnSnap: {default: false},
      triggerOnPickedUp: {default: false},
      triggerOnRelease: {default: false},
      acceptedEntities: {default: []},
      radius: {default: 0},
      enabled: {default: true},
    },
  
    init: function() {
      
      //Select necessary components:
      this.sceneEl = document.querySelector("a-scene");
      this.root = this.el.querySelector(".root");
      this.hoverMeshes = this.el.querySelector(".hover-meshes");

      //Get List of accepted Entities and store copy of their meshes in hover-meshes:
      this.acceptedEntities = []; 

      
      this.radius = this.data.radius;

  
      this.heldEntity = null;
      this.wasHeldEntity = null;
      this.inRadiusEntity = null;
      this.attachedEntity = null;

      this.distance = this.radius + 1; 

      this.objectReleased = true;

      this.localTriggerOnSnap = false;
      this.localTriggerOnPickedUp = false;
      this.localTriggerOnRelease = false;

      //Observer-Arrays:
      this.onPickedUpCallbacks = [];
      this.onHoverEnterCallbacks = [];
      this.onHoverExitCallbacks = [];
      this.onReleasedCallbacks = [];
      this.onSnapCallbacks = [];

      //Disabled on Start?:
      this.socketEnabled = this.data.enabled;

      this.delayedInit = AFRAME.utils.bind(this.delayedInit, this);
      this.placeAttachedEntityLocal = AFRAME.utils.bind(this.placeAttachedEntityLocal, this);

      setTimeout(() => {
        waitForDOMContentLoaded().then(() => { 
          const sceneEl = this.el.sceneEl;
          this.experiment02 = sceneEl.systems["first-experiments"].getTaskById("02");
          
          console.log(this.experiment02);
  
          if (this.experiment02)
          {
            // TODO: unsubscribe on delete
            this.experiment02.components["first-experiment-02"].subscribe('onObjectSpawnedPart02', this.delayedInit);
          }
          else
          {
            console.log('ERROR ! entity-socket not well initialized');
          }
  
        });    
      }, IMSIMITY_INIT_DELAY * 0.5);
    
    },

    delayedInit()
    {
      console.log('Delayed init');
      for(let i = 0; i < this.data.acceptedEntities.length; i++) {
        let component = this.sceneEl.querySelector(this.data.acceptedEntities[i]);
        if(component == null) {
          console.log("entity -" + this.data.acceptedEntities[i] + "- not found, this entity will not be considered by the socket");
          continue;
        }
        this.acceptedEntities.push(component);

        //Create empty a-entity for hovermesh and copy mesh of original entity
        let hoverMeshEntity = document.createElement("a-entity");

        //apply material to clonedMesh and it's children
        this.applyMaterial(hoverMeshEntity, component, blueRGB);

        hoverMeshEntity.setAttribute("position", {x: 0, y: 0, z: 0});
        hoverMeshEntity.setAttribute("rotation", {x: 0, y: 0, z: 0});

        this.hoverMeshes.appendChild(hoverMeshEntity);
      }

      let acceptedEntity = this.sceneEl.querySelector(this.data.acceptedEntities[0]);
      this.initialPos = new Vector3().copy(acceptedEntity.object3D.position);

      let temp = new Vector3();
      this.root.object3D.getWorldPosition(temp);
      this.rootPos = temp;

      this.meshIndex = 0;
      
      this.rootRot = this.root.getAttribute("rotation");

      if(this.socketEnabled == false) 
        this.hoverMeshes.children[this.meshIndex].object3D.visible = false;
    },

    subscribe(eventName, fn)
    {
      switch(eventName) {
        case "onPickedUp":
          this.onPickedUpCallbacks.push(fn);
          break;
        case "onHoverEnter":
          this.onHoverEnterCallbacks.push(fn);
          break;
        case "onHoverExit":
          this.onHoverExitCallbacks.push(fn);
          break;
        case "onReleased":
          this.onReleasedCallbacks.push(fn);
          break;
        case "onSnap":
          this.onSnapCallbacks.push(fn);
          break;
      }
    },

    unsubscribe(eventName, fn)
    {
      switch(eventName) {
        case "onPickedUp":
          let index = this.onPickedUpCallbacks.indexOf(fn);
          this.onPickedUpCallbacks.splice(index, 1);
          break;
        case "onHoverEnter":
          let index2 = this.onHoverEnterCallbacks.indexOf(fn);
          this.onHoverEnterCallbacks.splice(index2, 1);
          break;
        case "onHoverExit":
          let index3 = this.onHoverExitCallbacks.indexOf(fn);
          this.onHoverExitCallbacks.splice(index3, 1);
          break;
        case "onReleased":
          let index4 = this.onReleasedCallbacks.indexOf(fn);
          this.onReleasedCallbacks.splice(index4, 1);
          break;
        case "onSnap":
          let index5 = this.onSnapCallbacks.indexOf(fn);
          this.onSnapCallbacks.splice(index5, 1);
          break;
      }
    },

    update() {
      waitForDOMContentLoaded().then(() => { 
        this.updateUI();
      });
    },

    updateUI: function() {

      if(this.localTriggerOnSnap != this.data.triggerOnSnap) {

        if (this.data.triggerOnSnap == true)
        {
          console.log('Snap');

          this.hoverMeshes.children[this.meshIndex].object3D.visible = false;
          this.playSound(SOUND_SNAP_ENTITY);

          // Hack to parent without parenting
          this.attachedEntity = this.acceptedEntities[0];

          this.attachedEntity.setAttribute("tags", {isHandCollisionTarget: false, isHoldable: false});
          
          // Looks like this is shite
          this.placeAttachedEntityLocal();

          this.onSnapCallbacks.forEach(cb => {
            cb();
          });
        }
      }

      if(this.localTriggerOnPickedUp != this.data.triggerOnPickedUp) {

        if (this.data.triggerOnSnap == true)
        {
          console.log('PickUp');

          this.disableSocket();

          this.attachedEntity = null;

          this.onPickedUpCallbacks.forEach(cb => {
            cb();
          });
          
        }
        
      }

      if(this.localTriggerOnRelease != this.data.triggerOnRelease) {

        if (this.data.triggerOnRelease == true)
        {
          console.log('Release');

          this.acceptedEntities[0].object3D.position.set(this.initialPos.x, this.initialPos.y, this.initialPos.z);

          this.onReleasedCallbacks.forEach(cb => {
            cb();
          });
        }
      }

      this.localTriggerOnSnap = this.data.localTriggerOnSnap;
      this.localTriggerOnPickedUp = this.data.triggerOnPickedUp;
      this.localTriggerOnRelease = this.data.triggerOnRelease;

      console.log(this.localTriggerOnRelease);
    },
  
    tick: function() {
      
      for(let i = 0; i < this.acceptedEntities.length; i++) {
        if(this.el.sceneEl.systems.interaction.isHeld(this.acceptedEntities[i])) {
          if(this.heldEntity == null)
          {
            console.log("Holding a new object")
            this.onHeld();
          }

          if(this.heldEntity == null && this.objectReleased && this.socketEnabled) {
            this.onPickedUp(this.acceptedEntities[i]);
            this.meshIndex = i;
            this.objectReleased = false;
          }
        }
      }

      if(this.heldEntity != null) {
        if(this.el.sceneEl.systems.interaction.isHeld(this.heldEntity)) {
          let worldHeldPos = new Vector3();
          this.heldEntity.object3D.getWorldPosition(worldHeldPos);
          this.distance = this.rootPos.distanceTo(worldHeldPos); //Measure distance between root and heldEntity
          console.log("Held Distance : " + this.distance);
          if(this.distance < this.radius) {
            this.onHoverEnter(this.heldEntity);
          }
        }
        else {
          this.onReleased(this.heldEntity);
        }
      }

      if(this.inRadiusEntity != null) {
        if(this.el.sceneEl.systems.interaction.isHeld(this.inRadiusEntity)) {
          let worldHeldPos = new Vector3();
          this.inRadiusEntity.object3D.getWorldPosition(worldHeldPos);
          this.distance = this.rootPos.distanceTo(worldHeldPos);
          console.log("In Radius Distance : " + this.distance);
          if(this.distance > this.radius)
            this.onHoverExit(this.inRadiusEntity);
        }
        else {
          this.onSnap(this.inRadiusEntity);
        }
      }
      
    },

    onPickedUp(entity)
    {
      console.log('onPickedUp');
      console.log(this);

      if(entity == this.attachedEntity) {
        // this.attachedEntity.object3D.removeFromParent();
        this.attachedEntity = null;
        this.heldEntity = null;
        this.objectReleased = true;
        console.log("about to hide socket");
        

        // Network
        NAF.utils.getNetworkedEntity(this.el).then(networkedEl => {
      
          NAF.utils.takeOwnership(networkedEl);
          
          this.el.setAttribute("entity-socket", "triggerOnSnap", false); 
          this.el.setAttribute("entity-socket", "triggerOnPickedUp", true); 
        });

        return;
      }
      
      entity.setAttribute("floaty-object", {autoLockOnRelease: true});
      this.heldEntity = entity;

      
    },

    onHoverEnter(entity)
    {
      if(this.attachedEntity != null) 
        return;

      this.hoverMeshes.children[this.meshIndex].object3D.visible = true;
      this.applyMaterial(this.hoverMeshes.children[this.meshIndex], this.hoverMeshes.children[this.meshIndex], greenRGB);

      this.playSound(SOUND_HOVER_ENTER);

      this.heldEntity = null;
      this.inRadiusEntity = entity;

      this.onHoverEnterCallbacks.forEach(cb => {
        cb(entity);
      });
    },

    onHoverExit(entity)
    {
      if(this.attachedEntity != null)
        return;

      this.applyMaterial(this.hoverMeshes.children[this.meshIndex], this.hoverMeshes.children[this.meshIndex], blueRGB);

      this.inRadiusEntity = null;
      this.heldEntity = entity;

      this.onHoverExitCallbacks.forEach(cb => {
        cb(entity);
      });
    },

    onReleased(entity)
    {
      console.log("releasing");

      this.heldEntity = null;
      this.wasHeldEntity = entity;
      this.objectReleased = true;
      
      NAF.utils.getNetworkedEntity(this.el).then(networkedEl => {
      
        NAF.utils.takeOwnership(networkedEl);
        
        this.el.setAttribute("entity-socket", "triggerOnRelease", true); 
      });

    },

    onSnap(entity)
    {
      console.log('onSnap');

      if(this.attachedEntity != null)
        return;

      this.attachedEntity = entity;
      
      this.objectReleased = true;

      this.inRadiusEntity = null;

      // Network
      NAF.utils.getNetworkedEntity(this.el).then(networkedEl => {
    
        NAF.utils.takeOwnership(networkedEl);
  
        this.el.setAttribute("entity-socket", "triggerOnSnap", true); 
        this.el.setAttribute("entity-socket", "triggerOnPickedUp", false); 
      });
      
    },

    onHeld()
    {
      NAF.utils.getNetworkedEntity(this.el).then(networkedEl => {
    
        NAF.utils.takeOwnership(networkedEl);

        this.el.setAttribute("entity-socket", "triggerOnRelease", false);
      });
    },

    applyMaterial(entity, meshToClone, color)
    {
      let mesh = meshToClone.getObject3D('mesh');
      let clonedMesh = mesh.clone();

      //create blue material for hover-effect
      let hoverMaterial = new THREE.MeshBasicMaterial();
      hoverMaterial.color.setRGB(color.x, color.y, color.z);
      hoverMaterial.transparent = true;
      hoverMaterial.opacity = 0.55;
      hoverMaterial.flatShading = true;
      clonedMesh.material = hoverMaterial;

      for(let i = 0; i < clonedMesh.children.length; i++) {
        clonedMesh.children[i].material = hoverMaterial;
      }

      entity.setObject3D("mesh", clonedMesh);

      // if(entity.children.length > 0)
      //   this.applyMaterial(entity.children[0], entity.children[0], red, green, blue);
    },

    playSound(soundId)
    {
      const sceneEl = this.el.sceneEl;
      sceneEl.systems["hubs-systems"].soundEffectsSystem.playSoundOneShot(soundId);
    },

    enableSocket() {
      this.socketEnabled = true;
      this.objectReleased = true;
      
      this.localTriggerOnSnap = false;
      this.localTriggerOnRelease = false;
      this.localTriggerOnPickedUp = false;

      // Reseting values
      setTimeout(() => {
        this.data.triggerOnSnap = false; 
        this.data.triggerOnPickedUp = false;
        this.data.triggerOnRelease = false;        
      }, IMSIMITY_INIT_DELAY);
      
      if (this.initialPos)
      {
        let acceptedEntity = this.sceneEl.querySelector(this.data.acceptedEntities[0]);
        this.initialPos = new Vector3().copy(acceptedEntity.object3D.position);  
      }
      
      
      // error hoverMeshes mortar
      this.hoverMeshes.children[this.meshIndex].object3D.visible = true;
      this.applyMaterial(this.hoverMeshes.children[this.meshIndex], this.hoverMeshes.children[this.meshIndex], blueRGB);

      for(let i = 0; i < this.acceptedEntities.length; i++) {
        this.acceptedEntities[i].setAttribute("tags", {isHandCollisionTarget: true, isHoldable: true});
      }
    },

    disableSocket() {
      this.socketEnabled = false;
      this.hoverMeshes.children[this.meshIndex].object3D.visible = false;

      this.heldEntity = null;
      this.wasHeldEntity = null;
      this.inRadiusEntity = null;
      this.attachedEntity = null;
    },

    placeAttachedEntityLocal()
    {
      var parent = this.attachedEntity.object3D.parent;
        
      this.root.object3D.attach(this.attachedEntity.object3D);

      this.attachedEntity.object3D.position.set(0, 0, 0);
      this.attachedEntity.object3D.rotation.set(0, 0, 0);

      parent.attach(this.attachedEntity.object3D);
    }
  });
  