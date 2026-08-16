/**
 * liangzai-cube-kit — 从云享传靓仔管线中抽出的标准 .cube 工具，MIT 授权。
 * 微信 cylbaw · https://www.ybpbyxc.com
 *
 * Adobe .cube：3D 表红变化最快，然后绿，然后蓝。
 */

export type Rgb = readonly [number, number, number]

export interface Cube3D {
  kind: '3d'
  title: string
  size: number
  domainMin: Rgb
  domainMax: Rgb
  /** length = size^3 * 3，顺序 r + size * (g + size * b) */
  table: Float32Array
}

export interface Cube1D {
  kind: '1d'
  title: string
  size: number
  domainMin: Rgb
  domainMax: Rgb
  /** length = size * 3，每行一个 RGB 结点 */
  table: Float32Array
}

export type Cube = Cube3D | Cube1D

export interface CubeMetadata {
  kind: '3d' | '1d'
  title: string
  size: number
  domainMin: Rgb
  domainMax: Rgb
  sampleCount: number
}

function clamp01(value: number): number {
  if (value < 0) return 0
  if (value > 1) return 1
  return value
}

function tableIndex(size: number, r: number, g: number, b: number): number {
  return (r + size * (g + size * b)) * 3
}

function assertDomain(domainMin: Rgb, domainMax: Rgb): void {
  for (let i = 0; i < 3; i += 1) {
    if (!Number.isFinite(domainMin[i]) || !Number.isFinite(domainMax[i])) {
      throw new Error('DOMAIN_MIN / DOMAIN_MAX 必须是有限数字')
    }
    if (domainMax[i] <= domainMin[i]) {
      throw new Error('DOMAIN_MAX 必须大于 DOMAIN_MIN')
    }
  }
}

function parseHeaderLine(
  line: string,
  state: {
    title: string
    size3: number
    size1: number
    domainMin: [number, number, number]
    domainMax: [number, number, number]
  }
): boolean {
  const titleMatch = line.match(/^TITLE\s+"?(.*?)"?$/i)
  if (titleMatch) {
    state.title = titleMatch[1]
    return true
  }
  const size3 = line.match(/^LUT_3D_SIZE\s+(\d+)/i)
  if (size3) {
    state.size3 = Number(size3[1])
    return true
  }
  const size1 = line.match(/^LUT_1D_SIZE\s+(\d+)/i)
  if (size1) {
    state.size1 = Number(size1[1])
    return true
  }
  const minMatch = line.match(/^DOMAIN_MIN\s+([^\s]+)\s+([^\s]+)\s+([^\s]+)/i)
  if (minMatch) {
    state.domainMin = [Number(minMatch[1]), Number(minMatch[2]), Number(minMatch[3])]
    return true
  }
  const maxMatch = line.match(/^DOMAIN_MAX\s+([^\s]+)\s+([^\s]+)\s+([^\s]+)/i)
  if (maxMatch) {
    state.domainMax = [Number(maxMatch[1]), Number(maxMatch[2]), Number(maxMatch[3])]
    return true
  }
  return false
}

function collectRgbSamples(text: string): { samples: number[]; header: ReturnType<typeof emptyHeader> } {
  const header = emptyHeader()
  const samples: number[] = []
  for (const raw of text.split(/\r?\n/)) {
    const line = raw.trim()
    if (!line || line.startsWith('#')) continue
    if (parseHeaderLine(line, header)) continue
    const nums = line.split(/\s+/).map(Number)
    if (nums.length >= 3 && nums.every((n) => Number.isFinite(n))) {
      samples.push(nums[0], nums[1], nums[2])
    }
  }
  return { samples, header }
}

function emptyHeader() {
  return {
    title: 'Untitled',
    size3: 0,
    size1: 0,
    domainMin: [0, 0, 0] as [number, number, number],
    domainMax: [1, 1, 1] as [number, number, number]
  }
}

export function identityCube(size: number, title = 'Identity'): Cube3D {
  if (size < 2 || size > 64) {
    throw new Error(`LUT_3D_SIZE 必须在 2–64，收到 ${size}`)
  }
  const table = new Float32Array(size * size * size * 3)
  const den = size - 1
  for (let b = 0; b < size; b += 1) {
    for (let g = 0; g < size; g += 1) {
      for (let r = 0; r < size; r += 1) {
        const i = tableIndex(size, r, g, b)
        table[i] = r / den
        table[i + 1] = g / den
        table[i + 2] = b / den
      }
    }
  }
  return {
    kind: '3d',
    title,
    size,
    domainMin: [0, 0, 0],
    domainMax: [1, 1, 1],
    table
  }
}

export function identityCube1D(size: number, title = 'Identity 1D'): Cube1D {
  if (size < 2 || size > 4096) {
    throw new Error(`LUT_1D_SIZE 必须在 2–4096，收到 ${size}`)
  }
  const table = new Float32Array(size * 3)
  const den = size - 1
  for (let i = 0; i < size; i += 1) {
    const v = i / den
    table[i * 3] = v
    table[i * 3 + 1] = v
    table[i * 3 + 2] = v
  }
  return {
    kind: '1d',
    title,
    size,
    domainMin: [0, 0, 0],
    domainMax: [1, 1, 1],
    table
  }
}

/** 通用暖调演示格，便于 README / CLI 出对比图。 */
export function warmDemoCube(size = 5): Cube3D {
  const cube = identityCube(size, 'Warm Demo')
  for (let i = 0; i < cube.table.length; i += 3) {
    cube.table[i] = clamp01(cube.table[i] * 1.08 + 0.02)
    cube.table[i + 2] = clamp01(cube.table[i + 2] * 0.9)
  }
  return cube
}

export function parseCube(text: string): Cube3D {
  const { samples, header } = collectRgbSamples(text)
  if (header.size1 > 0 && header.size3 === 0) {
    throw new Error('这是 1D LUT，请使用 parseCube1D()')
  }
  if (header.size3 < 2) {
    throw new Error('缺少有效的 LUT_3D_SIZE')
  }
  assertDomain(header.domainMin, header.domainMax)
  const expected = header.size3 * header.size3 * header.size3 * 3
  if (samples.length !== expected) {
    throw new Error(`点数不对：期望 ${expected / 3} 个 RGB，实际 ${samples.length / 3}`)
  }
  return {
    kind: '3d',
    title: header.title,
    size: header.size3,
    domainMin: header.domainMin,
    domainMax: header.domainMax,
    table: Float32Array.from(samples)
  }
}

export function parseCube1D(text: string): Cube1D {
  const { samples, header } = collectRgbSamples(text)
  if (header.size3 > 0 && header.size1 === 0) {
    throw new Error('这是 3D LUT，请使用 parseCube()')
  }
  if (header.size1 < 2) {
    throw new Error('缺少有效的 LUT_1D_SIZE')
  }
  assertDomain(header.domainMin, header.domainMax)
  const expected = header.size1 * 3
  if (samples.length !== expected) {
    throw new Error(`点数不对：期望 ${header.size1} 个 RGB，实际 ${samples.length / 3}`)
  }
  return {
    kind: '1d',
    title: header.title,
    size: header.size1,
    domainMin: header.domainMin,
    domainMax: header.domainMax,
    table: Float32Array.from(samples)
  }
}

export function stringifyCube(cube: Cube3D): string {
  const lines = [
    `# liangzai-cube-kit · https://www.ybpbyxc.com`,
    `TITLE "${cube.title.replaceAll('"', '')}"`,
    `LUT_3D_SIZE ${cube.size}`,
    `DOMAIN_MIN ${cube.domainMin.join(' ')}`,
    `DOMAIN_MAX ${cube.domainMax.join(' ')}`,
    ''
  ]
  for (let i = 0; i < cube.table.length; i += 3) {
    lines.push(
      `${cube.table[i].toFixed(6)} ${cube.table[i + 1].toFixed(6)} ${cube.table[i + 2].toFixed(6)}`
    )
  }
  return `${lines.join('\n')}\n`
}

export function stringifyCube1D(cube: Cube1D): string {
  const lines = [
    `# liangzai-cube-kit · https://www.ybpbyxc.com`,
    `TITLE "${cube.title.replaceAll('"', '')}"`,
    `LUT_1D_SIZE ${cube.size}`,
    `DOMAIN_MIN ${cube.domainMin.join(' ')}`,
    `DOMAIN_MAX ${cube.domainMax.join(' ')}`,
    ''
  ]
  for (let i = 0; i < cube.table.length; i += 3) {
    lines.push(
      `${cube.table[i].toFixed(6)} ${cube.table[i + 1].toFixed(6)} ${cube.table[i + 2].toFixed(6)}`
    )
  }
  return `${lines.join('\n')}\n`
}

export function cubeMetadata(cube: Cube): CubeMetadata {
  return {
    kind: cube.kind,
    title: cube.title,
    size: cube.size,
    domainMin: cube.domainMin,
    domainMax: cube.domainMax,
    sampleCount: cube.kind === '3d' ? cube.size ** 3 : cube.size
  }
}

function readNode(cube: Cube3D, r: number, g: number, b: number): Rgb {
  const i = tableIndex(cube.size, r, g, b)
  return [cube.table[i], cube.table[i + 1], cube.table[i + 2]]
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t
}

function lerpRgb(a: Rgb, b: Rgb, t: number): Rgb {
  return [lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t)]
}

function normalizeChannel(value: number, min: number, max: number): number {
  return clamp01((value - min) / (max - min || 1))
}

export function sampleCube(cube: Cube3D, r: number, g: number, b: number): Rgb {
  const nr = normalizeChannel(r, cube.domainMin[0], cube.domainMax[0])
  const ng = normalizeChannel(g, cube.domainMin[1], cube.domainMax[1])
  const nb = normalizeChannel(b, cube.domainMin[2], cube.domainMax[2])
  const max = cube.size - 1
  const x = nr * max
  const y = ng * max
  const z = nb * max
  const x0 = Math.floor(x)
  const y0 = Math.floor(y)
  const z0 = Math.floor(z)
  const x1 = Math.min(x0 + 1, max)
  const y1 = Math.min(y0 + 1, max)
  const z1 = Math.min(z0 + 1, max)
  const fx = x - x0
  const fy = y - y0
  const fz = z - z0
  const c000 = readNode(cube, x0, y0, z0)
  const c100 = readNode(cube, x1, y0, z0)
  const c010 = readNode(cube, x0, y1, z0)
  const c110 = readNode(cube, x1, y1, z0)
  const c001 = readNode(cube, x0, y0, z1)
  const c101 = readNode(cube, x1, y0, z1)
  const c011 = readNode(cube, x0, y1, z1)
  const c111 = readNode(cube, x1, y1, z1)
  const c00 = lerpRgb(c000, c100, fx)
  const c10 = lerpRgb(c010, c110, fx)
  const c01 = lerpRgb(c001, c101, fx)
  const c11 = lerpRgb(c011, c111, fx)
  const c0 = lerpRgb(c00, c10, fy)
  const c1 = lerpRgb(c01, c11, fy)
  return lerpRgb(c0, c1, fz)
}

export function sampleCube1D(cube: Cube1D, r: number, g: number, b: number): Rgb {
  const sampleAxis = (value: number, min: number, max: number, channel: 0 | 1 | 2): number => {
    const t = normalizeChannel(value, min, max) * (cube.size - 1)
    const i0 = Math.floor(t)
    const i1 = Math.min(i0 + 1, cube.size - 1)
    const f = t - i0
    return lerp(cube.table[i0 * 3 + channel], cube.table[i1 * 3 + channel], f)
  }
  return [
    sampleAxis(r, cube.domainMin[0], cube.domainMax[0], 0),
    sampleAxis(g, cube.domainMin[1], cube.domainMax[1], 1),
    sampleAxis(b, cube.domainMin[2], cube.domainMax[2], 2)
  ]
}

/** out = in + (lut(in) − in) * intensity。intensity 超出 0–1 时钳制。 */
export function mixSample(cube: Cube3D, r: number, g: number, b: number, intensity: number): Rgb {
  const t = clamp01(intensity)
  const mapped = sampleCube(cube, r, g, b)
  return [lerp(r, mapped[0], t), lerp(g, mapped[1], t), lerp(b, mapped[2], t)]
}

export function applyCubeToRgba8(
  cube: Cube3D,
  pixels: Uint8Array,
  intensity: number
): Uint8Array {
  const out = new Uint8Array(pixels.length)
  for (let i = 0; i < pixels.length; i += 4) {
    const [r, g, b] = mixSample(
      cube,
      pixels[i] / 255,
      pixels[i + 1] / 255,
      pixels[i + 2] / 255,
      intensity
    )
    out[i] = Math.round(clamp01(r) * 255)
    out[i + 1] = Math.round(clamp01(g) * 255)
    out[i + 2] = Math.round(clamp01(b) * 255)
    out[i + 3] = pixels[i + 3]
  }
  return out
}

export function applyCube1DToRgba8(
  cube: Cube1D,
  pixels: Uint8Array,
  intensity: number
): Uint8Array {
  const t = clamp01(intensity)
  const out = new Uint8Array(pixels.length)
  for (let i = 0; i < pixels.length; i += 4) {
    const r = pixels[i] / 255
    const g = pixels[i + 1] / 255
    const b = pixels[i + 2] / 255
    const mapped = sampleCube1D(cube, r, g, b)
    out[i] = Math.round(clamp01(lerp(r, mapped[0], t)) * 255)
    out[i + 1] = Math.round(clamp01(lerp(g, mapped[1], t)) * 255)
    out[i + 2] = Math.round(clamp01(lerp(b, mapped[2], t)) * 255)
    out[i + 3] = pixels[i + 3]
  }
  return out
}
