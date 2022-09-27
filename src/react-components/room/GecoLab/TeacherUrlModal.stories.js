import React from "react";
import { RoomLayout } from "../../layout/RoomLayout";
import { TeacherUrlModal } from "./TeacherUrlModal";

export default {
  title: "Room/TeacherUrlModal",
  parameters: {
    layout: "fullscreen"
  }
};

export const Base = () => <RoomLayout modal={<TeacherUrlModal />} />;
