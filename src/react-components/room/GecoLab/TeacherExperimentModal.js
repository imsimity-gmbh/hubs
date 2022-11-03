import React, { useCallback, useEffect } from "react";
import PropTypes from "prop-types";
import { Modal } from "../../modal/Modal";
import { CloseButton } from "../../input/CloseButton";
import { TextInputField } from "../../input/TextInputField";
import { useForm } from "react-hook-form";
import { Button } from "../../input/Button";
import { Column } from "../../layout/Column";
import { IconButton } from "../../input/IconButton";
import { ReactComponent as AttachIcon } from "../../icons/Attach.svg";
import styles from "./TeacherExperimentModal.scss";
import classNames from "classnames";
import { FormattedMessage } from "react-intl";
import { SelectInputField } from "../../input/SelectInputField";
import { getUsersFromPresences } from "../../../utils/GecoLab/network-helper";

export function TeacherExperimentModal({ onSubmit, location ,onClose, presences, sessionId }) {
  const { handleSubmit, register, watch, setValue } = useForm();

  useEffect(
    () => {
      register("groupCode");
      register("moderator");

      if (users)
      {
        setValue("groupCode", "0000");
        setValue("moderator", users[0]);
      }
    },
    [register, setValue]
  );

  
  const onChange = useCallback(
    e => {
      setValue("groupCode", e.target.value);
    },
    [setValue]
  );

  const onChangeModerator = useCallback(
    item => {
      console.log(item);
      setValue("moderator", item);
    },
    [setValue]
  );

  var users = getUsersFromPresences(presences, sessionId);
  
  const groupCode = watch("groupCode");
  const moderator = watch("moderator");
 
  return (
    <Modal
      title={ (location==="position_01") ? 
        <FormattedMessage id="teacher-experiment-modal.title_01" defaultMessage="Experiment 1 - Arbeitsbereich 1" /> : 
        <FormattedMessage id="teacher-experiment-modal.title_02" defaultMessage="Experiment 1 - Arbeitsbereich 2" /> }
      beforeTitle={<CloseButton onClick={onClose} />}
    >
      <Column as="form" padding center onSubmit={handleSubmit(onSubmit)}>
        <p>
          {(
            <FormattedMessage
              id="teacher-experiment-modal.message"
              defaultMessage="Geben Sie den Gruppencode der Gruppe ein, die Sie zuweisen möchten."
            />
          )}
        </p>
        <TextInputField
          name="url"
          label={<FormattedMessage id="teacher-experiment-modal.url-field-label" defaultMessage="Gruppencode" />}
          placeholder="0000"
          value={ groupCode || "0000"}
          onChange={onChange}
          description={
            <FormattedMessage
              id="teacher-experiment-modal.url-field-description"
              defaultMessage="Sie können den Code Ihrer Gruppe im Gecolab Dashboard finden."
            />
          }
        />
        <SelectInputField 
          label={<FormattedMessage id="teacher-experiment-modal.url-select-label" defaultMessage="Gruppenleiter" />}
          value={moderator == undefined ? "" :  moderator.label} 
          options={users} 
          onChange={onChangeModerator} 
        />
        <Button type="submit" preset="accept">
          <FormattedMessage id="teacher-experiment-modal.create-object-button" defaultMessage="Experiment platzieren" />
        </Button>
      </Column>
    </Modal>
  );

}

TeacherExperimentModal.propTypes = {
  isMobile: PropTypes.bool,
  onSubmit: PropTypes.func,
  location: PropTypes.string.isRequired,
  onClose: PropTypes.func,
  presences:  PropTypes.object.isRequired,
  sessionId: PropTypes.string.isRequired,
};
