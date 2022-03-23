/**
 * Collectible will be disabled on picked up and observers will be notified
 * @component collectible
 */
 
  AFRAME.registerComponent("collectible", {
     schema: {
     },
   
     init: function() {
        this.collectibleItem = this.el.querySelector(".collectible-item");

        this.onCollectCallbacks = [];
     },
 
     subscribe(eventName, fn)
     {
        switch(eventName) {
            case "onCollect":
                this.onCollectCallbacks.push(fn);
                break;
        }
     },
 
     unsubscribe(eventName, fn)
     {
       switch(eventName) {
           case "onCollect":
               let index = this.onCollectCallbacks.indexOf(fn);
               this.onCollectCallbacks.splice(index, 1);
               break;
       }
     },
   
     tick: function() {
        if(this.collectibleItem != null && this.el.sceneEl.systems.interaction.isHeld(this.collectibleItem)) {
            this.collectibleItem.object3D.visible = false;
            this.onCollectCallbacks.forEach(cb => {
                cb(this.collectibleItem);
              });
            this.collectibleItem = null;
        }
     },
 
   });
   