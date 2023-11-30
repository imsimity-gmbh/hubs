import { waitForDOMContentLoaded } from "../../../utils/async-utils";
import { cloneObject3D } from "../../../utils/three-utils";
import { loadModel } from "../.././gltf-model-plus";
import { IMSIMITY_INIT_DELAY } from "../../../utils/imsimity";
import { decodeNetworkId, getNetworkIdFromEl } from "../../../utils/GecoLab/network-helper";
import scaleSrc from "../../../assets/models/GecoLab/scales.glb";

const scaleModelPromise = waitForDOMContentLoaded().then(() => loadModel(scaleSrc));

/* should be networked (buttons and multiple-choice), couldn't test yet, cause second user can't even go past the spawning of the experiment */
 
 AFRAME.registerComponent("third-experiment-04", {
    schema: {
      confirmBtnClicked: {default: -1},
      skipBtnClicked: {default: false},
    },
  
    init: function() {
      console.log("Third exp 4 started");
      
      this.lastUpdate = performance.now();
     
      this.el.sceneEl.addEventListener("stateadded", () => this.updateUI());
      this.el.sceneEl.addEventListener("stateremoved", () => this.updateUI());

      //local version of network variable:
      this.localConfirmBtnClicked = -1;
      this.localSkipBtnClicked = false;


      this.chosen;

      this.firstCorrect = false;
      this.secondCorrect = false;
      this.thirdCorrect = false;
      this.firstPlaced = null;
      this.secondPlaced = null;
      this.thirdPlaced = null;

      //Colors for buttons:
      this.initialColor = "#D4ECFA";
      this.selectColor = "#B5B5B5";
      this.wrongColor = "#761614";
      this.rightColor = "#18FF03";

      this.plant1Weigth = AFRAME.utils.bind(this.plant1Weigth, this);
      this.showScale2 = AFRAME.utils.bind(this.showScale2, this);
      this.plant2Weigth = AFRAME.utils.bind(this.plant2Weigth, this);
      this.showScale3 = AFRAME.utils.bind(this.showScale3, this);
      this.plant3Weigth = AFRAME.utils.bind(this.plant3Weigth, this);
      this.remove3Weigth = AFRAME.utils.bind(this.remove3Weigth, this);

      this.movableEntities = [];
      this.sockets = [];
 

      this.expSystem = this.el.sceneEl.systems["third-experiments"];

      this.delayedInit = AFRAME.utils.bind(this.delayedInit, this);

      waitForDOMContentLoaded().then(() => {
        console.log("Third exp 4 registered");
        var networkId = getNetworkIdFromEl(this.el);

        this.experimentData = decodeNetworkId(networkId);

        this.isMember = this.expSystem.getIsMemberForGroupCode(this.experimentData.groupCode);

        this.expSystem.registerTask("04", this.el, this.experimentData);
        
        setTimeout(() => {
          waitForDOMContentLoaded().then(() => {
            this.confirmBtn = this.el.querySelector(".confirm-btn-3-4");
            this.confirmBtn.object3D.visible = false;
            this.confirmBtn.object3D.addEventListener("interact", () => this.onClickConfirmBtn());

            this.skipBtn = this.el.querySelector(".skip-btn-3-4");
            this.skipBtn.object3D.visible = false;
            this.skipBtn.object3D.addEventListener("interact", () => this.onClickSkipBtn());

            
            this.delayedInit();
          });  
        }, IMSIMITY_INIT_DELAY * 0.9);

      });
      
    },

    delayedInit()
    {
      console.log('Delayed Init FE-04');

      this.scaleEntity  = this.el.querySelector(".scale-entity");
      this.spawnItem(scaleModelPromise, new THREE.Vector3(1, 0.7, 0.1), this.scaleEntity, false);

      this.displayText  = this.el.querySelector(".display-text");

      this.sampleSocketScale01 = this.el.querySelector(".sample-socket-scale-01");
      this.sampleSocketScale02 = this.el.querySelector(".sample-socket-scale-02");
      this.sampleSocketScale03 = this.el.querySelector(".sample-socket-scale-03");
      this.sampleSocket01 = this.el.querySelector(".sample-socket-01");
      this.sampleSocket02 = this.el.querySelector(".sample-socket-02");
      this.sampleSocket03 = this.el.querySelector(".sample-socket-03");

      this.resolutionSocket01 = this.el.querySelector(".resolution-socket-01");
      this.sockets.push(this.resolutionSocket01);
      this.resolutionSocket02 = this.el.querySelector(".resolution-socket-02");
      this.sockets.push(this.resolutionSocket02);
      this.resolutionSocket03 = this.el.querySelector(".resolution-socket-03");
      this.sockets.push(this.resolutionSocket03);


      this.sockets.forEach(s => {
        s.object3D.visible = false; //hide holograms until needed
      });

    },

    subscribe(eventName, fn)
    {
        switch(eventName) {
            case "onFinishPart04":
              this.onFinishPart04Callbacks.push(fn);
              break;
            case "onObjectSpawnedPart04":
                this.onObjectSpawnedPart04Callbacks.push(fn);
                break;
          }
    },

    unsubscribe(eventName, fn)
    {
        var index = 0;
        switch(eventName) {
            case "onFinishPart04":
              index = this.onFinishPart04Callback.indexOf(fn);
              this.onFinishPart04Callback.splice(index, 1);
              break;
            case "onObjectSpawnedPart04":
              index = this.onObjectSpawnedPart04Callbacks.indexOf(fn);
              this.onObjectSpawnedPart04Callbacks.splice(index, 1);
              break;
          }
    },

    update() {
      waitForDOMContentLoaded().then(() => { 
        this.updateUI();
      });
    },
    
    updateUI: function() {

      if(this.localConfirmBtnClicked != this.data.confirmBtnClicked) {
        this.localConfirmBtnClicked = this.data.confirmBtnClicked;
        this.snapSolution();
      }

      if(this.localSkipBtnClicked != this.data.skipBtnClicked) {
        this.localSkipBtnClicked = this.data.skipBtnClicked;
        this.skipOrderEnd();
      }
    },
  
    tick: function() {

    },

    spawnItem(promise, position, entity, show) {
      promise.then(model => {
          entity.object3D.visible = false;
          const mesh = cloneObject3D(model.scene);
          mesh.scale.set(1, 1, 1);
          mesh.matrixNeedsUpdate = true;
          entity.setObject3D("mesh", mesh);
      
          if(show)
            entity.object3D.visible = true;

          entity.object3D.scale.set(1, 1, 1);
          entity.object3D.rotation.set(0, 0, 0);
          entity.setAttribute("position", {x: position.x, y: position.y, z: position.z});
          entity.object3D.matrixNeedsUpdate = true;

      });
    },

    startPart04() {
      this.mannequin = this.el.sceneEl.systems["mannequin-manager"].getMannequinByGroupCode(this.experimentData.groupCode);

      this.thirdExpPart02 = this.expSystem.getTaskById("02", this.experimentData.groupCode);
      this.chosen = this.thirdExpPart02.components["third-experiment-02"].chosen;

      this.animateScissor();
    },

    animateScissor()
    {
      this.showScale();
    },

    showScale()
    {
      this.scaleEntity.object3D.visible = true;

      //this.enableInteractables();

      var socket = this.sampleSocketScale01.components["entity-socket"];
        socket.subscribe("onSnap", this.plant1Weigth);
        socket.delayedInitSocket();
        socket.enableSocket();
      this.sampleSocketScale01.object3D.visible = true;
    },

    plant1Weigth()
    {
      this.sampleSocketScale01.components["entity-socket"].unsubscribe("onSnap", this.plant1Weigth);

      this.displayText.setAttribute("text", { value: "1"});

      var socket = this.sampleSocket01.components["entity-socket"];
        socket.subscribe("onSnap", this.showScale2);
        socket.delayedInitSocket();
        socket.enableSocket();
      this.sampleSocketScale01.object3D.visible = true;
    },

    showScale2()
    {
      this.sampleSocket01.components["entity-socket"].unsubscribe("onSnap", this.showScale2);

      this.displayText.setAttribute("text", { value: "0"});
      
      var socket = this.sampleSocketScale02.components["entity-socket"];
        socket.subscribe("onSnap", this.plant2Weigth);
        socket.delayedInitSocket();
        socket.enableSocket();
      this.sampleSocketScale01.object3D.visible = true;
    },

    plant2Weigth()
    {
      this.sampleSocketScale02.components["entity-socket"].unsubscribe("onSnap", this.plant2Weigth);

      this.displayText.setAttribute("text", { value: "2"});

      var socket = this.sampleSocket02.components["entity-socket"];
        socket.subscribe("onSnap", this.showScale3);
        socket.delayedInitSocket();
        socket.enableSocket();
      this.sampleSocketScale01.object3D.visible = true;
    },

    showScale3()
    {
      this.sampleSocket02.components["entity-socket"].unsubscribe("onSnap", this.showScale3);

      this.displayText.setAttribute("text", { value: "0"});
      
      var socket = this.sampleSocketScale03.components["entity-socket"];
        socket.subscribe("onSnap", this.plant3Weigth);
        socket.delayedInitSocket();
        socket.enableSocket();
      this.sampleSocketScale01.object3D.visible = true;
    },

    plant3Weigth()
    {
      this.sampleSocketScale03.components["entity-socket"].unsubscribe("onSnap", this.plant3Weigth);

      this.displayText.setAttribute("text", { value: "3"});

      var socket = this.sampleSocket03.components["entity-socket"];
        socket.subscribe("onSnap", this.remove3Weigth);
        socket.delayedInitSocket();
        socket.enableSocket();
      this.sampleSocketScale01.object3D.visible = true;
    },

    remove3Weigth()
    {
      this.sampleSocket03.components["entity-socket"].unsubscribe("onSnap", this.remove3Weigth);

      this.displayText.setAttribute("text", { value: "0"});

      //this.orderPlants();
    },
    /*
    orderPlants()
    {
      
      this.thirdExpPart02 = this.expSystem.getTaskById("02", this.experimentData.groupCode);
      this.chosen = this.thirdExpPart02.components["third-experiment-02"].chosen;
      
        var socket = this.resolutionSocket01.components["entity-socket"];
        socket.subscribe("onSnap", this.place1Soluttion);
        socket.delayedInitSocket();
        socket.enableSocket();
        socket.object3D.visible = true; 

        socket = this.resolutionSocket02.components["entity-socket"];
        socket.subscribe("onSnap", this.place2Soluttion);
        socket.delayedInitSocket();
        socket.enableSocket();
        socket.object3D.visible = true; 

        socket = this.resolutionSocket03.components["entity-socket"];
        socket.subscribe("onSnap", this.place3Soluttion);
        socket.delayedInitSocket();
        socket.enableSocket();
        socket.object3D.visible = true; 

        this.confirmBtn.object3D.visible = true;
    },

    place1Soluttion(socket)
    {
      console.log(socket);
      //if (this.objectsPlacedSockets.some(({object3D}) => object3D.id === socket.object3D.id))
      var oldSocket = null;
      if(this.firstPlaced) oldSocket = this.firstPlaced;
      socket.setAttribute("position", {x: 3, y: 0.55, z:0.1});
      this.firstPlaced = socket;

      this.thirdExpPart02 = this.expSystem.getTaskById("02", this.experimentData.groupCode);
      this.chosen = this.thirdExpPart02.components["third-experiment-02"].chosen;

      //need to  make != to ==
      if(this.chosen == 0)
      {
        if(socket.object3D != null) this.firstCorrect = true;
      }
      else if(this.chosen == 1)
      {
        if(socket.object3D != null) this.firstCorrect = true;
      }
      else if(this.chosen == 2)
      {
        if(socket.object3D != null) this.firstCorrect = true;
      }

      if(oldSocket != null && socket == this.secondPlaced) this.place2Soluttion(oldSocket);
      if(oldSocket != null && socket == this.thirdPlaced) this.place3Soluttion(oldSocket);

      //this.resolutionSocket01.components["entity-socket"].enableSocket();
      this.resolutionSocket01.components["entity-socket"].object3D.visible = true; 
    },

    place2Soluttion(socket)
    {
      console.log(socket);
      //if (this.objectsPlacedSockets.some(({object3D}) => object3D.id === socket.object3D.id))
      var oldSocket = null;
      if(this.secondPlaced) oldSocket = this.secondPlaced;
      socket.setAttribute("position", {x: 3, y: 0.55, z:0.3});
      this.secondPlaced = socket;

      this.thirdExpPart02 = this.expSystem.getTaskById("02", this.experimentData.groupCode);
      this.chosen = this.thirdExpPart02.components["third-experiment-02"].chosen;

      //need to  make != to ==
      if(this.chosen == 0)
      {
        if(socket.object3D != null) this.secondCorrect = true;
      }
      else if(this.chosen == 1)
      {
        if(socket.object3D != null) this.secondCorrect = true;
      }
      else if(this.chosen == 2)
      {
        if(socket.object3D != null) this.secondCorrect = true;
      }

      if(oldSocket != null && socket == this.firstPlaced) this.place1Soluttion(oldSocket);
      if(oldSocket != null && socket == this.thirdPlaced) this.place3Soluttion(oldSocket);

      //this.resolutionSocket02.components["entity-socket"].enableSocket();
      this.resolutionSocket02.components["entity-socket"].object3D.visible = true; 
    },


    place3Soluttion(socket)
    {
      console.log(socket);
      //if (this.objectsPlacedSockets.some(({object3D}) => object3D.id === socket.object3D.id))
      var oldSocket = null;
      if(this.thirdPlaced) oldSocket = this.thirdPlaced;
      socket.setAttribute("position", {x: 3, y: 0.55, z:0.7});
      this.thirdPlaced = socket;

      this.thirdExpPart02 = this.expSystem.getTaskById("02", this.experimentData.groupCode);
      this.chosen = this.thirdExpPart02.components["third-experiment-02"].chosen;

      //need to  make != to ==
      if(this.chosen == 0)
      {
        if(socket.object3D != null) this.thirdCorrect = true;
      }
      else if(this.chosen == 1)
      {
        if(socket.object3D != null) this.thirdCorrect = true;
      }
      else if(this.chosen == 2)
      {
        if(socket.object3D != null) this.thirdCorrect = true;
      }
      
      if(oldSocket != null && socket == this.secondPlaced) this.place2Soluttion(oldSocket);
      if(oldSocket != null && socket == this.firstPlaced) this.place1Soluttion(oldSocket);

      //this.resolutionSocket03.components["entity-socket"].enableSocket();
      this.resolutionSocket03.components["entity-socket"].object3D.visible = true; 
    },

    onClickConfirmBtn()
    {
      if(firstPlaced && secondPlaced && thirdPlaced)
      {
        NAF.utils.getNetworkedEntity(this.el).then(networkedEl => {
    
        NAF.utils.takeOwnership(networkedEl);
  
        this.el.setAttribute("third-experiment-04", "confirmBtnClicked", this.confirmBtnClicked + 1);      
  
        this.updateUI();
        });
      }
    },


    snapSolution()
    {
      //TODO:Mannequin Wiring similar to SingleChoice
      
      if(firstCorrect && secondCorrect && thirdCorrect)
      { 
        this.confirmBtn.object3D.visible = false;
      
        this.skipBtn.object3D.visible = true;
      }
    },
    */
    onClickSkipBtn()
    {
      NAF.utils.getNetworkedEntity(this.el).then(networkedEl => {
    
        NAF.utils.takeOwnership(networkedEl);
  
        this.el.setAttribute("third-experiment-04", "skipBtnClicked", true);      
  
        this.updateUI();
      });
    },

    skipOrderEnd()
    {
      this.skipBtn.object3D.visible = false;

      this.thirdExpPart04 = this.expSystem.getTaskById("05", this.experimentData.groupCode);
      this.thirdExpPart04.components["third-experiment-05"].startPart05();
    },

    enableInteractables() {

      console.log("enabling interaction on movableEntities");

      if (this.isMember)
      {
          this.movableEntities.forEach(e => {
              let name = e.className;
              e.className = "interactable " + name;
          });
      }
      
    },
    
    remove() {
      console.log("removing third-experiment 04");
      this.expSystem.deregisterTask("04", this.el, this.experimentData);
    }

  });

