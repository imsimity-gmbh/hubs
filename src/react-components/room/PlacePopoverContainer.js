import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { ReactComponent as PenIcon } from "../icons/Pen.svg";
import { ReactComponent as CameraIcon } from "../icons/Camera.svg";
// import { ReactComponent as TextIcon } from "../icons/Text.svg";
// import { ReactComponent as LinkIcon } from "../icons/Link.svg";
import { ReactComponent as GIFIcon } from "../icons/GIF.svg";
import { ReactComponent as ObjectIcon } from "../icons/Object.svg";
import { ReactComponent as AvatarIcon } from "../icons/Avatar.svg";
import { ReactComponent as SceneIcon } from "../icons/Scene.svg";
import { ReactComponent as UploadIcon } from "../icons/Upload.svg";
import { ReactComponent as ExperimentIcon } from "../icons/GecoLab/Experiment.svg";
import { PlacePopoverButton } from "./PlacePopover";
import { ObjectUrlModalContainer } from "./ObjectUrlModalContainer";
import configs from "../../utils/configs";
import { FormattedMessage } from "react-intl";

export function PlacePopoverContainer({ scene, mediaSearchStore, showNonHistoriedDialog, hubChannel }) {
  const [items, setItems] = useState([]);

  useEffect(
    () => {
      function updateItems() {
        const hasActiveCamera = !!scene.systems["camera-tools"].getMyCamera();
        const hasActivePen = !!scene.systems["pen-tools"].getMyPen();
        const hasActiveMachine = !!scene.systems["machine-tools"].getMyMachine();
        const hasActiveStopwatch = !!scene.systems["stopwatch-tools"].getMyStopwatch();
        const hasActiveExample = !!scene.systems["example-tools"].getMyExample();
        const hasActiveRobot = !!scene.systems["robot-tools"].getMyRobot();
        const hasActiveFirstExperiment = !!scene.systems["first-experiments"].getMyExperiment();
        

        let nextItems = [
          hubChannel.can("spawn_drawing") && {
            id: "pen",
            icon: PenIcon,
            color: "accent5",
            label: <FormattedMessage id="place-popover.item-type.pen" defaultMessage="Pen" />,
            onSelect: () => scene.emit("penButtonPressed"),
            selected: hasActivePen
          },
          false && hubChannel.can("spawn_camera") && {
            id: "machine",
            icon: ObjectIcon,
            color: "accent5",
            label: <FormattedMessage id="place-popover.item-type.machine" defaultMessage="Machine" />,
            onSelect: () => scene.emit("action_toggle_machine"),
            selected: hasActiveMachine
          },
          false && hubChannel.can("spawn_camera") && {
            id: "stopwatch",
            icon: ObjectIcon,
            color: "accent5",
            label: <FormattedMessage id="place-popover.item-type.stopwatch" defaultMessage="Stopwatch" />,
            onSelect: () => scene.emit("action_toggle_stopwatch"),
            selected: hasActiveStopwatch
          },
          false && hubChannel.can("spawn_camera") && {
            id: "example",
            icon: ObjectIcon,
            color: "accent5",
            label: <FormattedMessage id="place-popover.item-type.example" defaultMessage="Example" />,
            onSelect: () => scene.emit("action_toggle_example"),
            selected: hasActiveExample
          },
          false && hubChannel.can("spawn_camera") && {
            id: "robot",
            icon: ObjectIcon,
            color: "accent5",
            label: <FormattedMessage id="place-popover.item-type.robot" defaultMessage="Robot" />,
            onSelect: () => scene.emit("action_toggle_robot"),
            selected: hasActiveRobot
          },
          hubChannel.can("spawn_camera") && {
            id: "experiments",
            icon: ExperimentIcon,
            color: "accent5",
            label: <FormattedMessage id="place-popover.item-type.experiments" defaultMessage="Experimente" />,
            onSelect: () => mediaSearchStore.sourceNavigate("experiments")
          },
          hubChannel.can("spawn_camera") && {
            id: "camera",
            icon: CameraIcon,
            color: "accent5",
            label: <FormattedMessage id="place-popover.item-type.camera" defaultMessage="Camera" />,
            onSelect: () => scene.emit("action_toggle_camera"),
            selected: hasActiveCamera
          },
          // hubChannel.can("spawn_camera") && {
          //   id: "choose-gloves-modal",
          //   icon: CameraIcon,
          //   color: "accent4",
          //   label: <FormattedMessage id="place-popover.item-type.gloves" defaultMessage="Glove Popup" />,
          //   onSelect: () => scene.emit("gecolab_choose_gloves")
          // },
          // hubChannel.can("spawn_camera") && {
          //   id: "choose-formula-modal",
          //   icon: CameraIcon,
          //   color: "accent4",
          //   label: <FormattedMessage id="place-popover.item-type.formula" defaultMessage="Formula Popup" />,
          //   onSelect: () => scene.emit("gecolab_choose_formula")
          // }
         
        ];

        if (hubChannel.can("spawn_and_move_media")) {
          nextItems = [
            ...nextItems,
            // TODO: Create text/link dialog
            // { id: "text", icon: TextIcon, color: "blue", label: "Text" },
            // { id: "link", icon: LinkIcon, color: "blue", label: "Link" },
            configs.integration("tenor") && {
              id: "gif",
              icon: GIFIcon,
              color: "accent2",
              label: <FormattedMessage id="place-popover.item-type.gif" defaultMessage="GIF" />,
              onSelect: () => mediaSearchStore.sourceNavigate("gifs")
            },
            configs.integration("sketchfab") && {
              id: "model",
              icon: ObjectIcon,
              color: "accent2",
              label: <FormattedMessage id="place-popover.item-type.model" defaultMessage="3D Model" />,
              onSelect: () => mediaSearchStore.sourceNavigate("sketchfab")
            },
            {
              id: "avatar",
              icon: AvatarIcon,
              color: "accent1",
              label: <FormattedMessage id="place-popover.item-type.avatar" defaultMessage="Avatar" />,
              onSelect: () => mediaSearchStore.sourceNavigate("avatars")
            },
            {
              id: "scene",
              icon: SceneIcon,
              color: "accent1",
              label: <FormattedMessage id="place-popover.item-type.scene" defaultMessage="Scene" />,
              onSelect: () => mediaSearchStore.sourceNavigate("scenes")
            },
            // TODO: Launch system file prompt directly
            {
              id: "upload",
              icon: UploadIcon,
              color: "accent3",
              label: <FormattedMessage id="place-popover.item-type.upload" defaultMessage="Upload" />,
              onSelect: () => showNonHistoriedDialog(ObjectUrlModalContainer, { scene })
            }
          ];
        }

        setItems(nextItems);
      }

      hubChannel.addEventListener("permissions_updated", updateItems);

      updateItems();

      function onSceneStateChange(event) {
        if (event.detail === "camera" || event.detail === "pen") {
          updateItems();
        }
      }

      scene.addEventListener("stateadded", onSceneStateChange);
      scene.addEventListener("stateremoved", onSceneStateChange);

      return () => {
        hubChannel.removeEventListener("permissions_updated", updateItems);
        scene.removeEventListener("stateadded", onSceneStateChange);
        scene.removeEventListener("stateremoved", onSceneStateChange);
      };
    },
    [hubChannel, mediaSearchStore, showNonHistoriedDialog, scene]
  );

  return <PlacePopoverButton items={items} />;
}

PlacePopoverContainer.propTypes = {
  hubChannel: PropTypes.object.isRequired,
  scene: PropTypes.object.isRequired,
  mediaSearchStore: PropTypes.object.isRequired,
  showNonHistoriedDialog: PropTypes.func.isRequired
};
