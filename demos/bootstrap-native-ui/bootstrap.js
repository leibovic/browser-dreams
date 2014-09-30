const { classes: Cc, interfaces: Ci, utils: Cu } = Components;

Cu.import("resource://gre/modules/Services.jsm");

const CAT_ICON = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAUCAYAAADskT9PAAAAAXNSR0IArs4c6QAAAAZiS0dEAP8A/wD/oL2nkwAAAAlwSFlzAAAOwwAADsMBx2+oZAAAAAd0SU1FB9sFGg0XBT5YnY0AAAEhSURBVEjHrVZRFoQgCHR83Wj3THImPFN7JvZjozUDpVf85ItihhFQpLlJum+47FBwWfk++ptcLITBP+U68qtOSeRQoBF4rfY6SDqHwfvgaqXY6yCJHJazjAOBkEDw1TgW9V7YS3qixAmJmfe1sHiERb8jIkkpITeM5FLLORky81GJztfb0jqISCXCnS2xSFjg2hZikPjptfKxiGo9AbfyX7ENB1mzVeBhsD5rv9CmtuFIbgeSSyLSgvurclBx5sv9VCSic4ASn4IAPLlN3+KMZpl2QEeq/LV1q1+f+i0NBhFO87zdhokirYLe+tHDqO8ErwaMbgNmd4DocYw3hdtRwT0FJJrNExeUJbiXMGa5lYDlH/6DwBUMjm+6fUZXnf75AtSJkJx49gb1AAAAAElFTkSuQmCC";

var NativeWindow;
var BrowserApp;

// Keep track of IDs so that we can clean up after ourselves.
var contextMenuId;
var pageActionId;

// This function loads the add-on into the global browser window. This is a XUL window that holds
// <browser> elements, which in turn hold the normal web content windows you find in tabs.
// You don't need to worry about this, but we need this window to get at UI APIs that depend on a window.
function loadIntoWindow(window) {
  NativeWindow = window.NativeWindow;
  contextMenuId = NativeWindow.contextmenus.add(
    "Cat-ify!",
    NativeWindow.contextmenus.SelectorContext("img"),
    img => img.src = "http://upload.wikimedia.org/wikipedia/commons/thumb/2/22/Turkish_Van_Cat.jpg/819px-Turkish_Van_Cat.jpg"
  );

  BrowserApp = window.BrowserApp;
  BrowserApp.deck.addEventListener("pageshow", onPageShow, false);
}

function unloadFromWindow(window) {
  NativeWindow.contextmenus.remove(contextMenuId);

  BrowserApp.deck.removeEventListener("pageshow", onPageShow, false);
}

function onPageShow(event) {
  // Ignore load events on frames and other documents.
  let selectedTab = BrowserApp.selectedTab;
  if (!selectedTab || event.target != selectedTab.browser.contentDocument) {
    return;
  }

  // Remove any current page action item.
  if (pageActionId) {
    NativeWindow.pageactions.remove(pageActionId);
    pageActionId = undefined;
  }

  // Only show the page action icon sometimes.
  // (You would have a more useful check if this was a real add-on ;)
  if (Math.random() < 0.5) {
    return;
  }

  pageActionId = NativeWindow.pageactions.add({
    icon: CAT_ICON,
    title: "Cats!",
    clickCallback: function() {
      let doc = selectedTab.browser.contentDocument;
      let images = doc.querySelectorAll("img");
      for (let i = 0; i < images.length; i++) {
        images[i].src = "http://upload.wikimedia.org/wikipedia/commons/thumb/2/22/Turkish_Van_Cat.jpg/819px-Turkish_Van_Cat.jpg";
      }
    }
  });
}

/**
 * bootstrap.js API
 */
var windowListener = {
  onOpenWindow: function(aWindow) {
    // Wait for the window to finish loading
    let domWindow = aWindow.QueryInterface(Ci.nsIInterfaceRequestor).getInterface(Ci.nsIDOMWindowInternal || Ci.nsIDOMWindow);
    domWindow.addEventListener("load", function() {
      domWindow.removeEventListener("load", arguments.callee, false);
      loadIntoWindow(domWindow);
    }, false);
  },
  
  onCloseWindow: function(aWindow) {
  },
  
  onWindowTitleChange: function(aWindow, aTitle) {
  }
};

function startup(aData, aReason) {
  // Load into any existing windows
  let windows = Services.wm.getEnumerator("navigator:browser");
  while (windows.hasMoreElements()) {
    let domWindow = windows.getNext().QueryInterface(Ci.nsIDOMWindow);
    loadIntoWindow(domWindow);
  }

  // Load into any new windows
  Services.wm.addListener(windowListener);
}

function shutdown(aData, aReason) {
  // When the application is shutting down we normally don't have to clean
  // up any UI changes made
  if (aReason == APP_SHUTDOWN) {
    return;
  }

  // Stop listening for new windows
  Services.wm.removeListener(windowListener);

  // Unload from any existing windows
  let windows = Services.wm.getEnumerator("navigator:browser");
  while (windows.hasMoreElements()) {
    let domWindow = windows.getNext().QueryInterface(Ci.nsIDOMWindow);
    unloadFromWindow(domWindow);
  }
}

function install(aData, aReason) {
}

function uninstall(aData, aReason) {
}
