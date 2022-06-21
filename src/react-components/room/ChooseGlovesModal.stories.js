import React from "react";
import { RoomLayout } from "../layout/RoomLayout";
import { ChooseGlovesModal } from "./ChooseGlovesModal";

export default {
  title: "Room/ChooseGlovesModal",
  parameters: {
    layout: "fullscreen"
  }
};

export const Base = () => <RoomLayout modal={<ChooseGlovesModal />} />;