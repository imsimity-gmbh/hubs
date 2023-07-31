import React from "react";
import { RoomLayout } from "../layout/RoomLayout";
import { DemoExitWarningModal, DemoExitReason } from "./DemoExitWarningModal";

export default {
  title: "Room/DemoExitWarningModal",
  parameters: {
    layout: "fullscreen"
  }
};

export const ConcurrentSession = () => (
  <RoomLayout modal={<DemoExitWarningModal reason={DemoExitReason.concurrentSession} secondsRemaining={5} />} />
);

export const Idle = () => (
  <RoomLayout modal={<DemoExitWarningModal reason={DemoExitReason.idle} secondsRemaining={5} />} />
);
