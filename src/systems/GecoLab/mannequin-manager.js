AFRAME.registerSystem("mannequin-manager", {
  init() {
    this.mannequins = [];
    
  },

  register(el, data) {
    this.mannequins.push({groupCode: data.groupCode, position: data.position, value:el});
  },


  deregister(el, data) {
    this.mannequins.splice(this.mannequins.indexOf({groupCode: data.groupCode, position: data.position, value: el}), 1);
  },

  getMannequinByGroupCode(groupCode) {
    return this.findByGroupCode(this.mannequins, groupCode);
  },

  findByGroupCode(array, groupCode)
  {
    var foundObject = array.find(obj => { return obj.groupCode === groupCode });

    if (foundObject == null)
    {
      return null;
    }
      
    return foundObject.value;
  },
});
