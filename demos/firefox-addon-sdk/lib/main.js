var buttons = require("sdk/ui/button/action");
var tabs = require("sdk/tabs");

var button = buttons.ActionButton({
  id: "mozilla-link",
  label: "Cats!",
  icon: {
    "32": "./icon.png",
  },
  onClick: function handleClick(state) {
    tabs.open("https://www.google.com/search?q=cat&tbm=isch");
  }
});

var data = require("sdk/self").data;
var pageMod = require("sdk/page-mod");

pageMod.PageMod({
  include: "*",
  contentScriptFile: data.url("content.js")
});
