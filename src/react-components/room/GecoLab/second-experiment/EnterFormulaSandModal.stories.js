import React from "react";
import { RoomLayout } from "../../../layout/RoomLayout";
import { EnterFormulaSandModal } from "./EnterFormulaSandModal";

export default {
  title: "Room/EnterFormulaSandModal",
  parameters: {
    layout: "fullscreen"
  }
};

export const Base = () => <RoomLayout modal={<EnterFormulaSandModal />} />;