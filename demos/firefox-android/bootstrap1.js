const { classes: Cc, interfaces: Ci, utils: Cu } = Components;

Cu.import("resource://gre/modules/Services.jsm");

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

/**
 * Boilerplate code to listen for browser windows being loaded.
 */
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
}

function shutdown(data, reason) {
  WindowListener.uninit();
}

function install(data, reason) {}

function uninstall(data, reason) {}
