import React, { useCallback } from "react";
import PropTypes from "prop-types";
import { TeacherExperimentModal } from "./TeacherExperimentModal";
import configs from "../../../utils/configs";
import { getUsersFromPresences, spawnOrDeleteExperiment } from "../../../utils/imsimity";


const isMobile = AFRAME.utils.device.isMobile() || AFRAME.utils.device.isMobileVR();



export function TeacherExperimentModalContainer({ scene, location, onClose, presences, sessionId }) {

  const getUserFromName = (users, moderatorName) => {
    return users.find(u => { return u.profile.displayName === moderatorName });
  }

  const onSubmit = useCallback(
    ({ groupCode, moderatorName })  =>  {

      var users = getUsersFromPresences(presences, sessionId);

      console.log(users);

      var user = getUserFromName(users, moderatorName);

      if (user == null)
      {
        console.log("Could not find Moderator...");
        
        onClose();

        return;
      }

      if (user.isMe === true)
      {
        spawnOrDeleteExperiment(location, groupCode);
      }
      else
      {
        // We are not the Moderator, we broadcast an event !
        console.log("We broadcast a Spawn Request to " + moderatorName);
      }
      
      
      onClose();
    },
    [scene, onClose]
  );

  return (
    <TeacherExperimentModal
      isMobile={isMobile}
      onSubmit={onSubmit}
      onClose={onClose}
      location={location}
      presences={presences}
      sessionId={sessionId}
    />
  );
}

TeacherExperimentModalContainer.propTypes = {
  scene: PropTypes.object.isRequired,
  location: PropTypes.string.isRequired,
  onClose: PropTypes.func,
  presences:  PropTypes.object.isRequired,
  sessionId: PropTypes.string.isRequired,
};
