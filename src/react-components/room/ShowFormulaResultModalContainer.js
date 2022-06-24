import React, { useCallback } from "react";
import PropTypes from "prop-types";
import { ShowFormulaResultModal } from "./ShowFormulaResultModal";

const isMobile = AFRAME.utils.device.isMobile() || AFRAME.utils.device.isMobileVR();

export function ShowFormulaResultModalContainer({ scene, onClose, result}) {

    return (
        <ShowFormulaResultModal
            scene={scene}
            onClose={onClose}
            result={result}
        />
    );
}

ShowFormulaResultModalContainer.propTypes = {
    scene: PropTypes.object,
    onClose: PropTypes.func,
    result: PropTypes.number
};