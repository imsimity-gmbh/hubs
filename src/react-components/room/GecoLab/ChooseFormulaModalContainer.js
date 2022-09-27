import React, { useCallback } from "react";
import PropTypes from "prop-types";
import { ChooseFormulaModal } from "./ChooseFormulaModal";

const isMobile = AFRAME.utils.device.isMobile() || AFRAME.utils.device.isMobileVR();

export function ChooseFormulaModalContainer({scene, showNonHistoriedDialog, onClose}) {

    return (
        <ChooseFormulaModal
            scene={scene}
            showNonHistoriedDialog={showNonHistoriedDialog}
            onClose={onClose}
        />
    );
}

ChooseFormulaModalContainer.propTypes = {
    scene: PropTypes.object,
    showNonHistoriedDialog: PropTypes.func,
    onClose: PropTypes.func
};