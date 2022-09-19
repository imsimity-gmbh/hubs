AFRAME.registerSystem("mannequin-manager", {
  init() {
    this.mannequins = [];
    
    this.updateMyMannequin = this.updateMyMannequin.bind(this);
  },


  register(el) {
    this.mannequins.push(el);
    el.addEventListener("ownership-changed", this.updateMyMannequin);
    this.updateMyMannequin();
  },

  deregister(el) {
    this.robotEls.splice(this.robotEls.indexOf(el), 1);
    el.removeEventListener("ownership-changed", this.updateMyMannequin);
    this.updateMyMannequin();
  },

  getMyMannequin() {
    this.updateMyMannequin();

    return this.myMannequin;
  },


  updateMyMannequin() {
    this.myMannequin = this.mannequins.length > 0 ? this.mannequins[0] : null; 

    if (this.myMannequin) {
      this.sceneEl.addState("mannequin");
    } else {
      this.sceneEl.removeState("mannequin");
    }
  },
});
