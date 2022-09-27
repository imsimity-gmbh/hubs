import React, { useCallback, useEffect } from "react";
import { ChooseGlovesModalContainer } from "./ChooseGlovesModalContainer";
import PropTypes from "prop-types";
import { Modal } from "../../modal/Modal";
import { FormattedMessage } from "react-intl";
import gloves1 from "../../../assets/images/icons/Icon_Handschuhe_1.png";  // Chemikalienhandschuhe
import gloves3 from "../../../assets/images/icons/Icon_Handschuhe_3.png";  // Plastik Handschuhe

const correctId = 1;
let gloves1Class = "idle";
let gloves2Class = "idle";

function onClickGlove(scene, showNonHistoriedDialog, id) {
    gloves1Class = "idle";
    gloves2Class = "idle";

    if(id == correctId)
        gloves1Class = "right";
    else if(id == 2) 
        gloves2Class = "wrong";
    

    showNonHistoriedDialog(
        ChooseGlovesModalContainer, {scene: scene, showNonHistoriedDialog: showNonHistoriedDialog }
    );
}

export function ChooseGlovesModal ({ scene, showNonHistoriedDialog, onClose }) {

    if(gloves1Class == "right") {
        setTimeout(() => {
            scene.systems["first-experiments"].getTaskById("04").components["first-experiment-04"].onPopupClosed();
            onClose();
        }, 500);
    }

    return (
        <Modal  
            title={<FormattedMessage id="glove-modal.title" defaultMessage="Feuerschutz" />}
            /*beforeTitle={<CloseButton onClick={onClose} />}*/
        >
            <div class="safety-text">
                Sicherheit ist wichtig! <br></br>
                Wähle die richtigen Handschuhe aus. Du solltest sie tragen, damit du dich nicht verbrennst!
            </div>
            <div class="gloves">
                <div>
                    <img className={gloves1Class} src={gloves1} onClick={() => onClickGlove(scene, showNonHistoriedDialog, 1)}></img>
                    <div class="gloves-text">
                        <p>feuerfeste</p>
                        <p>Handschuhe</p>
                    </div>
                </div>
                    
                <div>
                    <img className={gloves2Class} src={gloves3} onClick={() => onClickGlove(scene, showNonHistoriedDialog, 2)}></img>
                    <div class="gloves-text">
                        <p>Einweghandschuhe</p>
                        <p> </p>
                    </div>   
                </div>
            </div>
        </Modal>
    );
}
    

ChooseGlovesModal.propTypes = {
    scene: PropTypes.object,
    showNonHistoriedDialog: PropTypes.func,
    onClose: PropTypes.func
};