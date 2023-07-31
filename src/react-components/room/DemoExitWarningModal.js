import React from "react";
import { FormattedMessage, defineMessages, useIntl } from "react-intl";
import PropTypes from "prop-types";
import { Modal } from "../modal/Modal";
import { CancelButton } from "../input/Button";
import { Column } from "../layout/Column";

export const DemoExitReason = {
  demo: "Demo"
};

const messages = defineMessages({
  [DemoExitReason.demo]: {
    id: "demo-exit-warning-modal.reason.demo-session",
    defaultMessage: "Ihre Demo-Zeit ist abgelaufen"
  }
});

export function DemoExitWarningModal({ onCancel, reason, secondsRemaining }) {
  const intl = useIntl();

  return (
    <Modal title={<FormattedMessage id="demo-exit-warning-modal.title" defaultMessage="Warning" />}>
      <Column padding center>
        <b>
          <FormattedMessage
            id="demo-exit-warning-modal.message"
            defaultMessage="Demo-ending session in {secondsRemaining} seconds"
            values={{ secondsRemaining }}
          />
        </b>
        <p>{intl.formatMessage(messages[reason])}</p>
        <CancelButton onClick={onCancel} />
      </Column>
    </Modal>
  );
}

DemoExitWarningModal.propTypes = {
  reason: PropTypes.string.isRequired,
  secondsRemaining: PropTypes.number.isRequired,
  onCancel: PropTypes.func
};
