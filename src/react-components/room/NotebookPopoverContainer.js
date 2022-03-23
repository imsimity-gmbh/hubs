import React from "react";
import { NotebookPopoverButton } from "./NotebookPopover";
import { spawnEmojiInFrontOfUser, emojis } from "../../components/emoji";
import { defineMessages, useIntl } from "react-intl";

const emojiLabels = defineMessages({
  smile: { id: "reaction-popover.emoji-label.smile", defaultMessage: "Smile" },
  laugh: { id: "reaction-popover.emoji-label.laugh", defaultMessage: "Laugh" },
  clap: { id: "reaction-popover.emoji-label.clap", defaultMessage: "Clap" },
  heart: { id: "reaction-popover.emoji-label.heart", defaultMessage: "Heart" },
  wave: { id: "reaction-popover.emoji-label.wave", defaultMessage: "Wave" },
  angry: { id: "reaction-popover.emoji-label.angry", defaultMessage: "Angry" },
  cry: { id: "reaction-popover.emoji-label.cry", defaultMessage: "Cry" }
});

export function NotebookPopoverContainer() {
  const intl = useIntl();

  const items = emojis.map(emoji => ({
    src: emoji.particleEmitterConfig.src,
    onSelect: spawnEmojiInFrontOfUser,
    label: intl.formatMessage(emojiLabels[emoji.id]),
    ...emoji
  }));

  return <NotebookPopoverButton items={items} />;
}
