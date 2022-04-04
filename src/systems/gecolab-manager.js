

AFRAME.registerSystem('gecolab-manager', {
    schema: {},  // System schema. Parses into `this.data`.
  
    init: function () {
        // Called on scene initialization.
        console.log('gecolab manager');

        const queryParams = new URLSearchParams(window.location.search);
        
        this.userId = queryParams.get('userId');
        this.groupId = queryParams.get('groupId');
        this.schoolId = queryParams.get('schoolId');
        
    },
  
    // Other handlers and methods.
});