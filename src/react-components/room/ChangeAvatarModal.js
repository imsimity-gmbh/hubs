import React, { useState, useCallback } from "react";
import { FormattedMessage } from "react-intl";
import PropTypes from "prop-types";
import { Modal } from "../modal/Modal";
import modalStyles from "../modal/Modal.scss";
import { CloseButton } from "../input/CloseButton";
import { Button, CancelButton } from "../input/Button";
import { Column } from "../layout/Column";
import { Container } from "../layout/Container";
import avatarStyles from "../../assets/stylesheets/avatar.scss";
import { TextInputField } from "../input/TextInputField";
import { pushHistoryPath, pushHistoryState, sluglessPath } from "../../utils/history";

export function ChangeAvatarModal({ onClose, onClickUploadAvatarButton }) {

  return (
    <Modal
      closeable
      className={modalStyles.modalAvatarPage}
      title={<FormattedMessage id="change-avatar-modal.title" defaultMessage="Change my avatar" />}
      afterTitle={<Button sm preset="primary" onClick={onClickUploadAvatarButton}>
                    <FormattedMessage id="upload-avatar" defaultMessage="Upload my avatar" />
                  </Button>}
      beforeTitle={<CloseButton onClick={onClose} />}
    >
      <Container>
        <iframe
          id="avatarIFrame"
          className={avatarStyles.avatariframe}
          src="https://imsimity.readyplayer.me/"
          fullscreen
          frameBorder="0"
        />
      </Container>
    </Modal>
  );
}

ChangeAvatarModal.propTypes = {
  onClose: PropTypes.func
};
