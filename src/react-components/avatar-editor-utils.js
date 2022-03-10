

import { ensureAvatarMaterial } from "../utils/avatar-utils";

// GLTFLoader plugin for splitting glTF and bin from glb.

class GLTFBinarySplitterPlugin {
  constructor(parser) {
    this.parser = parser;
    this.gltf = null;
    this.bin = null;
  }

  beforeRoot() {
    const parser = this.parser;
    const { body } = parser.extensions.KHR_binary_glTF;
    const content = JSON.stringify(ensureAvatarMaterial(parser.json));

    this.gltf = new File([content], "file.gltf", {
      type: "model/gltf"
    });
    this.bin = new File([body], "file.bin", {
      type: "application/octet-stream"
    });

    // This plugin just wants to split gltf and bin from glb and
    // doesn't want to start the parse. But glTF loader plugin API
    // doesn't have an ability to cancel the parse. So overriding
    // parser.json with very light glTF data as workaround.
    parser.json = { asset: { version: "2.0" } };
  }

  afterRoot(result) {
    result.files = result.files || {};
    result.files.gltf = this.gltf;
    result.files.bin = this.bin;
  }
}



export default GLTFBinarySplitterPlugin
