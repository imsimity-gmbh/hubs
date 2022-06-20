import React from "react";
import { RoomLayout } from "../layout/RoomLayout";
import { ReactComponent as ReadIcon } from "../icons/GecoLab/Read.svg";
import { ReactComponent as WriteIcon } from "../icons/GecoLab/Write.svg";
import { InventoryListModalContainer } from "./InventoryListPopover";

export default {
  title: "Room/NotebookPopover",
  parameters: {
    layout: "fullscreen"
  }
};

export const Base = () => <RoomLayout toolbarCenter={<InventoryListModalContainer />} />;