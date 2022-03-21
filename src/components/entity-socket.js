/**
 * Entity Socket for snapping objects into places
 * @component entity-socket
 */
//Todo: 
//3. make hover meshes blue and opacity 0.2
import { SOUND_HOVER_ENTER, SOUND_SNAP_ENTITY } from "../systems/sound-effects-system";

import { Vector3 } from "three";

 AFRAME.registerComponent("entity-socket", {
    schema: {
      acceptedEntities: {default: []},
      radius: {default: 0}
    },
  
    init: function() {

      //Select necessary components:
      this.sceneEl = document.querySelector("a-scene");
      this.root = document.querySelector(".root");
      this.hoverMeshes = document.querySelector(".hover-meshes");

      let temp = new Vector3();
      this.root.object3D.getWorldPosition(temp);
      this.rootPos = temp;

      //Get List of accepted Entities and store copy of their meshes in hover-meshes:
      this.acceptedEntities = []; 
      for(let i = 0; i < this.data.acceptedEntities.length; i++) {
        let component = this.sceneEl.querySelector(this.data.acceptedEntities[i]);
        this.acceptedEntities.push(component);

        //Create empty a-entity for hovermesh and copy mesh of original entity
        let hoverMeshEntity = document.createElement("a-entity");
        let mesh = component.getObject3D('mesh');
        let clonedMesh = mesh.clone();

        //create blue material for hover-effect
        this.hoverMaterial = new THREE.MeshBasicMaterial();
        this.hoverMaterial.color.setRGB(0.165, 0.38, 0.749);
        this.hoverMaterial.transparent = true;
        this.hoverMaterial.opacity = 0.2;
        this.hoverMaterial.flatShading = true;

        //apply material to clonedMesh and it's children
        this.applyMaterial(clonedMesh, this.hoverMaterial);

        //add mesh to empty entity, and append it to the hovermeshes-parent
        hoverMeshEntity.setObject3D("mesh", clonedMesh);

        hoverMeshEntity.setAttribute("position", {x: 0, y: 0, z: 0});
        hoverMeshEntity.setAttribute("rotation", {x: 0, y: 0, z: 0});
        hoverMeshEntity.object3D.visible = false;

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

      this.distance = this.radius + 10;

      this.objectReleased = true;

      //Observer-Arrays:
      this.onPickedUpCallbacks = [];
      this.onHoverEnterCallbacks = [];
      this.onHoverExitCallbacks = [];
      this.onReleasedCallbacks = [];
      this.onSnapCallbacks = [];
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
          if(this.heldEntity == null && this.objectReleased) {
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
      console.log("picked up entity");

      if(entity == this.attachedEntity) {
        this.attachedEntity = null;
        console.log("picked up attached entity");
      }
      
      entity.setAttribute("floaty-object", {autoLockOnRelease: false});
      this.heldEntity = entity;

      this.onPickedUpCallbacks.forEach(cb => {
        cb(entity);
      });
    },

    onHoverEnter(entity)
    {
      if(this.attachedEntity != null) 
        return;

      entity.setAttribute("floaty-object", {autoLockOnRelease: true});

      this.hoverMeshes.children[this.meshIndex].object3D.visible = true;

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

      entity.setAttribute("floaty-object", {autoLockOnRelease: false});

      this.hoverMeshes.children[this.meshIndex].object3D.visible = false;

      this.inRadiusEntity = null;
      this.heldEntity = entity;

      this.onHoverExitCallbacks.forEach(cb => {
        cb(entity);
      });
    },

    onReleased(entity)
    {
      console.log("released");

      this.heldEntity = null;
      this.wasHeldEntity = entity;

      this.objectReleased = true;

      this.onReleasedCallbacks.forEach(cb => {
        cb(entity);
      });
    },

    onSnap(entity)
    {
      if(this.attachedEntity != null)
        return;

      console.log("snap!");

      this.root.object3D.attach(entity.object3D);

      entity.setAttribute("position", {x: 0, y: 0, z: 0});

      entity.setAttribute("rotation", {x: this.rootRot.x, y: this.rootRot.y, z: this.rootRot.z});
      this.hoverMeshes.children[this.meshIndex].object3D.visible = false;

      this.playSound(SOUND_SNAP_ENTITY);

      this.inRadiusEntity = null;
      this.attachedEntity = entity;

      this.objectReleased = true;

      this.onSnapCallbacks.forEach(cb => {
        cb(entity);
      });
    },

    applyMaterial(mesh, material)
    {
      mesh.material = material;

      for(let i = 0; i < mesh.children.length; i++) {
        this.applyMaterial(mesh.children[i], this.hoverMaterial);
      }
    },

    playSound(soundId)
    {
      const sceneEl = this.el.sceneEl;
      sceneEl.systems["hubs-systems"].soundEffectsSystem.playSoundOneShot(soundId);
    }
  });
  