import React, { useCallback } from "react";
import PropTypes from "prop-types";
import { StudentEntryModal } from "./StudentEntryModal";

const isMobile = AFRAME.utils.device.isMobile() || AFRAME.utils.device.isMobileVR();

export function StudentEntryModalContainer({scene,showNonHistoriedDialog, onClose, securityRead, showAcceptBtn, 
    showSecurity, showSecurityBtn, clothingWrapperLeftClassName, clothingOptionLeftClassName, clothingWrapperRightClassName, clothingOptionRightClassName, rightOptionCounter}) {

    return (
        <StudentEntryModal
            isMobile={isMobile}
            scene={scene}
            showNonHistoriedDialog={showNonHistoriedDialog}
            onClose={onClose}
            securityRead={securityRead}
            showAcceptBtn={showAcceptBtn}
            showSecurity={showSecurity}
            showSecurityBtn={showSecurityBtn}
            clothingWrapperLeftClassName={clothingWrapperLeftClassName}
            clothingOptionLeftClassName={clothingOptionLeftClassName}
            clothingWrapperRightClassName={clothingWrapperRightClassName}
            clothingOptionRightClassName={clothingOptionRightClassName}
            rightOptionCounter={rightOptionCounter}
        />
    );
}

StudentEntryModalContainer.propTypes = {
    scene: PropTypes.object,
    showNonHistoriedDialog: PropTypes.func,
    onClose: PropTypes.func,
    securityRead: PropTypes.bool,
    showAcceptBtn: PropTypes.bool,
    showSecurity: PropTypes.bool,
    showSecurityBtn: PropTypes.bool,
    clothingWrapperLeftClassName: PropTypes.string,
    clothingOptionLeftClassName: PropTypes.string,
    clothingWrapperRightClassName: PropTypes.string,
    clothingOptionRightClassName: PropTypes.string,
    rightOptionCounter: PropTypes.number
};