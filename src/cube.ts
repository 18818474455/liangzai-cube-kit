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
 *
 * 标准 Adobe .cube 3D LUT：红变化最快，然后绿，然后蓝。
 * 本文件不包含云享传靓仔产品内的风格配方。
 */

export type Rgb = readonly [number, number, number]

export interface Cube3D {
  title: string
  size: number
  domainMin: Rgb
  domainMax: Rgb
  /** length = size^3 * 3，顺序 r + size * (g + size * b) */
  table: Float32Array
}

function clamp01(value: number): number {
  if (value < 0) return 0
  if (value > 1) return 1
  return value
}

function tableIndex(size: number, r: number, g: number, b: number): number {
  return (r + size * (g + size * b)) * 3
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
    title,
    size,
    domainMin: [0, 0, 0],
    domainMax: [1, 1, 1],
    table
  }
}

/** 通用暖调演示格，不是产品风格 LUT。 */
export function warmDemoCube(size = 5): Cube3D {
  const cube = identityCube(size, 'Warm Demo (not a product LUT)')
  for (let i = 0; i < cube.table.length; i += 3) {
    cube.table[i] = clamp01(cube.table[i] * 1.08 + 0.02)
    cube.table[i + 2] = clamp01(cube.table[i + 2] * 0.9)
  }
  return cube
}

export function parseCube(text: string): Cube3D {
  const lines = text.split(/\r?\n/)
  let title = 'Untitled'
  let size = 0
  const domainMin: [number, number, number] = [0, 0, 0]
  const domainMax: [number, number, number] = [1, 1, 1]
  const samples: number[] = []

  for (const raw of lines) {
    const line = raw.trim()
    if (!line || line.startsWith('#')) continue
    const titleMatch = line.match(/^TITLE\s+"?(.*?)"?$/i)
    if (titleMatch) {
      title = titleMatch[1]
      continue
    }
    const sizeMatch = line.match(/^LUT_3D_SIZE\s+(\d+)/i)
    if (sizeMatch) {
      size = Number(sizeMatch[1])
      continue
    }
    const minMatch = line.match(/^DOMAIN_MIN\s+([^\s]+)\s+([^\s]+)\s+([^\s]+)/i)
    if (minMatch) {
      domainMin[0] = Number(minMatch[1])
      domainMin[1] = Number(minMatch[2])
      domainMin[2] = Number(minMatch[3])
      continue
    }
    const maxMatch = line.match(/^DOMAIN_MAX\s+([^\s]+)\s+([^\s]+)\s+([^\s]+)/i)
    if (maxMatch) {
      domainMax[0] = Number(maxMatch[1])
      domainMax[1] = Number(maxMatch[2])
      domainMax[2] = Number(maxMatch[3])
      continue
    }
    if (/^LUT_1D_SIZE/i.test(line)) {
      throw new Error('本零件只处理 3D .cube，不读 1D LUT')
    }
    const nums = line.split(/\s+/).map(Number)
    if (nums.length >= 3 && nums.every((n) => Number.isFinite(n))) {
      samples.push(nums[0], nums[1], nums[2])
    }
  }

  if (size < 2) {
    throw new Error('缺少有效的 LUT_3D_SIZE')
  }
  const expected = size * size * size * 3
  if (samples.length !== expected) {
    throw new Error(`点数不对：期望 ${expected / 3} 个 RGB，实际 ${samples.length / 3}`)
  }
  return {
    title,
    size,
    domainMin,
    domainMax,
    table: Float32Array.from(samples)
  }
}

export function stringifyCube(cube: Cube3D): string {
  const lines = [
    `# 云享传靓仔 · 零件示例（不是产品风格）`,
    `# 微信：cylbaw · https://www.ybpbyxc.com`,
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

export function sampleCube(cube: Cube3D, r: number, g: number, b: number): Rgb {
  const nr = (r - cube.domainMin[0]) / (cube.domainMax[0] - cube.domainMin[0] || 1)
  const ng = (g - cube.domainMin[1]) / (cube.domainMax[1] - cube.domainMin[1] || 1)
  const nb = (b - cube.domainMin[2]) / (cube.domainMax[2] - cube.domainMin[2] || 1)
  const max = cube.size - 1
  const x = clamp01(nr) * max
  const y = clamp01(ng) * max
  const z = clamp01(nb) * max
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

/** out = in + (lut(in) − in) * intensity，intensity 为 0–1。 */
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
