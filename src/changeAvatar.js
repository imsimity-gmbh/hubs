import "./webxr-bypass-hacks";
// We should technically be able to just include three here, but our dependancies are tangled such that not having aframe is a bit difficult
import "./utils/theme";
console.log(`Hubs version: ${process.env.BUILD_VERSION || "?"}`);

import "aframe";
import "./utils/logging";

import ReactDOM from "react-dom";
import React from "react";
import PropTypes from "prop-types";
import classNames from "classnames";
import { FormattedMessage } from "react-intl";
import { WrappedIntlProvider } from "./react-components/wrapped-intl-provider";

import configs from "./utils/configs";

import { disableiOSZoom } from "./utils/disable-ios-zoom";
disableiOSZoom();

import { App } from "./App";

import AvatarPreview from "./react-components/avatar-preview";

import { fetchAvatar, remixAvatar } from "./utils/avatar-utils";

import "./react-components/styles/global.scss";
import styles from "./assets/stylesheets/avatar.scss";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faClone } from "@fortawesome/free-solid-svg-icons/faClone";
import { ThemeProvider } from "./react-components/styles/theme";

const qs = new URLSearchParams(location.search);
window.APP = new App();

class ChangeAvatar extends React.Component {


  constructor(props) {
    super(props);
  }






  render() {
      return (
        <div>
          <iframe
            src="https://imsimity.readyplayer.me/"
            allow="fullscreen"
            allowFullScreen=""
            frameBorder="0"
          />
        </div>
      );

  }
}

document.addEventListener("DOMContentLoaded", () => {
  console.log('Avatar ID:');
  ReactDOM.render(
    <WrappedIntlProvider>
      <ThemeProvider store={window.APP.store}>
        <ChangeAvatar />
      </ThemeProvider>
    </WrappedIntlProvider>,
    document.getElementById("ui-root")
  );
});
