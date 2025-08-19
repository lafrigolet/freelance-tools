// helper to load an image element from a data URL
function createImage(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.addEventListener("load", () => resolve(img));
    img.addEventListener("error", (err) => reject(err));
    img.setAttribute("crossOrigin", "anonymous"); // avoid CORS issues
    img.src = url;
  });
}

// main function: crop a File and return a new File
export async function getCroppedFile(file, crop, zoom) {
  // Convert File -> data URL
  const reader = new FileReader();
  const dataUrl = await new Promise((resolve, reject) => {
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

  const image = await createImage(dataUrl);

  // For now, this just makes a square crop in the center.
  // Later we can extend this to use the crop rect from react-easy-crop.
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  const size = Math.min(image.width, image.height);
  canvas.width = size;
  canvas.height = size;

  ctx.drawImage(
    image,
    (image.width - size) / 2,
    (image.height - size) / 2,
    size,
    size,
    0,
    0,
    size,
    size
  );

  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      const croppedFile = new File([blob], file.name, { type: file.type });
      resolve(croppedFile);
    }, file.type);
  });
}
