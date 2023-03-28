import React, { useCallback } from "react";
import PropTypes from "prop-types";
import { EnterFormulaGroundModal } from "./EnterFormulaGroundModal";

const isMobile = AFRAME.utils.device.isMobile() || AFRAME.utils.device.isMobileVR();

export function EnterFormulaGroundModalContainer({scene, showNonHistoriedDialog, onClose, groupCode}) {

    return (
        <EnterFormulaGroundModal
            scene={scene}
            showNonHistoriedDialog={showNonHistoriedDialog}
            onClose={onClose}
            groupCode={groupCode}
        />
    );
}

EnterFormulaGroundModalContainer.propTypes = {
    scene: PropTypes.object,
    showNonHistoriedDialog: PropTypes.func,
    onClose: PropTypes.func,
    groupCode: PropTypes.string
};