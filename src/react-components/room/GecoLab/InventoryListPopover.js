import React, { useCallback } from "react";
import PropTypes from "prop-types";
import { Popover } from "../../popover/Popover";
import { ToolbarButton } from "../../input/ToolbarButton";
import { ReactComponent as InventoryIcon } from "../../icons/GeycoLab/Inventory.svg";
import { defineMessage, useIntl } from "react-intl";
import { InventoryListContent } from "./InventoryListContent";
import styles from "./InventoryListContent.scss";

const isMobile = AFRAME.utils.device.isMobile() || AFRAME.utils.device.isMobileVR();

const inventoryPopoverTitle = defineMessage({
  id: "inventory-list.title",
  defaultMessage: "Inventar"
}); 

export function InventoryListPopover({ onClose }) {

  const intl = useIntl();
  const title = intl.formatMessage(inventoryPopoverTitle);

  return (
    <Popover
      className={styles.inventoryPopover}
      title={title}
      content={props => <InventoryListContent />}
      placement="top"
      offsetDistance={50}
      disableFullscreen
    >
      {({ togglePopover, popoverVisible, triggerRef }) => (
        <ToolbarButton
          ref={triggerRef}
          icon={<InventoryIcon />}
          selected={popoverVisible}
          onClick={togglePopover}
          label={title}
          preset="accent2"
        />
      )}
    </Popover>
  );
}

InventoryListPopover.propTypes = {
  onClose: PropTypes.func
};