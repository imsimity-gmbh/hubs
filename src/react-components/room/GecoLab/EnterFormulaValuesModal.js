import React, { useCallback, useEffect } from "react";
import { ShowFormulaResultModalContainer } from "./ShowFormulaResultModalContainer";
import PropTypes from "prop-types";
import { Modal } from "../../modal/Modal";
import { FormattedMessage } from "react-intl";
import correctFormula from "../../../assets/images/icons/humusgehalt_formel_richtig_neu.png";
import styles from "./EnterFormulaValuesModal.scss";
import { Column } from "../../layout/Column";
import { useForm } from "react-hook-form";




export function EnterFormulaValuesModal ({ scene, showNonHistoriedDialog, onClose }) {

    const {} = useForm();

    function handleSubmit(e) {
        e.preventDefault();
        let a = e.target.a.value;
        let b = e.target.b.value;
        let c = e.target.c.value;
    
        let result = ((b-c) / (b-a)) * 100;
        
        let resultTxt = (result).toFixed(2);
        showNonHistoriedDialog(
            ShowFormulaResultModalContainer, { scene: scene, onClose: onClose, result: resultTxt }
        )
    }

    return (
        <Modal  
            title={<FormattedMessage id="enter-values.title" defaultMessage="Werte einsetzen" />}
            /*beforeTitle={<CloseButton onClick={onClose} />}*/
        >
            <Column as="form" center>
            <div class="modal-wrapper">
                <div class="info-text">
                    <img class="enter-formula-img" src={correctFormula}></img>
                </div>
                <form class="enter-formula-form" onSubmit={handleSubmit}>
                    <div
                    >
                        <label for="input-a">a = Tiegel (Leergewicht)<br/></label>
                        <input id="input-a" name="a" type="number" min="0" step="1" required></input>
                    </div>
                    <div>
                        <label for="input-b">b = Probengewicht vor dem Glühen<br/></label>
                        <input id="input-b" name="b" type="number" min="0" step="1" required></input>
                    </div>
                    <div>
                        <label for="input-c">c = Probengewicht nach dem Glühen<br/></label>
                        <input id="input-c" name="c" type="number" min="0" step="1" required></input>
                    </div>
                    <input id="submit-btn" type="submit" value="Berechnen"></input>
                </form>
            </div>
            </Column>
        </Modal>
    );
}
    

EnterFormulaValuesModal.propTypes = {
    scene: PropTypes.object,
    showNonHistoriedDialog: PropTypes.func,
    onClose: PropTypes.func
};