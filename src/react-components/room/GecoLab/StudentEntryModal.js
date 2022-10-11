import React, { useCallback, useEffect } from "react";
import PropTypes from "prop-types";
import { Modal } from "../../modal/Modal";
import { FormattedMessage } from "react-intl";
import { ClothingOptions } from "./ClothingOptions";
import { Button } from "../../input/Button";
import { CloseButton } from "../../input/CloseButton";
import { TextInputField } from "../../input/TextInputField";
import { styles } from "./StudentEntryModal.scss";
import  configs from "../../../utils/configs";
import AvatarPreview from "../../avatar-preview";
import Laborbrille from "../../../assets/images/icons/laborbrille_placeholder.png";
import Laborkittel from "../../../assets/images/icons/laborkittel_placeholder.png";
import { StudentEntryModalContainer } from "./StudentEntryModalContainer";


var loadedOnce = false;

//Functions for reloading UI:
function jumpToSecurity(scene, showNonHistoriedDialog, securityRead, securityBtn) {
    console.log(securityBtn);
    if(securityBtn == false)
        return;

    showNonHistoriedDialog(
        StudentEntryModalContainer,
        {scene, showNonHistoriedDialog, securityRead: securityRead, showAcceptBtn: false, showSecurity: true, showSecurityBtn: false, 
            clothingWrapperLeftClassName: "selectableImage", clothingOptionLeftClassName: "clickable hidden", clothingWrapperRightClassName: "selectableImage", 
            clothingOptionRightClassName: "clickable hidden", rightOptionCounter: 0}
    )


    if(securityRead)
        return;

    setTimeout( () => {
        showNonHistoriedDialog(
            StudentEntryModalContainer, 
            {scene, showNonHistoriedDialog, securityRead: true, showAcceptBtn: false, showSecurity: true, showSecurityBtn: false,
                clothingWrapperLeftClassName: "selectableImage", clothingOptionLeftClassName: "clickable hidden", clothingWrapperRightClassName: "selectableImage", 
                clothingOptionRightClassName: "clickable hidden", rightOptionCounter: 0 }
        )
    }, 5000);
}

function backToStudentEntry(showNonHistoriedDialog, scene) {
    showNonHistoriedDialog(
        StudentEntryModalContainer, 
        {scene, showNonHistoriedDialog, securityRead: true, showAcceptBtn: true, showSecurity: false, showSecurityBtn: true, 
            clothingWrapperLeftClassName: "selectableImage confirmed", clothingOptionLeftClassName: "clickable hidden", clothingWrapperRightClassName: "selectableImage confirmed", 
            clothingOptionRightClassName: "clickable hidden", rightOptionCounter: 0}
    )
}

function setSecurityBtn(showNonHistoriedDialog, scene) {
    showNonHistoriedDialog(
        StudentEntryModalContainer, 
        {scene, showNonHistoriedDialog, securityRead: false, showAcceptBtn: false, showSecurity: false, showSecurityBtn: true, 
            clothingWrapperLeftClassName: "selectableImage confirmed", clothingOptionLeftClassName: "clickable hidden", clothingWrapperRightClassName: "selectableImage confirmed", 
            clothingOptionRightClassName: "clickable hidden", rightOptionCounter: 0}
    )
}


export function StudentEntryModal ({ scene, showNonHistoriedDialog, onClose, securityRead, showAcceptBtn, 
    showSecurity, showSecurityBtn, clothingWrapperLeftClassName, clothingOptionLeftClassName, clothingWrapperRightClassName, clothingOptionRightClassName, rightOptionCounter }) {
    
    const profile = window.APP.store.state.profile;

    let enterBtnClassName = "";
    let acceptBtnClassName = "";
    let toSecurityBtnClassName = "";

    let clothingWrapperLeftClassName_local = clothingWrapperLeftClassName;
    let clothingOptionLeftClassName_local = clothingOptionLeftClassName;
    let clothingWrapperRightClassName_local = clothingWrapperRightClassName;
    let clothingOptionRightClassName_local = clothingOptionRightClassName;
    let rightOptionCounter_local = rightOptionCounter;

    let gecolabManager = scene.systems["gecolab-manager"];
    
    let studentAvatar = null;

    console.log(gecolabManager);

    if (gecolabManager.isInit() == false)
    {
        onClose();
    }
    
    let student = gecolabManager.getStudent();

    // Skip security for Labor entrances
    if (loadedOnce === false)
    {
        if (!gecolabManager.isInLobby())
        {
            showAcceptBtn = false;
            showSecurityBtn = true;

            //onClose();
        }
        else
        {
            showAcceptBtn = true;
            showSecurityBtn = false;
        }

        loadedOnce = true;
    }
    

    let avatarGltfUrl = `https://${configs.CORS_PROXY_SERVER}/${profile.avatarId}`;

    //Callbacks from ClothingOptions:
    const onClickClothingWrapper = useCallback(
        (elementID) => {
            if(showSecurityBtn)
                return;

            if(elementID == 0) {
                if(clothingWrapperLeftClassName_local == "selectableImage confirmed")
                    return;
                else if(clothingWrapperLeftClassName_local == "selectableImage" || clothingWrapperLeftClassName_local == "selectableImage wrongAnswer") {
                    clothingWrapperLeftClassName_local = "selectableImage selected";
                    clothingOptionLeftClassName_local = "clickable";
                }
                else if(clothingWrapperLeftClassName_local = "selectableImage selected") {
                    clothingWrapperLeftClassName_local = "selectableImage";
                    clothingOptionLeftClassName_local = "clickable hidden";
                }
            }
            else if(elementID == 1){
                if(clothingWrapperRightClassName_local == "selectableImage confirmed")
                    return;
                else if(clothingWrapperRightClassName_local == "selectableImage" || clothingWrapperRightClassName_local == "selectableImage wrongAnswer") {
                    clothingWrapperRightClassName_local = "selectableImage selected";
                    clothingOptionRightClassName_local = "clickable";
                }
                else if(clothingWrapperRightClassName_local = "selectableImage selected") {
                    clothingWrapperRightClassName_local = "selectableImage";
                    clothingOptionRightClassName_local = "clickable hidden";
                }
            }
            else 
                return;

            showNonHistoriedDialog(
                StudentEntryModalContainer,
                {scene, showNonHistoriedDialog, securityRead: securityRead, showAcceptBtn: showAcceptBtn, showSecurity: false, showSecurityBtn: showSecurityBtn, 
                    clothingWrapperLeftClassName: clothingWrapperLeftClassName_local, clothingOptionLeftClassName: clothingOptionLeftClassName_local, 
                    clothingWrapperRightClassName: clothingWrapperRightClassName_local, clothingOptionRightClassName: clothingOptionRightClassName_local, rightOptionCounter: rightOptionCounter_local}
            )
        }
    );

    const onCheckOption = useCallback(
        (elementID, id) => {
            if(showSecurityBtn)
                return;

            if(elementID == 0) {
                if(id == 2) {
                    clothingWrapperLeftClassName_local = "selectableImage confirmed";
                    rightOptionCounter_local++;
                    showNonHistoriedDialog(
                        StudentEntryModalContainer,
                        {scene, showNonHistoriedDialog, securityRead: securityRead, showAcceptBtn: showAcceptBtn, showSecurity: false, showSecurityBtn: false, 
                            clothingWrapperLeftClassName: clothingWrapperLeftClassName_local, clothingOptionLeftClassName: "clickable hidden", 
                            clothingWrapperRightClassName: clothingWrapperRightClassName_local, clothingOptionRightClassName: clothingOptionRightClassName_local, rightOptionCounter: rightOptionCounter_local}
                    )
                    if(rightOptionCounter_local >= 2) {
                        clothingOptionLeftClassName_local = "clickable hidden";
                        clothingWrapperRightClassName_local = "clickable hidden";
                        setSecurityBtn(showNonHistoriedDialog, scene);
                    }
                }
                else {
                    if(clothingWrapperLeftClassName_local == "selectableImage wrongAnswer") {
                        return;
                    }
    
                    clothingWrapperLeftClassName_local = "selectableImage wrongAnswer";
                    showNonHistoriedDialog(
                        StudentEntryModalContainer,
                        {scene, showNonHistoriedDialog, securityRead: securityRead, showAcceptBtn: showAcceptBtn, showSecurity: false, showSecurityBtn: false, 
                            clothingWrapperLeftClassName: clothingWrapperLeftClassName_local, clothingOptionLeftClassName: "clickable hidden", 
                            clothingWrapperRightClassName: clothingWrapperRightClassName_local, clothingOptionRightClassName: clothingOptionRightClassName_local, rightOptionCounter: rightOptionCounter_local}
                    )
                }
            }
            else if(elementID == 1){
                if(id == 2) {
                    clothingWrapperRightClassName_local = "selectableImage confirmed";
                    rightOptionCounter_local++;
                    showNonHistoriedDialog(
                        StudentEntryModalContainer,
                        {scene, showNonHistoriedDialog, securityRead: securityRead, showAcceptBtn: showAcceptBtn, showSecurity: false, showSecurityBtn: false, 
                            clothingWrapperLeftClassName: clothingWrapperLeftClassName_local, clothingOptionLeftClassName: clothingOptionLeftClassName_local, 
                            clothingWrapperRightClassName: clothingWrapperRightClassName_local, clothingOptionRightClassName: "clickable hidden", rightOptionCounter: rightOptionCounter_local}
                    )
                    if(rightOptionCounter_local >= 2) {
                        clothingOptionRightClassName_local = "clickable hidden";
                        clothingWrapperRightClassName_local = "clickable hidden";
                        setSecurityBtn(showNonHistoriedDialog, scene);
                    }
                }
                else {
                    if(clothingWrapperRightClassName_local == "selectableImage wrongAnswer") {
                        return;
                    }
    
                    clothingWrapperRightClassName_local = "selectableImage wrongAnswer";
                    showNonHistoriedDialog(
                        StudentEntryModalContainer,
                        {scene, showNonHistoriedDialog, securityRead: securityRead, showAcceptBtn: showAcceptBtn, showSecurity: false, showSecurityBtn: false, 
                            clothingWrapperLeftClassName: clothingWrapperLeftClassName_local, clothingOptionLeftClassName: clothingOptionLeftClassName_local, 
                            clothingWrapperRightClassName: clothingWrapperRightClassName_local, clothingOptionRightClassName: "clickable hidden", rightOptionCounter: rightOptionCounter_local}
                    )
                }
            }
        }
    );


    if(showAcceptBtn) 
        enterBtnClassName = "btn";
    else 
        enterBtnClassName = "btn notThere";

    if(securityRead) 
        acceptBtnClassName = "acceptBtn";
    else 
        acceptBtnClassName = "acceptBtn notThere";

    if(showSecurityBtn) 
        toSecurityBtnClassName = "btnActive";
    else 
        toSecurityBtnClassName = "btnInactive notThere";


    if(showSecurity) {
        return (
            <Modal  
                title={<FormattedMessage id="security-reading.title" defaultMessage="Sicherheitseinweisung" />}
                /*beforeTitle={<CloseButton onClick={onClose} />}*/
            >
                <div className="scrollableContent">
                    In unserem virtuellen Lehr-Lern-Labor gibt es keine Gefahrenquellen für dich.<br/>
                    Für das Arbeiten im Labor gibt es trotzdem ein paar Dinge, die du beachten solltest.<br/>
                    Während des Aufenthalts im Labor musst du immer einen Kittel und eine Schutzbrille
                    tragen, auch wenn du selbst nicht experimentierst!<br/>
                    Denk daran sauber und sorgfältig zu arbeiten, weil es sonst zu Fehlern beim Experiment
                    kommen kann!<br/>
                    Essen und Trinken sind im Labor verboten!
                </div>
                <Button className={acceptBtnClassName} onClick={() => backToStudentEntry(showNonHistoriedDialog, scene)}>
                    <FormattedMessage id="security-reading.close" defaultMessage="Bestätigen"/>
                </Button>
            </Modal>
        );
    }
    else {
        return (
            <Modal  
                title={<FormattedMessage id="student-entry.title" defaultMessage="Informationen" />}
                /* beforeTitle={<CloseButton onClick={onClose} />} */
             >
                <div id="wrapper"> 
                    <h4 id="header">
                        Ziehe die Schutzkleidung an und lese die Sicherheitseinweisung
                    </h4>

                    <TextInputField
                        disabled={true}
                        value={student.gamerTag}
                        />
                    <br/>
    
                    <div class="flexWrapper">
                        <ClothingOptions
                            parentID={"laborkittel"}
                            elementID={0}
                            imgSrc={Laborkittel}
                            onClickWrapperCallback={onClickClothingWrapper} 
                            onCheckOptionCallback={onCheckOption}
                            clothingWrapperClassName={clothingWrapperLeftClassName_local}
                            clothingOptionClassName={clothingOptionLeftClassName_local}
                        />
                        
                        <AvatarPreview 
                            className="preview"
                            avatarGltfUrl={avatarGltfUrl}
                        />
                        <ClothingOptions
                            parentID={"laborbrille"}
                            elementID={1}
                            imgSrc={Laborbrille}
                            onClickWrapperCallback={onClickClothingWrapper} 
                            onCheckOptionCallback={onCheckOption}
                            clothingWrapperClassName={clothingWrapperRightClassName_local}
                            clothingOptionClassName={clothingOptionRightClassName_local}
                        />
                    </div>

                    <Button className={toSecurityBtnClassName} onClick={() => jumpToSecurity(scene, showNonHistoriedDialog, securityRead, showSecurityBtn)}>
                        <FormattedMessage id="student-entry.security" defaultMessage="Sicherheitseinweisung"/>
                    </Button>
                    <Button className={enterBtnClassName} onClick={onClose} preset="accept">
                        <FormattedMessage id="student-entry.finish" defaultMessage="Labor betreten"/>
                    </Button>
                </div>
            </Modal>
        );
    }
}

StudentEntryModal.propTypes = {
    isMobile: PropTypes.bool,
    scene: PropTypes.object,
    showNonHistoriedDialog: PropTypes.func,
    onClose: PropTypes.func,
    securityRead: PropTypes.bool,
    showAcceptBtn: PropTypes.bool,
    showSecurity: PropTypes.bool,
    showSecurityBtn: PropTypes.bool,
    clothingWrapperLeftClassName: PropTypes.string,
    clothingOptionLeftClassName: PropTypes.string,
    clothingWrapperRightClassName: PropTypes.string,
    clothingOptionRightClassName: PropTypes.string,
    rightOptionCounter: PropTypes.number
};