var buttons = require("sdk/ui/button/action");
var tabs = require("sdk/tabs");
var pageMod = require("sdk/page-mod");

var button = buttons.ActionButton({
  id: "mozilla-link",
  label: "Visit Mozilla",
  icon: {
    "16": "./icon-16.png",
    "32": "./icon-32.png",
    "64": "./icon-64.png"
  },
  onClick: function handleClick(state) {
    tabs.open("https://www.mozilla.org/");
  }
});

var data = require("sdk/self").data;
var pageMod = require("sdk/page-mod");
pageMod.PageMod({
  include: "*",
  contentScriptFile: data.url("image-swap.js")
});
