import React, { useCallback } from "react";
import PropTypes from "prop-types";
import { ChooseFormulaModal } from "./ChooseFormulaModal";

const isMobile = AFRAME.utils.device.isMobile() || AFRAME.utils.device.isMobileVR();

export function ChooseFormulaModalContainer({showNonHistoriedDialog, onClose}) {

    return (
        <ChooseFormulaModal
            showNonHistoriedDialog={showNonHistoriedDialog}
            stepId={1}
            onClose={onClose}
        />
    );
}

ChooseFormulaModalContainer.propTypes = {
    showNonHistoriedDialog: PropTypes.func,
    onClose: PropTypes.func
};