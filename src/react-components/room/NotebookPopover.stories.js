import React from "react";
import { RoomLayout } from "../layout/RoomLayout";
import { ReactComponent as ReadIcon } from "../icons/GecoLab/Read.svg";
import { ReactComponent as WriteIcon } from "../icons/GecoLab/Write.svg";
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
    icon: ReadIcon,
    color: "accent5",
    label: "Read" ,
  },
  {
    id: "write",
    icon: WriteIcon,
    color: "accent5",
    label: "Write" ,
  }
];

export const Base = () => <RoomLayout toolbarCenter={<NotebookPopoverButton items={items} />} />;
