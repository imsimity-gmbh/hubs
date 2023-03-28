import React, { useCallback } from "react";
import PropTypes from "prop-types";
import { EnterFormulaClayModal } from "./EnterFormulaClayModal";

const isMobile = AFRAME.utils.device.isMobile() || AFRAME.utils.device.isMobileVR();

export function EnterFormulaClayModalContainer({scene, showNonHistoriedDialog, onClose, groupCode}) {

    return (
        <EnterFormulaClayModal
            scene={scene}
            showNonHistoriedDialog={showNonHistoriedDialog}
            onClose={onClose}
            groupCode={groupCode}
        />
    );
}

EnterFormulaClayModalContainer.propTypes = {
    scene: PropTypes.object,
    showNonHistoriedDialog: PropTypes.func,
    onClose: PropTypes.func,
    groupCode: PropTypes.string
};