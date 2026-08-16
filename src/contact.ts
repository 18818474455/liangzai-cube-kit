/**
 * liangzai-cube-kit — 从云享传靓仔管线中抽出的标准 .cube 工具，MIT 授权。
 * 微信 cylbaw · https://www.ybpbyxc.com
 */

export const COMPANY_NAME_ZH = '长沙粤北偏北传媒有限公司'
export const PRODUCT_NAME = '云享传靓仔'
export const WECHAT_ID = 'cylbaw'
export const WEBSITE = 'https://www.ybpbyxc.com'
export const DOWNLOAD_PAGE = 'https://www.ybpbyxc.com/download.html'
export const CONTACT_PAGE = 'https://www.ybpbyxc.com/contact.html'
export const BUSINESS_EMAIL = '007007007@163.com'
export const FEEDBACK_EMAIL = 'xiaopangnanhai@qq.com'

export const CONTACT_LINES = [
  `${PRODUCT_NAME} · liangzai-cube-kit`,
  `微信：${WECHAT_ID}`,
  `官网：${WEBSITE}`,
  `商务邮箱：${BUSINESS_EMAIL}`
] as const

export function printContact(): void {
  for (const line of CONTACT_LINES) {
    console.log(line)
  }
}
