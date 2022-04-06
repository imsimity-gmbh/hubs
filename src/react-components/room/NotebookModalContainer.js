import React, { useCallback } from "react";
import PropTypes from "prop-types";
import { NotebookModal } from "./NotebookModal";
import Cookies from "js-cookie";
import { ReactComponent as DeleteIcon } from "../icons/Delete.svg";
import { Button } from "../input/Button";
import InfiniteScroll from 'react-infinite-scroller';
import styles from "./NotebookModal.scss";

const isMobile = AFRAME.utils.device.isMobile() || AFRAME.utils.device.isMobileVR();

let cookieNotes = [];
if(Cookies.get('notes') != null) {
  let jsonNotes = Cookies.get('notes');
  cookieNotes = JSON.parse(jsonNotes);
  console.log(cookieNotes);
}

const Note = ({ noteContent, noteId, deleteCallback }) => (
  <div style={{width: "100%", backgroundColor: "#424242", marginBottom: "20px", borderRadius: "20px", padding: "20px", textAlign: "start"}}>
    <Button 
      style={{width: "8px", height: "20px"}} 
      className={styles.deleteBtn} 
      id={ noteId} 
      onClick={(e) => deleteCallback(noteId, e)}
    >
      <DeleteIcon/>
    </Button>
    <span>
      {noteContent}
    </span>
  </div>
);

export function NotebookModalContainer({ scene, onClose, writeBtn, onNoteDeleted }) { 
  const onSubmit = useCallback(
    ({note}) => {
      if(note == null) {
        onClose();
        return;
      }
      if(/^\s*$/.test(note)) {
        onClose();
        return;
      }
      
      let newNote = note;
      cookieNotes.push(newNote);

      let jsonNotes = JSON.stringify(cookieNotes);
      Cookies.set('notes', jsonNotes);

      onClose();
    },
    [onClose]
  );

  const loadNotes = useCallback(
    (callback) => {

      let jsonNotes = Cookies.get('notes');
      if(jsonNotes == null)
        return;
      cookieNotes = JSON.parse(jsonNotes);

      let uiNotes = [];

      for(let i = 0; i < cookieNotes.length; i++) {
        let note = cookieNotes[i];
        uiNotes.push({ noteContent: note, noteId: i, deleteCallback: callback });
      }
      console.log(uiNotes);

      return (
        <div
          className={styles.scrollableContent}
        >
          {uiNotes.map((p, i) => (
            <Note {...p} key={i} />
          ))}
        </div>
      );
    }
  );

  const deleteNote = useCallback(
    (id, e) => {
      let jsonNotes = Cookies.get('notes');
      cookieNotes = JSON.parse(jsonNotes);

      cookieNotes.splice(id, 1);
      console.log("deleted note nr." + id);

      jsonNotes = JSON.stringify(cookieNotes);
      Cookies.set('notes', jsonNotes);

      onClose();
      onNoteDeleted();
    },
    [onClose]
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


NotebookModalContainer.propTypes = {
  scene: PropTypes.object.isRequired,
  onClose: PropTypes.func,
  writeBtn: PropTypes.bool,
  onNoteDeleted: PropTypes.func
};
