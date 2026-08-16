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
 */

export const COMPANY_NAME_ZH = '长沙粤北偏北传媒有限公司'
export const COMPANY_NAME_EN = 'Changsha Yuebei Pianbei Media Co., Ltd.'
export const PRODUCT_NAME = '云享传靓仔'
export const WECHAT_ID = 'cylbaw'
export const WEBSITE = 'https://www.ybpbyxc.com'
export const DOWNLOAD_PAGE = 'https://www.ybpbyxc.com/download.html'
export const CONTACT_PAGE = 'https://www.ybpbyxc.com/contact.html'
export const BUSINESS_EMAIL = '007007007@163.com'
export const FEEDBACK_EMAIL = 'xiaopangnanhai@qq.com'

export const CONTACT_LINES = [
  `${PRODUCT_NAME} · 零件示例（标准 .cube 工具，不是完整产品）`,
  `微信：${WECHAT_ID}`,
  `官网：${WEBSITE}`,
  `下载：${DOWNLOAD_PAGE}`,
  `合作：${CONTACT_PAGE}`,
  `商务邮箱：${BUSINESS_EMAIL}`,
  `协议反馈：${FEEDBACK_EMAIL}`,
  `公司：${COMPANY_NAME_ZH}`
] as const

export function printContact(): void {
  for (const line of CONTACT_LINES) {
    console.log(line)
  }
}
