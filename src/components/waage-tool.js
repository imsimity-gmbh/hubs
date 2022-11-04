import { waitForDOMContentLoaded } from "../utils/async-utils";
import { IMSIMITY_INIT_DELAY } from "../utils/imsimity";
import { getGroupCodeFromParent } from "../utils/GecoLab/network-helper"

AFRAME.registerComponent("waage-tool", {
    schema: {
        rightAmount: {default: 0},
        taraPressed: {default: false},
        glowLossPressed: {default: false}
    },
  
    init: function() {
        this.lastUpdate = performance.now();
        
        this.el.sceneEl.addEventListener("stateadded", () => this.updateUI());
        this.el.sceneEl.addEventListener("stateremoved", () => this.updateUI());

        this.weight = 0;
        this.containerWeight = 64.55;
        this.weightAfterGlowing = 0;
        this.displayWeight = this.weight + " g";

        this.localTaraPressed = false;
        this.localGlowLossPressed = false;

        this.ready = true;
        this.tooMuch = false;

        this.onContainerPlacedCallbacks = [];
        this.onTaraPressedCallbacks = [];
        this.onRightAmountCallbacks = [];
        this.onGlowLossWeighedCallbacks = [];

        this.onContainerPlaced = AFRAME.utils.bind(this.onContainerPlaced, this);
        this.proceedToFormula = AFRAME.utils.bind(this.proceedToFormula, this);
        this.onPickUpContainer = AFRAME.utils.bind(this.onPickUpContainer, this);


        waitForDOMContentLoaded().then(() => { 

            setTimeout(() => {

                this.groupCode = getGroupCodeFromParent(this.el);

                const expSystem = this.el.sceneEl.systems["first-experiments"];
                this.isMember = this.expSystem.getIsMemberForGroupCode(this.groupCode);

                this.crucibleSocketTripod = expSystem.findElementForGroupCode(".crucible-socket-04", this.groupCode);

                this.scaleSocket = expSystem.findElementForGroupCode(".scale-socket", this.groupCode);

                console.log(this.scaleSocket);

                this.scaleSocket.components["entity-socket"].subscribe("onSnap", this.onContainerPlaced);


                this.displayText = this.el.querySelector(".display-text");
                this.displayText.setAttribute("text", { value: this.displayWeight });

                this.taraBtn = this.el.querySelector(".tara-btn");
                this.taraBtn.object3D.addEventListener("interact", () => this.tara());

                this.taraBtn.object3D.visible = false;
                this.displayText.object3D.visible = false;

                this.glowLossBtn = this.el.querySelector(".glow-loss-btn");
                this.glowLossBtn.object3D.addEventListener("interact", () => this.onClickGlowLossBtn());
                this.glowLossBtn.object3D.visible = false;


            }, IMSIMITY_INIT_DELAY);
           
            
           
            // this.onContainerPlaced(); //nur drin bis entity-socket auf waage klappt
        });
    },

    subscribe(eventName, fn)
    {
        switch(eventName) {
            case "onContainerPlaced":
              this.onContainerPlacedCallbacks.push(fn);
              break;
            case "onTaraPressed":
              this.onTaraPressedCallbacks.push(fn);
              break;
            case "onRightAmount":
              this.onRightAmountCallbacks.push(fn);
              break;
            case "onGlowLossWeighed":
              this.onGlowLossWeighedCallbacks.push(fn);
              break;
        }
    },

    unsubscribe(eventName, fn)
    {
        switch(eventName) {
            case "onContainerPlaced":
              let index = this.onContainerPlacedCallbacks.indexOf(fn);
              this.onContainerPlacedCallbacks.splice(index, 1);
              break;
            case "onTaraPressed":
              let index1 = this.onContainerPlacedCallbacks.indexOf(fn);
              this.onContainerPlacedCallbacks.splice(index1, 1);
              break;
            case "onRightAmount":
              let index2 = this.onRightAmountCallbacks.indexOf(fn);
              this.onRightAmountCallbacks.splice(index2, 1);
              break;
            case "onGlowLossWeighed":
              let index3 = this.onGlowLossWeighedCallbacks.indexOf(fn);
              this.onGlowLossWeighedCallbacks.splice(index3, 1);
              break;
        }
    },

    update() {
        waitForDOMContentLoaded().then(() => { 
          this.updateUI();
        });
    },
    
    updateUI: function() {

        if(this.localTaraPressed != this.data.taraPressed && this.data.taraPressed == true) {
            this.weight = 0;
            this.displayWeight = this.weight + " g";
            this.displayText.setAttribute("text", { value: this.displayWeight });
            this.taraPressed = true;
            
            this.taraBtn.object3D.visible = false;
    
            this.onTaraPressedCallbacks.forEach(cb => {
                cb();
            });
        }

        if(this.localGlowLossPressed != this.data.glowLossPressed) {
            this.proceedToFormula();
            this.localGlowLossPressed = this.data.glowLossPressed;
        }
    },
  
    tick: function() {


    },

    onContainerPlaced() {
        this.taraBtn.object3D.visible = true;
        this.displayText.object3D.visible = true;

        this.weight = this.containerWeight;
        this.displayWeight = this.weight + " g";
        this.displayText.setAttribute("text", { value: this.displayWeight });
        this.ready = true;
        this.onContainerPlacedCallbacks.forEach(cb => {
            cb();
        });
        this.crucibleSocketTripod.components["entity-socket"].subscribe("onPickedUp", this.onPickUpContainer);
    },

    onPickUpContainer() {
        this.weight = 0;
        this.displayWeight = this.weight + " g";
        this.displayText.setAttribute("text", { value: this.displayWeight });
        this.crucibleSocketTripod.components["entity-socket"].unsubscribe("onPickedUp", this.onPickUpContainer);
    },

    addWeight(gramm) {
        if(this.ready == false)
            return;

        this.weight += gramm;
        this.displayWeight = this.weight + " g";
        this.displayText.setAttribute("text", { value: this.displayWeight });

        if(this.taraPressed && this.weight > this.data.rightAmount || this.taraPressed == false && this.weight > (this.data.rightAmount + this.containerWeight))
            this.tooMuch = true;

        if(this.weight == this.data.rightAmount || this.weight == (this.data.rightAmount + this.containerWeight)) {
            this.ready = false;
            this.onRightAmountCallbacks.forEach(cb => {
                cb();
            });
        }
    },

    removeWeight() {
        if(this.ready == false || this.tooMuch == false)
            return;

        if(this.taraPressed)
            this.weight = this.data.rightAmount;
        else    
            this.weight = this.containerWeight + this.data.rightAmount;

        this.displayWeight = this.weight + " g";
        this.displayText.setAttribute("text", { value: this.displayWeight });

        this.ready = false;
        this.onRightAmountCallbacks.forEach(cb => {
            cb();
        });
    },

    tara() {
        if(this.ready == false || this.localTaraPressed)
            return;

        NAF.utils.getNetworkedEntity(this.el).then(networkedEl => {

            NAF.utils.takeOwnership(networkedEl);
        
            this.el.setAttribute("waage-tool", "taraPressed", true); 
        });
    
    },

    reset() {
        this.weight = 0;
        this.displayWeight = this.weight + " g";
        this.displayText.setAttribute("text", { value: this.displayWeight });
    },

    setGlowLossWeight(weight) {
        this.weightAfterGlowing = weight;
    },

    measureGlowLoss() {
        this.weight = this.weightAfterGlowing;
        this.displayWeight = this.weight + " g";
        this.displayText.setAttribute("text", { value: this.displayWeight });

        this.taraBtn.object3D.visible = false;
        this.glowLossBtn.object3D.visible = true;
    },

    onClickGlowLossBtn() {
        NAF.utils.getNetworkedEntity(this.el).then(networkedEl => {

            NAF.utils.takeOwnership(networkedEl);
        
            this.el.setAttribute("waage-tool", "glowLossPressed", true); 
        });
    },

    proceedToFormula() {
        this.onGlowLossWeighedCallbacks.forEach(cb => {
            cb();
        });
        console.log("formel");
        this.glowLossBtn.object3D.visible = false;
    }

  });