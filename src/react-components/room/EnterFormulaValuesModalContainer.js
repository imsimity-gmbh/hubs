import React, { useCallback } from "react";
import PropTypes from "prop-types";
import { EnterFormulaValuesModal } from "./EnterFormulaValuesModal";

const isMobile = AFRAME.utils.device.isMobile() || AFRAME.utils.device.isMobileVR();

export function EnterFormulaValuesModalContainer({showNonHistoriedDialog, onClose}) {

    return (
        <EnterFormulaValuesModal
            showNonHistoriedDialog={showNonHistoriedDialog}
            onClose={onClose}
        />
    );
}

EnterFormulaValuesModalContainer.propTypes = {
    showNonHistoriedDialog: PropTypes.func,
    onClose: PropTypes.func
};