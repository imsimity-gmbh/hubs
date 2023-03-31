import React, { useCallback, useEffect } from "react";
import PropTypes from "prop-types";
import { Modal } from "../../../modal/Modal";
import { FormattedMessage } from "react-intl";
import { styles } from "./ShowFormulaResultClayModal.scss";
import { Button } from "../../../input/Button";


export function ShowFormulaResultClayModal ({ scene, onClose, result, groupCode }) {

    function handleSubmit() {
        scene.systems["second-experiments"].getTaskById("06", groupCode).components["second-experiment-06"].onClayDone();
        onClose();
    }

    return (
        <Modal  
            title={<FormattedMessage id="show-result.title" defaultMessage="Ergebnis" />}
            /*beforeTitle={<CloseButton onClick={onClose} />}*/
        >
            <div class="result-modal-wrapper">
                <div class="result-text">
                    <h3>Der Anteil der Ton-/Schlufffraktion beträgt: </h3>
                    <h2>{result}%</h2>
                </div>
                <Button id="close-modal" onClick={handleSubmit} preset="accept">
                    <FormattedMessage id="show-result.finish" defaultMessage="Schließen"/>
                </Button>
            </div>
        </Modal>
    );
}
    

ShowFormulaResultClayModal.propTypes = {
    scene: PropTypes.object,
    onClose: PropTypes.func,
    result: PropTypes.number,
    groupCode: PropTypes.string
};