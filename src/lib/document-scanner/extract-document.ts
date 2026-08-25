import { warpPerspective } from "./perspective-warp";
import type { CornerPoints } from "./types";

// A4-ish portrait ratio — most prescriptions/reports/bills are portrait
// documents, and a fixed output size keeps thumbnails consistent in the vault.
const OUTPUT_WIDTH = 1000;
const OUTPUT_HEIGHT = 1414;

// Perspective-corrects the captured photo down to just the document, given the
// four (possibly user-adjusted) corners. Returns a JPEG Blob.
//
// Takes the source Blob directly and decodes it via createImageBitmap rather
// than routing through an `HTMLImageElement` + `.decode()` — a *second* Image
// pointed at a blob: URL that's already rendering elsewhere in the DOM (the
// corner-adjuster's preview) was observed to hang indefinitely in testing.
// createImageBitmap has no such DOM-attachment dependency.
export async function extractDocument(source: Blob, corners: CornerPoints): Promise<Blob> {
  const bitmap = await createImageBitmap(source);
  const sourceCanvas = document.createElement("canvas");
  sourceCanvas.width = bitmap.width;
  sourceCanvas.height = bitmap.height;
  sourceCanvas.getContext("2d")!.drawImage(bitmap, 0, 0);
  bitmap.close();

  const canvas = warpPerspective(sourceCanvas, corners, OUTPUT_WIDTH, OUTPUT_HEIGHT);

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("Couldn't export the image"))),
      "image/jpeg",
      0.92
    );
  });
}

// Default corner guess when auto-detection didn't find anything — inset a bit
// so the drag handles start on-image rather than exactly at the edge.
export function defaultCorners(width: number, height: number): CornerPoints {
  const insetX = width * 0.06;
  const insetY = height * 0.06;
  return {
    topLeftCorner: { x: insetX, y: insetY },
    topRightCorner: { x: width - insetX, y: insetY },
    bottomLeftCorner: { x: insetX, y: height - insetY },
    bottomRightCorner: { x: width - insetX, y: height - insetY },
  };
}
