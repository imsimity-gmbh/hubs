import React from "react";
import { RoomLayout } from "../../../layout/RoomLayout";
import { EnterFormulaGroundModal } from "./EnterFormulaGroundModal";

export default {
  title: "Room/EnterFormulaGroundModal",
  parameters: {
    layout: "fullscreen"
  }
};

export const Base = () => <RoomLayout modal={<EnterFormulaGroundModal />} />;