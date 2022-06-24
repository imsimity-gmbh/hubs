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

import { Vector3 } from "three";

const blueRGB = new Vector3(0.165, 0.38, 0.749);
const greenRGB = new Vector3(0.36, 0.91, 0.47);

 AFRAME.registerComponent("entity-socket", {
    schema: {
      acceptedEntities: {default: []},
      radius: {default: 0},
      snappedEntity: {default: ""},
      enabled: {default: true}
    },
  
    init: function() {
      
      //Select necessary components:
      this.sceneEl = document.querySelector("a-scene");
      this.root = this.el.querySelector(".root");
      this.hoverMeshes = this.el.querySelector(".hover-meshes");

      let temp = new Vector3();
      this.root.object3D.getWorldPosition(temp);
      this.rootPos = temp;

      //Get List of accepted Entities and store copy of their meshes in hover-meshes:
      this.acceptedEntities = []; 
      for(let i = 0; i < this.data.acceptedEntities.length; i++) {
        let component = this.sceneEl.querySelector(this.data.acceptedEntities[i]);
        if(component == null) {
          console.log("entity -" + this.data.acceptedEntities[i] + "- not found, this entity will not be considered by the socket");
          continue;
        }
        this.acceptedEntities.push(component);
        this.initialPos = component.getAttribute("position");
        // console.log(this.initialPos);

        //Create empty a-entity for hovermesh and copy mesh of original entity
        let hoverMeshEntity = document.createElement("a-entity");

        //apply material to clonedMesh and it's children
        this.applyMaterial(hoverMeshEntity, component, blueRGB);

        hoverMeshEntity.setAttribute("position", {x: 0, y: 0, z: 0});
        hoverMeshEntity.setAttribute("rotation", {x: 0, y: 0, z: 0});

        this.hoverMeshes.appendChild(hoverMeshEntity);
      }
      console.log(this.acceptedEntities);

      this.meshIndex = 0;
      
      this.rootRot = this.root.getAttribute("rotation");

      this.radius = this.data.radius;

      this.heldEntity = null;
      this.wasHeldEntity = null;
      this.inRadiusEntity = null;
      this.attachedEntity = null;

      this.distance = this.radius + 1; 

      this.objectReleased = true;

      //local version of network variables:
      // this.localSnappedEntity = "";

      //Observer-Arrays:
      this.onPickedUpCallbacks = [];
      this.onHoverEnterCallbacks = [];
      this.onHoverExitCallbacks = [];
      this.onReleasedCallbacks = [];
      this.onSnapCallbacks = [];

      //Disabled on Start?:
      this.socketEnabled = this.data.enabled;
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
  
    tick: function() {

      for(let i = 0; i < this.acceptedEntities.length; i++) {
        if(this.el.sceneEl.systems.interaction.isHeld(this.acceptedEntities[i])) {
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
      if(entity == this.attachedEntity) {
        // this.attachedEntity.object3D.removeFromParent();
        this.attachedEntity = null;
        this.heldEntity = null;
        this.objectReleased = true;
        console.log("about to hide socket");
        this.disableSocket();
        return;
      }
      
      entity.setAttribute("floaty-object", {autoLockOnRelease: true});
      this.heldEntity = entity;

      this.onPickedUpCallbacks.forEach(cb => {
        cb(entity);
      });
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
      this.heldEntity = null;
      this.wasHeldEntity = entity;
      // console.log(this.initialPos);
      // entity.setAttribute("position", {x: this.initialPos.x, y: this.initialPos.y, z: this.initialPos.z});
      // console.log(entity);

      this.objectReleased = true;

      this.onReleasedCallbacks.forEach(cb => {
        cb(entity);
      });
    },

    onSnap(entity)
    {
      if(this.attachedEntity != null)
        return;

      this.attachedEntity = entity;
      this.root.object3D.attach(this.attachedEntity.object3D);

      this.attachedEntity.setAttribute("position", {x: 0, y: 0, z: 0});

      this.attachedEntity.setAttribute("rotation", {x: this.rootRot.x, y: this.rootRot.y, z: this.rootRot.z});
      this.hoverMeshes.children[this.meshIndex].object3D.visible = false;

      this.attachedEntity.setAttribute("tags", {isHandCollisionTarget: false, isHoldable: false});

      this.playSound(SOUND_SNAP_ENTITY);

      this.objectReleased = true;

      this.inRadiusEntity = null;

      //Network snappedEntity: (still to do....)

      this.onSnapCallbacks.forEach(cb => {
        cb(entity);
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
      
      this.hoverMeshes.children[this.meshIndex].object3D.visible = true;
      this.applyMaterial(this.hoverMeshes.children[this.meshIndex], this.hoverMeshes.children[this.meshIndex], blueRGB);

      for(let i = 0; i < this.acceptedEntities.length; i++) {
        this.acceptedEntities[i].setAttribute("tags", {isHandCollisionTarget: true, isHoldable: true});
      }
    },

    disableSocket() {
      this.socketEnabled = false;
      this.hoverMeshes.children[this.meshIndex].object3D.visible = false;
    }
  });
  