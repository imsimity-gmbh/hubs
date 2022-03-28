import React, { useCallback } from "react";
import PropTypes from "prop-types";
import { NotebookModal } from "./NotebookModal";
import configs from "../../utils/configs";
import ducky from "../../assets/models/DuckyMesh.glb";

const isMobile = AFRAME.utils.device.isMobile() || AFRAME.utils.device.isMobileVR();

export function NotebookModalContainer({ scene, onClose }) {
  const onSubmit = useCallback(
    ({ file, url }) => {
      scene.emit("add_media", (file && file.length > 0 && file[0]) || url || ducky);
      onClose();
    },
    [scene, onClose]
  );

  return (
    <NotebookModal
      isMobile={isMobile}
      onSubmit={onSubmit}
      onClose={onClose}
    />
  );
}

NotebookModalContainer.propTypes = {
  scene: PropTypes.object.isRequired,
  onClose: PropTypes.func
};
