import React, { useCallback } from "react";
import PropTypes from "prop-types";
import { ChooseGlovesModal } from "./ChooseGlovesModal";

const isMobile = AFRAME.utils.device.isMobile() || AFRAME.utils.device.isMobileVR();

export function ChooseGlovesModalContainer({showNonHistoriedDialog, onClose}) {

    return (
        <ChooseGlovesModal
            showNonHistoriedDialog={showNonHistoriedDialog}
            onClose={onClose}
        />
    );
}

ChooseGlovesModalContainer.propTypes = {
    showNonHistoriedDialog: PropTypes.func,
    onClose: PropTypes.func
};