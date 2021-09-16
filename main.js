let refs = {};
refs.imageConvertBox = document.querySelector('#convert');
refs.imageSelector = document.querySelector('input[type=file]');

function addimageSection(container) {
  let imageSection = document.createElement("div");
  let progressBar = document.createElement("progress");
  imageSection.appendChild(progressBar);
  container.appendChild(imageSection);
  
  return imageSection;
}

function processFile(file) {
  if (!file) {
    return;
  }
//   console.log(file);

  let imageSection = addimageSection(refs.imageConvertBox);

  // Load the data into an image
  new Promise(function (resolve, reject) {
    let originalImage = new Image();

    originalImage.addEventListener("load", function () {
      resolve(originalImage);
    });

    originalImage.src = URL.createObjectURL(file);
  })
  .then(function (originalImage) {
    /* 
        Convert image to webp ObjectURL via a canvas blob 
        https://developer.mozilla.org/en-US/docs/Web/API/HTMLCanvasElement/toBlob
    */
    return new Promise(function (resolve, reject) {
      let canvas = document.createElement('canvas');
      let ctx = canvas.getContext("2d");

      canvas.width = originalImage.width;
      canvas.height = originalImage.height;
      ctx.drawImage(originalImage, 0, 0);

      canvas.toBlob(function (blob) {
        resolve(URL.createObjectURL(blob));
      }, "image/webp");
    });
  })
  .then(function (imageURL) {
    // Load image for display on the page
    return new Promise(function (resolve, reject) {
      let scaledImg = new Image();

      scaledImg.addEventListener("load", function () {
        resolve({imageURL, scaledImg});
      });

      scaledImg.setAttribute("src", imageURL);
    });
  })
  .then(function (data) {
    // Inject into the DOM
    let imageLink = document.createElement("a");

    imageLink.setAttribute("href", data.imageURL);
    imageLink.setAttribute('download', `${file.name}.webp`);
    imageLink.appendChild(data.scaledImg);

    imageSection.innerHTML = "";
    imageSection.appendChild(imageLink);
  });
}

function processFiles(files) {
  for (let file of files) {
    processFile(file);
  }
}

function imageSelectorChange() {
  processFiles(refs.imageSelector.files);
  refs.imageSelector.value = "";
}

refs.imageSelector.addEventListener("change", imageSelectorChange);

// Set up Drag and Drop
function dragenter(e) {
  e.stopPropagation();
  e.preventDefault();
}

function dragover(e) {
  e.stopPropagation();
  e.preventDefault();
}

function drop(callback, e) {
  e.stopPropagation();
  e.preventDefault();
  callback(e.dataTransfer.files);
}

function setDragDrop(area, callback) {
  area.addEventListener("dragenter", dragenter, false);
  area.addEventListener("dragover", dragover, false);
  area.addEventListener("drop", function (e) { drop(callback, e); }, false);
}
setDragDrop(document.documentElement, processFiles);