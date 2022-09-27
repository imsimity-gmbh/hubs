import React from "react";
import PropTypes from "prop-types";
import { ButtonGridPopover } from "../../popover/ButtonGridPopover";
import { Popover } from "../../popover/Popover";
import { ToolbarButton } from "../../input/ToolbarButton";
import { ReactComponent as NotebookIcon } from "../../icons/GecoLab/Notebook.svg";
import { defineMessage, useIntl } from "react-intl";

const notebookPopoverTitle = defineMessage({
  id: "notebook-popover.title",
  defaultMessage: "Notebook"
});

export function NotebookPopoverButton({ items }) {
  const intl = useIntl();
  const title = intl.formatMessage(notebookPopoverTitle);

  return (
    <Popover
      title={title}
      content={props => <ButtonGridPopover items={items} {...props} />}
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
  items: PropTypes.array.isRequired
};
