import { waitForDOMContentLoaded } from "../../utils/async-utils";


// Used for tracking and managing camera tools in the scene
AFRAME.registerSystem("second-experiments", {
  init() {

    console.log("second-experiments init");

    this.experimentsBaseEls = [];

    this.experiments01Els = [];
    this.experiments02Els = [];
    this.experiments03Els = [];

    // 2D array of all experiment parts
    this.experimentsAllParts = [this.experiments01Els, this.experiments02Els, this.experiments03Els];

    // "Rights" for Experiments
    this.experimentsIsMember = [];
  },

  register(el, data) {
    this.experimentsBaseEls.push({groupCode: data.groupCode, position: data.position, value:el});
  },

  deregister(el, data) {
    console.log("deregistering second-experiment");

    this.experimentsBaseEls.splice(this.experimentsBaseEls.findIndex(item => item.groupCode === data.groupCode), 1);

    // remove
    this.experimentsIsMember.splice(this.experimentsIsMember.findIndex(item => item.groupCode === data.groupCode), 1);

  },
  
  registerTask(id, el, data) {
    switch(id) {
      case "01":
        this.experiments01Els.push({groupCode: data.groupCode, position: data.position, value:el});
        break;
      case "02":
        this.experiments02Els.push({groupCode: data.groupCode, position: data.position, value:el});
        break;
      case "03":
        this.experiments03Els.push({groupCode: data.groupCode, position: data.position, value:el});
        break;
    }
  },

  deregisterTask(id, el, data) {
    switch(id) {
      case "01":
        this.experiments01Els.splice(this.experiments01Els.indexOf({groupCode: data.groupCode, position: data.position, value:el}), 1);
        break;
      case "02":
        this.experiments02Els.splice(this.experiments02Els.indexOf({groupCode: data.groupCode, position: data.position, value:el}), 1);
        break;
      case "03":
        this.experiments03Els.splice(this.experiments03Els.indexOf({groupCode: data.groupCode, position: data.position, value:el}), 1);
        break;
    }
  },

  getExperimentByGroupCode(groupCode) {
    return this.findByGroupCode(this.experimentsBaseEls, groupCode);
  },

  getTaskById(id, groupCode) {
    switch(id) {
      case "01":
        return this.findByGroupCode(this.experiments01Els, groupCode);
      case "02":
        return this.findByGroupCode(this.experiments02Els, groupCode);
      case "03":
        return this.findByGroupCode(this.experiments03Els, groupCode);
    }
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

  getAllPartsForGroupCode(groupCode)
  {
    var arr = [];

    arr.push(this.getExperimentByGroupCode(groupCode));
    arr.push(this.getTaskById("01", groupCode));
    arr.push(this.getTaskById("02", groupCode));
    arr.push(this.getTaskById("03", groupCode));

    return arr;
  },

  getCurrentGroupCodeForPosition(position)
  {
    var foundObject = this.experimentsBaseEls.find(obj => { return obj.position === position });
    
    if (foundObject == null)
      return null;

    return foundObject.groupCode;
  },

  findElementForGroupCode(selector, groupCode)
  {
    var element = null;

    for(var i = 0; i < this.experimentsAllParts.length; i++)
    {
      var experimentPart = this.findByGroupCode(this.experimentsAllParts[i], groupCode);

      if (experimentPart != null)
      {
        // We found the part relative to our groupCode
        element = experimentPart.querySelector(selector);
        if (element != null)
        {
          console.log(selector + " found for groupCode " + groupCode);
          break;
        }
      }
    }

    return element;
  },

  setIsMemberForGroupCode(groupCode, isMember)
  {
    console.log("This user is part of the spawned experiment (" + groupCode + ") ? " + isMember);
    this.experimentsIsMember.push({groupCode: groupCode, isMember: isMember});
  },

  getIsMemberForGroupCode(groupCode)
  {
    var foundObject = this.experimentsIsMember.find(obj => { return obj.groupCode === groupCode });

    if (foundObject == null)
    {
      return false;
    }

    return foundObject.isMember;
  }
});