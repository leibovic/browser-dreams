var buttons = require("sdk/ui/button/action");
var tabs = require("sdk/tabs");
var pageMod = require("sdk/page-mod");

var button = buttons.ActionButton({
  id: "mozilla-link",
  label: "Visit Mozilla",
  icon: {
    "32": "./nyan.png",
  },
  onClick: function handleClick(state) {
    tabs.open("https://www.google.com/search?q=cat&tbm=isch");
  }
});

var data = require("sdk/self").data;
var pageMod = require("sdk/page-mod");
pageMod.PageMod({
  include: "*",
  contentScriptFile: data.url("image-swap.js")
});
