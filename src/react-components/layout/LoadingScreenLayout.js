import React from "react";
import PropTypes from "prop-types";
import styles from "./LoadingScreenLayout.scss";
import { Column } from "../layout/Column";
import { ReactComponent as HmcLogo } from "../icons/HmcLogo.svg";
import configs from "../../utils/configs";

export function LoadingScreenLayout({ center, bottom, logoSrc }) {
  const isHmc = configs.feature("show_cloud");
  return (
    <div className={styles.loadingScreenLayout}>
      <Column center padding gap="lg" className={styles.center}>
        <p className={styles.homeTextLink}>
          CYBERCINITY
        </p>
      </Column>
      {bottom && (
        <Column center className={styles.bottom}>
          {bottom}
        </Column>
      )}
    </div>
  );
}

LoadingScreenLayout.propTypes = {
  logoSrc: PropTypes.string,
  center: PropTypes.node,
  bottom: PropTypes.node
};
