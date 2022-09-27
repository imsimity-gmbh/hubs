import React from "react";
import { RoomLayout } from "../../layout/RoomLayout";
import { ChooseFormulaModal } from "./ChooseFormulaModal";

export default {
  title: "Room/ChooseFormulaModal",
  parameters: {
    layout: "fullscreen"
  }
};

export const Base = () => <RoomLayout modal={<ChooseFormulaModal />} />;