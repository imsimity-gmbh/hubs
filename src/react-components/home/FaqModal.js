import React, { useState, useCallback } from "react";
import { FormattedMessage } from "react-intl";
import PropTypes from "prop-types";
import { Modal } from "../modal/Modal";
import modalStyles from "../modal/Modal.scss";
import { CloseButton } from "../input/CloseButton";
import { Button, CancelButton } from "../input/Button";
import { Column } from "../layout/Column";
import { Container } from "../layout/Container";
import { CollapsibleList } from "../layout/CollapsibleList";
import avatarStyles from "../../assets/stylesheets/avatar.scss";
import { TextInputField } from "../input/TextInputField";
import faqTexts from "./faqTexts";
import { pushHistoryPath, pushHistoryState, sluglessPath } from "../../utils/history";

export function FaqModal({ onClose, onClickUploadAvatarButton }) {

  return (
    <Modal
      closeable
      className={modalStyles.modalFAQPage}
      title={<FormattedMessage id="faq-modal.title" defaultMessage="Frequently asked questions" />}
      beforeTitle={<CloseButton onClick={onClose} />}
    >
      <CollapsibleList items={faqTexts} />
    </Modal>
  );
}

FaqModal.propTypes = {
  onClose: PropTypes.func
};
