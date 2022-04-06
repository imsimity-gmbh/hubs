import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { NotebookPopoverButton } from "./NotebookPopover";
import { ReactComponent as ReadIcon } from "../icons/GecoLab/Read.svg";
import { ReactComponent as WriteIcon } from "../icons/GecoLab/Write.svg";
import { ReactComponent as StudentIcon } from "../icons/Avatar.svg";
import { ReactComponent as SecurityIcon } from "../icons/Help.svg";
import { FormattedMessage } from "react-intl";
import { NotebookModalContainer } from "./NotebookModalContainer";
import configs from "../../utils/configs";


export function NotebookPopoverContainer({scene, showNonHistoriedDialog}) {

  const [items, setItems] = useState([]);

  function showReadModal() {
    showNonHistoriedDialog(
      NotebookModalContainer, 
      { scene, writeBtn: false,
        onNoteDeleted: showReadModal}
    )
  }

  useEffect(
    () => {
      function updateItems() {

        let nextItems = [
          {
            id: "read",
            icon: ReadIcon,
            color: "accent5",
            label: <FormattedMessage id="notebook-popover.read" defaultMessage="Read" />,
            onSelect: () => showReadModal()
          },
          {
            id: "write",
            icon: WriteIcon,
            color: "accent5",
            label: <FormattedMessage id="notebook-popover.write" defaultMessage="Write" />,
            onSelect: () => showNonHistoriedDialog(NotebookModalContainer, { scene, writeBtn: true})
          },
          {
            id: "student-entry",
            icon: StudentIcon,
            color: "accent5",
            label: <FormattedMessage id="student-entry-popover" defaultMessage="Student Entry" />,
            onSelect: () => console.log("Student entered")
          },
          {
            id: "security-reading",
            icon: SecurityIcon,
            color: "accent5",
            label: <FormattedMessage id="security-reading-popover" defaultMessage="Security Notes" />,
            onSelect: () => console.log("Security stuff...")
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