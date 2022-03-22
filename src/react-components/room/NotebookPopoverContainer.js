import React, { useCallback, useEffect, useState } from "react";
import PropTypes from "prop-types";
import { ReactComponent as VideoIcon } from "../icons/Video.svg";
import { ReactComponent as DesktopIcon } from "../icons/Desktop.svg";
import { FormattedMessage } from "react-intl";
import useAvatar from "./useAvatar";

function useNotebook(scene, hubChannel) {

  const [sharingSource, setSharingSource] = useState(null);
  const [canShareCamera, setCanShareCamera] = useState(false);
  const [canShareScreen, setCanShareScreen] = useState(false);
  const { hasVideoTextureTarget } = useAvatar();

  useEffect(
    () => {
      function onShareVideoEnabled(event) {
        setSharingSource(event.detail.source);
      }

      function onShareVideoDisabled() {
        setSharingSource(null);
      }

      onPermissionsUpdated();

      return () => {
        
      };
    },
    [scene, hubChannel, hasVideoTextureTarget]
  );

  const toggleShareCamera = useCallback(
    () => {
      if (sharingSource) {
        //scene.emit("action_end_video_sharing");
      } else {
        //scene.emit("action_share_camera");
      }
    },
    [scene, sharingSource]
  );

  const toggleShareScreen = useCallback(
    () => {
      if (sharingSource) {
        //scene.emit("action_end_video_sharing");
      } else {
        //scene.emit("action_share_screen");
      }
    },
    [scene, sharingSource]
  );

  return {
    sharingSource,
    canShareCamera,
    canShareScreen,
    toggleShareCamera,
    toggleShareScreen
  };
}


export function NotebookPopoverContainer({ scene, hubChannel }) {
  
  const {
    sharingSource,
    canShareCamera,
    toggleShareCamera,
    canShareScreen,
    toggleShareScreen
  } = useNotebook(scene, hubChannel);


  const items = [
    true && {
      id: "camera",
      icon: VideoIcon,
      color: "accent5",
      label: <FormattedMessage id="share-popover.source.camera" defaultMessage="Camera" />,
      onSelect: toggleShareCamera,
      active: sharingSource === "camera"
    },
    true && {
      id: "screen",
      icon: DesktopIcon,
      color: "accent5",
      label: <FormattedMessage id="share-popover.source.screen" defaultMessage="Screen" />,
      onSelect: toggleShareScreen,
      active: sharingSource === "screen"
    }
  ];

  return <NotebookPopoverContainer items={items} />;
}

NotebookPopoverContainer.propTypes = {
  hubChannel: PropTypes.object.isRequired,
  scene: PropTypes.object.isRequired
};
