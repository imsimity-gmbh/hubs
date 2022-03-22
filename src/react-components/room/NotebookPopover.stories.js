import React from "react";
import { RoomLayout } from "../layout/RoomLayout";
import { ReactComponent as VideoIcon } from "../icons/Video.svg";
import { ReactComponent as DesktopIcon } from "../icons/Desktop.svg";
import { NotebookPopoverButton } from "./NotebookPopover";

export default {
  title: "Room/NotebookPopover",
  parameters: {
    layout: "fullscreen"
  }
};

const items = [
  { id: "camera", icon: VideoIcon, color: "accent5", label: "Camera" },
  { id: "screen", icon: DesktopIcon, color: "accent5", label: "Screen" }
];

export const Base = () => <RoomLayout toolbarCenter={<NotebookPopoverButton items={items} />} />;

export const Mobile = () => <RoomLayout toolbarCenter={<NotebookPopoverButton items={[items[0]]} />} />;

const activeItems = [
  { id: "camera", icon: VideoIcon, color: "accent5", label: "Camera", active: true },
  { id: "screen", icon: DesktopIcon, color: "accent5", label: "Screen" }
];

export const Active = () => <RoomLayout toolbarCenter={<NotebookPopoverButton items={activeItems} />} />;
