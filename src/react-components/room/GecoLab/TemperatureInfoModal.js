import React, { useCallback, useEffect } from "react";
import { TemperatureInfoModalContainer } from "./TemperatureInfoModalContainer";
import PropTypes from "prop-types";
import { Modal } from "../../modal/Modal";
import styles from "./TemperatureInfo.scss";
import { FormattedMessage } from "react-intl";
import { Column } from "../../layout/Column";
import { Button } from "../../input/Button";

let btnPushed = false;

function onButtonPush( scene, showNonHistoriedDialog){
    btnPushed = true;
    showNonHistoriedDialog(
        TemperatureInfoModalContainer, {scene: scene, showNonHistoriedDialog: showNonHistoriedDialog }
    );
}

export function TemperatureInfoModal ({ scene, showNonHistoriedDialog, onClose }) {

    if(btnPushed) {
        setTimeout(() => {
            scene.systems["first-experiments"].getTaskById("05").components["first-experiment-05"].onPopupClosed();
            onClose();
        }, 500);
    }

    return (
        <Modal  
            title={<FormattedMessage id="temperatureInfo-modal.title" defaultMessage="Warum ist die Temperatur wichtig?" />}
            /*beforeTitle={<CloseButton onClick={onClose} />}*/
        >
            <div class="modal-wrapper">
                <Column as="form" center>
                    <div class="tempInfo-text">
                        Beim Erhitzen des Bodens auf 400-500 °C verglüht der Humus, die anderen Bodenbestandteile bleiben größtenteils erhalten. Wenn die Temperatur zu hoch ist, kann der Humusgehalt demnach nicht eindeutig bestimmt werden, weil auch andere Bodenbestandteile verglüht sein können.
                    </div>
                    <Button
                    preset="accept"
                    onClick={() => onButtonPush(scene, showNonHistoriedDialog)}>
                        Schließen
                    </Button>
                </Column>
            </div>
        </Modal>
    );
}
    

TemperatureInfoModal.propTypes = {
    scene: PropTypes.object,
    showNonHistoriedDialog: PropTypes.func,
    onClose: PropTypes.func
};