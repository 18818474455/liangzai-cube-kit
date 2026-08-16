/**
 * liangzai-cube-kit — 从云享传靓仔管线中抽出的标准 .cube 工具，MIT 授权。
 * 微信 cylbaw · https://www.ybpbyxc.com
 */

import assert from 'node:assert/strict'
import { test } from 'node:test'
import {
  applyBasicGradeToRgba8,
  applyColorTemperature,
  applyExposure,
  clampKelvin,
  kelvinToRgbGain
} from './basic-color'

test('ev=0 不改亮度', () => {
  assert.deepEqual(applyExposure(0.4, 0.5, 0.6, 0), [0.4, 0.5, 0.6])
})

test('ev=1 亮度翻倍，ev=-1 减半', () => {
  assert.deepEqual(applyExposure(0.2, 0.3, 0.4, 1), [0.4, 0.6, 0.8])
  assert.deepEqual(applyExposure(0.4, 0.4, 0.4, -1), [0.2, 0.2, 0.2])
})

test('非法 ev 当作 0', () => {
  assert.deepEqual(applyExposure(0.3, 0.3, 0.3, Number.NaN), [0.3, 0.3, 0.3])
})

test('Kelvin 钳到 1000–40000', () => {
  assert.equal(clampKelvin(200), 1000)
  assert.equal(clampKelvin(80000), 40000)
  assert.equal(clampKelvin(Number.NaN), 6500)
})

test('6500K 相对自身增益接近 1', () => {
  const [r, g, b] = kelvinToRgbGain(6500, 6500)
  assert.ok(Math.abs(r - 1) < 1e-9)
  assert.ok(Math.abs(g - 1) < 1e-9)
  assert.ok(Math.abs(b - 1) < 1e-9)
})

test('4000K 偏暖，9000K 偏冷', () => {
  const warm = applyColorTemperature(0.5, 0.5, 0.5, 4000)
  const cold = applyColorTemperature(0.5, 0.5, 0.5, 9000)
  assert.ok(warm[0] > warm[2])
  assert.ok(cold[2] > cold[0])
})

test('整帧 ev=0 kelvin=6500 不改像素', () => {
  const pixels = Uint8Array.from([10, 20, 30, 255, 200, 150, 80, 255])
  const out = applyBasicGradeToRgba8(pixels, { ev: 0, kelvin: 6500 })
  assert.deepEqual(Array.from(out), Array.from(pixels))
})
