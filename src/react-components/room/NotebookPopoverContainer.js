import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { NotebookPopoverButton } from "./NotebookPopover";
import { ReactComponent as DesktopIcon } from "../icons/Desktop.svg";
import { ReactComponent as EnterIcon } from "../icons/Enter.svg";
import { FormattedMessage } from "react-intl";
import { NotebookModalContainer } from "./NotebookModalContainer";
import configs from "../../utils/configs";


export function NotebookPopoverContainer({scene, showNonHistoriedDialog}) {

  const [items, setItems] = useState([]);

  useEffect(
    () => {
      function updateItems() {
        
        let nextItems = [
          {
            id: "read",
            icon: DesktopIcon,
            color: "accent5",
            label: <FormattedMessage id="notebook-popover.read" defaultMessage="Read" />,
            onSelect: () => showNonHistoriedDialog(NotebookModalContainer, { scene })
          },
          {
            id: "write",
            icon: EnterIcon,
            color: "accent5",
            label: <FormattedMessage id="notebook-popover.write" defaultMessage="Write" />,
            onSelect: () => showNonHistoriedDialog(NotebookModalContainer, { scene })
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