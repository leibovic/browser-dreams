var { ToggleButton } = require("sdk/ui/button/toggle");
var panels = require("sdk/panel");
var self = require("sdk/self");

var button = ToggleButton({
  id: "my-button",
  label: "my button",
  icon: {
    "32": "./icon.png"
  },
  onChange: handleChange
});

var panel = panels.Panel({
  contentURL: self.data.url("popup.html")
});

function handleChange(state) {
  if (state.checked) {
    panel.show({
      width: 375,
      height: 465,
      position: {
        top: 0,
        right: 0
      }
    });
  }
}

var buttons = require("sdk/ui/button/action");
var tabs = require("sdk/tabs");

var button = buttons.ActionButton({
  id: "mozilla-link",
  label: "Cats!",
  icon: {
    "32": "./icon.png",
  },
  onClick: handleClick
});

function handleClick(state) {
  tabs.open("https://www.google.com/search?q=cat&tbm=isch");
}

var data = require("sdk/self").data;
var pageMod = require("sdk/page-mod");

pageMod.PageMod({
  include: "*",
  contentScriptFile: data.url("content.js")
});
