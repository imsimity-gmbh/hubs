import React, { useCallback, useEffect } from "react";
import { ChooseFormulaModalContainer } from "./ChooseFormulaModalContainer";
import { EnterFormulaValuesModalContainer } from "./EnterFormulaValuesModalContainer";
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

    showNonHistoriedDialog(
        ChooseFormulaModalContainer, { showNonHistoriedDialog: showNonHistoriedDialog }
    );
}

export function ChooseFormulaModal ({ showNonHistoriedDialog, onClose }) {

    if(formula1Class == "correct") {
        formula1Class = "formula";
        showNonHistoriedDialog(
            EnterFormulaValuesModalContainer, { showNonHistoriedDialog: showNonHistoriedDialog }
        );
    }

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
    

ChooseFormulaModal.propTypes = {
    showNonHistoriedDialog: PropTypes.func,
    onClose: PropTypes.func
};