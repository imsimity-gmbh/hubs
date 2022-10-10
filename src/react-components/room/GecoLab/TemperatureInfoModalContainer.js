import React, { useCallback } from "react";
import PropTypes from "prop-types";
import { TemperatureInfoModal } from "./TemperatureInfoModal";

const isMobile = AFRAME.utils.device.isMobile() || AFRAME.utils.device.isMobileVR();

export function TemperatureInfoModalContainer({scene, showNonHistoriedDialog, onClose}) {

    return (
        <TemperatureInfoModal
            scene={scene}
            showNonHistoriedDialog={showNonHistoriedDialog}
            onClose={onClose}
        />
    );
}

TemperatureInfoModalContainer.propTypes = {
    scene: PropTypes.object,
    showNonHistoriedDialog: PropTypes.func,
    onClose: PropTypes.func
};