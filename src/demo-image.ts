/**
 * liangzai-cube-kit — 从云享传靓仔管线中抽出的标准 .cube 工具，MIT 授权。
 * 微信 cylbaw · https://www.ybpbyxc.com
 */

import { createImage, type RgbaImage } from './png-io'

function setPixel(image: RgbaImage, x: number, y: number, r: number, g: number, b: number): void {
  const i = (y * image.width + x) * 4
  image.pixels[i] = r
  image.pixels[i + 1] = g
  image.pixels[i + 2] = b
  image.pixels[i + 3] = 255
}

function hsvToRgb(h: number, s: number, v: number): [number, number, number] {
  const i = Math.floor(h * 6)
  const f = h * 6 - i
  const p = v * (1 - s)
  const q = v * (1 - f * s)
  const t = v * (1 - (1 - f) * s)
  const channels = [
    [v, t, p],
    [q, v, p],
    [p, v, t],
    [p, q, v],
    [t, p, v],
    [v, p, q]
  ][i % 6]
  return [Math.round(channels[0] * 255), Math.round(channels[1] * 255), Math.round(channels[2] * 255)]
}

export function makeSwatchImage(width = 480, height = 270): RgbaImage {
  const image = createImage(width, height)
  const mid = Math.floor(width / 2)
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      if (x < mid) {
        const [r, g, b] = hsvToRgb(x / mid, 0.85, 0.9)
        setPixel(image, x, y, r, g, b)
      } else {
        const gray = Math.round(((x - mid) / (width - mid - 1 || 1)) * 255)
        setPixel(image, x, y, gray, gray, gray)
      }
    }
  }

  const patches: Array<[number, number, number, number]> = [
    [16, 16, 72, 56],
    [96, 16, 152, 56],
    [176, 16, 232, 56],
    [16, 72, 72, 112],
    [96, 72, 152, 112],
    [176, 72, 232, 112]
  ]
  const colors: Array<[number, number, number]> = [
    [220, 176, 150],
    [70, 140, 210],
    [60, 150, 80],
    [240, 220, 80],
    [200, 60, 60],
    [90, 90, 90]
  ]
  patches.forEach((box, idx) => {
    const [x0, y0, x1, y1] = box
    const [r, g, b] = colors[idx]
    for (let y = y0; y < y1; y += 1) {
      for (let x = x0; x < x1; x += 1) {
        setPixel(image, x, y, r, g, b)
      }
    }
  })
  return image
}
