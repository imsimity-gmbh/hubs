import React from "react";
import { RoomLayout } from "../../layout/RoomLayout";
import { TeacherExperimentModal } from "./TeacherExperimentModal";

export default {
  title: "Room/TeacherExperimentModal",
  parameters: {
    layout: "fullscreen"
  }
};

export const Base = () => <RoomLayout modal={<TeacherExperimentModal />} />;
