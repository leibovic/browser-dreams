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
const PANEL_TITLE = "My awesome panel";
const KITTENS_URL = "http://api.flickr.com/services/feeds/photos_public.gne?tags=kittens&format=json";

// Used to configure home panel.
function panelOptionsCallback() {
  return {
    title: PANEL_TITLE,
    views: [{
      type: Home.panels.View.GRID,
      dataset: DATASET_ID
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
      yield storage.deleteAll();
      yield storage.save(items);
    }).then(null, Cu.reportError);
  });
}

function deleteDataset() {
  Task.spawn(function() {
    let storage = HomeProvider.getStorage(DATASET_ID);
    yield storage.deleteAll();
  }).then(null, Cu.reportError);
}

/**
 * Logic to load add-on code into the browser window.
 */

var menuItemId;

function loadIntoWindow(window) {
  menuItemId = window.NativeWindow.menu.add({
    name: "Cats!",
    callback: function() {
      window.BrowserApp.addTab("https://www.google.com/search?q=cat&tbm=isch");
    }
  });
}

function unloadFromWindow(window) {
  window.NativeWindow.menu.remove(menuItemId);
}

// Boilerplate code to listen for browser windows being loaded.
var WindowListener = {
  init: function() {
    let windows = Services.wm.getEnumerator("navigator:browser");
    while (windows.hasMoreElements()) {
      let domWindow = windows.getNext().QueryInterface(Ci.nsIDOMWindow);
      loadIntoWindow(domWindow);
    }
    Services.wm.addListener(this);
  },

  uninit: function() {
    Services.wm.removeListener(this);
    let windows = Services.wm.getEnumerator("navigator:browser");
    while (windows.hasMoreElements()) {
      let domWindow = windows.getNext().QueryInterface(Ci.nsIDOMWindow);
      unloadFromWindow(domWindow);
    }
  },

  onOpenWindow: function(window) {
    let domWindow = window.QueryInterface(Ci.nsIInterfaceRequestor).getInterface(Ci.nsIDOMWindowInternal || Ci.nsIDOMWindow);
    domWindow.addEventListener("load", function() {
      domWindow.removeEventListener("load", arguments.callee, false);
      loadIntoWindow(domWindow);
    }, false);
  },

  onCloseWindow: function(window) {},

  onWindowTitleChange: function(window, title) {}
};

/**
 * bootstrap.js API
 * https://developer.mozilla.org/en-US/Add-ons/Bootstrapped_extensions
 */
function startup(data, reason) {
  WindowListener.init();

  // Always register your panel on startup.
  Home.panels.register(PANEL_ID, panelOptionsCallback);

  switch(reason) {
    case ADDON_INSTALL:
    case ADDON_ENABLE:
      Home.panels.install(PANEL_ID);
      refreshDataset();

      // Open the panel when the add-on is installed.
      Services.wm.getMostRecentWindow("navigator:browser").BrowserApp.loadURI("about:home?panel=" + PANEL_ID);
      break;

    case ADDON_UPGRADE:
    case ADDON_DOWNGRADE:
      Home.panels.update(PANEL_ID);
      break;
  }

  // Update data once every hour.
  HomeProvider.addPeriodicSync(DATASET_ID, 3600, refreshDataset);
}

function shutdown(data, reason) {
  WindowListener.uninit();

  if (reason == ADDON_UNINSTALL || reason == ADDON_DISABLE) {
    // Call removePeriodicSync only when uninstalling or disabling,
    // because we still need periodic sync in other cases.
    HomeProvider.removePeriodicSync(DATASET_ID);

    Home.panels.uninstall(PANEL_ID);
    deleteDataset();
  }

  Home.panels.unregister(PANEL_ID);
}

function install(data, reason) {}

function uninstall(data, reason) {}
