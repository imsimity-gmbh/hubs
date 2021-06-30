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

import styles from "./react-components/home/HomePage.scss";
import avatarStyles from "./assets/stylesheets/avatar.scss";
import "./react-components/styles/global.scss";
import { PageContainer } from "./react-components/layout/PageContainer";
import { Container } from "./react-components/layout/Container";
import { AuthContextProvider } from "./react-components/auth/AuthContext";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faClone } from "@fortawesome/free-solid-svg-icons/faClone";
import { ThemeProvider } from "./react-components/styles/theme";
import registerTelemetry from "./telemetry";
import Store from "./storage/store";



registerTelemetry("/changeAvatar", "Hubs Avatar Page");

const store = new Store();

class ChangeAvatar extends React.Component {


  constructor(props) {
    super(props);
  }



  render() {
      return (
        <PageContainer className={styles.homePage}>
          <Container>
            <iframe
              className={avatarStyles.avatariframe}
              src="https://imsimity.readyplayer.me/"
              fullscreen
              frameBorder="0"
            />
          </Container>
        </PageContainer>
      );

  }
}

document.addEventListener("DOMContentLoaded", () => {
  ReactDOM.render(
    <WrappedIntlProvider>
      <ThemeProvider store={ store }>
        <AuthContextProvider store={ store }>
          <ChangeAvatar />
        </AuthContextProvider>
      </ThemeProvider>
    </WrappedIntlProvider>,
    document.getElementById("changeavatar-root")
  );
});
