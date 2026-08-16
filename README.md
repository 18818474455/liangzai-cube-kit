# liangzai-cube-kit

**标准 Adobe `.cube` 3D LUT 读写与三线性插值。**  
给开发者用的开源调色零件：一行命令套 LUT，一行代码读表、混合、写回。

[![npm](https://img.shields.io/npm/v/liangzai-cube-kit.svg)](https://www.npmjs.com/package/liangzai-cube-kit)
[![license](https://img.shields.io/github/license/18818474455/liangzai-cube-kit.svg)](./LICENSE)
[![CI](https://github.com/18818474455/liangzai-cube-kit/actions/workflows/ci.yml/badge.svg)](https://github.com/18818474455/liangzai-cube-kit/actions/workflows/ci.yml)

[在线试跑](https://18818474455.github.io/liangzai-cube-kit/) · [npm](https://www.npmjs.com/package/liangzai-cube-kit)

![Warm demo LUT before / after](docs/before-after.gif)

从云享传靓仔管线中抽出的标准 LUT 工具，MIT 授权。

## Quick Start

```bash
npm install liangzai-cube-kit
```

```ts
import { parseCube, applyCubeToRgba8 } from 'liangzai-cube-kit'

const pixels = applyCubeToRgba8(parseCube(cubeText), rgba8, 0.8)
```

```bash
npm start
```

会写出 `out/input.png` 和 `out/output.png`。上面的 GIF 就是这组色条套暖调演示格的结果。

## 功能

- 读 Adobe `.cube` 3D LUT（红 → 绿 → 蓝）
- 三线性插值 + 强度混合：`out = in + (lut(in) − in) × t`
- 序列化回 `.cube`；另有 1D LUT 与教科书级曝光 / 色温
- 自带暖调演示格，`npm start` 即出前后对比
- 浏览器 playground：拖图、拖强度，不用装桌面软件

## Playground

https://18818474455.github.io/liangzai-cube-kit/

## 文档

现场桌面修图怎么打包、签名、把像素留在本机：[shipping-a-desktop-retoucher.md](docs/shipping-a-desktop-retoucher.md)

## License

MIT © 长沙粤北偏北传媒有限公司

产品与合作：微信 `cylbaw` · [ybpbyxc.com](https://www.ybpbyxc.com)
