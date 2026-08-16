/**
 * liangzai-cube-kit — 从云享传靓仔管线中抽出的标准 .cube 工具，MIT 授权。
 * 微信 cylbaw · https://www.ybpbyxc.com
 */

import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { printContact, WECHAT_ID } from './contact'
import { applyCubeToRgba8, cubeMetadata, parseCube, stringifyCube, warmDemoCube } from './cube'
import { makeSwatchImage } from './demo-image'
import { writePng } from './png-io'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')

function parseArgs(argv: string[]): { cubePath?: string; intensity: number } {
  let cubePath: string | undefined
  let intensity = 0.8
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i]
    if (arg === '--intensity') {
      intensity = Number(argv[i + 1])
      i += 1
      continue
    }
    if (!arg.startsWith('-')) cubePath = arg
  }
  if (!Number.isFinite(intensity)) {
    throw new Error('--intensity 必须是数字')
  }
  return { cubePath, intensity }
}

function main(): void {
  const { cubePath, intensity } = parseArgs(process.argv.slice(2))
  const outDir = join(root, 'out')
  mkdirSync(outDir, { recursive: true })
  mkdirSync(join(root, 'examples'), { recursive: true })

  const cube = cubePath
    ? parseCube(readFileSync(resolve(cubePath), 'utf8'))
    : warmDemoCube(5)
  if (!cubePath) {
    writeFileSync(join(root, 'examples', 'warm-demo.cube'), stringifyCube(cube))
  }

  const input = makeSwatchImage()
  const outputPixels = applyCubeToRgba8(cube, input.pixels, intensity)
  writePng(join(outDir, 'input.png'), input)
  writePng(join(outDir, 'output.png'), {
    width: input.width,
    height: input.height,
    pixels: outputPixels
  })
  const meta = cubeMetadata(cube)
  writeFileSync(
    join(outDir, 'compare.html'),
    `<!doctype html>
<meta charset="utf-8">
<title>liangzai-cube-kit</title>
<body style="font-family:sans-serif;margin:24px">
<h1>Adobe .cube 线性混合</h1>
<p>${meta.title} · ${meta.kind.toUpperCase()} · ${meta.size}³ · intensity=${intensity}</p>
<p><img src="input.png" alt="before" width="480"> <img src="output.png" alt="after" width="480"></p>
<p>微信 ${WECHAT_ID} · <a href="https://www.ybpbyxc.com">ybpbyxc.com</a></p>
</body>
`
  )
  console.log(`wrote ${join(outDir, 'input.png')}`)
  console.log(`wrote ${join(outDir, 'output.png')}`)
  console.log(`open ${join(outDir, 'compare.html')}`)
  console.log('')
  printContact()
}

main()
