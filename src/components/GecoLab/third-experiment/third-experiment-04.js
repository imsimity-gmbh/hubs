import { waitForDOMContentLoaded } from "../../../utils/async-utils";
import { cloneObject3D } from "../../../utils/three-utils";
import { loadModel } from "../.././gltf-model-plus";
import { IMSIMITY_INIT_DELAY } from "../../../utils/imsimity";
import { decodeNetworkId, getNetworkIdFromEl } from "../../../utils/GecoLab/network-helper";
import scaleSrc from "../../../assets/models/GecoLab/scales.glb";

import scissorSrc from "../../../assets/models/GecoLab/PlantGrowth/wheat_ground_1.glb";
import solSrc from "../../../assets/models/GecoLab/PlantGrowth/geco_petri_dish.glb";
import { faBreadSlice } from "@fortawesome/free-solid-svg-icons";

const scaleModelPromise = waitForDOMContentLoaded().then(() => loadModel(scaleSrc));
const scissorModelPromise = waitForDOMContentLoaded().then(() => loadModel(scissorSrc));
const solModelPromise = waitForDOMContentLoaded().then(() => loadModel(solSrc));


/* should be networked (buttons and multiple-choice), couldn't test yet, cause second user can't even go past the spawning of the experiment */
 
 AFRAME.registerComponent("third-experiment-04", {
    schema: {
      confirmBtnClicked: {default: -1},
      skipBtnClicked: {default: false},
      change1BtnClicked: {default: false},
      change2BtnClicked: {default: false},
      delayBtnClicked: {default: false},
    },
  
    init: function() {
      console.log("Third exp 4 started");
      
      this.lastUpdate = performance.now();
     
      this.el.sceneEl.addEventListener("stateadded", () => this.updateUI());
      this.el.sceneEl.addEventListener("stateremoved", () => this.updateUI());

      //local version of network variable:
      this.localConfirmBtnClicked = -1;
      this.localSkipBtnClicked = false;
      this.localDelayBtnClicked = false;


      this.chosen;
      this.answerRound = 0;


      this.firstPlaced = null;
      this.secondPlaced = null;
      this.thirdPlaced = null;
      /*
      this.firstPosition = new THREE.Vector3(3, 0.55, 0.1);
      this.secondPosition = new THREE.Vector3(3, 0.55, 0.4);
      this.thirdPosition = new THREE.Vector3(3, 0.55, 0.7);
      */

      //Colors for buttons:
      this.initialColor = "#D4ECFA";
      this.selectColor = "#B5B5B5";
      this.wrongColor = "#761614";
      this.rightColor = "#18FF03";

      this.animateScissor1 = AFRAME.utils.bind(this.animateScissor1, this);
      this.animateScissor2 = AFRAME.utils.bind(this.animateScissor2, this);
      this.animateScissor3 = AFRAME.utils.bind(this.animateScissor3, this);
      this.plant1Weigth = AFRAME.utils.bind(this.plant1Weigth, this);
      this.showScale2 = AFRAME.utils.bind(this.showScale2, this);
      this.plant2Weigth = AFRAME.utils.bind(this.plant2Weigth, this);
      this.showScale3 = AFRAME.utils.bind(this.showScale3, this);
      this.plant3Weigth = AFRAME.utils.bind(this.plant3Weigth, this);
      this.remove3Weigth = AFRAME.utils.bind(this.remove3Weigth, this);

      //this.onClickConfirmBtn = AFRAME.utils.bind(this.onClickConfirmBtn, this);
      this.onClickSkipBtn = AFRAME.utils.bind(this.onClickSkipBtn, this);
      this.onClickChange1Btn = AFRAME.utils.bind(this.onClickChange1Btn, this);
      this.onClickChange2Btn = AFRAME.utils.bind(this.onClickChange2Btn, this);
      this.onClickDelayBtn = AFRAME.utils.bind(this.onClickDelayBtn, this);

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

            this.changeBtn1 = this.el.querySelector(".switch-btn-3-4-1");
            this.changeBtn1.object3D.visible = false;
            this.changeBtn1.object3D.addEventListener("interact", () => this.onClickChange1Btn());

            this.changeBtn2 = this.el.querySelector(".switch-btn-3-4-2");
            this.changeBtn2.object3D.visible = false;
            this.changeBtn2.object3D.addEventListener("interact", () => this.onClickChange2Btn());

            this.delayBtn = this.el.querySelector(".delay-btn-3-4");
            this.delayBtn.object3D.visible = false;
            this.delayBtn.object3D.addEventListener("interact", () => this.onClickDelayBtn());

            
            this.delayedInit();
          });  
        }, IMSIMITY_INIT_DELAY * 0.9);

      });
      
    },

    delayedInit()
    {
      console.log('Delayed Init FE-04');

      this.scaleEntity  = this.el.querySelector(".scale-entity");
      this.spawnItem(scaleModelPromise, new THREE.Vector3(-0.4, 0.7, 0.1), this.scaleEntity, false);
      this.scaleEntity.object3D.rotation.set(0, 0, 0);
      
      this.displayText  = this.el.querySelector(".display-text");

      this.sol1 = this.el.querySelector(".plant-sol-1-entity");
      this.movableEntities.push(this.sol1);
      this.spawnItem(solModelPromise, new THREE.Vector3(0.5, 0.7, -3.8), this.sol1, false, false); //0.5 0.7 -3.8
      this.sol2 = this.el.querySelector(".plant-sol-2-entity");
      this.movableEntities.push(this.sol2);
      this.spawnItem(solModelPromise, new THREE.Vector3(1.2, 0.7, -3.8), this.sol2, false, false); //1.2 0.7 -3.8
      this.sol3 = this.el.querySelector(".plant-sol-3-entity");
      this.movableEntities.push(this.sol3);
      this.spawnItem(solModelPromise, new THREE.Vector3(1.9, 0.7, -3.8), this.sol3, false, false); //1.9 0.7 -3.8

      this.sampleSocketScale01 = this.el.querySelector(".sample-socket-scale-01");
      this.sockets.push(this.sampleSocketScale01);
      this.sampleSocketScale02 = this.el.querySelector(".sample-socket-scale-02");
      this.sockets.push(this.sampleSocketScale02);
      this.sampleSocketScale03 = this.el.querySelector(".sample-socket-scale-03");
      this.sockets.push(this.sampleSocketScale03);
      this.sampleSocket01 = this.el.querySelector(".sample-socket-01");
      this.sockets.push(this.sampleSocket01);
      this.sampleSocket02 = this.el.querySelector(".sample-socket-02");
      this.sockets.push(this.sampleSocket02);
      this.sampleSocket03 = this.el.querySelector(".sample-socket-03");
      this.sockets.push(this.sampleSocket03);

      this.scissor = this.el.querySelector(".scissor-entity");
      this.movableEntities.push(this.scissor);
      this.spawnItem(scissorModelPromise, new THREE.Vector3(0, 0.7, 0.5), this.scissor, false, true);

      this.scissorSocket01 = this.el.querySelector(".scissor-socket-01");
      this.sockets.push(this.scissorSocket01);
      this.scissorSocket02 = this.el.querySelector(".scissor-socket-02");
      this.sockets.push(this.scissorSocket02);
      this.scissorSocket03 = this.el.querySelector(".scissor-socket-03");
      this.sockets.push(this.scissorSocket03);

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
        this.compileAnswer();
      }

      if(this.data.change1BtnClicked) {
        this.data.change1BtnClicked = false;
        
        [this.firstPlaced, this.secondPlaced] = [this.secondPlaced, this.firstPlaced];
        this.firstPlaced.setAttribute("position", {x: 3, y: 0.55, z: 0.1});
        this.secondPlaced.setAttribute("position", {x: 3, y: 0.55, z: 0.4});
      }

      if(this.data.change2BtnClicked) {
        this.data.change2BtnClicked = false;

        [this.secondPlaced, this.thirdPlaced] = [this.secondPlaced, this.thirdPlaced];
        this.thirdPlaced.setAttribute("position", {x: 3, y: 0.55, z: 0.7});
        this.secondPlaced.setAttribute("position", {x: 3, y: 0.55, z: 0.4});
        
      }

      if(this.localDelayBtnClicked != this.data.delayBtnClicked) {
        this.localDelayBtnClicked = this.data.delayBtnClicked;
        this. endPart04();
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
          entity.object3D.rotation.set(0, 1.6, 0);
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
      this.scissor.object3D.visible = true;

      var socket = this.scissorSocket01.components["entity-socket"];
      socket.subscribe("onSnap", this.animateScissor1);
      socket.delayedInitSocket();
      socket.enableSocket();
      this.scissorSocket01.object3D.visible = true;
      this.scissorSocket01.components["entity-socket"].enableSocket();

    },

    animateScissor1()
    {
      this.scissorSocket01.components["entity-socket"].unsubscribe("onSnap", this.animateScissor1);

      //this.simpleAnims1 = this.thirdExpPart01.querySelector(".scissor");
      //this.simpleAnim1 = this.simpleAnims1.components["simple-animation"];
      //this.simpleAnim1.stopClip("03_long_cut");
      //this.simpleAnim1.playClip("03_long_cut", false, true);

      this.thirdExpPart03 = this.expSystem.getTaskById("03", this.experimentData.groupCode);

      switch(this.chosen)
      {
        case 0:
          this.simpleAnims2 = this.thirdExpPart03.querySelector(".plant-6-temp-1");
          this.simpleAnim2 = this.simpleAnims2.components["simple-animation"];
          this.simpleAnim2.playClip("wheat_temp_1_cutting", false, true);
          break;
        case 1:
          this.simpleAnims2 = this.thirdExpPart03.querySelector(".plant-6-co2-1");
          this.simpleAnim2 = this.simpleAnims2.components["simple-animation"];
          this.simpleAnim2.playClip("wheat_co2_1_cutting", false, true);
          break;
        case 2:
          this.simpleAnims2 = this.thirdExpPart03.querySelector(".plant-6-ground-1");
          this.simpleAnim2 = this.simpleAnims2.components["simple-animation"];
          this.simpleAnim2.playClip("wheat_ground_1_cutting", false, true);
          break;
      }

      setTimeout(() => this.showSol1(),2000);
    },

    showSol1()
    {
      this.sol1.object3D.visible = true;

      var socket = this.scissorSocket02.components["entity-socket"];
      socket.subscribe("onSnap", this.animateScissor2);
      socket.delayedInitSocket();
      socket.enableSocket();
      this.scissorSocket02.object3D.visible = true;
      this.scissorSocket02.components["entity-socket"].enableSocket();
    },

    animateScissor2()
    {
      this.scissorSocket02.components["entity-socket"].unsubscribe("onSnap", this.animateScissor2);

      //this.simpleAnims1 = this.thirdExpPart01.querySelector(".scissor");
      //this.simpleAnim1 = this.simpleAnims1.components["simple-animation"];
      //this.simpleAnim1.stopClip("03_long_cut");
      //this.simpleAnim1.playClip("03_long_cut", false, true);

      this.thirdExpPart03 = this.expSystem.getTaskById("03", this.experimentData.groupCode);

      switch(this.chosen)
      {
        case 0:
          this.simpleAnims2 = this.thirdExpPart03.querySelector(".plant-6-temp-2");
          this.simpleAnim2 = this.simpleAnims2.components["simple-animation"];
          this.simpleAnim2.playClip("wheat_temp_2_cutting", false, true);
          break;
        case 1:
          this.simpleAnims2 = this.thirdExpPart03.querySelector(".plant-6-co2-2");
          this.simpleAnim2 = this.simpleAnims2.components["simple-animation"];
          this.simpleAnim2.playClip("wheat_co2_2_cutting", false, true);
          break;
        case 2:
          this.simpleAnims2 = this.thirdExpPart03.querySelector(".plant-6-ground-2");
          this.simpleAnim2 = this.simpleAnims2.components["simple-animation"];
          this.simpleAnim2.playClip("wheat_ground_2_cutting", false, true);
          break;
      }

      setTimeout(() => this.showSol2(),2000);
    },

    showSol2()
    {
      this.sol2.object3D.visible = true;

      var socket = this.scissorSocket03.components["entity-socket"];
      socket.subscribe("onSnap", this.animateScissor3);
      socket.delayedInitSocket();
      socket.enableSocket();
      this.scissorSocket03.object3D.visible = true;
      this.scissorSocket03.components["entity-socket"].enableSocket();
    },

    animateScissor3()
    {
      this.scissorSocket03.components["entity-socket"].unsubscribe("onSnap", this.animateScissor3);

      //this.simpleAnims1 = this.thirdExpPart01.querySelector(".scissor");
      //this.simpleAnim1 = this.simpleAnims1.components["simple-animation"];
      //this.simpleAnim1.stopClip("03_long_cut");
      //this.simpleAnim1.playClip("03_long_cut", false, true);

      this.thirdExpPart03 = this.expSystem.getTaskById("03", this.experimentData.groupCode);

      switch(this.chosen)
      {
        case 0:
          this.simpleAnims2 = this.thirdExpPart03.querySelector(".plant-6-temp-3");
          this.simpleAnim2 = this.simpleAnims2.components["simple-animation"];
          this.simpleAnim2.playClip("wheat_temp_3_cutting", false, true);
          break;
        case 1:
          this.simpleAnims2 = this.thirdExpPart03.querySelector(".plant-6-co2-3");
          this.simpleAnim2 = this.simpleAnims2.components["simple-animation"];
          this.simpleAnim2.playClip("wheat_co2_3_cutting", false, true);
          break;
        case 2:
          this.simpleAnims2 = this.thirdExpPart03.querySelector(".plant-6-ground-3");
          this.simpleAnim2 = this.simpleAnims2.components["simple-animation"];
          this.simpleAnim2.playClip("wheat_ground_3_cutting", false, true);
          break;
      }

      setTimeout(() => this.showSol3(),2000);
    },

    showSol3()
    {
      this.sol3.object3D.visible = true;

      this.scissor.object3D.visible = false;

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
      this.sampleSocketScale01.components["entity-socket"].enableSocket();
    },

    plant1Weigth()
    {
      this.sampleSocketScale01.components["entity-socket"].unsubscribe("onSnap", this.plant1Weigth);

      this.displayText.setAttribute("text", { value: "1"});

      var socket = this.sampleSocket01.components["entity-socket"];
        socket.subscribe("onSnap", this.showScale2);
        socket.delayedInitSocket();
        socket.enableSocket();
      this.sampleSocket01.object3D.visible = true;
      this.sampleSocket01.components["entity-socket"].enableSocket();
    },

    showScale2()
    {
      this.sampleSocket01.components["entity-socket"].unsubscribe("onSnap", this.showScale2);

      this.displayText.setAttribute("text", { value: "0"});
      
      var socket = this.sampleSocketScale02.components["entity-socket"];
        socket.subscribe("onSnap", this.plant2Weigth);
        socket.delayedInitSocket();
        socket.enableSocket();
      this.sampleSocketScale02.object3D.visible = true;
      this.sampleSocketScale02.components["entity-socket"].enableSocket();
    },

    plant2Weigth()
    {
      this.sampleSocketScale02.components["entity-socket"].unsubscribe("onSnap", this.plant2Weigth);

      this.displayText.setAttribute("text", { value: "2"});

      var socket = this.sampleSocket02.components["entity-socket"];
        socket.subscribe("onSnap", this.showScale3);
        socket.delayedInitSocket();
        socket.enableSocket();
      this.sampleSocket02.object3D.visible = true;
      this.sampleSocket02.components["entity-socket"].enableSocket();
    },

    showScale3()
    {
      this.sampleSocket02.components["entity-socket"].unsubscribe("onSnap", this.showScale3);

      this.displayText.setAttribute("text", { value: "0"});
      
      var socket = this.sampleSocketScale03.components["entity-socket"];
        socket.subscribe("onSnap", this.plant3Weigth);
        socket.delayedInitSocket();
        socket.enableSocket();
      this.sampleSocketScale03.object3D.visible = true;
      this.sampleSocketScale03.components["entity-socket"].enableSocket();
    },

    plant3Weigth()
    {
      this.sampleSocketScale03.components["entity-socket"].unsubscribe("onSnap", this.plant3Weigth);

      this.displayText.setAttribute("text", { value: "3"});

      var socket = this.sampleSocket03.components["entity-socket"];
        socket.subscribe("onSnap", this.remove3Weigth);
        socket.delayedInitSocket();
        socket.enableSocket();
      this.sampleSocket03.object3D.visible = true;
      this.sampleSocket03.components["entity-socket"].enableSocket();
    },

    remove3Weigth()
    {
      this.sampleSocket03.components["entity-socket"].unsubscribe("onSnap", this.remove3Weigth);

      this.displayText.setAttribute("text", { value: "0"});

      this.firstPlaced = this.sol1;
      this.secondPlaced = this.sol2;
      this.thirdPlaced = this.sol3;

      this.skipBtn.object3D.visible = true;
      this.changeBtn1.object3D.visible = true;
      this.changeBtn2.object3D.visible = true;
    },

    onClickSkipBtn()
    {
      if(this.data.skipBtnClicked) this.localSkipBtnClicked = false;
      NAF.utils.getNetworkedEntity(this.el).then(networkedEl => {
    
        NAF.utils.takeOwnership(networkedEl);
  
        this.el.setAttribute("third-experiment-04", "skipBtnClicked", true);      
  
        this.updateUI();
      });
    },

    onClickChange1Btn()
    {
      NAF.utils.getNetworkedEntity(this.el).then(networkedEl => {
    
        NAF.utils.takeOwnership(networkedEl);
  
        this.el.setAttribute("third-experiment-04", "change1BtnClicked", true);      
  
        this.updateUI();
      });
    },

    onClickChange2Btn()
    {
      NAF.utils.getNetworkedEntity(this.el).then(networkedEl => {
    
        NAF.utils.takeOwnership(networkedEl);
  
        this.el.setAttribute("third-experiment-04", "change2BtnClicked", true);      
  
        this.updateUI();
      });
    },

    compileAnswer()
    {
      this.correct=false;
      if(this.firstPlaced == this.sol1 && this.secondPlaced == this.sol2 && this.thirdPlaced == this.sol3)this.correct=true;
      
      if(this.answerRound == 0)
      {
        this.answerRound = 1;
        if(this.correct)
        {
          this.answerRound = 3;
          this.mannequin.components["mannequin"].displayMessage(62);
          this.skipOrderEnd();
        }
        else
        {
          this.mannequin.components["mannequin"].displayMessage(63);
        }
      }
      else if(this.answerRound == 1)
      {
        this.answerRound = 2;
        if(this.correct)
        {
          this.answerRound = 3;
          this.mannequin.components["mannequin"].displayMessage(64);
          this.skipOrderEnd();
        }
        else
        {
          switch (this.chosen) {
            case 0:
              this.mannequin.components["mannequin"].displayMessage(66);
              break;
            case 1:
              this.mannequin.components["mannequin"].displayMessage(65);
              break;
            case 2:
              this.mannequin.components["mannequin"].displayMessage(67);
              break;
            default:
              break;
          }
        } 
      }
      else if(this.answerRound == 2)
      {
        if(this.correct)
        {
          this.skipOrderEnd();
        }
        else
        {
        }
      }
    },

    skipOrderEnd()
    {
      this.skipBtn.object3D.visible = false;
      this.changeBtn1.object3D.visible = false;
      this.changeBtn2.object3D.visible = false;

      this.delayBtn.object3D.visible = true;
    },

    onClickDelayBtn()
    {
      NAF.utils.getNetworkedEntity(this.el).then(networkedEl => {
    
        NAF.utils.takeOwnership(networkedEl);
  
        this.el.setAttribute("third-experiment-04", "delayBtnClicked", true);      
  
        this.updateUI();
      });
    },

    endPart04()
    {
      this.delayBtn.object3D.visible = false;

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

