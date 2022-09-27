import React, { useCallback } from "react";
import PropTypes from "prop-types";
import { ChooseGlovesModal } from "./ChooseGlovesModal";

const isMobile = AFRAME.utils.device.isMobile() || AFRAME.utils.device.isMobileVR();

export function ChooseGlovesModalContainer({ scene, showNonHistoriedDialog, onClose}) {

    return (
        <ChooseGlovesModal
            scene={scene}
            showNonHistoriedDialog={showNonHistoriedDialog}
            onClose={onClose}
        />
    );
}

ChooseGlovesModalContainer.propTypes = {
    scene: PropTypes.object,
    showNonHistoriedDialog: PropTypes.func,
    onClose: PropTypes.func
};