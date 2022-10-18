import React, { useCallback } from "react";
import PropTypes from "prop-types";
import { ChooseGlovesModal } from "./ChooseGlovesModal";

const isMobile = AFRAME.utils.device.isMobile() || AFRAME.utils.device.isMobileVR();

export function ChooseGlovesModalContainer({ scene, showNonHistoriedDialog, onClose, groupCode}) {

    return (
        <ChooseGlovesModal
            scene={scene}
            showNonHistoriedDialog={showNonHistoriedDialog}
            onClose={onClose}
            groupCode={groupCode}
        />
    );
}

ChooseGlovesModalContainer.propTypes = {
    scene: PropTypes.object,
    showNonHistoriedDialog: PropTypes.func,
    onClose: PropTypes.func,
    groupCode: PropTypes.string
};