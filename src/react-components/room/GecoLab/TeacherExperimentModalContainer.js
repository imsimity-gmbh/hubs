import React, { useCallback } from "react";
import PropTypes from "prop-types";
import { TeacherExperimentModal } from "./TeacherExperimentModal";
import configs from "../../../utils/configs";
import { getUsersFromPresences, spawnOrDeleteExperiment } from "../../../utils/imsimity";


const isMobile = AFRAME.utils.device.isMobile() || AFRAME.utils.device.isMobileVR();



export function TeacherExperimentModalContainer({ scene, location, onClose, presences, sessionId, hubChannel }) {

  const getOwnUser = (users) => {
    return users.find(u => { return u.value.isMe === true });
  }
  
  const onSubmit = useCallback(
    ({ groupCode, moderator })  =>  {

      var users = getUsersFromPresences(presences, sessionId);
      var user = null;

      console.log(moderator);

      if (groupCode == null)
        groupCode = "0000";

      if (moderator == null)
      {
        console.log("Moderator Name is Null, defaulting to Teacher");

        user = getOwnUser(users).value;
      }
      else
      {
        user = moderator
      }
      

      if (user == null)
      {
        console.log("Could not find Moderator...");
        
        onClose();

        return;
      }

      if (user.isMe === true)
      {
        spawnOrDeleteExperiment(location, groupCode, scene);
      }
      else
      {
        var data = { position: location, groupCode: groupCode, moderatorId: user.id };

        // We are not the Moderator, we broadcast an event !
        console.log("We broadcast a Spawn Request to " + user.label);

        hubChannel.sendMessage(data, "gecolab-spawn");
      }
      
      
      onClose();
    },
    [scene, hubChannel, onClose]
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
  hubChannel: PropTypes.object.isRequired
};
