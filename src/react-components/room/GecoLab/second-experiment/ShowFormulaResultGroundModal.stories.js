import React from "react";
import { RoomLayout } from "../../../layout/RoomLayout";
import { ShowFormulaResultGroundModal } from "./ShowFormulaResultGroundModal";

export default {
  title: "Room/ShowFormulaResultModal",
  parameters: {
    layout: "fullscreen"
  }
};

export const Base = () => <RoomLayout modal={<ShowFormulaResultGroundModal />} />;