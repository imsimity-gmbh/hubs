export function isNullUndefinedOrEmpty(value) { 
  return (value == null || value == undefined || value == "");
}

export const redirectTo = url =>  
{
  console.log("Redirecting");
  console.log(url);

  if (typeof document !== "undefined") {
    document.location.replace(url);
  }
}
  
export var HEROKU_UPLOAD_URI = "https://gecolab-dashboard.herokuapp.com/api/v1/upload";

export var HEROKU_POST_UPLOAD_URI = "https://gecolab-dashboard.herokuapp.com/api/v1/post/upload";

export var HEROKU_DELETE_UPLOAD_URI = "https://gecolab-dashboard.herokuapp.com/api/v1/delete/upload";

export var HEROKU_POST_FEEDBACK_URI = "https://gecolab-dashboard.herokuapp.com/api/v1/post/feedback";

export var HEROKU_POST_TEACHER_MESSAGE_URI = "https://gecolab-dashboard.herokuapp.com/io/v1/message";

export var HEROKU_GET_TEACHER_COUNT_URI = "https://gecolab-dashboard.herokuapp.com/io/v1/teachers";

export var IMSIMITY_INIT_DELAY = 500;
