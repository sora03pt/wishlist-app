export const maxSourceImageSize = 20 * 1024 * 1024;

const optimizedImageMaxDimension = 1200;
const optimizedImageQuality = 0.85;

function getOptimizedImageFileName(fileName: string) {
  const baseName = fileName.replace(/\.[^.]+$/, "").trim() || "wishlist-image";

  return `${baseName}.webp`;
}

function createImageBlobFromCanvas(
  canvas: HTMLCanvasElement,
  type: string,
  quality: number,
) {
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob);
          return;
        }

        reject(new Error("画像の変換に失敗しました。"));
      },
      type,
      quality,
    );
  });
}

function loadImageElement(file: File) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const image = document.createElement("img");

    image.onload = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(image);
    };
    image.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("画像を読み込めませんでした。"));
    };
    image.src = objectUrl;
  });
}

export async function optimizeWishlistImage(file: File) {
  const image = await loadImageElement(file);
  const sourceWidth = image.naturalWidth;
  const sourceHeight = image.naturalHeight;

  if (sourceWidth <= 0 || sourceHeight <= 0) {
    throw new Error("画像を読み込めませんでした。");
  }

  const scale = Math.min(
    1,
    optimizedImageMaxDimension / Math.max(sourceWidth, sourceHeight),
  );
  const canvasWidth = Math.round(sourceWidth * scale);
  const canvasHeight = Math.round(sourceHeight * scale);
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");

  if (!context) {
    throw new Error("画像の変換に失敗しました。");
  }

  canvas.width = canvasWidth;
  canvas.height = canvasHeight;
  context.drawImage(
    image,
    0,
    0,
    sourceWidth,
    sourceHeight,
    0,
    0,
    canvasWidth,
    canvasHeight,
  );

  const blob = await createImageBlobFromCanvas(
    canvas,
    "image/webp",
    optimizedImageQuality,
  );

  return new File([blob], getOptimizedImageFileName(file.name), {
    lastModified: Date.now(),
    type: "image/webp",
  });
}
