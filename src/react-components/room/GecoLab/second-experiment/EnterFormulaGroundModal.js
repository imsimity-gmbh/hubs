import React, { useCallback, useEffect } from "react";
import { ShowFormulaResultGroundModalContainer } from "./ShowFormulaResultGroundModalContainer";
import PropTypes from "prop-types";
import { Modal } from "../../../modal/Modal";
import { FormattedMessage } from "react-intl";
import correctFormula from "../../../../assets/images/icons/Formel_GesamtmasseBoden.png";
import styles from "./EnterFormulaGroundModal.scss";
import { Column } from "../../../layout/Column";
import { useForm } from "react-hook-form";




export function EnterFormulaGroundModal ({ scene, showNonHistoriedDialog, onClose, groupCode }) {

    const {} = useForm();

    function handleSubmit(e) {
        e.preventDefault();
        let a = e.target.a.value;
        let b = e.target.b.value;

        let result = (parseFloat(a) + parseFloat(b)).toFixed(2);
        
        let resultTxt = result;
        showNonHistoriedDialog(
            ShowFormulaResultGroundModalContainer, { scene: scene, onClose: onClose, result: resultTxt, groupCode: groupCode }
        )

        e.target.a.value = 0;
        e.target.b.value = 0;
    }

    return (
        <Modal  
            title={<FormattedMessage id="enter-values.title.ground" defaultMessage="Berechnung der Gesamtmasse Boden" />}
            /*beforeTitle={<CloseButton onClick={onClose} />}*/
            disableFullscreen={true}
        >
            <Column as="form" center>
            <div class="modal-wrapper">
                <div class="info-text">
                    <img class="enter-formula-img" src={correctFormula}></img>
                </div>
                <form class="enter-formula-form" onSubmit={handleSubmit}>
                    <div
                    >
                        <label for="input-a">a = Masse Sandfraktion (in g)<br/></label>
                        <input id="input-a" name="a" type="number" min="0" step="0.01" required></input>
                    </div>
                    <div>
                        <label for="input-b">b = Masse Ton-/Schlufffraktion (in g)<br/></label>
                        <input id="input-b" name="b" type="number" min="0" step="0.01" required></input>
                    </div>
                    <input id="submit-btn" type="submit" value="Berechnen"></input>
                </form>
            </div>
            </Column>
        </Modal>
    );
}
    

EnterFormulaGroundModal.propTypes = {
    scene: PropTypes.object,
    showNonHistoriedDialog: PropTypes.func,
    onClose: PropTypes.func,
    groupCode: PropTypes.string
};