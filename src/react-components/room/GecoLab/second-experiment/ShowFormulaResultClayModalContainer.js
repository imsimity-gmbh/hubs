import React, { useCallback } from "react";
import PropTypes from "prop-types";
import { ShowFormulaResultClayModal } from "./ShowFormulaResultClayModal";

const isMobile = AFRAME.utils.device.isMobile() || AFRAME.utils.device.isMobileVR();

export function ShowFormulaResultClayModalContainer({ scene, onClose, result, groupCode}) {

    return (
        <ShowFormulaResultClayModal
            scene={scene}
            onClose={onClose}
            result={result}
            groupCode={groupCode}
        />
    );
}

ShowFormulaResultClayModalContainer.propTypes = {
    scene: PropTypes.object,
    onClose: PropTypes.func,
    result: PropTypes.number,
    groupCode: PropTypes.string
};