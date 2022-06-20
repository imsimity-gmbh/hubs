import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { InventoryListPopover } from "./InventoryListPopover";


export function InventoryListPopoverContainer({onClose}) {

  return <InventoryListPopover onClose={onClose}/>;
}

InventoryListPopoverContainer.propTypes = {
    onClose: PropTypes.func
};