import React, { useCallback } from "react";
import PropTypes from "prop-types";
import { StudentEntryModal } from "./StudentEntryModal";

const isMobile = AFRAME.utils.device.isMobile() || AFRAME.utils.device.isMobileVR();

export function StudentEntryModalContainer({showNonHistoriedDialog, onClose, securityRead, showAcceptBtn, 
    showSecurity, showSecurityBtn, clothingWrapperClassName, clothingOptionClassName, rightOptionCounter}) {

    return (
        <StudentEntryModal
            isMobile={isMobile}
            showNonHistoriedDialog={showNonHistoriedDialog}
            onClose={onClose}
            securityRead={securityRead}
            showAcceptBtn={showAcceptBtn}
            showSecurity={showSecurity}
            showSecurityBtn={showSecurityBtn}
            clothingWrapperClassName={clothingWrapperClassName}
            clothingOptionClassName={clothingOptionClassName}
            rightOptionCounter={rightOptionCounter}
        />
    );
}

StudentEntryModalContainer.propTypes = {
    showNonHistoriedDialog: PropTypes.func,
    onClose: PropTypes.func,
    securityRead: PropTypes.bool,
    showAcceptBtn: PropTypes.bool,
    showSecurity: PropTypes.bool,
    showSecurityBtn: PropTypes.bool,
    clothingWrapperClassName: PropTypes.string,
    clothingOptionClassName: PropTypes.string,
    rightOptionCounter: PropTypes.number
};