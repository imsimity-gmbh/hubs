import React from "react";
import { RoomLayout } from "../../../layout/RoomLayout";
import { EnterFormulaClayModal } from "./EnterFormulaClayModal";

export default {
  title: "Room/EnterFormulaClayModal",
  parameters: {
    layout: "fullscreen"
  }
};

export const Base = () => <RoomLayout modal={<EnterFormulaClayModal />} />;