import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { NotebookPopoverButton } from "./NotebookPopover";


export function NotebookPopoverContainer({scene, showNonHistoriedDialog}) {

  const [items, setItems] = useState([]);

  useEffect(
    () => {
      function updateItems() {
        
        let nextItems = [
          {
            id: "text",
          }
        ];
        
        setItems(nextItems);
      }

      updateItems();

      return () => {
      };
    },
    [scene, showNonHistoriedDialog]
  );

  return <NotebookPopoverButton items={items} />;
}

NotebookPopoverContainer.propTypes = {
  scene: PropTypes.object.isRequired,
  showNonHistoriedDialog: PropTypes.func.isRequired
};
/*
id: "write",
icon: WriteIcon,
color: "accent5",
label: <FormattedMessage id="notebook-popover.write" defaultMessage="Schreiben" />,
onSelect: () => showNonHistoriedDialog(NotebookModalContainer, { scene, writeBtn: true})
*/