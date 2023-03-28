import React, { useCallback } from "react";
import PropTypes from "prop-types";
import { EnterFormulaSandModal } from "./EnterFormulaSandModal";

const isMobile = AFRAME.utils.device.isMobile() || AFRAME.utils.device.isMobileVR();

export function EnterFormulaSandModalContainer({scene, showNonHistoriedDialog, onClose, groupCode}) {

    return (
        <EnterFormulaSandModal
            scene={scene}
            showNonHistoriedDialog={showNonHistoriedDialog}
            onClose={onClose}
            groupCode={groupCode}
        />
    );
}

EnterFormulaSandModalContainer.propTypes = {
    scene: PropTypes.object,
    showNonHistoriedDialog: PropTypes.func,
    onClose: PropTypes.func,
    groupCode: PropTypes.string
};