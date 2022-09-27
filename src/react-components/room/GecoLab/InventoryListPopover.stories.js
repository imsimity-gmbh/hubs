import React from "react";
import { RoomLayout } from "../../layout/RoomLayout";
import { InventoryListModalContainer } from "./InventoryListPopover";

export default {
  title: "Room/NotebookPopover",
  parameters: {
    layout: "fullscreen"
  }
};

export const Base = () => <RoomLayout toolbarCenter={<InventoryListModalContainer />} />;