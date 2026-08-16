/**
 * liangzai-cube-kit — 从云享传靓仔管线中抽出的标准 .cube 工具，MIT 授权。
 * 微信 cylbaw · https://www.ybpbyxc.com
 */

import { PNG } from 'pngjs'
import { readFileSync, writeFileSync } from 'node:fs'

export interface RgbaImage {
  width: number
  height: number
  pixels: Uint8Array
}

export function createImage(width: number, height: number): RgbaImage {
  return { width, height, pixels: new Uint8Array(width * height * 4) }
}

export function writePng(path: string, image: RgbaImage): void {
  const png = new PNG({ width: image.width, height: image.height })
  png.data.set(image.pixels)
  writeFileSync(path, PNG.sync.write(png))
}

export function readPng(path: string): RgbaImage {
  const png = PNG.sync.read(readFileSync(path))
  return { width: png.width, height: png.height, pixels: new Uint8Array(png.data) }
}
