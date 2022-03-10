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
import GLTFBinarySplitterPlugin from "./avatar-editor-utils";
import styles from "../assets/stylesheets/avatar-editor-rpm.scss";

const delistAvatarInfoMessage = defineMessage({
  id: "avatar-editor.delist-avatar-info",
  defaultMessage:
    "Other users already using this avatar will still be able to use it, but it will be removed from 'My Avatars' and search results."
});

const AVATARS_API = "/api/v1/avatars";


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
    previewGltfUrl: null
  };

  constructor(props) {
    super(props);
    this.rpmUrl = ""
    this.inputFiles = {};
  }

  receiveMessage(event)
  {

    console.log(event);

    this.rpmUrl = event.data;

    this.setState({ previewGltfUrl: this.rpmUrl});
    this.setState({ readyplayer: true });
  };

  createOrUpdateAvatar = avatar => {
    return fetchReticulumAuthenticated(
      avatar.avatar_id ? `${AVATARS_API}/${avatar.avatar_id}` : AVATARS_API,
      avatar.avatar_id ? "PUT" : "POST",
      { avatar }
    ).then(({ avatars }) => avatars[0]);
  };

  componentWillUnmount = async () => {
    window.removeEventListener('message', function(event) { this.receiveMessage(event); }.bind(this), false);

  };

  componentDidMount = async () => {

     // Listen to messages from the iframe
     window.addEventListener('message', function(event) { this.receiveMessage(event); }.bind(this), false);

     
    this.setState({ readyplayer: false });

    this.setState({
      avatar: {
        name: "My Avatar"
      }
    });
      
  };

  uploadAvatar = async () => {
   
    this.setState({ uploading: true });

    // RENDER API :https://docs.readyplayer.me/render-api/render-api

    const gltfLoader = new THREE.GLTFLoader().register(parser => new GLTFBinarySplitterPlugin(parser));
    const onProgress = console.log;

    await new Promise((resolve, reject) => {
      // GLTFBinarySplitterPlugin saves gltf and bin in gltf.files
      gltfLoader.load(
        this.rpmUrl,
        result => {
          this.inputFiles.gltf = result.files.gltf;
          this.inputFiles.bin = result.files.bin;
          resolve(result);
        },
        onProgress,
        reject
      );
    });

    this.inputFiles.thumbnail = new File([await this.preview.snapshot()], "thumbnail.png", {
      type: "image/png"
    });

    const filesToUpload = ["gltf", "bin", "thumbnail"].filter(
      k => this.inputFiles[k] === null || this.inputFiles[k] instanceof File
    );

    const fileUploads = await Promise.all(filesToUpload.map(f => this.inputFiles[f] && upload(this.inputFiles[f])));
    
    const avatar = {
       ...this.state.avatar,
      attributions: {
        creator: ""
      },
      files: fileUploads
      .map((resp, i) => [filesToUpload[i], resp && [resp.file_id, resp.meta.access_token, resp.meta.promotion_token]])
      .reduce((o, [k, v]) => ({ ...o, [k]: v }), {}),
      parent_avatar_listing_id: ""
    };

    
    // Upload
    const updatedAvatar = await this.createOrUpdateAvatar(avatar);

    console.log(updatedAvatar);

    this.setState({ uploading: false });

    this.props.store.update(
      { profile: { ...this.props.store.state.profile, 
        ...{ avatarId: updatedAvatar.avatar_id } } });
    
    this.props.scene.emit("avatar_updated");

    if (this.props.onSave) this.props.onSave();
  };

  
  handleGltfLoaded = () =>
  {
    // avatar loaded in the preview frame
    this.uploadAvatar();
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
         {!this.state.avatar && (
          <div className="loader">
            <div className="loader-center" />
          </div>
        )}
        {this.state.avatar && !this.state.readyplayer ? (
          
          <form className="center">
            {this.textField("name", "Name", false, true)}
            {
                <iframe
                className="avatariframe"
                src="https://imsimity.readyplayer.me/"
                allow = 'camera *; microphone *'
              />
              }            
          </form>
          
        ) : (
          <div className="center">
            <div>
            
            Loading

            </div>
            <AvatarPreview 
            className="preview"
            avatarGltfUrl={this.state.previewGltfUrl}
            onGltfLoaded={this.handleGltfLoaded}
            ref={p => (this.preview = p)}
          />
          </div>
          
        )}
        
      </div>
    );
  }
}

export default injectIntl(AvatarEditorRpm);
