import { waitForDOMContentLoaded } from "../utils/async-utils";

AFRAME.registerComponent("waage-tool", {
    schema: {
        rightAmount: {default: 0},
    },
  
    init: function() {
        this.sceneEl = document.querySelector("a-scene");
        this.lastUpdate = performance.now();
        
        this.el.sceneEl.addEventListener("stateadded", () => this.updateUI());
        this.el.sceneEl.addEventListener("stateremoved", () => this.updateUI());

        waitForDOMContentLoaded().then(() => { 
            this.weight = 0;
            this.containerWeight = 64.55;
            this.weightAfterGlowing = 0;
            this.displayWeight = this.weight + "g";

            this.onContainerPlaced = AFRAME.utils.bind(this.onContainerPlaced, this);
            this.proceedToFormula = AFRAME.utils.bind(this.proceedToFormula, this);
            this.onPickUpContainer = AFRAME.utils.bind(this.onPickUpContainer, this);

            this.crucibleSocketTripod = this.sceneEl.querySelector(".crucible-socket-04");

            this.scaleSocket = this.sceneEl.querySelector(".scale-socket");
            this.scaleSocket.components["entity-socket"].subscribe("onSnap", this.onContainerPlaced);

            this.ready = true;
            this.tooMuch = false;

            this.displayText = this.el.querySelector(".display-text");
            this.displayText.setAttribute("text", { value: this.displayWeight });

            this.taraBtn = this.el.querySelector(".tara-btn");
            this.taraBtn.object3D.addEventListener("interact", () => this.tara(false));
            this.taraPressed = false;

            this.glowLossBtn = this.el.querySelector(".glow-loss-btn");
            this.glowLossBtn.object3D.addEventListener("interact", () => this.proceedToFormula());
            this.glowLossBtn.object3D.visible = false;

            this.onContainerPlacedCallbacks = [];
            this.onTaraPressedCallbacks = [];
            this.onRightAmountCallbacks = [];
            this.onGlowLossWeighedCallbacks = [];
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
    
    updateUI: function() {

    },
  
    tick: function() {


    },

    onContainerPlaced() {
        this.weight = this.containerWeight;
        this.displayWeight = this.weight + "g";
        this.displayText.setAttribute("text", { value: this.displayWeight });
        this.ready = true;
        this.onContainerPlacedCallbacks.forEach(cb => {
            cb();
        });
        this.crucibleSocketTripod.components["entity-socket"].subscribe("onPickedUp", this.onPickUpContainer);
    },

    onPickUpContainer() {
        this.weight = 0;
        this.displayWeight = this.weight + "g";
        this.displayText.setAttribute("text", { value: this.displayWeight });
        this.crucibleSocketTripod.components["entity-socket"].unsubscribe("onPickedUp", this.onPickUpContainer);
    },

    addWeight(gramm) {
        if(this.ready == false)
            return;

        this.weight += gramm;
        this.displayWeight = this.weight + "g";
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

        this.displayWeight = this.weight + "g";
        this.displayText.setAttribute("text", { value: this.displayWeight });

        this.ready = false;
        this.onRightAmountCallbacks.forEach(cb => {
            cb();
        });
    },

    tara(skip) {
        if(this.ready == false || this.taraPressed)
            return;

        if(skip == false) {
            this.weight = 0;
            this.displayWeight = this.weight + "g";
            this.displayText.setAttribute("text", { value: this.displayWeight });
            this.taraPressed = true;
        }

        if(skip) {
            this.weight = 50;
            this.displayWeight = this.weight + "g";
            this.displayText.setAttribute("text", { value: this.displayWeight });
            if(this.weight == this.data.rightAmount || this.weight == (this.data.rightAmount + this.containerWeight)) {
                this.ready = false;
                this.onRightAmountCallbacks.forEach(cb => {
                    cb();
                });
            }
        }
        this.onTaraPressedCallbacks.forEach(cb => {
            cb();
        });
    },

    setGlowLossWeight(weight) {
        this.weightAfterGlowing = weight;
    },

    measureGlowLoss() {
        this.weight = this.weightAfterGlowing;
        this.displayWeight = this.weight + "g";
        this.displayText.setAttribute("text", { value: this.displayWeight });

        this.taraBtn.object3D.visible = false;
        this.glowLossBtn.object3D.visible = true;
    },

    proceedToFormula() {
        this.onGlowLossWeighedCallbacks.forEach(cb => {
            cb();
        });
        this.glowLossBtn.object3D.visible = false;
    }

  });