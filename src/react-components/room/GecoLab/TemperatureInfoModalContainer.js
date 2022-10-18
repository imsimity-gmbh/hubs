import React, { useCallback } from "react";
import PropTypes from "prop-types";
import { TemperatureInfoModal } from "./TemperatureInfoModal";

const isMobile = AFRAME.utils.device.isMobile() || AFRAME.utils.device.isMobileVR();

export function TemperatureInfoModalContainer({scene, showNonHistoriedDialog, onClose, groupCode}) {

    return (
        <TemperatureInfoModal
            scene={scene}
            showNonHistoriedDialog={showNonHistoriedDialog}
            onClose={onClose}
            groupCode={groupCode}
        />
    );
}

TemperatureInfoModalContainer.propTypes = {
    scene: PropTypes.object,
    showNonHistoriedDialog: PropTypes.func,
    onClose: PropTypes.func,
    groupCode: PropTypes.string
};