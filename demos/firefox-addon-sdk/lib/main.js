// For even more APIs and examples, see:
// https://developer.mozilla.org/en-US/Add-ons/SDK/High-Level_APIs

// ----------------------------------------------------------------------------
// 1. Creating a button that opens a tab when clicked.

var ui = require("sdk/ui");
var tabs = require("sdk/tabs");

var actionButton = ui.ActionButton({
  id: "mozilla-link",
  label: "Cats!",
  icon: {
    "32": "./icon.png",
  },
  onClick: function(state) {
    tabs.open("https://www.google.com/search?q=cat&tbm=isch");
  }
});

// ----------------------------------------------------------------------------
// 2. Creating a button that toggles a panel when clicked.

var panels = require("sdk/panel");
var self = require("sdk/self");

var panel = panels.Panel({
  contentURL: self.data.url("popup.html"),
  width: 375,
  height: 465
});

// ToggleButton can toggle some state when clicked.
var toggleButton = ui.ToggleButton({
  id: "my-button",
  label: "my button",
  icon: {
    "32": "./icon.png"
  },
  onChange: function(state) {
    if (state.checked) {
      panel.show({ position: toggleButton });
    }
  }
});

// ----------------------------------------------------------------------------
// 3. Add a keyboard shortcut to show the panel.

var hotkeys = require("sdk/hotkeys");

var showHotKey = hotkeys.Hotkey({
  combo: "accel-shift-o",
  onPress: function() {
    if (panel.isShowing) {
      panel.hide();
    } else {
      panel.show();
    }
  }
});

// ----------------------------------------------------------------------------
// 4. Creating a content script to modify page content.

var pageMod = require("sdk/page-mod");

pageMod.PageMod({
  include: "*",
  contentScriptFile: self.data.url("content.js")
});


// ----------------------------------------------------------------------------
// 5. Add a context menu to certain kinds of elements.

var contextMenu = require("sdk/context-menu");

var menuItem = contextMenu.Item({
  label: "Cat-ify",
  context: contextMenu.SelectorContext("img"),
  contentScript: 'self.on("click", function (img) {' +
                 '  img.src = "http://upload.wikimedia.org/wikipedia/commons/thumb/2/22/Turkish_Van_Cat.jpg/819px-Turkish_Van_Cat.jpg"' +
                 '});'
});
