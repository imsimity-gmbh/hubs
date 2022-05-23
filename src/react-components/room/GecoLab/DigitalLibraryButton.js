import React from "react";
import { ReactComponent as LibraryIcon } from "../../icons/GecoLab/Library.svg";
import { ToolbarButton } from "../../input/ToolbarButton";
import { FormattedMessage } from "react-intl";

export function DigitalLibraryButton(props) {
    return (
      <ToolbarButton
        {...props}
        icon={<LibraryIcon />}
        preset="accent4"
        label={<FormattedMessage id="media-browser.nav_title.digital_library" defaultMessage="Digi Library" />}
      />
    );
  }