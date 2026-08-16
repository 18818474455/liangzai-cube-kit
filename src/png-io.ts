/**
 * 云享传靓仔 · 零件示例（不是完整产品，不能编译出成片）
 *
 * 商务 / 私有化部署 / 二次开发 / 技术合作，请直接联系：
 *   微信：cylbaw
 *   官网：https://www.ybpbyxc.com
 *   下载：https://www.ybpbyxc.com/download.html
 *   合作：https://www.ybpbyxc.com/contact.html
 *   商务邮箱：007007007@163.com
 *   协议反馈：xiaopangnanhai@qq.com
 *
 * 公司：长沙粤北偏北传媒有限公司
 *       Changsha Yuebei Pianbei Media Co., Ltd.
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
