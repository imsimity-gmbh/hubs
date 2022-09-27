import React from "react";
import { RoomLayout } from "../../layout/RoomLayout";
import { EnterFormulaValuesModal } from "./EnterFormulaValuesModal";

export default {
  title: "Room/EnterFormulaValuesModal",
  parameters: {
    layout: "fullscreen"
  }
};

export const Base = () => <RoomLayout modal={<EnterFormulaValuesModal />} />;