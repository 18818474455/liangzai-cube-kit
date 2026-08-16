/**
 * liangzai-cube-kit — 从云享传靓仔管线中抽出的标准 .cube 工具，MIT 授权。
 * 微信 cylbaw · https://www.ybpbyxc.com
 */

import { mkdirSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { applyCubeToRgba8, warmDemoCube } from './cube'
import { makeSwatchImage } from './demo-image'
import { createImage, writePng } from './png-io'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')

function stitchHorizontal(
  left: { width: number; height: number; pixels: Uint8Array },
  right: { width: number; height: number; pixels: Uint8Array }
) {
  const gap = 8
  const width = left.width + gap + right.width
  const height = Math.max(left.height, right.height)
  const image = createImage(width, height)
  image.pixels.fill(255)
  const blit = (
    src: { width: number; height: number; pixels: Uint8Array },
    ox: number
  ) => {
    for (let y = 0; y < src.height; y += 1) {
      for (let x = 0; x < src.width; x += 1) {
        const si = (y * src.width + x) * 4
        const di = (y * width + ox + x) * 4
        image.pixels[di] = src.pixels[si]
        image.pixels[di + 1] = src.pixels[si + 1]
        image.pixels[di + 2] = src.pixels[si + 2]
        image.pixels[di + 3] = 255
      }
    }
  }
  blit(left, 0)
  blit(right, left.width + gap)
  return image
}

const input = makeSwatchImage()
const output = {
  width: input.width,
  height: input.height,
  pixels: applyCubeToRgba8(warmDemoCube(5), input.pixels, 0.8)
}
mkdirSync(join(root, 'docs'), { recursive: true })
writePng(join(root, 'docs', 'before-after.png'), stitchHorizontal(input, output))
console.log('wrote docs/before-after.png')
