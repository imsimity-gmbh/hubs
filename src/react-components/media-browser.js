import React, { Component } from "react";
import PropTypes from "prop-types";
import { injectIntl, FormattedMessage, defineMessages } from "react-intl";
import configs from "../utils/configs";
import { pushHistoryPath, pushHistoryState, sluglessPath } from "../utils/history";
import { SOURCES } from "../storage/media-search-store";
import { showFullScreenIfWasFullScreen } from "../utils/fullscreen";
import { AvatarUrlModalContainer } from "./room/AvatarUrlModalContainer";
import { SceneUrlModalContainer } from "./room/SceneUrlModalContainer";
import { ObjectUrlModalContainer } from "./room/ObjectUrlModalContainer";
import { TeacherUrlModalContainer } from "./room/TeacherUrlModalContainer";
import { MediaBrowser } from "./room/MediaBrowser";
import { IconButton } from "./input/IconButton";
import { ReactComponent as UploadIcon } from "./icons/Upload.svg";
import { ReactComponent as LinkIcon } from "./icons/Link.svg";
import { remixAvatar } from "../utils/avatar-utils";
import { fetchReticulumAuthenticated, getReticulumFetchUrl } from "../utils/phoenix-utils";
import { proxiedUrlFor, scaledThumbnailUrlFor } from "../utils/media-url-utils";
import { CreateTile, MediaTile } from "./room/MediaTiles";
import { SignInMessages } from "./auth/SignInModal";

import { HEROKU_UPLOAD_URI } from "../utils/imsimity";

const isMobile = AFRAME.utils.device.isMobile();
const isMobileVR = AFRAME.utils.device.isMobileVR();

const PRIVACY_POLICY_LINKS = {
  videos: "https://privacy.microsoft.com/en-us/privacystatement",
  images: "https://privacy.microsoft.com/en-us/privacystatement",
  gifs: "https://tenor.com/legal-privacy",
  sketchfab: "https://sketchfab.com/privacy",
  youtube: "https://policies.google.com/privacy",
  twitch: "https://www.twitch.tv/p/legal/privacy-policy/"
};

const DEFAULT_FACETS = {
  sketchfab: [
    { text: "Featured", params: { filter: "featured" } },
    { text: "Animals", params: { filter: "animals-pets" } },
    { text: "Architecture", params: { filter: "architecture" } },
    { text: "Art", params: { filter: "art-abstract" } },
    { text: "Vehicles", params: { filter: "cars-vehicles" } },
    { text: "Characters", params: { filter: "characters-creatures" } },
    { text: "Culture", params: { filter: "cultural-heritage-history" } },
    { text: "Gadgets", params: { filter: "electronics-gadgets" } },
    { text: "Fashion", params: { filter: "fashion-style" } },
    { text: "Food", params: { filter: "food-drink" } },
    { text: "Furniture", params: { filter: "furniture-home" } },
    { text: "Music", params: { filter: "music" } },
    { text: "Nature", params: { filter: "nature-plants" } },
    { text: "News", params: { filter: "news-politics" } },
    { text: "People", params: { filter: "people" } },
    { text: "Places", params: { filter: "places-travel" } },
    { text: "Science", params: { filter: "science-technology" } },
    { text: "Sports", params: { filter: "sports-fitness" } },
    { text: "Weapons", params: { filter: "weapons-military" } }
  ],
  avatars: [
    { text: "Featured", params: { filter: "featured" } },
    { text: "My Avatars", params: { filter: "my-avatars" } },
    { text: "Newest", params: { filter: "" } }
  ],
  favorites: [],
  scenes: [{ text: "Featured", params: { filter: "featured" } }, { text: "My Scenes", params: { filter: "my-scenes" } }],
  library: [
    { text: "Images", params: { filter: "images"}},
    { text: "Videos", params: { filter: "videos"}},
    { text: "Documents", params: { filter: "documents"}},
    { text: "URLs", params: { filter: "urls"}},
    { text: "Models", params: { filter: "models"}},
  ],
  experiments: []
};

const poweredByMessages = defineMessages({
  images: {
    id: "media-browser.powered_by.images",
    defaultMessage: "Search by Bing"
  },
  videos: {
    id: "media-browser.powered_by.videos",
    defaultMessage: "Search by Bing"
  },
  youtube: {
    id: "media-browser.powered_by.youtube",
    defaultMessage: "Search by Google"
  },
  gifs: {
    id: "media-browser.powered_by.gifs",
    defaultMessage: "Search by Tenor"
  },
  sketchfab: {
    id: "media-browser.powered_by.sketchfab",
    defaultMessage: "Search by Sketchfab"
  },
  twitch: {
    id: "media-browser.powered_by.twitch",
    defaultMessage: "Search by Twitch"
  },
  scenes: {
    id: "media-browser.powered_by.scenes",
    defaultMessage: "Made with {editorName}"
  },
  library: {
    id: "media-browser.nav_title.digital_library",
    defaultMessage: "Digital Library"
  }
});

const customObjectMessages = defineMessages({
  object: {
    id: "media-browser.add_custom_object",
    defaultMessage: "Custom URL or File"
  },
  scene: {
    id: "media-browser.add_custom_scene",
    defaultMessage: "Custom Scene"
  },
  avatar: {
    id: "media-browser.add_custom_avatar",
    defaultMessage: "Avatar GLB URL"
  },
  library: {
    id: "media-browser.add_custom_library",
    defaultMessage: "Teacher Upload"
  }
});

const searchPlaceholderMessages = defineMessages({
  scenes: { id: "media-browser.search-placeholder.scenes", defaultMessage: "Search Scenes..." },
  avatars: { id: "media-browser.search-placeholder.avatars", defaultMessage: "Search Avatars..." },
  videos: { id: "media-browser.search-placeholder.videos", defaultMessage: "Search for Videos..." },
  images: { id: "media-browser.search-placeholder.images", defaultMessage: "Search for Images..." },
  youtube: { id: "media-browser.search-placeholder.youtube", defaultMessage: "Search for Youtube videos..." },
  gifs: { id: "media-browser.search-placeholder.gifs", defaultMessage: "Search for GIFs..." },
  twitch: { id: "media-browser.search-placeholder.twitch", defaultMessage: "Search for Twitch streams..." },
  sketchfab: { id: "media-browser.search-placeholder.sketchfab", defaultMessage: "Search Sketchfab Models..." },
  default: { id: "media-browser.search-placeholder.default", defaultMessage: "Search..." }
});

const emptyMessages = defineMessages({
  favorites: {
    id: "media-browser.empty.favorites",
    defaultMessage: "You don't have any favorites. Click a ⭐ to add to your favorites."
  },
  default: {
    id: "media-browser.empty.default",
    defaultMessage: "No results. Try entering a new search above."
  }
});

// TODO: Migrate to use MediaGrid and media specific components like RoomTile
class MediaBrowserContainer extends Component {
  static propTypes = {
    mediaSearchStore: PropTypes.object,
    history: PropTypes.object,
    intl: PropTypes.object,
    hubChannel: PropTypes.object,
    onMediaSearchResultEntrySelected: PropTypes.func,
    performConditionalSignIn: PropTypes.func,
    showNonHistoriedDialog: PropTypes.func.isRequired,
    scene: PropTypes.object.isRequired,
    store: PropTypes.object.isRequired
  };

  state = { query: "", facets: [], showNav: true, selectNextResult: false, clearStashedQueryOnClose: false };

  constructor(props) {
    super(props);
    this.state = this.getStoreAndHistoryState(props);
    this.props.mediaSearchStore.addEventListener("statechanged", this.storeUpdated);
    this.props.mediaSearchStore.addEventListener("sourcechanged", this.sourceChanged);

    const searchParams = new URLSearchParams(this.props.history.location.search);
    const urlSource = this.getUrlSource(searchParams);

    console.log("Media Browser Constructor");
    console.log(urlSource);

    if (urlSource === "library")
    {
      this.updateLibrary();
    }

  }

  componentDidMount() {}

  componentWillUnmount() {
    this.props.mediaSearchStore.removeEventListener("statechanged", this.storeUpdated);
    this.props.mediaSearchStore.removeEventListener("sourcechanged", this.sourceChanged);
  }

  updateLibrary = async () => {
    const res = await fetch(`https://${configs.CORS_PROXY_SERVER}/${HEROKU_UPLOAD_URI}` ,  
      { method: "GET"}
    );

    const libraryListing = await res.json();


    var newState = this.state;

    // If result is currently 'Internal server error'
    if (!newState.result || typeof newState.result === "string")
    {
      newState.result = {};
    }

    newState.result.entries = libraryListing;

    this.setState(newState);

  }

  storeUpdated = () => {
    
    const searchParams = new URLSearchParams(this.props.history.location.search);
    const urlSource = this.getUrlSource(searchParams);
    // Avoid media-store overriding our own findings from Heroku
    if (urlSource === "library")
    {
      return;
    }

    const newState = this.getStoreAndHistoryState(this.props);
    this.setState(newState);

    if (this.state.selectNextResult) {
      if (newState.result && newState.result.entries.length > 0) {
        this.selectEntry(newState.result.entries[0]);
      } else {
        this.close();
      }
    }
  };

  sourceChanged = () => {
    if (this.inputRef && !isMobile && !isMobileVR) {
      this.inputRef.focus();
    }
  };

  getUrlSource = searchParams =>
    searchParams.get("media_source") || sluglessPath(this.props.history.location).substring(7);

  getStoreAndHistoryState = props => {
    const searchParams = new URLSearchParams(props.history.location.search);
    const result = props.mediaSearchStore.result;

    const newState = { result, query: this.state.query || searchParams.get("q") || "" };
    const urlSource = this.getUrlSource(searchParams);
    newState.showNav = !!(searchParams.get("media_nav") !== "false");
    newState.selectAction = searchParams.get("selectAction") || "spawn";

    if (result && result.suggestions && result.suggestions.length > 0) {
      newState.facets = result.suggestions.map(s => {
        return { text: s, params: { q: s } };
      });
    } else {
      newState.facets = DEFAULT_FACETS[urlSource] || [];
    }

    return newState;
  };

  handleQueryUpdated = (query, forceNow) => {
    this.setState({ result: null });

    if (this._sendQueryTimeout) {
      clearTimeout(this._sendQueryTimeout);
      this._sendQueryTimeout = null;
    }

    if (forceNow) {
      this.props.mediaSearchStore.filterQueryNavigate("", query);
    } else {
      // Don't update search on every keystroke, but buffer for some ms.
      this._sendQueryTimeout = setTimeout(() => {
        // Drop filter for now, so entering text drops into "search all" mode
        this.props.mediaSearchStore.filterQueryNavigate("", query);
        this._sendQueryTimeout = null;
      }, 500);
    }

    this.setState({ query });
  };

  handleEntryClicked = (evt, entry) => {
    evt.preventDefault();

    if (!entry.lucky_query) {
      this.selectEntry(entry);
    } else {
      // Entry has a pointer to another "i'm feeling lucky" query -- used for trending videos
      //
      // Also, mark the browser to clear the stashed query on close, since this is a temporary
      // query we are running to get the result we want.
      this.setState({ clearStashedQueryOnClose: true });
      this.handleQueryUpdated(entry.lucky_query, true);
    }
  };

  onShowSimilar = (id, name) => {
    this.handleFacetClicked({ params: { similar_to: id, similar_name: name } });
  };

  selectEntry = entry => {
    if (!this.props.onMediaSearchResultEntrySelected) return;
    this.props.onMediaSearchResultEntrySelected(entry, this.state.selectAction);
    this.close();
  };

  handleSourceClicked = source => {
    this.props.mediaSearchStore.sourceNavigate(source);
  };

  handleFacetClicked = facet => {
    this.setState({ query: "" }, () => {
      const searchParams = this.getSearchClearedSearchParams(true, true, true);

      for (const [k, v] of Object.entries(facet.params)) {
        searchParams.set(k, v);
      }

      pushHistoryPath(this.props.history, this.props.history.location.pathname, searchParams.toString());
    });
  };

  getSearchClearedSearchParams = (keepSource, keepNav, keepSelectAction) => {
    return this.props.mediaSearchStore.getSearchClearedSearchParams(
      this.props.history.location,
      keepSource,
      keepNav,
      keepSelectAction
    );
  };

  pushExitMediaBrowserHistory = (stashLastSearchParams = true) => {
    this.props.mediaSearchStore.pushExitMediaBrowserHistory(this.props.history, stashLastSearchParams);
  };

  showCustomMediaDialog = source => {
    const { scene, store, hubChannel } = this.props;
    const isAvatarApiType = source === "avatars";
    this.pushExitMediaBrowserHistory(!isAvatarApiType);

    console.log(source);

    if (source === "scenes") {
      this.props.showNonHistoriedDialog(SceneUrlModalContainer, { hubChannel });
    } else if (isAvatarApiType) {
      this.props.showNonHistoriedDialog(AvatarUrlModalContainer, { scene, store });
    } else if (source === "library") {
      this.props.showNonHistoriedDialog(TeacherUrlModalContainer, { scene });
    } else{
      this.props.showNonHistoriedDialog(ObjectUrlModalContainer, { scene });
    }
  };

  close = () => {
    showFullScreenIfWasFullScreen();
    const urlSource = this.getUrlSource(new URLSearchParams(this.props.history.location.search));
    this.pushExitMediaBrowserHistory(urlSource !== "avatars" && urlSource !== "favorites");
    if (this.state.clearStashedQueryOnClose) {
      this.props.mediaSearchStore.clearStashedQuery();
    }
  };

  handlePager = delta => {
    this.setState({ result: null });
    this.props.mediaSearchStore.pageNavigate(delta);
    this.browserDiv.scrollTop = 0;
  };

  handleCopyAvatar = (e, entry) => {
    e.preventDefault();

    this.props.performConditionalSignIn(
      () => this.props.hubChannel.signedIn,
      async () => {
        await remixAvatar(entry.id, entry.name);
        this.handleFacetClicked({ params: { filter: "my-avatars" } });
      },
      SignInMessages.remixAvatar
    );
  };

  handleCopyScene = async (e, entry) => {
    e.preventDefault();

    this.props.performConditionalSignIn(
      () => this.props.hubChannel.signedIn,
      async () => {
        await fetchReticulumAuthenticated("/api/v1/scenes", "POST", {
          parent_scene_id: entry.id
        });
        this.handleFacetClicked({ params: { filter: "my-scenes" } });
      },
      SignInMessages.remixScene
    );
  };

  onCreateAvatar = () => {
    window.dispatchEvent(new CustomEvent("action_create_avatar"));
  };

  onCreateAvatarRpm = () => {
    window.dispatchEvent(new CustomEvent("action_create_avatar_rpm"));
  }

  onPlaceExperiment = (e, position_id) => {
    const { scene } = this.props;

    console.log(position_id);

    if (position_id === "position_01") {
      scene.emit("action_toggle_first_experiment_01");
      scene.emit("action_toggle_first_experiment_01_start");
    }
    else if (position_id === "position_02") {
      scene.emit("action_toggle_first_experiment_02");
      scene.emit("action_toggle_first_experiment_02_start");
    }
    else if (position_id === "position_03") {
      scene.emit("action_toggle_first_experiment_03");
      scene.emit("action_toggle_first_experiment_03_start");
    }
    
      this.close();
  }

  processThumbnailUrl = (entry, thumbnailWidth, thumbnailHeight) => {
    if (entry.images.preview.type === "mp4") {
      return proxiedUrlFor(entry.images.preview.url);
    } else {
      return scaledThumbnailUrlFor(entry.images.preview.url, thumbnailWidth, thumbnailHeight);
    }
  };

  render() {
   
    const intl = this.props.intl;
    const searchParams = new URLSearchParams(this.props.history.location.search);
    const urlSource = this.getUrlSource(searchParams);
    const isSceneApiType = urlSource === "scenes";
    const isFavorites = urlSource === "favorites";
    const showCustomOption =
      !isFavorites && (!isSceneApiType || this.props.hubChannel.canOrWillIfCreator("update_hub"));
    const entries = (this.state.result && this.state.result.entries) || [];
    const hideSearch = urlSource === "favorites";
    const showEmptyStringOnNoResult = urlSource !== "avatars" && urlSource !== "scenes";

    const facets = this.state.facets && this.state.facets.length > 0 ? this.state.facets : undefined;

    console.log(urlSource);

    // Don't render anything if we just did a feeling lucky query and are waiting on result.
    if (this.state.selectNextResult) return <div />;
    const handleCustomClicked = urlSource => {
      const isAvatarApiType = urlSource === "avatars";
      if (isAvatarApiType) {
        this.showCustomMediaDialog(urlSource);
      } else {
        this.props.performConditionalSignIn(
          () => !isSceneApiType || this.props.hubChannel.can("update_hub"),
          () => this.showCustomMediaDialog(urlSource),
          SignInMessages.changeScene
        );
      }
    };

    const activeFilter =
      searchParams.get("filter") || (searchParams.get("similar_to") && "similar") || (!searchParams.get("q") && "");

    const meta = this.state.result && this.state.result.meta;
    const hasNext = !!(meta && meta.next_cursor);
    const hasPrevious = !!searchParams.get("cursor");

    const customObjectType =
      this.state.result && isSceneApiType ? "scene" : urlSource === "avatars" ? "avatar" : urlSource === "library" ? "library" : "object";

    let searchDescription;


    let experiments = [
      {
        id: "001",
        attributions: null,
        description: null,
        images: { preview: { url: "https://cci.imsimity.com/gecolab/lab_positions/laboratory_pos_01.png" } },
        name: "Experiment 1 - Arbeitsbereich 1",
        project_id: null,
        type: "experiment_listing",
        url: "#"
      },
      {
        id: "002",
        attributions: null,
        description: null,
        images: { preview: { url: "https://cci.imsimity.com/gecolab/lab_positions/laboratory_pos_02.png" } },
        name: "Experiment 1 - Arbeitsbereich 2",
        project_id: null,
        type: "experiment_listing",
        url: "#"
      },
      {
        id: "003",
        attributions: null,
        description: null,
        images: { preview: { url: "https://cci.imsimity.com/gecolab/lab_positions/laboratory_pos_03.png" } },
        name: "Experiment 1 - Arbeitsbereich 3",
        project_id: null,
        type: "experiment_listing",
        url: "#"
      }
    ] 


    if (!hideSearch && urlSource !== "scenes" && urlSource !== "avatars" && urlSource !== "favorites") {
      searchDescription = (
        <>
          {poweredByMessages[urlSource] ? intl.formatMessage(poweredByMessages[urlSource]) : ""}
          {poweredByMessages[urlSource] && PRIVACY_POLICY_LINKS[urlSource] ? " | " : ""}
          {PRIVACY_POLICY_LINKS[urlSource] && (
            <a href={PRIVACY_POLICY_LINKS[urlSource]} target="_blank" rel="noreferrer noopener">
              <FormattedMessage id="media-browser.privacy_policy" defaultMessage="Privacy Policy" />
            </a>
          )}
        </>
      );
    } else if (urlSource === "scenes") {
      searchDescription = (
        <>
          {configs.feature("enable_spoke") && (
            <>
              {intl.formatMessage(poweredByMessages.scenes, {
                editorName: (
                  <a href="/spoke" target="_blank" rel="noreferrer noopener">
                    {configs.translation("editor-name")}
                  </a>
                )
              })}
            </>
          )}
          {configs.feature("enable_spoke") && configs.feature("show_issue_report_link") && " | "}
          {configs.feature("show_issue_report_link") && (
            <a
              target="_blank"
              rel="noopener noreferrer"
              href={configs.link("issue_report", "https://hubs.mozilla.com/docs/help.html")}
            >
              <FormattedMessage id="media-browser.report-issue" defaultMessage="Report Issue" />
            </a>
          )}
        </>
      );
    }

    return (
      <MediaBrowser
        browserRef={r => (this.browserDiv = r)}
        onClose={this.close}
        searchInputRef={r => (this.inputRef = r)}
        autoFocusSearch={!isMobile && !isMobileVR}
        query={this.state.query}
        onChangeQuery={e => this.handleQueryUpdated(e.target.value)}
        onSearchKeyDown={e => {
          if (e.key === "Enter" && e.ctrlKey) {
            if (entries.length > 0 && !this._sendQueryTimeout) {
              this.handleEntryClicked(e, entries[0]);
            } else if (this.state.query.trim() !== "") {
              this.handleQueryUpdated(this.state.query, true);
              this.setState({ selectNextResult: true });
            } else {
              this.close();
            }
          } else if (e.key === "Escape" || (e.key === "Enter" && isMobile)) {
            e.target.blur();
          }
        }}
        onClearSearch={() => this.handleQueryUpdated("", true)}
        mediaSources={urlSource === "favorites" ? undefined : SOURCES}
        selectedSource={urlSource}
        onSelectSource={this.handleSourceClicked}
        activeFilter={activeFilter}
        facets={facets}
        onSelectFacet={this.handleFacetClicked}
        searchPlaceholder={
          searchPlaceholderMessages[urlSource]
            ? intl.formatMessage(searchPlaceholderMessages[urlSource])
            : intl.formatMessage(searchPlaceholderMessages.default)
        }
        searchDescription={searchDescription}
        headerRight={
          showCustomOption && (
            <IconButton lg onClick={() => handleCustomClicked(urlSource)}>
              {["scenes", "avatars"].includes(urlSource) ? <LinkIcon /> : <UploadIcon />}
              <p>{intl.formatMessage(customObjectMessages[customObjectType])}</p>
            </IconButton>
          )
        }
        hasNext={hasNext}
        hasPrevious={hasPrevious}
        onNextPage={() => this.handlePager(1)}
        onPreviousPage={() => this.handlePager(-1)}
        noResultsMessage={
          emptyMessages[urlSource]
            ? intl.formatMessage(emptyMessages[urlSource])
            : intl.formatMessage(emptyMessages.default)
        }
      >
        {urlSource === "experiments" &&
          <MediaTile
            key={`001`}
            entry={experiments[0]}
            processThumbnailUrl={this.processThumbnailUrl}
            onClick={e => this.onPlaceExperiment(e, "position_01")}
          />
        }
        {urlSource === "experiments" &&
          <MediaTile
            key={`002`}
            entry={experiments[1]}
            processThumbnailUrl={this.processThumbnailUrl}
            onClick={e => this.onPlaceExperiment(e, "position_02")}
          />
        }
        {false && urlSource === "experiments" &&
          <MediaTile
            key={`003`}
            entry={experiments[2]}
            processThumbnailUrl={this.processThumbnailUrl}
            onClick={e => this.onPlaceExperiment(e, "position_03")}
          />
        }
          

        {this.props.mediaSearchStore.isFetching ||
        this._sendQueryTimeout ||
        entries.length > 0 ||
        !showEmptyStringOnNoResult ? (
          <>
            {urlSource === "avatars" && (
              <CreateTile
                type="avatar"
                onClick={this.onCreateAvatarRpm}
                label={<FormattedMessage id="media-browser.create-avatar-rpm" defaultMessage="Create new Avatar" />}
              />  
            )}
            {urlSource === "avatars" && (
              <CreateTile
                type="avatar"
                onClick={this.onCreateAvatar}
                label={<FormattedMessage id="media-browser.create-avatar" defaultMessage="Avatar Upload" />}
              />  
            )}

            {urlSource === "scenes" &&
              configs.feature("enable_spoke") && (
                <CreateTile
                  as="a"
                  href="/spoke/new"
                  rel="noopener noreferrer"
                  target="_blank"
                  type="scene"
                  label={
                    <FormattedMessage
                      id="media-browser.create-scene"
                      defaultMessage="Create Scene with {editorName}"
                      values={{ editorName: configs.translation("editor-name") }}
                    />
                  }
                />
              )}

            {entries.map((entry, idx) => {
              const isAvatar = entry.type === "avatar" || entry.type === "avatar_listing";
              const isScene = entry.type === "scene" || entry.type === "scene_listing";
              const onShowSimilar =
                entry.type === "avatar_listing"
                  ? e => {
                      e.preventDefault();
                      this.onShowSimilar(entry.id, entry.name);
                    }
                  : undefined;

              let onEdit;

              if (entry.type === "avatar") {
                onEdit = e => {
                  e.preventDefault();
                  pushHistoryState(this.props.history, "overlay", "avatar-editor", { avatarId: entry.id });
                };
              } else if (entry.type === "scene") {
                onEdit = e => {
                  e.preventDefault();
                  const spokeProjectUrl = getReticulumFetchUrl(`/spoke/projects/${entry.project_id}`);
                  window.open(spokeProjectUrl);
                };
              } else if (entry.type === "library_item") {
                entry.images.preview.url =  `https://${configs.CORS_PROXY_SERVER}/${entry.images.preview.url}`;
              }

              let onCopy;

              if (isAvatar) {
                onCopy = e => this.handleCopyAvatar(e, entry);
              } else if (isScene) {
                onCopy = e => this.handleCopyScene(e, entry);
              }

              return (
                  <MediaTile
                    key={`${entry.id}_${idx}`}
                    entry={entry}
                    processThumbnailUrl={this.processThumbnailUrl}
                    onClick={e => this.handleEntryClicked(e, entry)}
                    onEdit={onEdit}
                    onShowSimilar={onShowSimilar}
                    onCopy={onCopy}
                  />
              );
            })}
          </>
        ) : null}
      </MediaBrowser>
    );
  }
}

export default injectIntl(MediaBrowserContainer);
