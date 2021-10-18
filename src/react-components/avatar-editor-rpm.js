import React, { Component } from "react";
import PropTypes from "prop-types";
import { defineMessage, FormattedMessage, injectIntl } from "react-intl";
import classNames from "classnames";
import { faTimes } from "@fortawesome/free-solid-svg-icons/faTimes";
import { faCloudUploadAlt } from "@fortawesome/free-solid-svg-icons/faCloudUploadAlt";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import configs from "../utils/configs";
import IfFeature from "./if-feature";
import { fetchReticulumAuthenticated } from "../utils/phoenix-utils";
import { upload } from "../utils/media-utils";
import { ensureAvatarMaterial } from "../utils/avatar-utils";

import AvatarPreview from "./avatar-preview";
import styles from "../assets/stylesheets/avatar-editor-rpm.scss";

const delistAvatarInfoMessage = defineMessage({
  id: "avatar-editor.delist-avatar-info",
  defaultMessage:
    "Other users already using this avatar will still be able to use it, but it will be removed from 'My Avatars' and search results."
});

const AVATARS_API = "/api/v1/avatars";

const defaultEditors = [
  {
    name: "Quilt",
    url: "https://tryquilt.io/?gltf=$AVATAR_GLTF"
  }
];
const useAllowedEditors = true;
const allowedEditors = [
  ...defaultEditors,
  {
    name: "Skindex Editor",
    url: "https://www.minecraftskins.com/skin-editor"
  },
  {
    name: "MinecraftSkins.net Editor",
    url: "https://www.minecraftskins.net/skineditor"
  }
];

const fetchAvatar = async avatarId => {
  const { avatars } = await fetchReticulumAuthenticated(`${AVATARS_API}/${avatarId}`);
  return avatars[0];
};

class AvatarEditorRpm extends Component {
  static propTypes = {
    avatarId: PropTypes.string,
    onSave: PropTypes.func,
    onClose: PropTypes.func,
    hideDelete: PropTypes.bool,
    debug: PropTypes.bool,
    className: PropTypes.string,
    intl: PropTypes.object.isRequired,
    store: PropTypes.object,
    scene: PropTypes.object
  };

  state = {
    baseAvatarResults: [],
    editorLinks: defaultEditors,
    previewGltfUrl: null
  };

  constructor(props) {
    super(props);
    this.rpmUrl = ""
    this.inputFiles = {};
  }

  receiveMessage(event)
  {
    this.rpmUrl = event.data;

    this.setState({ readyplayer: true });
  };

  componentDidMount = async () => {

     // Listen to messages from the iframe
     window.addEventListener('message', function(event) { this.receiveMessage(event); }.bind(this), false);

     
    this.setState({ readyplayer: false });

    if (this.props.avatarId) {
      const avatar = await fetchAvatar(this.props.avatarId);
      avatar.creatorAttribution = (avatar.attributions && avatar.attributions.creator) || "";
      Object.assign(this.inputFiles, avatar.files);
      this.setState({ avatar, previewGltfUrl: avatar.base_gltf_url });
    } else {
      const { entries } = await fetchReticulumAuthenticated(`/api/v1/media/search?filter=base&source=avatar_listings`);
      const baseAvatarResults = entries.map(e => ({ id: e.id, name: e.name, gltfs: e.gltfs, images: e.images }));
      if (baseAvatarResults.length) {
        const randomAvatarResult = baseAvatarResults[Math.floor(Math.random() * baseAvatarResults.length)];
        this.setState({
          baseAvatarResults,
          avatar: {
            name: "My Avatar",
            files: {},
            base_gltf_url: randomAvatarResult.gltfs.base,
            parent_avatar_listing_id: randomAvatarResult.id
          },
          previewGltfUrl: randomAvatarResult.gltfs.avatar
        });
      } else {
        this.setState({
          avatar: {
            name: "My Avatar",
            files: {}
          }
        });
      }
    }
  };

  
  uploadAvatar = async e => {
    e.preventDefault();
    
    this.setState({ uploading: true });


    this.props.store.update(
      { profile: { ...this.props.store.state.profile, 
        ...{ avatarId: this.rpmUrl } } });
    this.props.scene.emit("avatar_updated");
   

    this.setState({ uploading: false });

    if (this.props.onSave) this.props.onSave();
  };


  textField = (name, placeholder, disabled, required) => (
    <div className="text-field-container">
      <label htmlFor={`#avatar-${name}`}>{placeholder}</label>
      <input
        id={`avatar-${name}`}
        type="text"
        disabled={disabled}
        required={required}
        placeholder={placeholder}
        className="text-field"
        value={this.state.avatar[name] || ""}
        onChange={e => this.setState({ avatar: { ...this.state.avatar, [name]: e.target.value } })}
      />
    </div>
  );

  
  textarea = (name, placeholder, disabled) => (
    <div>
      <textarea
        id={`avatar-${name}`}
        disabled={disabled}
        placeholder={placeholder}
        className="textarea"
        value={this.state.avatar[name] || ""}
        onChange={e => this.setState({ avatar: { ...this.state.avatar, [name]: e.target.value } })}
      />
    </div>
  );

  checkbox = (name, title, children, disabled) => (
    <div className="checkbox-container" title={title}>
      <input
        id={`avatar-${name}`}
        type="checkbox"
        className="checkbox"
        disabled={disabled}
        checked={!!this.state.avatar[name]}
        onChange={e => this.setState({ avatar: { ...this.state.avatar, [name]: e.target.checked } })}
      />
      <label htmlFor={`#avatar-${name}`}>{children}</label>
    </div>
  );


  render() {
    const { debug, intl } = this.props;
    const { avatar } = this.state;

    return (
      <div className={classNames(styles.avatarEditorRpm, this.props.className)}>
        {this.props.onClose && (
          <a className="close-button" onClick={this.props.onClose}>
            <i>
              <FontAwesomeIcon icon={faTimes} />
            </i>
          </a>
        )}
        {!this.state.avatar ? (
          <div className="loader">
            <div className="loader-center" />
          </div>
        ) : (
          <form onSubmit={this.uploadAvatar} className="center">
            {
                <iframe
                className="avatariframe"
                src="https://imsimity.readyplayer.me/"
                allow = 'camera *; microphone *'
              />
              }
            
            <div className="form-body">
              {debug &&
                this.textField(
                  "avatar_id",
                  intl.formatMessage({ id: "avatar-editor.field.avatar-id", defaultMessage: "Avatar ID" }),
                  true
                )}
              {debug &&
                this.textField(
                  "parent_avatar_id",
                  intl.formatMessage({
                    id: "avatar-editor.field.parent-avatar-id",
                    defaultMessage: "Parent Avatar ID"
                  })
                )}
              {debug &&
                this.textField(
                  "parent_avatar_listing_id",
                  intl.formatMessage({
                    id: "avatar-editor.field.parent-avatar-listing-id",
                    defaultMessage: "Parent Avatar Listing ID"
                  })
                )}
              {debug &&
                this.textarea(
                  "description",
                  intl.formatMessage({
                    id: "avatar-editor.field.description",
                    defaultMessage: "Description"
                  })
                )}
              
            </div>
            
            <div className="info">
              <IfFeature name="show_avatar_editor_link">
                <p>
                  <FormattedMessage
                    id="avatar-editor.external-editor-info"
                    defaultMessage="Create a custom skin for this avatar:"
                  />{" "}
                  {this.state.editorLinks.map(({ name, url }) => (
                    <a
                      key={name}
                      target="_blank"
                      rel="noopener noreferrer"
                      href={url.replace("$AVATAR_GLTF", encodeURIComponent(this.state.previewGltfUrl))}
                    >
                      {name}
                    </a>
                  ))}
                </p>
              </IfFeature>
            </div>
            <div>
              <button disabled={this.state.uploading || !this.state.readyplayer } className="form-submit" type="submit">
                {this.state.uploading ? (
                  <FormattedMessage id="avatar-editor.submit-button.uploading" defaultMessage="Uploading..." />
                ) : (
                  <FormattedMessage id="avatar-editor.submit-button.save" defaultMessage="Save" />
                )}
              </button>
            </div>
           
            
          </form>
        )}
      </div>
    );
  }
}

export default injectIntl(AvatarEditorRpm);
