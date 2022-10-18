import React, { useCallback } from "react";
import PropTypes from "prop-types";
import { EnterFormulaValuesModal } from "./EnterFormulaValuesModal";

const isMobile = AFRAME.utils.device.isMobile() || AFRAME.utils.device.isMobileVR();

export function EnterFormulaValuesModalContainer({scene, showNonHistoriedDialog, onClose, groupCode}) {

    return (
        <EnterFormulaValuesModal
            scene={scene}
            showNonHistoriedDialog={showNonHistoriedDialog}
            onClose={onClose}
            groupCode={groupCode}
        />
    );
}

EnterFormulaValuesModalContainer.propTypes = {
    scene: PropTypes.object,
    showNonHistoriedDialog: PropTypes.func,
    onClose: PropTypes.func,
    groupCode: PropTypes.string
};