import React, { useCallback } from "react";
import PropTypes from "prop-types";
import { ShowFormulaResultModal } from "./ShowFormulaResultModal";

const isMobile = AFRAME.utils.device.isMobile() || AFRAME.utils.device.isMobileVR();

export function ShowFormulaResultModalContainer({ scene, onClose, result, groupCode}) {

    return (
        <ShowFormulaResultModal
            scene={scene}
            onClose={onClose}
            result={result}
            groupCode={groupCode}
        />
    );
}

ShowFormulaResultModalContainer.propTypes = {
    scene: PropTypes.object,
    onClose: PropTypes.func,
    result: PropTypes.number,
    groupCode: PropTypes.string
};