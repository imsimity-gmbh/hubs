import React, {} from "react";
import PropTypes from "prop-types";
import { Popover } from "../../popover/Popover";
import { ToolbarButton } from "../../input/ToolbarButton";
import { ReactComponent as NotebookIcon } from "../../icons/GecoLab/Notebook.svg";
import { defineMessage, useIntl } from "react-intl";
import { TextAreaInputField } from "../../input/TextAreaInputField";
import Cookies from "js-cookie";
import { Button } from "../../input/Button";
import { useForm } from "react-hook-form";
import { Column } from "../../layout/Column";

const notebookPopoverTitle = defineMessage({
  id: "notebook-popover.title",
  defaultMessage: "Notebook"
});


export function NotebookPopoverButton() {
  const intl = useIntl();
  const title = intl.formatMessage(notebookPopoverTitle);
  const {} = useForm();

  const handleOnChange = event => {
    if((typeof event.target.value === 'string' || event.target.value instanceof String))
      {
      let jsonNotes = JSON.stringify(event.target.value);
      Cookies.set('notes', jsonNotes);
      //console.log("Speicher " + event.target.value + " in " + jsonNotes);
      }
  }

  let styles = {
    height: '250px',
    width: '250px',
  };
  
  return (
    <Popover
    title={title}
    placement="top"
    offsetDistance={28}
    disableFullscreen
    content={props => (
          <Column as="form" center>
            <TextAreaInputField 
              style = {styles} 
              defaultValue = {JSON.parse(Cookies.get("notes") || JSON.stringify("")) }
              onChange={handleOnChange} />
            <Button
              preset="accept"
              onClick={() => props.closePopover()}>
                Save
            </Button>
          </Column>
    )}
  >
    {({ togglePopover, popoverVisible, triggerRef }) => (
      <ToolbarButton
        ref={triggerRef}
        icon={<NotebookIcon />}
        selected={popoverVisible}
        onClick={togglePopover}
        label={title}
        preset="accent2"
      />
    )}
  </Popover>

  );
}

NotebookPopoverButton.propTypes = {
};
