import { CLIPPING_THRESHOLD_ENABLED, CLIPPING_THRESHOLD_DEFAULT } from "../react-components/preferences-screen";
import { getCurrentAudioSettings, updateAudioSettings } from "../update-audio-settings";

function isClippingEnabled() {
  const { enableAudioClipping } = window.APP.store.state.preferences;
  return enableAudioClipping !== undefined ? enableAudioClipping : CLIPPING_THRESHOLD_ENABLED;
}

function getClippingThreshold() {
  const { audioClippingThreshold } = window.APP.store.state.preferences;
  return audioClippingThreshold !== undefined ? audioClippingThreshold : CLIPPING_THRESHOLD_DEFAULT;
}

const distanceModels = {
  linear: function(distance, rolloffFactor, refDistance, maxDistance) {
    return 1.0 - rolloffFactor * ((distance - refDistance) / (maxDistance - refDistance));
  },
  inverse: function(distance, rolloffFactor, refDistance) {
    return refDistance / (refDistance + rolloffFactor * (Math.max(distance, refDistance) - refDistance));
  },
  exponential: function(distance, rolloffFactor, refDistance) {
    return Math.pow(Math.max(distance, refDistance) / refDistance, -rolloffFactor);
  }
};

const calculateAttenuation = (() => {
  const listenerPos = new THREE.Vector3();
  const sourcePos = new THREE.Vector3();
  return (el, audio) => {
    el.sceneEl.audioListener.getWorldPosition(listenerPos);
    audio.getWorldPosition(sourcePos);
    const distance = sourcePos.distanceTo(listenerPos);
    if (audio.panner) {
      return distanceModels[audio.panner.distanceModel](
        distance,
        audio.panner.rolloffFactor,
        audio.panner.refDistance,
        audio.panner.maxDistance
        // TODO: Why are coneInnerAngle, coneOuterAngle and coneOuterGain not used?
      );
    } else {
      const { distanceModel, rolloffFactor, refDistance, maxDistance } = getCurrentAudioSettings(el);
      return distanceModels[distanceModel](distance, rolloffFactor, refDistance, maxDistance);
    }
  };
})();

// TODO: Rename "GainSystem" because the name is suspicious
export class GainSystem {
  tick() {
    const clippingEnabled = isClippingEnabled();
    const clippingThreshold = getClippingThreshold();
    for (const [el, audio] of APP.audios.entries()) {
      const attenuation = calculateAttenuation(el, audio);

      if (!audio.panner) {
        // For Audios that are not PositionalAudios, we reintroduce
        // distance-based attenuation manually.
        APP.supplementaryAttenuation.set(el, attenuation);
        updateAudioSettings(el, audio);
      }

      const isClipped = APP.clippingState.has(el);
      const shouldBeClipped = clippingEnabled && attenuation < clippingThreshold;
      if (isClipped !== shouldBeClipped) {
        if (shouldBeClipped) {
          APP.clippingState.add(el);
        } else {
          APP.clippingState.delete(el);
        }
        updateAudioSettings(el, audio);
      }
    }
  }
}