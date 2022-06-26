export function isNullUndefinedOrEmpty(value) { 
    return (value == null || value == undefined || value == "");
  }
  
export var HEROKU_UPLOAD_URI = "https://gecolab-dashboard.herokuapp.com/api/v1/upload";

export var HEROKU_POST_UPLOAD_URI = "https://gecolab-dashboard.herokuapp.com/api/v1/post/upload";

export var IMSIMITY_INIT_DELAY = 500;
