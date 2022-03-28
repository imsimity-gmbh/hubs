import React from "react";
import { RoomLayout } from "../layout/RoomLayout";
import { ReactComponent as DesktopIcon } from "../icons/Desktop.svg";
import { ReactComponent as EnterIcon } from "../icons/Enter.svg";
import { NotebookPopoverButton } from "./NotebookPopover";

export default {
  title: "Room/NotebookPopover",
  parameters: {
    layout: "fullscreen"
  }
};

const items = [
  {
    id: "read",
    icon: DesktopIcon,
    color: "accent5",
    label: "Read" ,
  },
  {
    id: "write",
    icon: EnterIcon,
    color: "accent5",
    label: "Write" ,
  }
];

export const Base = () => <RoomLayout toolbarCenter={<NotebookPopoverButton items={items} />} />;
