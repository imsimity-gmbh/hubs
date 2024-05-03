import configs from "../../utils/configs";
import Cookies from "js-cookie";
import { isNullUndefinedOrEmpty } from "../../utils/imsimity";

const GECOLAB_DASHBOARD_API = "https://gecolab-dashboard.herokuapp.com"
const GECOLAB_LOBBY_ID = "Fgfz8xC";

AFRAME.registerSystem('gecolab-manager', {
    schema: {},  // System schema. Parses into `this.data`.
  
    init: function () {

        this.school = null;
        this.student = null;
        this.group = null;
        this.initialized = false;

        // Getting the Params from URL
        const queryParams = new URLSearchParams(window.location.search);
        
        this.studentId = queryParams.get('studentId');
        this.groupId = queryParams.get('groupId');
        this.schoolId = queryParams.get('schoolId');
        this.teacherId = queryParams.get('teacherId');

        const roomId = window.location.pathname.split('/')[1];
        console.log('Room ID:' + roomId);
        
        this.isCurrentlyInLobby = (roomId === GECOLAB_LOBBY_ID);
        console.log('Currently in lobby ? ' + this.isCurrentlyInLobby);

        
        if (!isNullUndefinedOrEmpty(this.studentId) && !isNullUndefinedOrEmpty(this.groupId))
        {
            Cookies.remove('teacherId');
        }
        else if (!isNullUndefinedOrEmpty(this.teacherId))
        {
            Cookies.remove('studentId');
            Cookies.remove('groupId');
        }

        // Values aren't in the params, we get it from cookies 
        this.studentId = isNullUndefinedOrEmpty(this.studentId) ? Cookies.get('studentId') : this.studentId;
        this.groupId = isNullUndefinedOrEmpty(this.groupId) ? Cookies.get('groupId') : this.groupId;
        this.schoolId = isNullUndefinedOrEmpty(this.schoolId) ? Cookies.get('schoolId') : this.schoolId;
        this.teacherId = isNullUndefinedOrEmpty(this.teacherId) ? Cookies.get('teacherId') : this.teacherId;

        if (isNullUndefinedOrEmpty(this.teacherId) == false)
        {
            console.log("Teacher login !");

            Cookies.set('teacherId', this.teacherId, { expires: 1 });

            console.log("Teacher ID :" + this.teacherId + " found. Initializing...");
            this.checkInitTeacher();

        }
        else if (isNullUndefinedOrEmpty(this.studentId) == false)
        {
            // Store the value in cookies, for next time...
            Cookies.set('studentId', this.studentId, { expires: 1 });
            Cookies.set('groupId', this.groupId, { expires: 1 });
            Cookies.set('schoolId', this.schoolId, { expires: 1 });

            console.log("Student ID :" + this.studentId + " found. Initializing...");
            this.checkInitStudent();
        }
        else
        {
            console.log("Not a student...");
        }
        
    },

    checkInitTeacher()
    {
        console.log(window.APP);

        if (window.APP.scene != null && window.APP.hubChannel != null)
        {
            console.log("Scene & Hub Channel are ready");
        
            this.initTeacher();
            return;
        }

        console.log("Scene & Hub Channel aren't ready");

        // Re-check in 1 second
        setTimeout(() => { this.checkInitTeacher() }, 1000);
    },

    initTeacher()
    {
        if (this.teacherId != null)
        {
            fetch(`https://${configs.CORS_PROXY_SERVER}/${GECOLAB_DASHBOARD_API}/api/v1/teacher?teacherId=${this.teacherId}`, {
                method: 'GET', 
                cache: 'no-cache'
            })
            .then(response => response.json())
            .then(teacher => {
                console.log("GECOLAB MANAGER: Teacher found");
                console.log(teacher);
                
                // Initing Teacher
                this.teacher = teacher;
                
                console.log(teacher);
                
                const avatarUrl = this.teacher.avatarUrl;
                const gamerTag = this.teacher.firstname + " " + this.teacher.lastname;
                
                this.initializeAvatarAndDisplayName(avatarUrl, gamerTag);

                this.initialized = true;
            });
        }
        else
        {
            console.log("GECOLAB MANAGER: no schoolId found")
        }
    },

    checkInitStudent()
    {
        console.log(window.APP);

        if (window.APP.scene != null && window.APP.hubChannel != null)
        {
            console.log("Scene & Hub Channel are ready");
        
            this.initStudent();
            return;
        }

        console.log("Scene & Hub Channel aren't ready");

        // Re-check in 1 second
        setTimeout(() => { this.checkInitStudent() }, 1000);
    },

    initStudent()
    {
        //TODO: Refactor with Asyc / Await ?
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

                const avatarUrl = this.student.avatarUrl;
                const gamerTag = this.student.gamerTag;
                
                this.initializeAvatarAndDisplayName(avatarUrl, gamerTag);

                this.initialized = true;
            });
        }
        else
        {
            console.log("GECOLAB MANAGER: no schoolId found")
        }
    },

    initializeAvatarAndDisplayName(avatarUrl, displayName)
    {
        const store = window.APP.store;
        const scene = window.APP.scene;

        // We push an update of the AVATAR url for this Student
        store.update({ profile: { ...store.state.profile, ...{ avatarId: avatarUrl, displayName: displayName } } });
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

    getTeacher()
    {
        if (this.teacher == null)
        {
            return null;
        }

        return this.teacher;
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

    isTeacher()
    {
        return (this.teacher != null);
    },

    isInLobby()
    {
        return this.isCurrentlyInLobby;
    }
});