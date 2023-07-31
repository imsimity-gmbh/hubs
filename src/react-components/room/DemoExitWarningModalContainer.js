import React, { useCallback } from "react";
import PropTypes from "prop-types";
import { DemoExitWarningModal } from "./DemoExitWarningModal";

const isMobile = AFRAME.utils.device.isMobile() || AFRAME.utils.device.isMobileVR();

export function DemoExitWarningModalContainer({ onCancel, reason, secondsRemaining }) {

    return (
        <DemoExitWarningModal
            reason={reason}
            secondsRemaining={secondsRemaining}
            onCancel={onCancel}
        />
    );
}

DemoExitWarningModalContainer.propTypes = {
    reason: PropTypes.string.isRequired,
    secondsRemaining: PropTypes.number.isRequired,
    onCancel: PropTypes.func
};