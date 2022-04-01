import React, { useCallback } from "react";
import PropTypes from "prop-types";
import { NotebookModal } from "./NotebookModal";
import configs from "../../utils/configs";
import ducky from "../../assets/models/DuckyMesh.glb";

const isMobile = AFRAME.utils.device.isMobile() || AFRAME.utils.device.isMobileVR();

export function NotebookModalContainer({ scene, onClose, writeBtn }) {
  const onSubmit = useCallback(
    ({note}) => {
      console.log("note" + getCookiesLength() + "=" + note);
      //safe note to cookies
      // document.cookie = "note" + getCookiesLength() + "=" + note + ";path=/";
      onClose();
    },
    [onClose]
  );

  const loadNotes = useCallback(
    () => {
      console.log("load notes");
      // return ["example1", "example2"];
      getCookie("note1");
    }
  )

  return (
    <NotebookModal
      isMobile={isMobile}
      onSubmit={onSubmit}
      loadNotes={loadNotes}
      onClose={onClose}
      writeBtn={writeBtn}
    />
  );
}

//Cookie-Functions:
function getCookiesLength() {
  return document.cookie.length;
  let decodedCookie = decodeURIComponent(document.cookie);
  let cookieList = decodedCookie.split(';');
  return cookieList.length;
}

function getCookie(cname) {
  let name = cname + "=";
  let decodedCookie = decodeURIComponent(document.cookie);
  let ca = decodedCookie.split(';');
  for(let i = 0; i <ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) == ' ') {
      c = c.substring(1);
    }
    if (c.indexOf(name) == 0) {
      return c.substring(name.length, c.length);
    }
  }
  return "";
}

NotebookModalContainer.propTypes = {
  scene: PropTypes.object.isRequired,
  onClose: PropTypes.func,
  writeBtn: PropTypes.bool
};
