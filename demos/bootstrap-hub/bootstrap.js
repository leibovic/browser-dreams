const { classes: Cc, interfaces: Ci, utils: Cu } = Components;

Cu.import("resource://gre/modules/Home.jsm");
Cu.import("resource://gre/modules/HomeProvider.jsm");
Cu.import("resource://gre/modules/Services.jsm");
Cu.import("resource://gre/modules/Task.jsm");

/**
 * Logic to control a new home panel.
 */

const PANEL_ID = "myawesomepanel@margaretleibovic.com";
const DATASET_ID = "myawesomedata@margaretleibovic.com";
const PANEL_TITLE = "Kittens!";
const KITTENS_URL = "http://api.flickr.com/services/feeds/photos_public.gne?tags=kittens&format=json";

// Used to configure home panel.
function panelOptionsCallback() {
  return {
    title: PANEL_TITLE,
    views: [{
      type: Home.panels.View.GRID,
      dataset: DATASET_ID,
      onrefresh: refreshDataset
    }]
  };
}

function fetchFlickrJson(url, onFinish) {
  let xhr = Cc["@mozilla.org/xmlextras/xmlhttprequest;1"].createInstance(Ci.nsIXMLHttpRequest);
  xhr.open("GET", url, true);
  xhr.onload = function onload(event) {
    if (xhr.status === 200) {
      // Handle JSONP response.
      let response = null;
      let jsonFlickrFeed = function(r){
        response = r;
      }
      eval(xhr.responseText);
      onFinish(response);
    } else {
      Cu.reportError("Error loading Flickr feed: XHR status " + xhr.status);
    }
  };
  xhr.send(null);
}

function refreshDataset() {
  fetchFlickrJson(KITTENS_URL, function(response) {
    // Format items the way we want to store them.
    let items = response.items.map(function(item) {
      return {
        url: item.link,
        image_url: item.media.m 
      };
    });

    Task.spawn(function() {
      let storage = HomeProvider.getStorage(DATASET_ID);
      yield storage.save(items, { replace: true });
    }).then(null, Cu.reportError);
  });
}

function deleteDataset() {
  Task.spawn(function() {
    let storage = HomeProvider.getStorage(DATASET_ID);
    yield storage.deleteAll();
  }).then(null, Cu.reportError);
}

function openPanel() {
  Services.wm.getMostRecentWindow("navigator:browser").BrowserApp.loadURI("about:home?panel=" + PANEL_ID);
}

/**
 * bootstrap.js API
 * https://developer.mozilla.org/en-US/Add-ons/Bootstrapped_extensions
 */
function startup(data, reason) {
  // Always register your panel on startup.
  Home.panels.register(PANEL_ID, panelOptionsCallback);

  switch(reason) {
    case ADDON_INSTALL:
    case ADDON_ENABLE:
      Home.panels.install(PANEL_ID);
      refreshDataset();
      break;

    case ADDON_UPGRADE:
    case ADDON_DOWNGRADE:
      Home.panels.update(PANEL_ID);
      break;
  }

   // Open the panel when the add-on is first installed.
  if (reason == ADDON_INSTALL) {
    openPanel();
  }
}

function shutdown(data, reason) {
  if (reason == ADDON_UNINSTALL || reason == ADDON_DISABLE) {
    Home.panels.uninstall(PANEL_ID);
    deleteDataset();
  }

  Home.panels.unregister(PANEL_ID);
}

function install(data, reason) {}

function uninstall(data, reason) {}
