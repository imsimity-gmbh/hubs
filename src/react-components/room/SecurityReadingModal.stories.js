import React from "react";
import { RoomLayout } from "../layout/RoomLayout";
import { SecurityReadingModal } from "./SecurityReadingModal";

export default {
  title: "Room/SecurityReadingModal",
  parameters: {
    layout: "fullscreen"
  }
};

export const Base = () => <RoomLayout modal={<SecurityReadingModal />} />;