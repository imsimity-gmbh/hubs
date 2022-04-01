import React, { useCallback } from "react";
import PropTypes from "prop-types";
import { NotebookModal } from "./NotebookModal";
import Cookies from "js-cookie";
import configs from "../../utils/configs";
import ducky from "../../assets/models/DuckyMesh.glb";

const isMobile = AFRAME.utils.device.isMobile() || AFRAME.utils.device.isMobileVR();
if(Cookies.get('note-ammount') == null) {
  Cookies.set('note-ammount', 0)
}

export function NotebookModalContainer({ scene, onClose, writeBtn }) {
  const onSubmit = useCallback(
    ({note}) => {
      Cookies.set('note' + setNoteIndex(), note);

      let testCookie = Cookies.get('note' + setNoteIndex());
      console.log(testCookie);

      Cookies.set('note-ammount', setNoteIndex());
      onClose();
    },
    [onClose]
  );

  const loadNotes = useCallback(
    () => {
      console.log("load notes");

      let notes = "";
      for(let i = 0; i <= Cookies.get('note-ammount'); i++) {
        let note = Cookies.get('note' + i);
        notes += note + '\n';
      }
      
      return notes;
    }
  );

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
function setNoteIndex() {
  let getAmmount = Cookies.get('note-ammount');
  getAmmount++;
  return getAmmount;
}

NotebookModalContainer.propTypes = {
  scene: PropTypes.object.isRequired,
  onClose: PropTypes.func,
  writeBtn: PropTypes.bool
};
