import React, { useCallback, useEffect } from "react";
import PropTypes from "prop-types";
import { Modal } from "../modal/Modal";
import { CloseButton } from "../input/CloseButton";
import { useForm } from "react-hook-form";
import { Button } from "../input/Button";
import { Column } from "../layout/Column";
import { IconButton } from "../input/IconButton";
import styles from "./NotebookModal.scss";
import classNames from "classnames";
import { FormattedMessage } from "react-intl";
import { TextAreaInputField } from "../input/TextAreaInputField";

export function NotebookModal({onSubmit, loadNotes, deleteNote, onClose, writeBtn }) {
  const { handleSubmit, register, watch, setValue } = useForm();

  useEffect(
    () => {
      register("note");
    },
    [register]
  );

  const onClear = useCallback(
    () => {
      setValue("note", "");
    }
  );

  const onChange = useCallback(
    e => {
      setValue("note", e.target.value);
    }
  );

  const note = watch("note", "");
  const showCloseButton = note.length > 0;

  if(writeBtn) {

    return (
      <Modal
        title={<FormattedMessage id="notebook-write.title" defaultMessage="Write Notes" />}
        beforeTitle={<CloseButton onClick={onClose} />}
      >
        <Column as="form" padding center onSubmit={handleSubmit(onSubmit)}>
          <TextAreaInputField
            className={styles.noteInput}
            name="note"
            placeholder="Type a note..."
            type={"text"}
            value={ note || ""}
            onChange={onChange}
            afterInput={
              <>
                {showCloseButton && <CloseButton onClick={onClear} />}
                <IconButton as="label" className={classNames({ [styles.hidden]: showCloseButton })} htmlFor="note-input">
                </IconButton>
              </>
            }
          />
          <Button type="submit" preset="accept">
            <FormattedMessage id="notebook-write.submit-note" defaultMessage="Submit Note" />
          </Button>
        </Column>
      </Modal>
    );
  }

  else {

    return (
      <Modal
        title={<FormattedMessage id="notebook-read.title" defaultMessage="Read Notes" />}
        beforeTitle={<CloseButton onClick={onClose} />}
      >
        <Column as="form" className={styles.noteField} padding center>
          <div id="notebook-content" style={{width: "100%"}}>
            {loadNotes((id) => {
              deleteNote(id)
            })}
          </div>
          <Button className={styles.closeNotebook} onClick={onClose}>
            <FormattedMessage id="notebook-read.close-notebook" defaultMessage="Close Notebook" />
          </Button>
        </Column>
      </Modal>
    );
  }
}

NotebookModal.propTypes = {
  isMobile: PropTypes.bool,
  onSubmit: PropTypes.func,
  loadNotes: PropTypes.func,
  deleteNote: PropTypes.func,
  onClose: PropTypes.func,
  writeBtn: PropTypes.bool
};
