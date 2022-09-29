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

export function NotebookPopoverButton({ items, onClose }) {
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
    backgroundColor: 'black',
    height: '200px',
    width: '200px',
  };

  return (
    <Popover
      title={title}
      content={props =>
          <Column as="form" center>
            <TextAreaInputField 
              style = {styles} 
              defaultValue = {JSON.parse(Cookies.get("notes"))}
              onChange={handleOnChange} />
            <Button
              preset="accept"
              onClick={onClose}>
                Save
            </Button>
          </Column>
        }
      placement="top"
      offsetDistance={28}
      disableFullscreen
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
  items: PropTypes.array.isRequired,
  onClose: PropTypes.func
};
