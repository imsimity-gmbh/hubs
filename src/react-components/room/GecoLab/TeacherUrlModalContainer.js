import React, { useCallback } from "react";
import PropTypes from "prop-types";
import { TeacherUrlModal } from "./TeacherUrlModal";
import configs from "../../../utils/configs";
import { HEROKU_POST_UPLOAD_URI } from "../../../utils/imsimity";
import { getDirectReticulumFetchUrl } from "../../../utils/phoenix-utils.js";
import { guessContentType } from "../../../utils/media-url-utils";

const isMobile = AFRAME.utils.device.isMobile() || AFRAME.utils.device.isMobileVR();



export function TeacherUrlModalContainer({ scene, onClose }) {
  const onSubmit = useCallback(
    async ({ file, url })  =>  {

      // Upload the File to the Media Endpoint
      try {

        const uri = getDirectReticulumFetchUrl("/api/v1/media");

        console.log('URI: ' + uri);

        console.log('Files:');
        console.log(file);
        
        const f = file[0];
        console.log('File :');
        console.log(f);

        const fileName = f.name;

        const desiredContentType =  f.type || guessContentType(f.name);
        
        const formData = new FormData();
        formData.append("media", f);
        formData.append("promotion_mode", "with_token");

        if (desiredContentType) {
          formData.append("desired_content_type", desiredContentType);
        }

        console.log(formData);

        const res = await fetch(uri, { method: "POST", body: formData });
        const payload = await res.json();

        console.log("Uploaded done");
        console.log(payload);

        const fileId = payload.file_id;
        const link = payload.origin + "?token=" + payload.meta.access_token;

        const teacher = scene.systems["gecolab-manager"].getTeacher();
        var userId = teacher._id;

        const herokuRes = await fetch(`https://${configs.CORS_PROXY_SERVER}/${HEROKU_POST_UPLOAD_URI}?name=${fileName}&user_id=${userId}&content_type=${desiredContentType}&file_id=${fileId}&link=${link}`);

        console.log(herokuRes);
        console.log("Metadata sent to Heroku !");

      } catch (e) {
        
        console.log("Uploaded failed");
        console.log(e);
      }
      // Upload metadata to the Heroku server
      
      onClose();
    },
    [scene, onClose]
  );

  return (
    <TeacherUrlModal
      isMobile={isMobile}
      onSubmit={onSubmit}
      onClose={onClose}
    />
  );
}

TeacherUrlModalContainer.propTypes = {
  scene: PropTypes.object.isRequired,
  onClose: PropTypes.func
};
