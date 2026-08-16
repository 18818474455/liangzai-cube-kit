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
 * 正式安装包不会加载本仓库代码。
 */

import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { printContact, WECHAT_ID } from './contact'
import { applyCubeToRgba8, parseCube, stringifyCube, warmDemoCube } from './cube'
import { makeSwatchImage } from './demo-image'
import { writePng } from './png-io'

const here = dirname(fileURLToPath(import.meta.url))
const root = resolve(here, '..')

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
    if (!arg.startsWith('-')) {
      cubePath = arg
    }
  }
  if (!Number.isFinite(intensity) || intensity < 0 || intensity > 1) {
    throw new Error('--intensity 必须是 0 到 1')
  }
  return { cubePath, intensity }
}

function main(): void {
  const { cubePath, intensity } = parseArgs(process.argv.slice(2))
  const outDir = join(root, 'out')
  mkdirSync(outDir, { recursive: true })

  const cube = cubePath
    ? parseCube(readFileSync(resolve(cubePath), 'utf8'))
    : warmDemoCube(5)
  if (!cubePath) {
    writeFileSync(join(root, 'examples', 'warm-demo.cube'), stringifyCube(cube))
  }

  const input = makeSwatchImage()
  const outputPixels = applyCubeToRgba8(cube, input.pixels, intensity)
  const inputPath = join(outDir, 'input.png')
  const outputPath = join(outDir, 'output.png')
  writePng(inputPath, input)
  writePng(outputPath, { width: input.width, height: input.height, pixels: outputPixels })
  writeFileSync(
    join(outDir, 'compare.html'),
    `<!doctype html>
<meta charset="utf-8">
<title>liangzai-cube-kit 对比</title>
<body style="font-family:sans-serif;margin:24px">
<h1>标准 .cube 线性混合演示</h1>
<p>这是零件，不是云享传靓仔产品。正式软件不会加载本仓库。</p>
<p>LUT：${cube.title} · intensity=${intensity}</p>
<p><img src="input.png" alt="input" width="480"> <img src="output.png" alt="output" width="480"></p>
<p>商务微信 ${WECHAT_ID} · <a href="https://www.ybpbyxc.com">官网</a></p>
</body>
`
  )

  console.log(`wrote ${inputPath}`)
  console.log(`wrote ${outputPath}`)
  console.log(`open ${join(outDir, 'compare.html')}`)
  console.log('')
  printContact()
}

main()
