import React from "react";
import { RoomLayout } from "../../../layout/RoomLayout";
import { ShowFormulaResultClayModal } from "./ShowFormulaResultClayModal";

export default {
  title: "Room/ShowFormulaResultModal",
  parameters: {
    layout: "fullscreen"
  }
};

export const Base = () => <RoomLayout modal={<ShowFormulaResultClayModal />} />;