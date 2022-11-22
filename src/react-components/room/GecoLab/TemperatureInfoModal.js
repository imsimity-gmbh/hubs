import React, { useCallback, useEffect } from "react";
import { TemperatureInfoModalContainer } from "./TemperatureInfoModalContainer";
import PropTypes from "prop-types";
import { Modal } from "../../modal/Modal";
import styles from "./TemperatureInfo.scss";
import { FormattedMessage } from "react-intl";
import { Column } from "../../layout/Column";
import { Button } from "../../input/Button";

let btnPushed = false;

function onButtonPush( scene, showNonHistoriedDialog, groupCode){
    btnPushed = true;
    showNonHistoriedDialog(
        TemperatureInfoModalContainer, {scene: scene, showNonHistoriedDialog: showNonHistoriedDialog, groupCode: groupCode }
    );
}

export function TemperatureInfoModal ({ scene, showNonHistoriedDialog, onClose, groupCode }) {

    if(btnPushed) {
        setTimeout(() => {
            scene.systems["first-experiments"].getTaskById("05", groupCode).components["first-experiment-05"].onPopupClosed();

            btnPushed = false;

            onClose();
        }, 500);
    }

    return (
        <Modal  
            title={<FormattedMessage id="gecolab.temperature-info.title" defaultMessage="Why is the temperature important?" />}
            /*beforeTitle={<CloseButton onClick={onClose} />}*/
        >
            <div class="modal-wrapper">
                <Column as="form" center>
                    <div class="tempInfo-text">
                        <br/>
                        <FormattedMessage id="gecolab.temperature-info.message" defaultMessage="When the soil is heated to 400-500 °C, the humus burns up, while most of the other soil components remain. If the temperature is too high, the humus content cannot be determined unequivocally because other soil components can also be burned up." />
                    </div>
                    <Button
                    preset="accept"
                    onClick={() => onButtonPush(scene, showNonHistoriedDialog, groupCode)}>
                        <FormattedMessage id="gecolab.default.finish" defaultMessage="Close" />
                    </Button>
                </Column>
            </div>
        </Modal>
    );
}
    

TemperatureInfoModal.propTypes = {
    scene: PropTypes.object,
    showNonHistoriedDialog: PropTypes.func,
    onClose: PropTypes.func,
    groupCode: PropTypes.string
};