import React, { useCallback, useEffect } from "react";
import PropTypes from "prop-types";
import { Modal } from "../modal/Modal";
import { CloseButton } from "../input/CloseButton";
import { TextInputField } from "../input/TextInputField";
import { useForm } from "react-hook-form";
import { Button } from "../input/Button";
import { Column } from "../layout/Column";
import { IconButton } from "../input/IconButton";
import { ReactComponent as AttachIcon } from "../icons/Attach.svg";
import styles from "./TeacherUrlModal.scss";
import classNames from "classnames";
import { FormattedMessage } from "react-intl";

export function TeacherUrlModal({ showModelCollectionLink, modelCollectionUrl, onSubmit, onClose }) {
  const { handleSubmit, register, watch, setValue } = useForm();

  useEffect(
    () => {
      register("url");
    },
    [register]
  );

  const file = watch("file");
  const hasFile = file && file.length > 0;
  const fileName = hasFile ? file[0].name : undefined;

  const onClear = useCallback(
    () => {
      if (hasFile) {
        setValue("file", undefined);
      } else {
        setValue("url", "");
      }
    },
    [hasFile, setValue]
  );

  const onChange = useCallback(
    e => {
      if (hasFile) {
        return;
      }

      setValue("url", e.target.value);
    },
    [hasFile, setValue]
  );

  const url = watch("url", "");

  const showCloseButton = hasFile || url.length > 0;

  return (
    <Modal
      title={<FormattedMessage id="teacher-url-modal.title" defaultMessage="Teacher Upload" />}
      beforeTitle={<CloseButton onClick={onClose} />}
    >
      <Column as="form" padding center onSubmit={handleSubmit(onSubmit)}>
        <p>
          {(
            <FormattedMessage
              id="teacher-url-modal.message"
              defaultMessage="Upload or paste a URL to an image, video, model, or scene."
            />
          )}
        </p>
        <TextInputField
          name="url"
          label={<FormattedMessage id="object-url-modal.url-field-label" defaultMessage="Object URL or File" />}
          placeholder="https://example.com/avatar.glb"
          type={hasFile ? "text" : "url"}
          value={fileName || url || ""}
          onChange={onChange}
          afterInput={
            <>
              {showCloseButton && <CloseButton onClick={onClear} />}
              <IconButton as="label" className={classNames({ [styles.hidden]: showCloseButton })} htmlFor="file">
                <AttachIcon />
                <input id="file" className={styles.hidden} name="file" type="file" ref={register} />
              </IconButton>
            </>
          }
          description={
            <FormattedMessage
              id="object-url-modal.url-field-description"
              defaultMessage="Accepts glb, png, jpg, gif, mp4, and mp3 files"
            />
          }
        />
        <Button type="submit" preset="accept">
          <FormattedMessage id="object-url-modal.create-object-button" defaultMessage="Create Object" />
        </Button>
      </Column>
    </Modal>
  );
}

TeacherUrlModal.propTypes = {
  isMobile: PropTypes.bool,
  showModelCollectionLink: PropTypes.bool,
  modelCollectionUrl: PropTypes.string,
  onSubmit: PropTypes.func,
  onClose: PropTypes.func
};
