import React, { useCallback } from "react";
import PropTypes from "prop-types";
import { NotebookModal } from "./NotebookModal";
import Cookies from "js-cookie";
import { Button } from "../input/Button";
import { FormattedMessage } from "react-intl";

const isMobile = AFRAME.utils.device.isMobile() || AFRAME.utils.device.isMobileVR();

if(Cookies.get('note-ammount') == null) {
  Cookies.set('note-ammount', -1)
}

const Note = ({ noteContent, noteId, deleteCallback }) => (
  <div>
    {noteContent}
    <Button id={noteId}>
      <FormattedMessage id="notebook-read.delete-note" defaultMessage="Delete" onClick={deleteCallback(noteId)}/>
    </Button>
  </div>
);

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
    (callback) => {
      
      let notes = [];

      for(let i = 0; i <= Cookies.get('note-ammount'); i++) {
        let note = (Cookies.get('note' + i));

        notes.push({ noteContent: note, noteId: i, deleteCallback: callback });
      }
      console.log(notes);

      return (
        <div>
          {notes.map((p, i) => (
            <Note {...p} key={i} />
          ))}
        </div>
      );
    }
  );

  const deleteNote = useCallback(
    (id) => {
      console.log(id);
      Cookies.remove('note' + id);
      console.log("deleted note nr." + id);
    }
  );

  return (
    <NotebookModal
      isMobile={isMobile}
      onSubmit={onSubmit}
      deleteNote={deleteNote}
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
