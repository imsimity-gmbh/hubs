import React, { useCallback, useEffect } from "react";
import { ChooseGlovesModalContainer } from "./ChooseGlovesModalContainer";
import PropTypes from "prop-types";
import { Modal } from "../modal/Modal";
import { FormattedMessage } from "react-intl";
import { styles } from "./ChooseGlovesModal.scss";
import { Button } from "../input/Button";
import { CloseButton } from "../input/CloseButton";
import gloves1 from "../../assets/images/icons/Icon_Handschuhe_1.png";
import gloves2 from "../../assets/images/icons/Icon_Handschuhe_2.png";
import gloves3 from "../../assets/images/icons/Icon_Handschuhe_3.png";

const correctId = 1;
let gloves1Class = "idle";
let gloves2Class = "idle";
let gloves3Class = "idle";

function onClickGlove(scene, showNonHistoriedDialog, id) {
    gloves1Class = "idle";
    gloves2Class = "idle";
    gloves3Class = "idle";
    if(id == correctId)
        gloves1Class = "right";
    else if(id == 2) 
        gloves2Class = "wrong";
    else if(id == 3)
        gloves3Class = "wrong";
    
    console.log(gloves1Class);
    console.log(gloves2Class);
    console.log(gloves3Class);

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
                <img className={gloves1Class} src={gloves1} onClick={() => onClickGlove(scene, showNonHistoriedDialog, 1)}></img>
                <img className={gloves2Class} src={gloves2} onClick={() => onClickGlove(scene, showNonHistoriedDialog, 2)}></img>
                <img className={gloves3Class} src={gloves3} onClick={() => onClickGlove(scene, showNonHistoriedDialog, 3)}></img>
            </div>
        </Modal>
    );
}
    

ChooseGlovesModal.propTypes = {
    scene: PropTypes.object,
    showNonHistoriedDialog: PropTypes.func,
    onClose: PropTypes.func
};