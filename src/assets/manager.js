// -------------------------------------------------------------------------- //
//                                                                            //
// Avalon.js asset manager, the facade for the asset loading.                 //
//                                                                            //
// -------------------------------------------------------------------------- //
import _           from 'lodash';
import Url         from 'url-parse';
import QueryString from 'querystring';
import AssetLoader from './loader';

// Regex that matches the asset path
const PATH_REGEX = /^((?:[^\!\s]+!)*)([^\!\?]+)(?:\?(.*))?$/i;

// The asset loader class
export default class AssetManager {

  constructor() {
    this._loaders = { };
    this._config  = [ ];
  }

  // Mounts an asset loader to the specified name
  mount(name, loader) {
    if (!(loader instanceof AssetLoader)) {
      throw new Error('Loader must derive from Avalon.AssetLoader.');
    }
    if (this._loaders[name]) {
      throw new Error(`Duplicate AssetLoader name: ${name}`);
    }
    this._loaders[name] = loader;
    return this;
  }

  // Unmounts an asset loader from the specified name
  unmount(name) {
    delete this._loaders[name];
    return this;
  }

  // Loads an asset
  // Takes an asset path like "system:ui/frm_0101a.png?option=value"
  load(path) {
    let match = PATH_REGEX.exec(path);

    // Extract the file path
    let file  = match[2];

    // Determine which loaders to use
    let loaders = match[1].length ?
      match[1] : _.find(this._config, (i) => { return i.test.test(file); });
    loaders = loaders || '';
    loaders = _.filter(loaders.split('!').reverse());

    // Parse the config string
    let options = QueryString.parse(match[3]);

    // Load the asset
    let context = file;
    for (var i = 0; i < loaders.length; i++) {
      let loader = this._loaders[loaders[i]];
      if (!loader) { throw new Error(`Loader not found: ${loaders[i]}`); }
      context = loader.load(context, options);
    }
    return context;
  }

}

// Attach an extension module
AssetManager.Extension = { __avalon: true };
AssetManager.Extension.globals = {
  Assets: new AssetManager()
};
