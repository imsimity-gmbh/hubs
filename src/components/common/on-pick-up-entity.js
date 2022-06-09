AFRAME.registerComponent("on-pick-up-entity", {
    schema: {
    },

    init: function() {
        this.sceneEl = document.querySelector("a-scene");

        this.ownedByMe = false;
    },

    tick() {
        NAF.utils.getNetworkedEntity(this.el).then(networkedEl => {

            if(NAF.utils.isMine(networkedEl)) {
                this.ownedByMe = true;
                return;
            } 

            if(this.sceneEl.systems.interaction.isHeld(this.el)) { //how to check if I am the one holding it?
                this.onPickUp();
            }
        });
    },

    onPickUp() {
        NAF.utils.getNetworkedEntity(this.el).then(networkedEl => {
      
          NAF.utils.takeOwnership(networkedEl);    

          this.ownedByMe = true;
    
          this.updateUI();
        });
      },
});