import { waitForDOMContentLoaded } from "../utils/async-utils";


// Used for tracking and managing camera tools in the scene
AFRAME.registerSystem("first-experiments", {
  init() {

    this.experimentsBaseEls = [];

    this.experiments01Els = [];
    this.experiments02Els = [];
    this.experiments03Els = [];
    this.experiments04Els = [];
    this.experiments05Els = [];
    this.experiments06Els = [];
    this.experimentsStopwatchEls = [];


  },

  register(el, data) {
    console.log(data);

    this.experimentsBaseEls.push({groupCode: data.groupCode, position: data.position, value:el});
  },

  deregister(el, data) {
    console.log(data);

    this.experimentsBaseEls.splice(this.experimentsBaseEls.indexOf({groupCode: data.groupCode, position: data.position, value: el}), 1);
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
      case "04":
        this.experiments04Els.push({groupCode: data.groupCode, position: data.position, value:el});
        break;
      case "05":
        this.experiments05Els.push({groupCode: data.groupCode, position: data.position, value:el});
        break;
      case "06":
        this.experiments06Els.push({groupCode: data.groupCode, position: data.position, value:el});
        break;
      case "stopwatch":
        this.experimentsStopwatchEls.push({groupCode: data.groupCode, position: data.position, value:el});
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
      case "04":
        this.experiments04Els.splice(this.experiments04Els.indexOf({groupCode: data.groupCode, position: data.position, value:el}), 1);
        break;
      case "05":
        this.experiments05Els.splice(this.experiments05Els.indexOf({groupCode: data.groupCode, position: data.position, value:el}), 1);
        break;
      case "06":
        this.experiments06Els.splice(this.experiments06Els.indexOf({groupCode: data.groupCode, position: data.position, value:el}), 1);
        break;
      case "stopwatch":
        this.experimentsStopwatchEls.splice(this.experiments06Els.indexOf({groupCode: data.groupCode, position: data.position, value:el}), 1);
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
      case "04":
        return this.findByGroupCode(this.experiments04Els, groupCode);
      case "05":
        return this.findByGroupCode(this.experiments05Els, groupCode);
      case "06":
        return this.findByGroupCode(this.experiments06Els, groupCode);
      case "stopwatch":
        return this.findByGroupCode(this.experimentsStopwatchEls, groupCode);
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
    arr.push(this.getTaskById("04", groupCode));
    arr.push(this.getTaskById("05", groupCode));
    arr.push(this.getTaskById("06", groupCode));
    arr.push(this.getTaskById("stopwatch", groupCode));

    return arr;
  }
});
