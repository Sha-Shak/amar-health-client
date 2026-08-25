import type { CornerPoints } from "./types";

// Perspective-corrects a quad region of a source canvas into a rectangular
// output canvas — the "flatten a photographed document" step. Previously this
// ran through OpenCV.js (an ~9MB WASM build) purely for getPerspectiveTransform
// + warpPerspective; that's a lot of surface area (WASM instantiation, a manual
// heap the JS GC can't see, a third-party vendored build) for one small
// geometric transform. This is that transform written directly against the
// Canvas 2D API and plain math instead — no WASM, no external dependency,
// nothing that can leak or fail to load.
//
// The math: a projective mapping from the unit square (0,0)-(1,0)-(1,1)-(0,1)
// to an arbitrary quad has a closed-form solution (no matrix inversion
// needed) — see Paul Heckbert's "Fundamentals of Texture Mapping and Image
// Warping" (1989), §3. Because our *destination* is always a plain rectangle,
// mapping (destX/width, destY/height) through this unit-square-to-quad
// function directly gives the corresponding source pixel — exactly the
// inverse mapping a resampler needs, with no separate forward/inverse step.
function unitSquareToQuad(corners: CornerPoints) {
  const { topLeftCorner: p0, topRightCorner: p1, bottomRightCorner: p2, bottomLeftCorner: p3 } = corners;

  const dx1 = p1.x - p2.x;
  const dx2 = p3.x - p2.x;
  const dx3 = p0.x - p1.x + p2.x - p3.x;
  const dy1 = p1.y - p2.y;
  const dy2 = p3.y - p2.y;
  const dy3 = p0.y - p1.y + p2.y - p3.y;

  let a: number, b: number, c: number, d: number, e: number, f: number, g: number, h: number;

  if (Math.abs(dx3) < 1e-9 && Math.abs(dy3) < 1e-9) {
    // Already a parallelogram — the degenerate (and much simpler) affine case.
    a = p1.x - p0.x;
    b = p2.x - p1.x;
    c = p0.x;
    d = p1.y - p0.y;
    e = p2.y - p1.y;
    f = p0.y;
    g = 0;
    h = 0;
  } else {
    const denom = dx1 * dy2 - dx2 * dy1;
    g = (dx3 * dy2 - dx2 * dy3) / denom;
    h = (dx1 * dy3 - dx3 * dy1) / denom;
    a = p1.x - p0.x + g * p1.x;
    b = p3.x - p0.x + h * p3.x;
    c = p0.x;
    d = p1.y - p0.y + g * p1.y;
    e = p3.y - p0.y + h * p3.y;
    f = p0.y;
  }

  return (u: number, v: number): [number, number] => {
    const denom = g * u + h * v + 1;
    return [(a * u + b * v + c) / denom, (d * u + e * v + f) / denom];
  };
}

// Bilinear sample of `src` at fractional (x, y); returns 0 (transparent black)
// outside the source bounds rather than throwing, so a slightly-off corner
// drag never produces garbage pixels at the output's edge.
function sampleBilinear(
  src: Uint8ClampedArray,
  srcWidth: number,
  srcHeight: number,
  x: number,
  y: number,
  out: [number, number, number, number]
) {
  const x0 = Math.floor(x);
  const y0 = Math.floor(y);
  const x1 = x0 + 1;
  const y1 = y0 + 1;
  const fx = x - x0;
  const fy = y - y0;

  function px(sx: number, sy: number, channel: number): number {
    if (sx < 0 || sy < 0 || sx >= srcWidth || sy >= srcHeight) return 0;
    return src[(sy * srcWidth + sx) * 4 + channel];
  }

  for (let c = 0; c < 4; c++) {
    const top = px(x0, y0, c) * (1 - fx) + px(x1, y0, c) * fx;
    const bottom = px(x0, y1, c) * (1 - fx) + px(x1, y1, c) * fx;
    out[c] = top * (1 - fy) + bottom * fy;
  }
}

export function warpPerspective(
  source: HTMLCanvasElement,
  corners: CornerPoints,
  outputWidth: number,
  outputHeight: number
): HTMLCanvasElement {
  const srcCtx = source.getContext("2d")!;
  const srcData = srcCtx.getImageData(0, 0, source.width, source.height);

  const output = document.createElement("canvas");
  output.width = outputWidth;
  output.height = outputHeight;
  const outCtx = output.getContext("2d")!;
  const outData = outCtx.createImageData(outputWidth, outputHeight);

  const mapToSource = unitSquareToQuad(corners);
  const pixel: [number, number, number, number] = [0, 0, 0, 0];

  for (let py = 0; py < outputHeight; py++) {
    const v = py / outputHeight;
    for (let px = 0; px < outputWidth; px++) {
      const u = px / outputWidth;
      const [sx, sy] = mapToSource(u, v);
      sampleBilinear(srcData.data, source.width, source.height, sx, sy, pixel);
      const i = (py * outputWidth + px) * 4;
      outData.data[i] = pixel[0];
      outData.data[i + 1] = pixel[1];
      outData.data[i + 2] = pixel[2];
      outData.data[i + 3] = 255;
    }
  }

  outCtx.putImageData(outData, 0, 0);
  return output;
}
