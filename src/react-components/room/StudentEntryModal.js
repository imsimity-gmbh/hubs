import React, { useCallback, useEffect } from "react";
import PropTypes from "prop-types";
import { Modal } from "../modal/Modal";
import { FormattedMessage } from "react-intl";
import { ClothingOptions } from "./ClothingOptions";
import { Button } from "../input/Button";
import { CloseButton } from "../input/CloseButton";
import { TextInputField } from "../input/TextInputField";
import { styles } from "./StudentEntryModal.scss";
import AvatarPreview from "../avatar-preview";
import Laborbrille from "../../assets/images/icons/laborbrille_placeholder.png";
import Laborkittel from "../../assets/images/icons/laborkittel_placeholder.png";
import { StudentEntryModalContainer } from "./StudentEntryModalContainer";


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

    let enterBtnClassName = "";
    let acceptBtnClassName = "";
    let toSecurityBtnClassName = "";

    let clothingWrapperLeftClassName_local = clothingWrapperLeftClassName;
    let clothingOptionLeftClassName_local = clothingOptionLeftClassName;
    let clothingWrapperRightClassName_local = clothingWrapperRightClassName;
    let clothingOptionRightClassName_local = clothingOptionRightClassName;
    let rightOptionCounter_local = rightOptionCounter;

    let gecolabManager = scene.systems["gecolab-manager"];

    
    if (gecolabManager.isInit() == false)
    {
        onClose();
    }
    
    let student = gecolabManager.getStudent();
    

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
        toSecurityBtnClassName = "btnInactive";


    if(showSecurity) {
        return (
            <Modal  
                title={<FormattedMessage id="security-reading.title" defaultMessage="Sicherheitseinweisung" />}
                /*beforeTitle={<CloseButton onClick={onClose} />}*/
            >
                <div className="scrollableContent">
                    Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet.   
                    Duis autem vel eum iriure dolor in hendrerit in vulputate velit esse molestie consequat, vel illum dolore eu feugiat nulla facilisis at vero eros et accumsan et iusto odio dignissim qui blandit praesent luptatum zzril delenit augue duis dolore te feugait nulla facilisi. Lorem ipsum dolor sit amet, consectetuer adipiscing elit, sed diam nonummy nibh euismod tincidunt ut laoreet dolore magna aliquam erat volutpat.   
                    Ut wisi enim ad minim veniam, quis nostrud exerci tation ullamcorper suscipit lobortis nisl ut aliquip ex ea commodo consequat. Duis autem vel eum iriure dolor in hendrerit in vulputate velit esse molestie consequat, vel illum dolore eu feugiat nulla facilisis at vero eros et accumsan et iusto odio dignissim qui blandit praesent luptatum zzril delenit augue duis dolore te feugait nulla facilisi.   
                    Nam liber tempor cum soluta nobis eleifend option congue nihil imperdiet doming id quod mazim placerat facer
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
                /*beforeTitle={<CloseButton onClick={onClose} />}*/
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
                            avatarGltfUrl={"https://www.dropbox.com/s/3wqvhuw8zgvtjkh/9aa7a5a1-071f-4111-82f9-73b005e32d06.gltf?dl=1"} //Add link of my avatar
                            onGltfLoaded={(e) => {console.log(e)}}
                            // ref={p => (this.preview = p)}
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