import React from "react";
import { RoomLayout } from "../layout/RoomLayout";
import { StudentEntryModal } from "./StudentEntryModal";

export default {
  title: "Room/StudentEntryModal",
  parameters: {
    layout: "fullscreen"
  }
};

export const Base = () => <RoomLayout modal={<StudentEntryModal />} />;