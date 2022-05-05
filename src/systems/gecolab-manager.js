import configs from "../utils/configs";

const GECOLAB_DASHBOARD_API = "https://gecolab-dashboard.herokuapp.com"

AFRAME.registerSystem('gecolab-manager', {
    schema: {},  // System schema. Parses into `this.data`.
  
    init: function () {
        // Called on scene initialization.
        console.log('GECOLAB MANGER');

        const queryParams = new URLSearchParams(window.location.search);
        
        this.studentId = queryParams.get('studentId');
        this.groupId = queryParams.get('groupId');
        this.schoolId = queryParams.get('schoolId');
        
        this.school = null;
        this.student = null;
        this.group = null;
        this.initialized = false;


        // We wait for the scene to be loaded
        if (this.studentId != undefined || this.studentId != "")
        {
            console.log("Student ID :" + this.studentId + " found. Initializing...");
            this.checkSceneInitialization();
        }
        
        
    },

    checkSceneInitialization()
    {
        console.log(window.APP);

        if (window.APP.scene != null && window.APP.hubChannel != null)
        {
            console.log("Scene & Hub Channel are ready");
        
            this.initFromUrlParams();
            return;
        }

        console.log("Scene & Hub Channel aren't ready");

        // Re-check in 1 second
        setTimeout(() => { this.checkSceneInitialization() }, 1000);
    },

    initFromUrlParams()
    {
        if (this.schoolId != null)
        {
            fetch(`https://${configs.CORS_PROXY_SERVER}/${GECOLAB_DASHBOARD_API}/api/v1/school?schoolId=${this.schoolId}`, {
                method: 'GET', 
                cache: 'no-cache'
            })
            .then(response => response.json())
            .then(school => {
                console.log("GECOLAB MANAGER: School found");
                console.log(school);
                
                // Initing School
                this.school = school;

                for (let i = 0; i < school.students.length; i++) {
                    const std = school.students[i];
                    
                    if (std._id == this.studentId)
                    {
                        this.student = std;
                        break;
                    }
                }

                if (this.student == null)
                {
                    console.log("GECOLAB MANAGER: Student not found in school");
                }
                
                for (let i = 0; i < school.groups.length; i++) {
                    const grp = school.groups[i];
                    
                    if (grp._id == this.groupId)
                    {
                        this.group = grp;
                        break;
                    }
                }

                if (this.group == null)
                {
                    console.log("GECOLAB MANAGER: Group not found in school");
                }
                
                this.initializeAvatar();

                this.initialized = true;
            });
        }
        else
        {
            console.log("GECOLAB MANAGER: no schoolId found")
        }
    },

    initializeAvatar()
    {
        const avatarUrl = this.student.avatarUrl;
        
        console.log("Student Avatar found :"+ avatarUrl);

        const store = window.APP.store;
        const scene = window.APP.scene;

        // We push an update of the AVATAR url for this Student
        store.update({ profile: { ...store.state.profile, ...{ avatarId: avatarUrl } } });
        scene.emit("avatar_updated");
    },

    getSchool()
    {
        if (this.school == null)
        {
            return null;
        }

        return this.school;
    },

    getStudent()
    {
        if (this.student == null)
        {
            return null;
        }

        return this.student;
    },

    getGroup()
    {
        if (this.group == null)
        {
            return null;
        }

        return this.group;
    },

    isInit()
    {
        return this.initialized;
    },

    isStudent()
    {
        return (this.student != null);
    },

});