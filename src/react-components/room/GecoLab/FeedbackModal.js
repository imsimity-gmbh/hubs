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

import configs from "../../../utils/configs";
import { HEROKU_POST_FEEDBACK_URI } from "../../../utils/imsimity";

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

    const handleSubmit = async ()  => {

        console.log(feedbackText);

        if (!feedbackText?.trim())
        {
            feedbackText = "kein Text";
        }

        var uri = `https://${configs.CORS_PROXY_SERVER}/${HEROKU_POST_FEEDBACK_URI}?rating=${rating}&message=${encodeURIComponent(feedbackText)}`;

        console.log(uri);

        const res = await fetch(uri);

        const payload = await res.json();

        console.log("Uploaded done");
        console.log(payload);

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
            title={<FormattedMessage id="gecolab.feedback.title" defaultMessage="Feedback" />}
            /*beforeTitle={<CloseButton onClick={onClose} />}*/
        >
            <div class="modal-wrapper">
                <Column as="form" center>
                    <div className="feedback-text">
                        <br/>
                        <FormattedMessage id="gecolab.feedback.subtitle" defaultMessage="How good was your experience?" />
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
                        defaultValue = {<FormattedMessage id="gecolab.feedback.default-text" defaultMessage="You can give additional feedback here" />}
                        onChange={handleOnChange} />
                        <Button id="close-modal" onClick={handleSubmit} preset="accept" disabled={rating === 0}>
                            <FormattedMessage id="gecolab.default.send" defaultMessage="Send" />
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