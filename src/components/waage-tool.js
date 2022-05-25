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
            this.displayWeight = this.weight + "g";

            this.onScalePlaced = AFRAME.utils.bind(this.onScalePlaced, this);
            this.onContainerPlaced = AFRAME.utils.bind(this.onContainerPlaced, this);

            this.crucibleSocket = this.sceneEl.querySelector(".crucible-socket");
            this.crucibleSocket.object3D.visible = false;
            this.crucibleSocket.components["entity-socket"].subscribe("onSnap", this.onContainerPlaced);

            this.scaleSocket = this.sceneEl.querySelector(".scale-socket");
            this.scaleSocket.components["entity-socket"].subscribe("onSnap", this.onScalePlaced);

            this.scalePlaced = false;
            this.ready = false;

            this.displayText = this.el.querySelector(".display-text");
            this.displayText.setAttribute("text", { value: this.displayWeight });

            this.taraBtn = this.el.querySelector(".tara-btn");
            this.taraBtn.object3D.addEventListener("interact", () => this.tara());

            this.onRightAmountCallbacks = [];
            // this.onContainerPlaced(); //nur drin bis entity-socket auf waage klappt
        });
    },

    subscribe(eventName, fn)
    {
        switch(eventName) {
            case "onRightAmount":
              this.onRightAmountCallbacks.push(fn);
              break;
        }
    },

    unsubscribe(eventName, fn)
    {
        switch(eventName) {
            case "onRightAmount":
              let index = this.onRightAmountCallbacks.indexOf(fn);
              this.onRightAmountCallbacks.splice(index, 1);
              break;
        }
    },
    
    updateUI: function() {

    },
  
    tick: function() {
        if(this.scalePlaced)
            return;

        let waagePos = this.el.getAttribute("position");
        this.crucibleSocket.setAttribute("position", {x: waagePos.x, y: (waagePos.y + 0.2), z: waagePos.z});
    },

    onScalePlaced() {
        this.scalePlaced = true;
        this.crucibleSocket.setAttribute("position", {x: -1.1, y: 0.7, z: -0.04});
        this.crucibleSocket.object3D.visible = true;
    },
    onContainerPlaced() {
        this.weight = 120;
        this.displayWeight = this.weight + "g";
        this.displayText.setAttribute("text", { value: this.displayWeight });
        this.ready = true;
    },

    addWeight(gramm) {
        if(this.ready == false)
            return;
        this.weight += gramm;
        this.displayWeight = this.weight + "g";
        this.displayText.setAttribute("text", { value: this.displayWeight });

        if(this.weight == this.data.rightAmount) {
            this.ready = false;
            this.onRightAmountCallbacks.forEach(cb => {
                cb();
            });
        }
    },

    removeWeight(gramm) {
        if(this.ready == false || this.weight <= 0)
            return;
        this.weight -= gramm;
        this.displayWeight = this.weight + "g";
        this.displayText.setAttribute("text", { value: this.displayWeight });

        if(this.weight == this.data.rightAmount) {
            this.ready = false;
            this.onRightAmountCallbacks.forEach(cb => {
                cb();
            });
        }
    },

    tara() {
        if(this.ready == false)
            return;
        this.weight = 50;
        this.displayWeight = this.weight + "g";
        this.displayText.setAttribute("text", { value: this.displayWeight });

        if(this.weight == this.data.rightAmount) {
            this.ready = false;
            this.onRightAmountCallbacks.forEach(cb => {
                cb();
            });
        }
    }

  });