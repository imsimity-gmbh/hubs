import React, { useCallback } from "react";
import PropTypes from "prop-types";
import { ShowFormulaResultModal } from "./ShowFormulaResultModal";

const isMobile = AFRAME.utils.device.isMobile() || AFRAME.utils.device.isMobileVR();

export function ShowFormulaResultModalContainer({ onClose, result}) {

    return (
        <ShowFormulaResultModal
            onClose={onClose}
            result={result}
        />
    );
}

ShowFormulaResultModalContainer.propTypes = {
    onClose: PropTypes.func,
    result: PropTypes.number
};