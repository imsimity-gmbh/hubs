import React from "react";
import { RoomLayout } from "../../layout/RoomLayout";
import { ShowFormulaResultModal } from "./ShowFormulaResultModal";

export default {
  title: "Room/ShowFormulaResultModal",
  parameters: {
    layout: "fullscreen"
  }
};

export const Base = () => <RoomLayout modal={<ShowFormulaResultModal />} />;