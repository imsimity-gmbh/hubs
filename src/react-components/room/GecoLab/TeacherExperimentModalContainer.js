import React, { useCallback } from "react";
import PropTypes from "prop-types";
import { TeacherExperimentModal } from "./TeacherExperimentModal";
import configs from "../../../utils/configs";


const isMobile = AFRAME.utils.device.isMobile() || AFRAME.utils.device.isMobileVR();



export function TeacherExperimentModalContainer({ scene, location, onClose }) {
  const onSubmit = useCallback(
    ({ groupCode })  =>  {

      console.log(groupCode);

      if (location === "position_01") {
        scene.emit("action_toggle_first_experiment_01", groupCode);
        scene.emit("action_toggle_first_experiment_01_start", groupCode);
      }
      else if (location === "position_02") {
        scene.emit("action_toggle_first_experiment_02", groupCode);
        scene.emit("action_toggle_first_experiment_02_start", groupCode);
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
    />
  );
}

TeacherExperimentModalContainer.propTypes = {
  scene: PropTypes.object.isRequired,
  location: PropTypes.string.isRequired,
  onClose: PropTypes.func
};
