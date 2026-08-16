/**
 * liangzai-cube-kit — 从云享传靓仔管线中抽出的标准 .cube 工具，MIT 授权。
 * 微信 cylbaw · https://www.ybpbyxc.com
 *
 * 教科书级曝光 / 色温。不是产品 RAW 白平衡，也不是成片管线。
 */

export type Rgb = readonly [number, number, number]

const REF_KELVIN = 6500

function clamp01(value: number): number {
  if (value < 0) return 0
  if (value > 1) return 1
  return value
}

export function clampKelvin(kelvin: number): number {
  if (!Number.isFinite(kelvin)) return REF_KELVIN
  return Math.min(40000, Math.max(1000, kelvin))
}

/** Tanner Helland 近似：Kelvin → sRGB 三通道 0–1。 */
export function kelvinToRgb(kelvin: number): Rgb {
  const temp = clampKelvin(kelvin) / 100
  let r: number
  let g: number
  let b: number
  if (temp <= 66) {
    r = 255
    g = 99.4708025861 * Math.log(temp) - 161.1195681661
    b = temp <= 19 ? 0 : 138.5177312231 * Math.log(temp - 10) - 305.0447927307
  } else {
    r = 329.698727446 * (temp - 60) ** -0.1332047592
    g = 288.1221695283 * (temp - 60) ** -0.0755148492
    b = 255
  }
  return [clamp01(r / 255), clamp01(g / 255), clamp01(b / 255)]
}

export function kelvinToRgbGain(kelvin: number, referenceKelvin = REF_KELVIN): Rgb {
  const src = kelvinToRgb(kelvin)
  const ref = kelvinToRgb(referenceKelvin)
  return [src[0] / (ref[0] || 1), src[1] / (ref[1] || 1), src[2] / (ref[2] || 1)]
}

/** rgb × 2^ev。ev 非有限数字时当作 0。 */
export function applyExposure(r: number, g: number, b: number, ev: number): Rgb {
  const stops = Number.isFinite(ev) ? ev : 0
  const scale = 2 ** stops
  return [r * scale, g * scale, b * scale]
}

export function applyColorTemperature(
  r: number,
  g: number,
  b: number,
  kelvin: number,
  referenceKelvin = REF_KELVIN
): Rgb {
  const [gr, gg, gb] = kelvinToRgbGain(kelvin, referenceKelvin)
  return [r * gr, g * gg, b * gb]
}

export function applyBasicGradeToRgba8(
  pixels: Uint8Array,
  options: { ev?: number; kelvin?: number; referenceKelvin?: number } = {}
): Uint8Array {
  const ev = options.ev ?? 0
  const kelvin = options.kelvin ?? REF_KELVIN
  const referenceKelvin = options.referenceKelvin ?? REF_KELVIN
  const out = new Uint8Array(pixels.length)
  for (let i = 0; i < pixels.length; i += 4) {
    let r = pixels[i] / 255
    let g = pixels[i + 1] / 255
    let b = pixels[i + 2] / 255
    ;[r, g, b] = applyExposure(r, g, b, ev)
    ;[r, g, b] = applyColorTemperature(r, g, b, kelvin, referenceKelvin)
    out[i] = Math.round(clamp01(r) * 255)
    out[i + 1] = Math.round(clamp01(g) * 255)
    out[i + 2] = Math.round(clamp01(b) * 255)
    out[i + 3] = pixels[i + 3]
  }
  return out
}
