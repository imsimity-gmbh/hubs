import React, { useCallback, useEffect } from "react";
import PropTypes from "prop-types";
import { Modal } from "../../modal/Modal";
import { FormattedMessage } from "react-intl";
import { styles } from "./ShowFormulaResultModal.scss";
import { Button } from "../../input/Button";


export function ShowFormulaResultModal ({ scene, onClose, result, groupCode }) {

    function handleSubmit() {
        scene.systems["first-experiments"].getTaskById("06", groupCode).components["first-experiment-06"].onPopUpClosed();
        onClose();
    }

    return (
        <Modal  
            title={<FormattedMessage id="show-result.title" defaultMessage="Ergebnis" />}
            /*beforeTitle={<CloseButton onClick={onClose} />}*/
            disableFullscreen={true}
        >
            <div class="result-modal-wrapper">
                <div class="result-text">
                    <h3>Der Humusgehalt beträgt: </h3>
                    <h2>{result}%</h2>
                </div>
                <Button id="close-modal" onClick={handleSubmit} preset="accept">
                    <FormattedMessage id="show-result.finish" defaultMessage="Schließen"/>
                </Button>
            </div>
        </Modal>
    );
}
    

ShowFormulaResultModal.propTypes = {
    scene: PropTypes.object,
    onClose: PropTypes.func,
    result: PropTypes.number,
    groupCode: PropTypes.string
};