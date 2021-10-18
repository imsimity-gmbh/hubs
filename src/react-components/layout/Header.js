import React, { useState, useCallback} from "react";
import PropTypes from "prop-types";
import { FormattedMessage } from "react-intl";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCog } from "@fortawesome/free-solid-svg-icons/faCog";
import maskEmail from "../../utils/mask-email";
import styles from "./Header.scss";
import { Container } from "./Container";
import { Button } from "../input/Button";
import modalStyles from "../../react-components/modal/Modal.scss";
import { FaqModal } from "../home/FaqModal";

export function Header({
  appName,
  appLogo,
  showCloud,
  enableSpoke,
  editorName,
  showDocsLink,
  docsUrl,
  showSourceLink,
  showCommunityLink,
  communityUrl,
  isAdmin,
  isSignedIn,
  email,
  onSignOut
}) {

  const [isFaqModalVisible, setIsFaqModalVisible] = useState(false);

  

  const onClickShowFaqModal = useCallback(
    () => {
      if (isFaqModalVisible === false) {
        setIsFaqModalVisible(true);
      } else {
        setIsFaqModalVisible(false);
      }
    },
    [isFaqModalVisible]
  );


  return (
    <header>
      <Container as="div" className={styles.container}>
        {isFaqModalVisible && <FaqModal className={modalStyles.modalAvatarPage} onClose={onClickShowFaqModal} />}
        <nav>
          <ul>
            <li>
              <a href="/" className={styles.homeLink}>
                <img alt={appName} src={appLogo} />
              </a>
            </li>

            <li>
              <a href="/" className={styles.homeTextLink}>
                CYBERCINITY
              </a>
            </li>
            <li className={styles.homeFaqButton}>
              <Button sm preset="primary" onClick={onClickShowFaqModal}>
                <FormattedMessage id="home-page.faq-modal" defaultMessage="Frequently asked questions" />
              </Button>
            </li>
            {showCloud && (
              <li>
                <a href="/cloud">
                  <FormattedMessage id="header.cloud" defaultMessage="Hubs Cloud" />
                </a>
              </li>
            )}
            {enableSpoke && (
              <li>
                <a href="/spoke">{editorName}</a>
              </li>
            )}
            {showDocsLink && (
              <li>
                <a href={docsUrl}>
                  <FormattedMessage id="header.docs" defaultMessage="Docs" />
                </a>
              </li>
            )}
            {showSourceLink && (
              <li>
                <a href="https://github.com/mozilla/hubs">
                  <FormattedMessage id="header.source" defaultMessage="Source" />
                </a>
              </li>
            )}
            {showCommunityLink && (
              <li>
                <a href={communityUrl}>
                  <FormattedMessage id="header.community" defaultMessage="Community" />
                </a>
              </li>
            )}
            {isAdmin && (
              <li>
                <a href="/admin" rel="noreferrer noopener">
                  <i>
                    <FontAwesomeIcon icon={faCog} />
                  </i>
                  &nbsp;
                  <FormattedMessage id="header.admin" defaultMessage="Admin" />
                </a>
              </li>
            )}
          </ul>
        </nav>
        <div className={styles.signIn}>
          {isSignedIn  && (
            //Antoine 01.06.21 : Hotfix, hiding "Sign in" button
            <div>
              <span>
                <FormattedMessage
                  id="header.signed-in-as"
                  defaultMessage="Signed in as {email}"
                  values={{ email: maskEmail(email) }}
                />
              </span>{" "}
              <a href="#" onClick={onSignOut}>
                <FormattedMessage id="header.sign-out" defaultMessage="Sign Out" />
              </a>
            </div>
          ) }
        </div>
      </Container>
    </header>
  );
}

Header.propTypes = {
  appName: PropTypes.string,
  appLogo: PropTypes.string,
  showCloud: PropTypes.bool,
  enableSpoke: PropTypes.bool,
  editorName: PropTypes.string,
  showDocsLink: PropTypes.bool,
  docsUrl: PropTypes.string,
  showSourceLink: PropTypes.bool,
  showCommunityLink: PropTypes.bool,
  communityUrl: PropTypes.string,
  isAdmin: PropTypes.bool,
  isSignedIn: PropTypes.bool,
  email: PropTypes.string,
  onSignOut: PropTypes.func
};
