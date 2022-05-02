import { waitForDOMContentLoaded } from "../utils/async-utils";

AFRAME.registerComponent("waage-tool", {
    schema: {
        rightAmount: {default: 0},
    },
  
    init: function() {
        console.log("waage");
        this.sceneEl = document.querySelector("a-scene");
        this.lastUpdate = performance.now();
        
        this.el.sceneEl.addEventListener("stateadded", () => this.updateUI());
        this.el.sceneEl.addEventListener("stateremoved", () => this.updateUI());

        waitForDOMContentLoaded().then(() => { 
            this.weight = 0;
            this.displayWeight = this.weight + "g";

            this.containerPlaced = AFRAME.utils.bind(this.containerPlaced, this);

            this.ready = false;

            this.displayText = this.el.querySelector(".display-text");
            this.displayText.setAttribute("text", { value: this.displayWeight });

            this.taraBtn = this.el.querySelector(".tara-btn");
            this.taraBtn.object3D.addEventListener("interact", () => this.tara());

            this.onRightAmountCallbacks = [];
            this.containerPlaced(); //nur drin bis entity-socket auf waage klappt
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

    },

    containerPlaced() {
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
            this.onRightAmountCallbacks.forEach(cb => {
                cb();
            });
        }
    },

    tara() {
        if(this.ready == false)
            return;
        this.weight = 0;
        this.displayWeight = this.weight + "g";
        this.displayText.setAttribute("text", { value: this.displayWeight });
    }

  });