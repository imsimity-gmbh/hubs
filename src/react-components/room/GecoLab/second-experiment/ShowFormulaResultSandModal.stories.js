import React from "react";
import { RoomLayout } from "../../../layout/RoomLayout";
import { ShowFormulaResultSandModal } from "./ShowFormulaResultSandModal";

export default {
  title: "Room/ShowFormulaResultModal",
  parameters: {
    layout: "fullscreen"
  }
};

export const Base = () => <RoomLayout modal={<ShowFormulaResultSandModal />} />;