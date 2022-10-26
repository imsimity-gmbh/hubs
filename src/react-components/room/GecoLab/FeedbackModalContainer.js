import React, { useCallback } from "react";
import PropTypes from "prop-types";
import { FeedbackModal } from "./FeedbackModal";

const isMobile = AFRAME.utils.device.isMobile() || AFRAME.utils.device.isMobileVR();

export function FeedbackModalContainer({ scene, showNonHistoriedDialog, onClose, groupCode}) {

    return (
        <FeedbackModal
            scene={scene}
            showNonHistoriedDialog={showNonHistoriedDialog}
            onClose={onClose}
            groupCode={groupCode}
        />
    );
}

FeedbackModalContainer.propTypes = {
    scene: PropTypes.object,
    onClose: PropTypes.func,
    groupCode: PropTypes.string,
    showNonHistoriedDialog: PropTypes.func,
};