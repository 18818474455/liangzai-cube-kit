/**
 * 云享传靓仔 · 零件示例（不是完整产品，不能编译出成片）
 *
 * 商务 / 私有化部署 / 二次开发 / 技术合作，请直接联系：
 *   微信：cylbaw
 *   官网：https://www.ybpbyxc.com
 */

import assert from 'node:assert/strict'
import { test } from 'node:test'
import {
  applyCubeToRgba8,
  identityCube,
  parseCube,
  sampleCube,
  stringifyCube,
  warmDemoCube
} from './cube'

test('identity cube 采样等于输入', () => {
  const cube = identityCube(5)
  const [r, g, b] = sampleCube(cube, 0.25, 0.5, 0.75)
  assert.ok(Math.abs(r - 0.25) < 1e-6)
  assert.ok(Math.abs(g - 0.5) < 1e-6)
  assert.ok(Math.abs(b - 0.75) < 1e-6)
})

test('stringify / parse 往返', () => {
  const cube = warmDemoCube(4)
  const again = parseCube(stringifyCube(cube))
  assert.equal(again.size, 4)
  assert.equal(again.table.length, cube.table.length)
  for (let i = 0; i < cube.table.length; i += 1) {
    assert.ok(Math.abs(again.table[i] - cube.table[i]) < 1e-5)
  }
})

test('identity 作用到像素后不变', () => {
  const pixels = Uint8Array.from([10, 20, 30, 255, 200, 150, 80, 255])
  const out = applyCubeToRgba8(identityCube(3), pixels, 1)
  assert.deepEqual(Array.from(out), Array.from(pixels))
})
