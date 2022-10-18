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

export function TeacherExperimentModal({ onSubmit, location ,onClose, presences }) {
  const { handleSubmit, register, watch, setValue } = useForm();

  useEffect(
    () => {
      register("groupCode");
    },
    [register]
  );

  const onClear = useCallback(
    () => {     
      setValue("groupCode", "");
    },
    [setValue]
  );

  const onChange = useCallback(
    e => {
      setValue("groupCode", e.target.value);
    },
    [setValue]
  );

  const groupCode = watch("groupCode", "");


  console.log(presences); //steal from presence-logs? window.APP.componentRegistry.playerInfo? window.APP.hubChannel.presence.state[this.playerSessionId]? phoenix-utils.getPresenceEntryforSessions?
  var placingPosition01 = (location === "position_01")
  if (location === "position_01")
  {
    return (
      <Modal
        title={<FormattedMessage id="teacher-experiment-modal.title_01" defaultMessage="Experiment 1 - Arbeitsbereich 1" />}
        beforeTitle={<CloseButton onClick={onClose} />}
      >
        <Column as="form" padding center onSubmit={handleSubmit(onSubmit)}>
          <p>
            {(
              <FormattedMessage
                id="teacher-experiment-modal.message"
                defaultMessage="Put the Group Code from the Group you want to assign"
              />
            )}
          </p>
          <TextInputField
            name="url"
            label={<FormattedMessage id="teacher-experiment-modal.url-field-label" defaultMessage="Group Code" />}
            placeholder="0000"
            value={ groupCode || "0000"}
            onChange={onChange}
            description={
              <FormattedMessage
                id="teacher-experiment-modal.url-field-description"
                defaultMessage="You can find your group's code in the Gecolab Dashboard"
              />
            }
          />
          <Button type="submit" preset="accept">
            <FormattedMessage id="teacher-experiment-modal.create-object-button" defaultMessage="Place Exmperiment" />
          </Button>
        </Column>
      </Modal>
    );
  }
  else
  {
    return (
      <Modal
        title={<FormattedMessage id="teacher-experiment-modal.title_02" defaultMessage="Experiment 1 - Arbeitsbereich 2" />}
        beforeTitle={<CloseButton onClick={onClose} />}
      >
        <Column as="form" padding center onSubmit={handleSubmit(onSubmit)}>
          <p>
            {(
              <FormattedMessage
                id="teacher-experiment-modal.message"
                defaultMessage="Put the Group Code from the Group you want to assign"
              />
            )}
          </p>
          <TextInputField
            name="url"
            label={<FormattedMessage id="teacher-experiment-modal.url-field-label" defaultMessage="Group Code" />}
            placeholder="0000"
            value={ groupCode || "0000"}
            onChange={onChange}
            description={
              <FormattedMessage
                id="teacher-experiment-modal.url-field-description"
                defaultMessage="You can find your group's code in the Gecolab Dashboard"
              />
            }
          />
          <Button type="submit" preset="accept">
            <FormattedMessage id="teacher-experiment-modal.create-object-button" defaultMessage="Place Exmperiment" />
          </Button>
        </Column>
      </Modal>
    );
  }
  
}

TeacherExperimentModal.propTypes = {
  isMobile: PropTypes.bool,
  onSubmit: PropTypes.func,
  location: PropTypes.string.isRequired,
  onClose: PropTypes.func,
  presences: PropTypes.object.isRequired,
};
