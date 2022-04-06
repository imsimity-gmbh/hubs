import React from "react";
import { RoomLayout } from "../layout/RoomLayout";
import { ReactComponent as ReadIcon } from "../icons/GecoLab/Read.svg";
import { ReactComponent as WriteIcon } from "../icons/GecoLab/Write.svg";
import { ReactComponent as StudentIcon } from "../icons/Avatar.svg";
import { ReactComponent as SecurityIcon } from "../icons/Help.svg";
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
  },
  {
    id: "student-entry",
    icon: StudentIcon,
    color: "accent5",
    label: "Student Entry" ,
  },
  {
    id: "security-reading",
    icon: SecurityIcon,
    color: "accent5",
    label: "Security Notes" ,
  }
];

export const Base = () => <RoomLayout toolbarCenter={<NotebookPopoverButton items={items} />} />;
