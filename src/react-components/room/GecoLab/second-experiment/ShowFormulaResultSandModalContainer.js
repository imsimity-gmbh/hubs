import React, { useCallback } from "react";
import PropTypes from "prop-types";
import { ShowFormulaResultSandModal } from "./ShowFormulaResultSandModal";

const isMobile = AFRAME.utils.device.isMobile() || AFRAME.utils.device.isMobileVR();

export function ShowFormulaResultSandModalContainer({ scene, onClose, result, groupCode}) {

    return (
        <ShowFormulaResultSandModal
            scene={scene}
            onClose={onClose}
            result={result}
            groupCode={groupCode}
        />
    );
}

ShowFormulaResultSandModalContainer.propTypes = {
    scene: PropTypes.object,
    onClose: PropTypes.func,
    result: PropTypes.number,
    groupCode: PropTypes.string
};