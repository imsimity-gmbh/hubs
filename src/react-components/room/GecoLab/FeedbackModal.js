import React, { useCallback, useEffect } from "react";
import PropTypes from "prop-types";
import { Modal } from "../../modal/Modal";
import { FormattedMessage } from "react-intl";
import { styles } from "./Feedback.scss";
import { FeedbackModalContainer } from "./FeedbackModalContainer";
import { Button } from "../../input/Button";
import { Column } from "../../layout/Column";
import { TextAreaInputField } from "../../input/TextAreaInputField";
import starEmpty from "../../../assets/images/icons/Star_empty.png";
import starFilled from "../../../assets/images/icons/Star_filled.png";

    let star1Class = "idle";
    let star2Class = "idle";
    let star3Class = "idle";
    let star4Class = "idle";
    let star5Class = "idle";

    let onCloseNow = false;

    let rating = 0;
    let feedbackText = "";

    let stylesText = {
        backgroundColor: 'black',
        height: '200px',
        width: '200px',
        marginBottom: "10px",
      };

function onClickGlove(scene, showNonHistoriedDialog, id, groupCode) {

    if(id == 1)
    {
        rating = 1;
    }
    else if(id == 2) 
    {
        rating = 2;
    }
    else if(id == 3) 
    {
        rating = 3;
    }
    else if(id == 4) 
    {
        rating = 4;
    }
    else if(id == 5) 
    {
        rating = 5;
    }
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

        // reseting values
        star1Class = "idle";
        star2Class = "idle";
        star3Class = "idle";
        star4Class = "idle";
        star5Class = "idle";
    
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
                    <div class="feedback-text">
                        <br/>Wie gut war Ihre Erfahrung?
                    </div>
                    <div class="stars">
                        <div>
                            <img className={star1Class} class="starImage" src={rating>=1?starFilled:starEmpty} onClick={() => onClickGlove(scene, showNonHistoriedDialog, 1, groupCode)}></img>
                        </div>
                        <div>
                            <img className={star2Class} class="starImage" src={rating>=2?starFilled:starEmpty} onClick={() => onClickGlove(scene, showNonHistoriedDialog, 2, groupCode)}></img>  
                        </div>
                        <div>
                            <img className={star3Class} class="starImage" src={rating>=3?starFilled:starEmpty} onClick={() => onClickGlove(scene, showNonHistoriedDialog, 3, groupCode)}></img>  
                        </div>
                        <div>
                            <img className={star4Class} class="starImage" src={rating>=4?starFilled:starEmpty} onClick={() => onClickGlove(scene, showNonHistoriedDialog, 4, groupCode)}></img>  
                        </div>
                        <div>
                            <img className={star5Class} class="starImage" src={rating>=5?starFilled:starEmpty} onClick={() => onClickGlove(scene, showNonHistoriedDialog, 5, groupCode)}></img>  
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