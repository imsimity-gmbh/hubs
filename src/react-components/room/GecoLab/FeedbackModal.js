import React, { useCallback, useEffect } from "react";
import PropTypes from "prop-types";
import { Modal } from "../../modal/Modal";
import { FormattedMessage } from "react-intl";
import { styles } from "./FeedbackModal.scss";
import { FeedbackModalContainer } from "./FeedbackModalContainer";
import { Button } from "../../input/Button";
import { Column } from "../../layout/Column";
import { TextAreaInputField } from "../../input/TextAreaInputField";
import starEmpty from "../../../assets/images/icons/Star_empty.png";
import starFilled from "../../../assets/images/icons/Star_filled.png";

let onCloseNow = false;

let rating = 0;
let feedbackText = "";
let starClass = "idle starImage";

function onClickStar(scene, showNonHistoriedDialog, id, groupCode) {
    rating = id;

    showNonHistoriedDialog(
        FeedbackModalContainer, {scene: scene, showNonHistoriedDialog: showNonHistoriedDialog, groupCode: groupCode }
    );
}

export function FeedbackModal ({ scene, showNonHistoriedDialog, onClose, groupCode }) {

    function handleSubmit() {
        /* Hier Feedback-Speichern
        *
        *
        */

        console.log(rating);
            
        onCloseNow = false;
    
        rating = 0;
        feedbackText = "";

        onClose();
    }

    const handleOnChange = event => {
        feedbackText = event.target.value;
        console.log(feedbackText);
    }

    return (
        <Modal  
            title={<FormattedMessage id="temperatureInfo-modal.title" defaultMessage="Feedback" />}
            /*beforeTitle={<CloseButton onClick={onClose} />}*/
        >
            <div class="modal-wrapper">
                <Column as="form" center>
                    <div className="feedback-text">
                        <br/>Wie gut war Ihre Erfahrung?
                    </div>
                    <div className="stars">
                        <div>
                            <img className={starClass}  src={rating>=1?starFilled:starEmpty} onClick={() => onClickStar(scene, showNonHistoriedDialog, 1, groupCode)}></img>
                        </div>
                        <div>
                            <img className={starClass}  src={rating>=2?starFilled:starEmpty} onClick={() => onClickStar(scene, showNonHistoriedDialog, 2, groupCode)}></img>  
                        </div>
                        <div>
                            <img className={starClass}  src={rating>=3?starFilled:starEmpty} onClick={() => onClickStar(scene, showNonHistoriedDialog, 3, groupCode)}></img>  
                        </div>
                        <div>
                            <img className={starClass}  src={rating>=4?starFilled:starEmpty} onClick={() => onClickStar(scene, showNonHistoriedDialog, 4, groupCode)}></img>  
                        </div>
                        <div>
                            <img className={starClass}  src={rating>=5?starFilled:starEmpty} onClick={() => onClickStar(scene, showNonHistoriedDialog, 5, groupCode)}></img>  
                        </div>
                    </div>
                    <TextAreaInputField 
                        style = {styles} 
                        defaultValue = {"Hier können Sie zusätzlich Feedback geben"}
                        onChange={handleOnChange} />
                    <Button id="close-modal" onClick={handleSubmit} preset="accept" >
                        Absenden
                    </Button>
                    <br/>
                </Column>
            </div>
        </Modal>
    );
}
    

FeedbackModal.propTypes = {
    scene: PropTypes.object,
    onClose: PropTypes.func,
    result: PropTypes.number,
    groupCode: PropTypes.string,
    showNonHistoriedDialog: PropTypes.func,
};