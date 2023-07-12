import React, { useCallback, useEffect } from "react";
import PropTypes from "prop-types";
import { Modal } from "../../modal/Modal";
import { CloseButton } from "../../input/CloseButton";
import { useForm } from "react-hook-form";
import { Button } from "../../input/Button";
import { Column } from "../../layout/Column";
import styles from "./TeacherExperimentModal.scss";
import classNames from "classnames";
import { FormattedMessage } from "react-intl";
import { SelectInputField } from "../../input/SelectInputField";
import { getUsersFromPresences } from "../../../utils/GecoLab/network-helper";

import { ReactComponent as ModeratorIcon } from "../../icons/StarOutline.svg";
import { ReactComponent as RemoveIcon } from "../../icons/Close.svg";


export function TeacherExperimentModal({ onSubmit, location ,onClose, presences, sessionId, experiment }) {
  const { handleSubmit, register, watch, setValue } = useForm();

  useEffect(
    () => {
      register("moderator");
      register("members");

      setValue("members", []);
    },
    [register, setValue]
  );


  const onChangeModerator = useCallback(user => {
      console.log(user);
      setValue("moderator", user);

      var tempMembers = watch("members");
      const isMember =  tempMembers.some(({id}) => id === user.id)

      if (isMember)
      {
        tempMembers.splice(tempMembers.indexOf(user), 1);
      }
      
      setValue("members", tempMembers);
    },
    [setValue]
  );

  const onClickMember = useCallback((id) => {
      console.log(id);  

      if (users && id < users.length)
      {
        var tempMembers = watch("members");
        const user = users[id].value;

        console.log(user);
        console.log(tempMembers);
        
        const isMember =  tempMembers.some(({id}) => id === user.id)

        if (isMember)
        {
          console.log("removing " + users[id].label);
          tempMembers.splice(tempMembers.indexOf(user), 1);
        }
        else
        {
          console.log("pushing " + users[id].label);
          tempMembers.push(user);
        }

        setValue("members", tempMembers);
      }
    },
    [setValue]
  );

  
  var users = getUsersFromPresences(presences, sessionId);

  const moderator = watch("moderator");
  const members = watch("members");

  var groupMemberArray = [];
  var othersArray = [];

  var disableSubmit = !(moderator != null && moderator != undefined);

  if (users && members)
  {
    for(let i = 0; i < users.length; i++)
    {
      var user = users[i];

      const isModerator = (!moderator) ? false : (moderator.id === user.value.id);
      const inMembers = members.some(({id}) => id === user.value.id)
      const onClick = (isModerator) ? null : (() => { onClickMember(i) });

      const element =
        <Button sm preset="accent4" className={classNames(styles.userButton)} onClick={onClick}>
        {isModerator &&(
          <ModeratorIcon />
        )}
        <span>
          {user.label}   
          { inMembers &&( <span>&nbsp;</span>)}
        </span>
        { inMembers &&(
           <RemoveIcon />
        )}    
      </Button>
      

      if (isModerator)
      {
        // Always put the moderator first in the array
        groupMemberArray.unshift(element);
      }
      else
      {
        if (inMembers)
          groupMemberArray.push(element);
        else
          othersArray.push(element);  
      }
    }
    
  }

 
  return (
    <Modal
      title={ (location==="position_01") ? 
                (experiment==="first-experiment") ?
          <FormattedMessage id="teacher-experiment-modal.title_01" defaultMessage="Experiment 1 - Arbeitsbereich 1" /> :
                (experiment==="second-experiment") ? 
          <FormattedMessage id="teacher-experiment-modal.title_03" defaultMessage="Experiment 2 - Arbeitsbereich 1" /> :
          <FormattedMessage id="teacher-experiment-modal.title_05" defaultMessage="Experiment 3 - Arbeitsbereich 1" /> :
                (experiment==="first-experiment") ?
          <FormattedMessage id="teacher-experiment-modal.title_02" defaultMessage="Experiment 1 - Arbeitsbereich 2" /> :
                (experiment==="second-experiment") ?
          <FormattedMessage id="teacher-experiment-modal.title_04" defaultMessage="Experiment 2 - Arbeitsbereich 2" /> :
          <FormattedMessage id="teacher-experiment-modal.title_06" defaultMessage="Experiment 3 - Arbeitsbereich 2" />}
      beforeTitle={<CloseButton onClick={onClose} />}
    >
      <Column as="form" padding center onSubmit={handleSubmit(onSubmit)}>
        <p>
          {(
            <FormattedMessage
              id="teacher-experiment-modal.message"
              defaultMessage="Wählen Sie einen Gruppenleiter und Gruppenmitglieder. Andere können nicht mit diesem Experiment interagieren."
            />
          )}
        </p>
        <SelectInputField 
          label={<FormattedMessage id="teacher-experiment-modal.group-moderator" defaultMessage="Gruppenleiter" />}
          value={moderator}
          options={users} 
          onChange={onChangeModerator} 
        />
        <div className={classNames(styles.membersField)}>
          <label className={styles.label}>
            <FormattedMessage id="teacher-experiment-modal.group-members" defaultMessage="Gruppenmitglieder" />
            <span> ({groupMemberArray.length})</span>
          </label>
          <div className={classNames(styles.usersArray)}>
            { groupMemberArray }
          </div>
        </div>
        <div className={classNames(styles.membersField)}>
          <label className={styles.label}>
            <FormattedMessage id="teacher-experiment-modal.others" defaultMessage="Andere" />
            <span> ({othersArray.length})</span>
          </label>
          <div className={classNames(styles.usersArray)}>
            { othersArray }
          </div>
        </div>
        <Button type="submit" preset="accept" disabled={disableSubmit}>
          <FormattedMessage id="teacher-experiment-modal.create-object-button" defaultMessage="Experiment platzieren" />
        </Button>
      </Column>
    </Modal>
  );

}

TeacherExperimentModal.propTypes = {
  isMobile: PropTypes.bool,
  onSubmit: PropTypes.func,
  location: PropTypes.string.isRequired,
  onClose: PropTypes.func,
  presences:  PropTypes.object.isRequired,
  sessionId: PropTypes.string.isRequired,
};
