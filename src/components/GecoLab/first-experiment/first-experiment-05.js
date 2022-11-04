import { cloneObject3D } from "../../../utils/three-utils";
import { waitForDOMContentLoaded } from "../../../utils/async-utils";

import { IMSIMITY_INIT_DELAY } from "../../../utils/imsimity";
import { decodeNetworkId, getNetworkIdFromEl } from "../../../utils/GecoLab/network-helper";

/* Same as before: Buttons networked, maybe button called on spawn like in 03+04, entity-socket callbacks not yet  */

  AFRAME.registerComponent("first-experiment-05", {
    schema: {
        stirBtnHeld: {default: false},
        stirBtnDone: {default: 0},
        ctrlBtnClicked: {default: false},
        ctrlBtnIndex: {default: 2},
        measuredCounter: {default: 0},
        thermoPopupClosed: {default: false},
        minuteMark1: {default: false},
        minuteMark2: {default: false},
        minuteMark3: {default: false},
    },
  
    init: function() {
        this.lastUpdate = performance.now();
        
        this.el.sceneEl.addEventListener("stateadded", () => this.updateUI());
        this.el.sceneEl.addEventListener("stateremoved", () => this.updateUI());

        this.temp = 0;
        this.localMeasuredCounter = 0;

        this.scaleUp;
        this.wasGreater500 = false;

        this.localStirBtnHeld = false;
        this.localStirBtnDone = 0;
        this.stopStiring = true;
        this.updatePos = false;
        this.x = 0;
        this.z = 0;
        this.t = 0;
        
        this.ctrlBtnBlocked = true;
        this.localCtrlBtnClicked = false;
        this.localCtrlBtnIndex = 2;
        this.localThermoPopupClosed = false;

        this.minuteMark1FinishedCallbacks = [];
        this.stopBurnerSoundCallbacks = [];

        this.startPart05 = AFRAME.utils.bind(this.startPart05, this);
        this.glassStickPlaced = AFRAME.utils.bind(this.glassStickPlaced, this);
        this.thermoRunning = AFRAME.utils.bind(this.thermoRunning, this);
        this.thermoOnTable = AFRAME.utils.bind(this.thermoOnTable, this);
        this.startStiring = AFRAME.utils.bind(this.startStiring, this);
        this.cutBunsenBurner = AFRAME.utils.bind(this.cutBunsenBurner, this);
        this.waitForCoolingTask = AFRAME.utils.bind(this.waitForCoolingTask, this);
        this.startCoolingTask = AFRAME.utils.bind(this.startCoolingTask, this);
        this.turnOffBunsenBurner = AFRAME.utils.bind(this.turnOffBunsenBurner, this);
        this.tongPlacedOnCrucible = AFRAME.utils.bind(this.tongPlacedOnCrucible, this);
        this.cruciblePlacedOnTripod2 = AFRAME.utils.bind(this.cruciblePlacedOnTripod2, this);
        this.tongReplacedOnTable = AFRAME.utils.bind(this.tongReplacedOnTable, this);
        this.onHoldStirBtnDown = AFRAME.utils.bind(this.onHoldStirBtnDown, this);
        this.onReleaseStirBtn = AFRAME.utils.bind(this.onReleaseStirBtn, this);
        this.tempertatureScale = AFRAME.utils.bind(this.tempertatureScale, this);
        this.tematureCalc = AFRAME.utils.bind(this.tempertatureCalc, this);
        this.onMinuteMark1 = AFRAME.utils.bind(this.onMinuteMark1, this);
        this.onMinuteMark2 = AFRAME.utils.bind(this.onMinuteMark2, this);
        this.onMinuteMark3 = AFRAME.utils.bind(this.onMinuteMark3, this);
        
        
        this.expSystem = this.el.sceneEl.systems["first-experiments"];

        this.localMinuteMark1 = false;
        this.localMinuteMark2 = false;
        this.localMinuteMark3 = false;
    
        waitForDOMContentLoaded().then(() => { 

            var networkId = getNetworkIdFromEl(this.el);

            this.experimentData = decodeNetworkId(networkId);

            this.isMember = this.expSystem.getIsMemberForGroupCode(this.experimentData.groupCode);

            this.expSystem.registerTask("05", this.el, this.experimentData);

            setTimeout(() => {

                this.firstExpPart01 = this.expSystem.getTaskById("01", this.experimentData.groupCode);
                this.firstExpPart02 = this.expSystem.getTaskById("02", this.experimentData.groupCode);
                this.firstExpPart04 = this.expSystem.getTaskById("04", this.experimentData.groupCode);


                this.thermoSocket05 = this.el.querySelector(".thermo-socket-05");
                this.thermoSocketGeneral = this.firstExpPart01.querySelector(".thermo-socket")
                this.glassStickSocket = this.firstExpPart01.querySelector(".glass-stick-socket");
                this.glassStickSocketCrucible = this.firstExpPart04.querySelector(".glass-stick-socket-04");
                this.tongSocketCrucible = this.el.querySelector(".tong-socket-crucible");
                this.tongSocketGeneral = this.firstExpPart01.querySelector(".tong-socket");
                this.crucibleSocket05 = this.el.querySelector(".crucible-socket-05");

                this.stopwatchEntity = this.expSystem.getTaskById('stopwatch', this.experimentData.groupCode);

                console.log(this.stopwatchEntity);

                this.thermoEntity = this.firstExpPart02.querySelector(".thermo-entity");
                this.glassstickEntity = this.firstExpPart02.querySelector(".glass-stick-entity");
                this.flameEntity = this.firstExpPart02.querySelector(".flame-entity");
                this.crucibleEntity = this.firstExpPart02.querySelector(".crucible-entity");
                this.tongEntity = this.firstExpPart02.querySelector(".tong-entity");
                this.attachedTongEntity = this.crucibleEntity.querySelector(".attached-tong-entity");

                

                this.tempText = this.thermoEntity.querySelector(".thermo-text");
                

                this.stiringBtn = this.firstExpPart04.querySelector(".stiring-btn");
                this.stiringBtn.object3D.addEventListener("holdable-button-down", this.onHoldStirBtnDown);
                this.stiringBtn.object3D.addEventListener("holdable-button-up", this.onReleaseStirBtn);


                this.ctrlBtn00 = this.firstExpPart04.querySelector(".burner-ctrl-btn-0");
                this.ctrlBtn00.object3D.addEventListener("interact", () => this.onClickCtrlBtn(0));
                this.ctrlBtn01 = this.firstExpPart04.querySelector(".burner-ctrl-btn-1");
                this.ctrlBtn01.object3D.addEventListener("interact", () => this.onClickCtrlBtn(1));
                this.ctrlBtn02 = this.firstExpPart04.querySelector(".burner-ctrl-btn-2");
                this.ctrlBtn02.object3D.addEventListener("interact", () => this.onClickCtrlBtn(2));
                this.ctrlBtn03 = this.firstExpPart04.querySelector(".burner-ctrl-btn-3");
                this.ctrlBtn03.object3D.addEventListener("interact", () => this.onClickCtrlBtn(3));

                this.stopwatchEntity.components["stopwatch-tool"].subscribe("minuteMark1", this.onMinuteMark1);
                this.stopwatchEntity.components["stopwatch-tool"].subscribe("minuteMark2", this.onMinuteMark2);
                this.stopwatchEntity.components["stopwatch-tool"].subscribe("minuteMark3", this.onMinuteMark3);

            }, IMSIMITY_INIT_DELAY)

        });


    },

    onMinuteMark1()
    {
        NAF.utils.getNetworkedEntity(this.el).then(networkedEl => {
            NAF.utils.takeOwnership(networkedEl);
      
            this.el.setAttribute("first-experiment-05", "minuteMark1", true);      
        });
    },

    onMinuteMark2()
    {
        NAF.utils.getNetworkedEntity(this.el).then(networkedEl => {
            NAF.utils.takeOwnership(networkedEl);
      
            this.el.setAttribute("first-experiment-05", "minuteMark2", true);      
        });
    },

    onMinuteMark3()
    {
        NAF.utils.getNetworkedEntity(this.el).then(networkedEl => {
            NAF.utils.takeOwnership(networkedEl);
      
            this.el.setAttribute("first-experiment-05", "minuteMark3", true);
        });
    },

    subscribe(eventName, fn)
    {
        switch(eventName) {
            case "minuteMark1Finished":
              this.minuteMark1FinishedCallbacks.push(fn);
              break;
            case "stopBurnerSound":
                this.stopBurnerSoundCallbacks.push(fn);
                console.log(this.stopBurnerSoundCallbacks);
                break;
        }
    },

    unsubscribe(eventName, fn)
    {
    },

    update() {
        waitForDOMContentLoaded().then(() => { 
          this.updateUI();
        });
    },

    onHoldStirBtnDown() {
        NAF.utils.getNetworkedEntity(this.el).then(networkedEl => {
    
            NAF.utils.takeOwnership(networkedEl);
      
            this.el.setAttribute("first-experiment-05", "stirBtnHeld", true);      
        
        });
    },

    onReleaseStirBtn() {
        NAF.utils.getNetworkedEntity(this.el).then(networkedEl => {
    
            NAF.utils.takeOwnership(networkedEl);

            this.el.setAttribute("first-experiment-05", "stirBtnHeld", false);      
            
        });
    },
    
    updateUI: function() {

        console.log(this.data);

        if(this.localStirBtnHeld != this.data.stirBtnHeld) {
            if(this.data.stirBtnHeld) 
                this.stirBtnDown();
            else if(this.data.stirBtnHeld == false)
                this.stirBtnUp();

            this.localStirBtnHeld = this.data.stirBtnHeld;
        }

        if(this.localStirBtnDone != this.data.stirBtnDone) {
           
            if(this.data.stirBtnDone === 1 && this.localStirBtnDone === 0)
            { 
                this.stopStir = true;
                this.updatePos = false;
                this.stiringBtn.object3D.visible = false;
                console.log("BTN DONE 1");
                this.stopwatchEntity.components["stopwatch-tool"].adjustSpeed(100);

                this.minuteMark1FinishedCallbacks.forEach(cb => {
                    cb();
                });
                
            }
            else if (this.data.stirBtnDone === 2 && this.localStirBtnDone === 1)
            {
                this.stopStir = true;
                this.updatePos = false;
                this.stiringBtn.object3D.visible = false;
                console.log("BTN DONE 2");
                this.glassStickSocket.components["entity-socket"].enableSocket();
                this.glassStickSocket.components["entity-socket"].subscribe("onSnap", this.waitForCoolingTask);
            }

            this.localStirBtnDone = this.data.stirBtnDone;
        }


        if(this.localMinuteMark1 != this.data.minuteMark1 && this.data.minuteMark1 === true)
        {
            this.startPart05();

            this.localMinuteMark1 = this.data.minuteMark1;
        }
        
        if(this.localMinuteMark2 != this.data.minuteMark2 && this.data.minuteMark2 === true)
        {
            this.startPart05();
            
            this.localMinuteMark2 = this.data.minuteMark2;
        }

        if(this.localMinuteMark3 != this.data.minuteMark3 && this.data.minuteMark3 === true)
        {
            this.startCoolingTask();
            
            this.localMinuteMark3 = this.data.minuteMark3;
        }

        if(this.localThermoPopupClosed != this.data.thermoPopupClosed) {
           
            this.thermoSocketGeneral.components["entity-socket"].unsubscribe("onSnap", this.thermoOnTable);
            this.glassStickSocketCrucible.components["entity-socket"].enableSocket();
            this.glassStickSocketCrucible.components["entity-socket"].subscribe("onSnap", this.startStiring);
            this.mannequin = this.el.sceneEl.systems["mannequin-manager"].getMannequinByGroupCode(this.experimentData.groupCode);
            this.mannequin.components["mannequin"].displayMessage(9);  


            this.localThermoPopupClosed = this.data.thermoPopupClosed;
        }


        if(this.localCtrlBtnClicked != this.data.ctrlBtnClicked) {
            this.localCtrlBtnIndex = this.data.ctrlBtnIndex;
            if(this.localCtrlBtnIndex == 2)
                this.cutBunsenBurner();
            if(this.localCtrlBtnIndex == 1)
                this.turnOffBunsenBurner();

            // moved here
            if(this.temp > 50){
                this.tempertatureScale(1,5,this.temp,470);
                // Mannequin
                this.mannequin = this.el.sceneEl.systems["mannequin-manager"].getMannequinByGroupCode(this.experimentData.groupCode);
                this.mannequin.components["mannequin"].displayMessage(-1);
            }

            this.localCtrlBtnClicked = this.data.ctrlBtnClicked;
        }

        if(this.localOnClickTurnOffBunsenBurner != this.data.onClickTurnOffBunsenBurner) {
            this.turnOffBunsenBurner();
            this.localOnClickTurnOffBunsenBurner = this.data.onClickTurnOffBunsenBurner;
        }

        if(this.localMeasuredCounter != this.data.measuredCounter) {
            this.localMeasuredCounter = this.data.measuredCounter;
        }
        
    },
  
    tick: function() {

        if(!this.wasGreater500 && this.temp > 500) {
            this.ctrlBtn02.object3D.visible = true;
            this.ctrlBtnBlocked = false;
            this.wasGreater500 = true;

            console.log("Was Greater than 500");
        }

        if(this.updatePos && this.stopStiring == false) {
            this.t += 0.03
            this.x = (Math.cos(this.t) * 0.0004);
            this.z = (Math.sin(this.t) * 0.0004);

            var pos = this.glassStickPosition;
            pos.x += this.x;
            pos.z += this.z;

            this.glassstickEntity.object3D.position.set(pos.x, pos.y, pos.z);

            if(this.t > 10) {
                // Mannequin
                this.mannequin = this.el.sceneEl.systems["mannequin-manager"].getMannequinByGroupCode(this.experimentData.groupCode);
                this.mannequin.components["mannequin"].displayMessage(-1);
                if(!this.wasGreater500) {

                    // First Stir
                    this.stopStir = true;
                    this.updatePos = false;
                    
                    console.log("Sending stirBtnDone 1");

                    NAF.utils.getNetworkedEntity(this.el).then(networkedEl => {
    
                        NAF.utils.takeOwnership(networkedEl);
                  
                        this.el.setAttribute("first-experiment-05", "stirBtnDone", 1);      
                  
                    });
                }
                else {

                    // Second Stir
                    this.stopStir = true;
                    this.updatePos = false;

                    console.log("Sending stirBtnDone 2");

                    NAF.utils.getNetworkedEntity(this.el).then(networkedEl => {
    
                        NAF.utils.takeOwnership(networkedEl);
                  
                        this.el.setAttribute("first-experiment-05", "stirBtnDone", 2);      
                  
                    });
                }
            }
        }
    },

    //minStep is the minimum change each second, higher smoothing means more smaller steps until the aim is reached; smoothing and minStep should always be true positive
    tempertatureScale(minStep, smoothing, startTemperature, aimTemperature){
        this.temp = startTemperature;
        if(this.scaleUp) clearInterval(this.scaleUp);
        this.scaleUp = setInterval(() => this.tematureCalc(minStep, smoothing, startTemperature, aimTemperature),1000);
           
    },

    tempertatureCalc(minStep, smoothing, startTemperature, aimTemperature){
        if(Math.abs(aimTemperature - this.temp) > minStep){
            if(aimTemperature > startTemperature)
                this.temp = this.temp + Math.max(minStep, (aimTemperature - this.temp)/smoothing);
            else{
                this.temp = this.temp - Math.max(minStep, (this.temp - aimTemperature)/smoothing);
            }
        }
        else
            this.temp = aimTemperature;
        let roundedTemp = Math.round(this.temp);
        let displayTemp = roundedTemp + " °C";
        this.tempText.setAttribute("text", { value: displayTemp });
        if(this.temp == aimTemperature) clearInterval(this.scaleUp);
    },
    

    stirBtnDown() {
        this.updatePos = true;
    },

    stirBtnUp() {
        this.updatePos = false;
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

    startPart05() {
        console.log("start 05");

        if (this.localMeasuredCounter == 0)
        {
            this.mannequin = this.el.sceneEl.systems["mannequin-manager"].getMannequinByGroupCode(this.experimentData.groupCode);
            this.mannequin.components["mannequin"].displayMessage(8);  
        }
        else if (this.localMeasuredCounter > 0)
        {
            this.mannequin = this.el.sceneEl.systems["mannequin-manager"].getMannequinByGroupCode(this.experimentData.groupCode);
            this.mannequin.components["mannequin"].displayMessage(10);  
        }
        
        this.stopwatchEntity.components["stopwatch-tool"].adjustSpeed(1000);
        this.glassStickSocket.components["entity-socket"].enableSocket();
        this.glassStickSocket.components["entity-socket"].subscribe("onSnap", this.glassStickPlaced);
    },

    glassStickPlaced() {
        console.log("placed stick");

        //Mannequin
        this.mannequin = this.el.sceneEl.systems["mannequin-manager"].getMannequinByGroupCode(this.experimentData.groupCode);
    
        this.thermoSocket05.components["entity-socket"].enableSocket();
        this.thermoSocket05.components["entity-socket"].subscribe("onSnap", this.thermoRunning);
        this.glassStickSocket.components["entity-socket"].unsubscribe("onSnap", this.glassStickPlaced);
    },

    thermoRunning() {
        this.thermoSocket05.components["entity-socket"].unsubscribe("onSnap", this.thermoRunning);
        if(this.localMeasuredCounter == 0) {
            this.tempertatureScale(1,4,0,376);
            setTimeout(() => {
                this.thermoSocketGeneral.components["entity-socket"].enableSocket();
                this.thermoSocketGeneral.components["entity-socket"].subscribe("onSnap", this.thermoOnTable);
                console.log(this.thermoSocketGeneral.components["entity-socket"].onPickedUpCallbacks);
                NAF.utils.getNetworkedEntity(this.el).then(networkedEl => {
    
                    NAF.utils.takeOwnership(networkedEl);
              
                    this.el.setAttribute("first-experiment-05", "measuredCounter", 1);      
              
                });
            }, 4000);
        }

        if(this.localMeasuredCounter > 0) {
            this.stopwatchEntity.components["stopwatch-tool"].adjustSpeed(1000);
            if(this.temp == 0){
                this.tempertatureScale(10,4,0,507);
            }
        }
    },
 
    thermoOnTable() {
        this.tempertatureScale(15,3,this.temp,0);
        if(this.wasGreater500){
            this.thermoSocketGeneral.components["entity-socket"].unsubscribe("onSnap", this.thermoOnTable);
            this.glassStickSocketCrucible.components["entity-socket"].enableSocket();
            this.glassStickSocketCrucible.components["entity-socket"].subscribe("onSnap", this.startStiring);
        }
        if(!this.wasGreater500){
            if (this.isMember)
            {
                this.el.sceneEl.emit("gecolab_temperature_info", this.experimentData.groupCode);
            }
        }
    },

    onPopupClosed() {

        NAF.utils.getNetworkedEntity(this.el).then(networkedEl => {
    
            NAF.utils.takeOwnership(networkedEl);
      
            this.el.setAttribute("first-experiment-05", "thermoPopupClosed", true);

        });
    },


    startStiring() {
        this.glassStickPosition = this.glassstickEntity.object3D.position.clone();
        if (this.isMember)
        {
            this.stiringBtn.object3D.visible = true;
        }
        this.stopStiring = false;
        this.glassStickSocketCrucible.components["entity-socket"].unsubscribe("onSnap", this.startStiring);
    },

    onClickCtrlBtn(index) {

        console.log('OnClickCtrlBtn');

        if(this.ctrlBtnBlocked)
            return;
        
        
        NAF.utils.getNetworkedEntity(this.el).then(networkedEl => {
    
            NAF.utils.takeOwnership(networkedEl);
      
            this.el.setAttribute("first-experiment-05", "ctrlBtnClicked", !this.data.ctrlBtnClicked);
            this.el.setAttribute("first-experiment-05", "ctrlBtnIndex", index)      

        });
    },


    cutBunsenBurner() {
        //TODO: Error here
        this.ctrlBtnBlocked = true;
        this.measureTemp = false;
        this.ctrlBtn02.object3D.visible = false;
        
        if (this.isMember)
        {
            this.ctrlBtn01.object3D.visible = true;
        }
        
        setTimeout(() => {
            this.thermoSocketGeneral.components["entity-socket"].enableSocket();
            this.thermoSocketGeneral.components["entity-socket"].subscribe("onSnap", this.thermoOnTable);
            this.t = 0;
            this.ctrlBtn01.object3D.visible = false;
        }, 500);
    },

    waitForCoolingTask() {
        this.stopwatchEntity.components["stopwatch-tool"].adjustSpeed(100);
        this.glassStickSocket.components["entity-socket"].unsubscribe("onSnap", this.waitForCoolingTask);
    },

    startCoolingTask() {
        if (this.isMember)
        {
            this.ctrlBtn01.object3D.visible= true;
        }
        this.ctrlBtnBlocked = false;
        this.stopwatchEntity.components["stopwatch-tool"].adjustSpeed(1000);

        this.mannequin = this.el.sceneEl.systems["mannequin-manager"].getMannequinByGroupCode(this.experimentData.groupCode);
        this.mannequin.components["mannequin"].displayMessage(11);
    },

    turnOffBunsenBurner() {
        this.ctrlBtnBlocked = true;
        this.flameEntity.object3D.visible = false;
        this.ctrlBtn01.object3D.visible = false;
        if (this.isMember)
        {
            this.ctrlBtn00.object3D.visible = true;
        }
        this.stopBurnerSoundCallbacks.forEach(cb => {
            cb();
        });

        setTimeout(() => {
            this.ctrlBtn00.object3D.visible = false;
            this.tongSocketCrucible.components["entity-socket"].enableSocket();
            this.tongSocketCrucible.components["entity-socket"].subscribe("onSnap", this.tongPlacedOnCrucible);
        }, 500);
    },

    tongPlacedOnCrucible() {
        this.tongEntity.object3D.visible = false;
        this.attachedTongEntity.object3D.visible = true;
        this.crucibleSocket05.components["entity-socket"].enableSocket();
        this.crucibleSocket05.components["entity-socket"].subscribe("onSnap", this.cruciblePlacedOnTripod2);
        this.tongSocketCrucible.components["entity-socket"].unsubscribe("onSnap", this.tongPlacedOnCrucible);
    },

    cruciblePlacedOnTripod2() {

        var parent = this.tongEntity.object3D.parent;
        
        this.crucibleSocket05.object3D.attach(this.tongEntity.object3D);

        this.tongEntity.object3D.position.set(0.26, 0.35, 0);

        parent.attach(this.tongEntity.object3D);
        
        this.tongEntity.object3D.visible = true;
        this.attachedTongEntity.object3D.visible = false;
        this.tongSocketGeneral.components["entity-socket"].enableSocket();
        this.tongSocketGeneral.components["entity-socket"].subscribe("onSnap", this.tongReplacedOnTable);
        this.crucibleSocket05.components["entity-socket"].unsubscribe("onSnap", this.cruciblePlacedOnTripod2);
    },

    tongReplacedOnTable() {
        this.tongSocketGeneral.components["entity-socket"].unsubscribe("onSnap", this.tongReplacedOnTable);
        this.stopwatchEntity.components["stopwatch-tool"].adjustSpeed(50);
        
        // Mannequin
        this.mannequin = this.el.sceneEl.systems["mannequin-manager"].getMannequinByGroupCode(this.experimentData.groupCode);
        this.mannequin.components["mannequin"].displayMessage(-1);
    },

    remove() {
        console.log("removing first-experiment 05");
        this.expSystem.deregisterTask("05", this.el, this.experimentData);
    }

  });