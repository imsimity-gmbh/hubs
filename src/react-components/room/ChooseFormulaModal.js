import React, { useCallback, useEffect } from "react";
import { ChooseFormulaModalContainer } from "./ChooseFormulaModalContainer";
import PropTypes from "prop-types";
import { Modal } from "../modal/Modal";
import { FormattedMessage } from "react-intl";
import { styles } from "./ChooseFormulaModal.scss";
import { Button } from "../input/Button";
import { CloseButton } from "../input/CloseButton";
import correctFormula from "../../assets/images/icons/humusgehalt_formel_richtig.jpg";

const correctId = 1;
let formula1Class = "formula";
let formula2Class = "formula";
let formula3Class = "formula";

let currentStepId = 1;

function onClickFormula(showNonHistoriedDialog, id) {
    formula1Class = "formula";
    formula2Class = "formula";
    formula3Class = "formula";
    if(id == correctId)
        formula1Class = "correct";
    else if(id == 2) 
        formula2Class = "incorrect";
    else if(id == 3)
        formula3Class = "incorrect";
    
    console.log(formula1Class);
    console.log(formula2Class);
    console.log(formula3Class);

    showNonHistoriedDialog(
        ChooseFormulaModalContainer, { showNonHistoriedDialog: showNonHistoriedDialog, currentStepId }
    );
}

export function ChooseFormulaModal ({ showNonHistoriedDialog, stepId, onClose }) {

    console.log(stepId);

    if(formula1Class == "correct") {
        setTimeout(() => {
            currentStepId++;
            if(currentStepId < 4) {
                formula1Class = "formula";
                showNonHistoriedDialog(
                    ChooseFormulaModalContainer, { showNonHistoriedDialog: showNonHistoriedDialog, stepId: currentStepId }
                );
            }
            else {
                onClose();
            }
        }, 500);
    }

    currentStepId = stepId;

    if(currentStepId == 1) {
        return (
            <Modal  
                title={<FormattedMessage id="glove-modal.title" defaultMessage="Formel auswählen" />}
                /*beforeTitle={<CloseButton onClick={onClose} />}*/
            >
                <div class="modal-wrapper">
                    <div class="info-text">
                        <h3>Wähle die richtige Formel aus und setze anschließend deine Werte ein.</h3>
                        <p>a = Tiegel (Leergewicht)</p>
                        <p>b = Probengewicht <strong>vor</strong> dem Glühen (inkl. Tiegel)</p>
                        <p>c = Probengewicht <strong>nach</strong> dem Glühen (inkl. Tiegel)</p>
                    </div>
                    <div class="formulas">
                        <img className={formula1Class} src={correctFormula} onClick={() => onClickFormula(showNonHistoriedDialog, 1)}></img>
                        <img className={formula2Class} src={correctFormula} onClick={() => onClickFormula(showNonHistoriedDialog, 2)}></img>
                        <img className={formula3Class} src={correctFormula} onClick={() => onClickFormula(showNonHistoriedDialog, 3)}></img>
                    </div>
                </div>
            </Modal>
        );
    }
    else if(currentStepId == 2) {
        return (
            <Modal  
                title={<FormattedMessage id="glove-modal.title" defaultMessage="Formel auswählen" />}
                /*beforeTitle={<CloseButton onClick={onClose} />}*/
            >
                <div class="modal-wrapper">
                    <div class="info-text">
                        <img src={correctFormula}></img>
                    </div>
                </div>
            </Modal>
        );
    }
}
    

ChooseFormulaModal.propTypes = {
    showNonHistoriedDialog: PropTypes.func,
    stepId: PropTypes.number,
    onClose: PropTypes.func
};