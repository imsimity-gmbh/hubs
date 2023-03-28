import React, { useCallback } from "react";
import PropTypes from "prop-types";
import { ShowFormulaResultGroundModal } from "./ShowFormulaResultGroundModal";

const isMobile = AFRAME.utils.device.isMobile() || AFRAME.utils.device.isMobileVR();

export function ShowFormulaResultGroundModalContainer({ scene, onClose, result, groupCode}) {

    return (
        <ShowFormulaResultGroundModal
            scene={scene}
            onClose={onClose}
            result={result}
            groupCode={groupCode}
        />
    );
}

ShowFormulaResultGroundModalContainer.propTypes = {
    scene: PropTypes.object,
    onClose: PropTypes.func,
    result: PropTypes.number,
    groupCode: PropTypes.string
};