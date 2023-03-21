import React, { useCallback } from "react";
import PropTypes from "prop-types";
import { TeacherExperimentModal } from "./TeacherExperimentModal";
import configs from "../../../utils/configs";
import { spawnOrDeleteExperiment, generateGroupCode } from "../../../utils/GecoLab/network-helper";


const isMobile = AFRAME.utils.device.isMobile() || AFRAME.utils.device.isMobileVR();



export function TeacherExperimentModalContainer({ scene, location, onClose, presences, sessionId, hubChannel, experiment }) {
  
  const onSubmit = useCallback(
    ({ moderator, members })  =>  {

      members.push(moderator);

      var memberIds = members.map((member, index) => (member.id));

      console.log(memberIds);

      const groupCode = generateGroupCode();

      if (moderator == null)
      {
        console.log("Could not find Moderator...");
        
        onClose();

        return;
      }

      var data = { position: location, groupCode: groupCode, moderatorId: moderator.id, members: memberIds };

      // We are not the Moderator, we broadcast an event !
      console.log("We broadcasted a Spawn Request to " + moderator.label);

      hubChannel.sendMessage(data, "gecolab-spawn");

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
      experiment={experiment}
    />
  );
}

TeacherExperimentModalContainer.propTypes = {
  scene: PropTypes.object.isRequired,
  location: PropTypes.string.isRequired,
  onClose: PropTypes.func,
  presences:  PropTypes.object.isRequired,
  sessionId: PropTypes.string.isRequired,
  hubChannel: PropTypes.object.isRequired,
  experiment: PropTypes.string.isRequired
};
