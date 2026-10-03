// Persian/Farsi number formatting helpers

const faDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹']

export function toFaDigits(input: string | number): string {
  return String(input).replace(/[0-9]/g, d => faDigits[Number(d)])
}

export function formatToman(amount: number): string {
  // amount is in Rial (smallest unit); show in Toman
  const t = Math.round(amount)
  return toFaDigits(t.toLocaleString('en-US'))
}

export function formatNumber(n: number): string {
  return toFaDigits(n.toLocaleString('en-US'))
}

export const orderStatusLabel: Record<number, { text: string; color: string }> = {
  [-2]: { text: 'مرجوع شده', color: 'bg-red-100 text-red-700 border-red-200' },
  [-1]: { text: 'درخواست بازگشت', color: 'bg-orange-100 text-orange-700 border-orange-200' },
  0: { text: 'در انتظار پرداخت', color: 'bg-gray-100 text-gray-700 border-gray-200' },
  1: { text: 'پرداخت شده', color: 'bg-blue-100 text-blue-700 border-blue-200' },
  2: { text: 'در حال آماده‌سازی', color: 'bg-amber-100 text-amber-700 border-amber-200' },
  3: { text: 'تکمیل شده', color: 'bg-green-100 text-green-700 border-green-200' },
  4: { text: 'لغو شده', color: 'bg-red-100 text-red-700 border-red-200' },
}

export const orderTypeLabel: Record<string, { text: string; color: string }> = {
  dinein: { text: 'داخل سالن', color: 'bg-purple-100 text-purple-700 border-purple-200' },
  takeout: { text: 'بیرون‌بر', color: 'bg-cyan-100 text-cyan-700 border-cyan-200' },
  pickup: { text: 'تحویل حضوری', color: 'bg-teal-100 text-teal-700 border-teal-200' },
}

export const payTypeLabel: Record<string, string> = {
  cash: 'نقدی',
  card: 'کارت',
  wechat: 'وی‌چت',
  alipay: 'علی‌پی',
}

export const roleLabel: Record<string, string> = {
  admin: 'مدیر کل',
  manager: 'مدیر شعبه',
  staff: 'پرسنل',
  cashier: 'صندوق‌دار',
}

export const tableStatusLabel: Record<number, { text: string; color: string }> = {
  0: { text: 'آزاد', color: 'bg-green-100 text-green-700 border-green-200' },
  1: { text: 'اشغال شده', color: 'bg-red-100 text-red-700 border-red-200' },
  2: { text: 'رزرو شده', color: 'bg-amber-100 text-amber-700 border-amber-200' },
}
