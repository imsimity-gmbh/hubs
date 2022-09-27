import React from "react";
import { RoomLayout } from "../../layout/RoomLayout";
import { ClothingOptions } from "./ClothingOptions";

export default {
  title: "Room/ClothingOptions",
  parameters: {
    layout: "fullscreen"
  }
};

export const Base = () => <RoomLayout modal={<ClothingOptions />} />;