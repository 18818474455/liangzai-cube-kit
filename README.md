# 云享传靓仔 · 标准 .cube 零件

这是云享传靓仔的 **零件仓**，不是完整产品。  
本仓只做一件事：读 Adobe `.cube` 3D LUT，按 `out = in + (lut(in) − in) * t` 套到一张程序生成的色条上。

- **不能**编译出成片。
- **不含**产品风格 LUT、修图引擎、模型。
- 正式安装包 **不会**加载本仓库里的代码。

`clone` 之后应当能：安装依赖 → 跑起来 → 在 `out/` 看到处理前后的图。

完整软件请下载试用。私有化、二次开发、技术合作请直接联系我们。

## 联系方式

| 项 | 内容 |
|----|------|
| **微信** | `cylbaw` |
| 官网 | https://www.ybpbyxc.com |
| 下载 | https://www.ybpbyxc.com/download.html |
| 合作 | https://www.ybpbyxc.com/contact.html |
| 商务邮箱 | 007007007@163.com |
| 协议反馈 | xiaopangnanhai@qq.com |
| 公司 | 长沙粤北偏北传媒有限公司 |

以上联系方式也写在每份源码文件顶部的注释里。

## 跑起来

```bash
npm install
npm start
```

会写出：

- `out/input.png` 程序生成的色条（不是客户照片）
- `out/output.png` 套了通用暖调演示 LUT
- `out/compare.html` 左右对比，用浏览器打开即可

指定自己的 `.cube` 和强度：

```bash
npm start -- examples/warm-demo.cube --intensity 0.8
```

```bash
npm test
```

## 许可

本零件仓使用 MIT。这只覆盖本仓库里的示例代码。  
云享传靓仔产品、修图引擎、模型与内部风格配方仍是公司商业资产，不在本仓授权范围内。
