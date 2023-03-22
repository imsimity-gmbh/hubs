/**
 * Entity Socket for snapping objects into places
 * @component entity-socket
 */
import { SOUND_HOVER_ENTER, SOUND_SNAP_ENTITY } from "../../systems/sound-effects-system";

import { waitForDOMContentLoaded } from "../../utils/async-utils";

import { IMSIMITY_INIT_DELAY } from '../../utils/imsimity';

import { getGroupCodeFromParent, setInteractable } from '../../utils/GecoLab/network-helper';

import { Vector3 } from "three";

const blueRGB = new Vector3(0.165, 0.38, 0.749);
const greenRGB = new Vector3(0.36, 0.91, 0.47);

const SNAP = 0;
const PICKUP = 1;
const RELEASE = 2;
const HELD = 3;

 AFRAME.registerComponent("entity-socket", {
    schema: {
      triggerValue: {default: -1},
      acceptedEntities: {default: []},
      radius: {default: 0},
      enabled: {default: true},
    },
  
    init: function() {
      
      //Select necessary components:
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

      this.localTriggerValue = -1;

      //Observer-Arrays:
      this.onPickedUpCallbacks = [];
      this.onHoverEnterCallbacks = [];
      this.onHoverExitCallbacks = [];
      this.onReleasedCallbacks = [];
      this.onSnapCallbacks = [];

      //Disabled on Start?:
      this.socketEnabled = this.data.enabled;

      this.delayedInit = AFRAME.utils.bind(this.delayedInitFirstExperiment, this);
      this.placeAttachedEntityLocal = AFRAME.utils.bind(this.placeAttachedEntityLocal, this);

      setTimeout(() => {
        waitForDOMContentLoaded().then(() => { 
          this.groupCode = getGroupCodeFromParent(this.el);
  
          if (this.groupCode != null)
          {
            this.isMember = false;
            
            var firstExpSystem = this.el.sceneEl.systems["first-experiments"];
            var secondExpSystem = this.el.sceneEl.systems["second-experiments"];

            if (firstExpSystem.isGroupCodeActive(this.groupCode))
            {
              this.experiment02 = firstExpSystem.getTaskById("02", this.groupCode);
              this.isMember = firstExpSystem.getIsMemberForGroupCode(this.groupCode)
              // TODO: unsubscribe on delete
              this.experiment02.components["first-experiment-02"].subscribe('onObjectSpawnedPart02', this.delayedInitFirstExperiment);
            }
            else if (secondExpSystem.isGroupCodeActive(this.groupCode))
            {
              this.isMember = secondExpSystem.getIsMemberForGroupCode(this.groupCode);
            }

         
          }
          else
          {
            console.log(this.el);
            console.log('ERROR ! entity-socket not well initialized');
          }
  
        });    
      }, IMSIMITY_INIT_DELAY * 3);
    
    },

    delayedInitFirstExperiment()
    {
      console.log('Delayed init');
      for(let i = 0; i < this.data.acceptedEntities.length; i++) {

        let component = this.el.sceneEl.systems["first-experiments"].findElementForGroupCode(this.data.acceptedEntities[i], this.groupCode);
        
        if(component == null) {
          console.log("entity -" + this.data.acceptedEntities[i] + "- not found, this entity will not be considered by the socket");
          continue;
        }
        this.acceptedEntities.push(component);
        
        // Deactivate interractions for non members
        setInteractable(component, this.isMember);
        
        //Create empty a-entity for hovermesh and copy mesh of original entity
        let hoverMeshEntity = document.createElement("a-entity");

        //apply material to clonedMesh and it's children
        this.applyMaterial(hoverMeshEntity, component, blueRGB);

        hoverMeshEntity.setAttribute("position", {x: 0, y: 0, z: 0});
        hoverMeshEntity.setAttribute("rotation", {x: 0, y: 0, z: 0});

        this.hoverMeshes.appendChild(hoverMeshEntity);
      }

      let acceptedEntity = this.acceptedEntities[0];
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

      if(this.localTriggerValue != this.data.triggerValue) {

        if (this.data.triggerValue == SNAP)
        {
          console.log('Snap');

          this.objectReleased = true;
          this.heldEntity = null;
          this.inRadiusEntity = null;

          this.hoverMeshes.children[this.meshIndex].object3D.visible = false;
          this.playSound(SOUND_SNAP_ENTITY);

          // Hack to parent without parenting
          this.attachedEntity = this.acceptedEntities[0];

          setInteractable(this.attachedEntity, false);
          
          this.placeAttachedEntityLocal();

          this.onSnapCallbacks.forEach(cb => {
            cb(this.el);
          });
        }
        else if (this.data.triggerValue == PICKUP)
        {
          console.log('PickUp');

          this.disableSocket();

          this.heldEntity = null;
          this.attachedEntity = null;
          this.objectReleased = true;

          this.onPickedUpCallbacks.forEach(cb => {
            cb();
          });
        
          
        }
        else if (this.data.triggerValue == RELEASE && this.socketEnabled)
        {
          console.log('Release');

          var entity = this.acceptedEntities[0];
          entity.object3D.position.set(this.initialPos.x, this.initialPos.y, this.initialPos.z);

          this.heldEntity = null;
          this.wasHeldEntity = entity;
          this.objectReleased = true;

          setInteractable(entity, this.isMember);

          this.onReleasedCallbacks.forEach(cb => {
            cb();
          });
        }
        else if (this.data.triggerValue == HELD && this.socketEnabled)
        {
          console.log('Held');
          
          setInteractable(this.acceptedEntities[0], (this.heldEntity != null) ? this.isMember : false);

          this.onReleasedCallbacks.forEach(cb => {
            cb();
          });
        }
      }

      console.log(this.el.className);
      console.log(this.data.acceptedEntities[0]);
      console.log(this.data.triggerValue);
      console.log(this.heldEntity === null);
      
      this.localTriggerValue = this.data.triggerValue;
    },
  
    tick: function() {
      

      if(!this.socketEnabled)
        return;

      for(let i = 0; i < this.acceptedEntities.length; i++) {
        if(this.el.sceneEl.systems.interaction.isHeld(this.acceptedEntities[i])) {
          
          if(this.heldEntity == null && this.objectReleased && this.attachedEntity != null) {
            this.onPickedUp(this.acceptedEntities[i]);
            this.meshIndex = i;
            this.objectReleased = false;
          } 
          else if(this.heldEntity == null && this.attachedEntity == null)
          {
            console.log("Holding a new object")
            this.onHeld(this.acceptedEntities[i]);
          }          
        }
      }


      if(this.heldEntity != null && this.inRadiusEntity == null) {
        if(this.el.sceneEl.systems.interaction.isHeld(this.heldEntity)) {
          let worldHeldPos = new Vector3();
          this.heldEntity.object3D.getWorldPosition(worldHeldPos);
          this.distance = this.rootPos.distanceTo(worldHeldPos); //Measure distance between root and heldEntity
          // console.log("Held Distance : " + this.distance);
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
          // console.log("In Radius Distance : " + this.distance);
          if(this.distance > this.radius)
            this.onHoverExit(this.inRadiusEntity);
        }
        else {
          this.onSnap(this.inRadiusEntity);
        }
      }
      
    },

    onHoverEnter(entity)
    {
      if(this.attachedEntity != null) 
        return;

      this.hoverMeshes.children[this.meshIndex].object3D.visible = true;
      this.applyMaterial(this.hoverMeshes.children[this.meshIndex], this.hoverMeshes.children[this.meshIndex], greenRGB);

      this.playSound(SOUND_HOVER_ENTER);

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

      this.onHoverExitCallbacks.forEach(cb => {
        cb(entity);
      });
    },


    onPickedUp(entity)
    {
      console.log('onPickedUp');

      if(entity == this.attachedEntity) {
        // this.attachedEntity.object3D.removeFromParent();
        
        
        this.attachedEntity = null;
        this.heldEntity = null;
        this.objectReleased = true;
        console.log("about to hide socket");
        

        // Network
        NAF.utils.getNetworkedEntity(this.el).then(networkedEl => {
      
          NAF.utils.takeOwnership(networkedEl);
          
          this.el.setAttribute("entity-socket", "triggerValue", PICKUP); 
        });

        entity.setAttribute("floaty-object", {autoLockOnRelease: true});
        this.heldEntity = entity;
  
        NAF.utils.getNetworkedEntity(this.heldEntity).then(networkedHeldEl => {
          NAF.utils.takeOwnership(networkedHeldEl);
        });
      }
    },

   
    onReleased(entity)
    {
      
      console.log("releasing");
      this.heldEntity = null;
      this.wasHeldEntity = entity;
      this.objectReleased = true;
      

      NAF.utils.getNetworkedEntity(this.el).then(networkedEl => {
      
        NAF.utils.takeOwnership(networkedEl);
        
        this.el.setAttribute("entity-socket", "triggerValue", RELEASE); 
      });

    },

    onSnap(entity)
    {
      console.log('onSnap');

      if(this.attachedEntity != null)
        return;
      
      
      this.attachedEntity = entity;
      
      this.objectReleased = true;

      this.heldEntity = null;
      this.inRadiusEntity = null;
      
     
      // Network
      NAF.utils.getNetworkedEntity(this.el).then(networkedEl => {
    
        NAF.utils.takeOwnership(networkedEl);
  
        this.el.setAttribute("entity-socket", "triggerValue", SNAP); 
      });       
      
    },

    onHeld(entity)
    {
      this.heldEntity = entity;

      NAF.utils.getNetworkedEntity(this.el).then(networkedEl => {
    
        NAF.utils.takeOwnership(networkedEl);

        this.el.setAttribute("entity-socket", "triggerValue", HELD); 
        
      });

      NAF.utils.getNetworkedEntity(entity).then(networkedHeldEl => {
        NAF.utils.takeOwnership(networkedHeldEl);
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
    
      if(clonedMesh.children[0].children.length > 0){
        clonedMesh.children[0].children[0].material = hoverMaterial;
      }

      entity.setObject3D("mesh", clonedMesh);

      // if(entity.children.length > 0)
      //   this.applyMaterial(entity.children[0], entity.children[0], red, green, blue);
    },

    playSound(soundId)
    {
      if (this.isMember)
      {
        const sceneEl = this.el.sceneEl;
        sceneEl.systems["hubs-systems"].soundEffectsSystem.playSoundOneShot(soundId);
      }
    },

    enableSocket() {
      this.socketEnabled = true;
      this.objectReleased = true;
      
      this.localTriggerValue = -1;
      
      if (this.initialPos)
      {
        // if the acceptedEntities array is initialized, we find it with the finder function
        let acceptedEntity = (this.acceptedEntities.length > 0) ? this.acceptedEntities[0] : this.el.sceneEl.systems["first-experiments"].findElementForGroupCode(this.data.acceptedEntities[0], this.groupCode);
        this.initialPos = new Vector3().copy(acceptedEntity.object3D.position);  
      }
      
      
      // error hoverMeshes mortar
      this.hoverMeshes.children[this.meshIndex].object3D.visible = true;
      this.applyMaterial(this.hoverMeshes.children[this.meshIndex], this.hoverMeshes.children[this.meshIndex], blueRGB);

      for(let i = 0; i < this.acceptedEntities.length; i++) {
        // only set "interactable" if this user is a memeber of this experiment
        var enable = (this.isMember !== undefined) ? this.isMember : true;
        setInteractable(this.acceptedEntities[i], enable);
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
  