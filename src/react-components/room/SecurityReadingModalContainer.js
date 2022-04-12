import React, { useCallback } from "react";
import PropTypes, { func } from "prop-types";
import { SecurityReadingModal } from "./SecurityReadingModal";

const isMobile = AFRAME.utils.device.isMobile() || AFRAME.utils.device.isMobileVR();


export function SecurityReadingModalContainer({onClose, showBtn, onTimeElapsed, backToStudentEntry}) {
    
    console.log(showBtn);

    if(showBtn == false) {
        setTimeout( () => {
            onTimeElapsed(true);
        }, 5000);
    }

    return (
        <SecurityReadingModal
            isMobile={isMobile}
            onClose={onClose}
            showBtn={showBtn}
            backToStudentEntry={backToStudentEntry}
        />
    );
}

SecurityReadingModalContainer.propTypes = {
    onClose: PropTypes.func,
    showBtn: PropTypes.bool,
    onTimeElapsed: PropTypes.func,
    backToStudentEntry: PropTypes.func
};