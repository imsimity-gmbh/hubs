import React, { useCallback, useEffect } from "react";
import PropTypes from "prop-types";
import { Modal } from "../../../modal/Modal";
import { FormattedMessage } from "react-intl";
import { styles } from "./ShowFormulaResultGroundModal.scss";
import { Button } from "../../../input/Button";


export function ShowFormulaResultGroundModal ({ scene, onClose, result, groupCode }) {

    function handleSubmit() {
        scene.systems["second-experiments"].getTaskById("06", groupCode).components["second-experiment-06"].onGroundDone();
        onClose();
    }

    return (
        <Modal  
            title={<FormattedMessage id="show-result.title" defaultMessage="Ergebnis" />}
            /*beforeTitle={<CloseButton onClick={onClose} />}*/
        >
            <div class="result-modal-wrapper">
                <div class="result-text">
                    <h3>Die Gesamtmasse beträgt: </h3>
                    <h2>{result}g</h2>
                </div>
                <Button id="close-modal" onClick={handleSubmit} preset="accept">
                    <FormattedMessage id="show-result.finish" defaultMessage="Schließen"/>
                </Button>
            </div>
        </Modal>
    );
}
    

ShowFormulaResultGroundModal.propTypes = {
    scene: PropTypes.object,
    onClose: PropTypes.func,
    result: PropTypes.number,
    groupCode: PropTypes.string
};