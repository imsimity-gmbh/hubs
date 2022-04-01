import React, { useCallback, useEffect } from "react";
import PropTypes from "prop-types";
import { Modal } from "../modal/Modal";
import { CloseButton } from "../input/CloseButton";
import { TextInputField } from "../input/TextInputField";
import { useForm } from "react-hook-form";
import { Button } from "../input/Button";
import { Column } from "../layout/Column";
import { IconButton } from "../input/IconButton";
import styles from "./NotebookModal.scss";
import classNames from "classnames";
import { FormattedMessage } from "react-intl";

export function NotebookModal({onSubmit, loadNotes, onClose, writeBtn }) {
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
        title={<FormattedMessage id="notebook-write.title" defaultMessage="Notebook Entry" />}
        beforeTitle={<CloseButton onClick={onClose} />}
      >
        <Column as="form" padding center onSubmit={handleSubmit(onSubmit)}>
          <TextInputField
            name="note"
            placeholder="Type a note..."
            type={"text"}
            value={ note || ""}
            onChange={onChange}
            afterInput={
              <>
                {showCloseButton && <CloseButton onClick={onClear} />}
                <IconButton as="label" className={classNames({ [styles.hidden]: showCloseButton })} htmlFor="note-input">
                  <input id="note-input" className={styles.hidden} name="note-input" type="text" ref={register} />
                </IconButton>
              </>
            }
            // description={
            //   <FormattedMessage
            //     id="object-url-modal.url-field-description"
            //     defaultMessage="Accepts glb, png, jpg, gif, mp4, and mp3 files"
            //   />
            // }
          />
          <Button type="submit" preset="accept">
            <FormattedMessage id="notebook-write.submit-note" defaultMessage="Submit Note" />
          </Button>
        </Column>
      </Modal>
    );
  }

  else {

    // let noteContent = "";
    // for(let i = 0; i < loadNotes().length; i++) {
    //   noteContent += loadNotes()[i] + '\n';
    // }

    return (
      <Modal
        title={<FormattedMessage id="notebook-read.title" defaultMessage="Notebook Content" />}
        beforeTitle={<CloseButton onClick={onClose} />}
      >
        <Column as="form" padding center onSubmit={handleSubmit(onSubmit)}>
          <p id="notebook-content">
            {loadNotes()}
          </p>
        </Column>
      </Modal>
    );
  }
}

NotebookModal.propTypes = {
  isMobile: PropTypes.bool,
  onSubmit: PropTypes.func,
  onClose: PropTypes.func
};
