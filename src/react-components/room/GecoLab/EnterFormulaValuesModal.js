import React, { useCallback, useEffect } from "react";
import { ShowFormulaResultModalContainer } from "./ShowFormulaResultModalContainer";
import PropTypes from "prop-types";
import { Modal } from "../../modal/Modal";
import { FormattedMessage } from "react-intl";
import correctFormula from "../../../assets/images/icons/humusgehalt_formel_richtig_neu.png";
import styles from "./EnterFormulaValuesModal.scss";
import { Column } from "../../layout/Column";
import { useForm } from "react-hook-form";




export function EnterFormulaValuesModal ({ scene, showNonHistoriedDialog, onClose, groupCode }) {

    const {} = useForm();

    function handleSubmit(e) {
        e.preventDefault();
        let a = e.target.a.value;
        let b = e.target.b.value;
        let c = e.target.c.value;
    
        let result = ((b-c) / (b-a)) * 100;
        
        let resultTxt = (result).toFixed(2);
        showNonHistoriedDialog(
            ShowFormulaResultModalContainer, { scene: scene, onClose: onClose, result: resultTxt, groupCode: groupCode }
        )

        e.target.a.value = 0;
        e.target.b.value = 0;
        e.target.c.value = 0;
    }

    return (
        <Modal  
            title={<FormattedMessage id="gecolab.enter-values.title" defaultMessage="Insert Values" />}
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
                        <label for="input-a"><FormattedMessage id="gecolab.enter-values.a" defaultMessage="a = Crucible (empty weight)" /><br/></label>
                        <input id="input-a" name="a" type="number" min="0" step="0.01" required></input>
                    </div>
                    <div>
                        <label for="input-b"><FormattedMessage id="gecolab.enter-values.b" defaultMessage="b = sample weight before annealing" /><br/></label>
                        <input id="input-b" name="b" type="number" min="0" step="0.01" required></input>
                    </div>
                    <div>
                        <label for="input-c"><FormattedMessage id="gecolab.enter-values.c" defaultMessage="c = sample weight after annealing" /><br/></label>
                        <input id="input-c" name="c" type="number" min="0" step="0.01" required></input>
                    </div>
                    <button id="submit-btn" type="submit">
                        <FormattedMessage id="gecolab.default.calculate" defaultMessage="Calculate" />
                    </button>
                </form>
            </div>
            </Column>
        </Modal>
    );
}
    

EnterFormulaValuesModal.propTypes = {
    scene: PropTypes.object,
    showNonHistoriedDialog: PropTypes.func,
    onClose: PropTypes.func,
    groupCode: PropTypes.string
};