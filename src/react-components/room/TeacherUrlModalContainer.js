import React, { useCallback } from "react";
import PropTypes from "prop-types";
import { TeacherUrlModal } from "./TeacherUrlModal";
import configs from "../../utils/configs";
import { getReticulumFetchUrl } from "../../utils/phoenix-utils.js";

const isMobile = AFRAME.utils.device.isMobile() || AFRAME.utils.device.isMobileVR();

export function TeacherUrlModalContainer({ scene, onClose }) {
  const onSubmit = useCallback(
    async ({ file, url })  =>  {

      // Upload the File to the Media Endpoint
      try {

        const uri = getReticulumFetchUrl('/api/v1/media');

        const formData = new FormData();
        formData.append("media", file);
        formData.append("promotion_mode", "with_token");

        const res = await fetch(uri, { method: "POST", body: formData });
        const payload = await res.json();

        console.log("Uploaded done");
        console.log(payload);
        
      } catch (e) {
        
        console.log("Uploaded failed");
      }
      // Upload metadata to the Heroku server
      
      onClose();
    },
    [scene, onClose]
  );

  return (
    <TeacherUrlModal
      isMobile={isMobile}
      showModelCollectionLink={configs.feature("show_model_collection_link")}
      modelCollectionUrl={configs.link("model_collection", "https://sketchfab.com/mozillareality")}
      onSubmit={onSubmit}
      onClose={onClose}
    />
  );
}

TeacherUrlModalContainer.propTypes = {
  scene: PropTypes.object.isRequired,
  onClose: PropTypes.func
};
