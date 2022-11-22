import React, { useCallback, useEffect } from "react";
import { ChooseGlovesModalContainer } from "./ChooseGlovesModalContainer";
import PropTypes from "prop-types";
import { Modal } from "../../modal/Modal";
import { FormattedMessage } from "react-intl";
import styles from "./ChooseGlovesModal.scss";
import gloves1 from "../../../assets/images/icons/Icon_Handschuhe_1.png";  // Chemikalienhandschuhe
import gloves3 from "../../../assets/images/icons/Icon_Handschuhe_3.png";  // Plastik Handschuhe

const correctId = 1;
let gloves1Class = "idle";
let gloves2Class = "idle";

function onClickGlove(scene, showNonHistoriedDialog, id, groupCode) {
    gloves1Class = "idle";
    gloves2Class = "idle";

    if(id == correctId)
        gloves1Class = "right";
    else if(id == 2) 
        gloves2Class = "wrong";
    

    showNonHistoriedDialog(
        ChooseGlovesModalContainer, {scene: scene, showNonHistoriedDialog: showNonHistoriedDialog, groupCode: groupCode }
    );
}

export function ChooseGlovesModal ({ scene, showNonHistoriedDialog, onClose, groupCode }) {

    if(gloves1Class == "right") {
        setTimeout(() => {
            console.log("Right Answer");
            scene.systems["first-experiments"].getTaskById("04", groupCode).components["first-experiment-04"].onPopupClosed();

            gloves1Class = "idle";
            gloves2Class = "idle";

            onClose();
        }, 500);
    }

    return (
        <Modal  
            title={<FormattedMessage id="gecolab.glove-modal.title" defaultMessage="Fire protection" />}
            /*beforeTitle={<CloseButton onClick={onClose} />}*/
        >
            <div className="safety-text">
                <FormattedMessage id="gecolab.glove-modal.subtitle-1" defaultMessage="Fire protection" /><br></br>
                <FormattedMessage id="gecolab.glove-modal.subtitle-" defaultMessage="Choose the right gloves. You should wear them so you don't burn yourself!" /><br></br>
            </div>
            <div className="gloves">
                <div>
                    <img className={gloves1Class} src={gloves1} onClick={() => onClickGlove(scene, showNonHistoriedDialog, 1, groupCode)}></img>
                    <div className="gloves-text">
                        <FormattedMessage id="gecolab.glove-modal.gloves-1" defaultMessage="Fireproof Gloves" />
                    </div>
                </div>
                    
                <div>
                    <img className={gloves2Class} src={gloves3} onClick={() => onClickGlove(scene, showNonHistoriedDialog, 2, groupCode)}></img>
                    <div className="gloves-text">
                        <FormattedMessage id="gecolab.glove-modal.gloves-2" defaultMessage="Disposable Gloves" />
                    </div>   
                </div>
            </div>
        </Modal>
    );
}
    

ChooseGlovesModal.propTypes = {
    scene: PropTypes.object,
    showNonHistoriedDialog: PropTypes.func,
    onClose: PropTypes.func,
    groupCode: PropTypes.string
};