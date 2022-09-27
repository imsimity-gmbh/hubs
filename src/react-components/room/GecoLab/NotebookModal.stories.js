import React from "react";
import { RoomLayout } from "../../layout/RoomLayout";
import { NotebookModal } from "./NotebookModal";

export default {
  title: "Room/NotebookModal",
  parameters: {
    layout: "fullscreen"
  }
};

export const Base = () => <RoomLayout modal={<NotebookModal />} />;
