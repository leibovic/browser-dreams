// Content script
var images = document.querySelectorAll("img");
console.log("Replacing " + images.length + " images");

for (var i = 0; i < images.length; i++) {
  images[i].src = "http://upload.wikimedia.org/wikipedia/commons/thumb/2/22/Turkish_Van_Cat.jpg/819px-Turkish_Van_Cat.jpg";
}
