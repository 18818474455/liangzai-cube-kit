/**
 * liangzai-cube-kit — 从云享传靓仔管线中抽出的标准 .cube 工具，MIT 授权。
 * 微信 cylbaw · https://www.ybpbyxc.com
 */

import assert from 'node:assert/strict'
import { test } from 'node:test'
import {
  applyCube1DToRgba8,
  applyCubeToRgba8,
  cubeMetadata,
  identityCube,
  identityCube1D,
  mixSample,
  parseCube,
  parseCube1D,
  sampleCube,
  sampleCube1D,
  stringifyCube,
  stringifyCube1D,
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
  assert.equal(again.kind, '3d')
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

test('拒绝 1D LUT', () => {
  const text = ['LUT_1D_SIZE 2', '0 0 0', '1 1 1'].join('\n')
  assert.throws(() => parseCube(text), /1D LUT/)
})

test('点数不匹配报错', () => {
  const text = ['LUT_3D_SIZE 2', '0 0 0', '1 1 1'].join('\n')
  assert.throws(() => parseCube(text), /点数不对/)
})

test('DOMAIN_MAX 不大于 MIN 时报错', () => {
  const broken = stringifyCube(identityCube(2)).replace('DOMAIN_MAX 1 1 1', 'DOMAIN_MAX 0 1 1')
  assert.throws(() => parseCube(broken), /DOMAIN_MAX/)
})

test('采样超出 DOMAIN 时钳到端点', () => {
  const cube = identityCube(2)
  const low = sampleCube(cube, -2, -2, -2)
  const high = sampleCube(cube, 3, 3, 3)
  assert.deepEqual(low, [0, 0, 0])
  assert.deepEqual(high, [1, 1, 1])
})

test('intensity 越界钳制', () => {
  const cube = warmDemoCube(3)
  const under = mixSample(cube, 0.4, 0.4, 0.4, -3)
  const zero = mixSample(cube, 0.4, 0.4, 0.4, 0)
  const over = mixSample(cube, 0.2, 0.2, 0.2, 8)
  const full = mixSample(cube, 0.2, 0.2, 0.2, 1)
  assert.deepEqual(under, zero)
  assert.deepEqual(over, full)
})

test('已知 2 格插值：R 轴中点精确为 0.5', () => {
  const cube = identityCube(2)
  const [r, g, b] = sampleCube(cube, 0.5, 0, 0)
  assert.equal(r, 0.5)
  assert.equal(g, 0)
  assert.equal(b, 0)
})

test('已知 2 格插值：自定义结点 0.25→0.75 的中点为 0.5', () => {
  const cube = identityCube(2)
  cube.table[0] = 0.25
  cube.table[3] = 0.75
  const [r] = sampleCube(cube, 0.5, 0, 0)
  assert.equal(r, 0.5)
})

test('1D identity 往返与采样', () => {
  const cube = identityCube1D(5)
  const again = parseCube1D(stringifyCube1D(cube))
  assert.equal(again.kind, '1d')
  assert.equal(again.size, 5)
  const [r, g, b] = sampleCube1D(again, 0.25, 0.5, 0.75)
  assert.ok(Math.abs(r - 0.25) < 1e-6)
  assert.ok(Math.abs(g - 0.5) < 1e-6)
  assert.ok(Math.abs(b - 0.75) < 1e-6)
})

test('1D identity 不改像素', () => {
  const pixels = Uint8Array.from([12, 34, 56, 255])
  const out = applyCube1DToRgba8(identityCube1D(8), pixels, 1)
  assert.deepEqual(Array.from(out), Array.from(pixels))
})

test('cubeMetadata 导出 3D / 1D', () => {
  assert.deepEqual(cubeMetadata(identityCube(3)), {
    kind: '3d',
    title: 'Identity',
    size: 3,
    domainMin: [0, 0, 0],
    domainMax: [1, 1, 1],
    sampleCount: 27
  })
  assert.equal(cubeMetadata(identityCube1D(16)).sampleCount, 16)
})
