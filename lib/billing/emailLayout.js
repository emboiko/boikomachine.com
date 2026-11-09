import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { BUSINESS } from '@/lib/constants'

const EMAIL_LOGO_FILENAME = 'boiko-machine-and-tool-email.png'
const EMAIL_LOGO_CONTENT_ID = 'boiko-logo'
const EMAIL_LOGO_DISPLAY_WIDTH = 280
const EMAIL_LOGO_DISPLAY_HEIGHT = 114

const escapeHtml = (value) => {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')
}

export const buildCustomerEmailFooterText = () => {
  return [
    '—',
    `${BUSINESS.name} · ${BUSINESS.location}`,
    `${BUSINESS.phone} · ${BUSINESS.email}`,
    BUSINESS.siteUrl,
  ].join('\n')
}

const buildCustomerEmailFooterHtml = () => {
  return [
    `<p style="margin:24px 0 0;padding-top:16px;border-top:1px solid #d0d0d0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;font-size:13px;line-height:1.5;color:#555555;">`,
    `${escapeHtml(BUSINESS.name)} · ${escapeHtml(BUSINESS.location)}<br>`,
    `<a href="${escapeHtml(BUSINESS.phoneHref)}" style="color:#555555;text-decoration:none;">${escapeHtml(BUSINESS.phone)}</a>`,
    ' · ',
    `<a href="${escapeHtml(BUSINESS.emailHref)}" style="color:#555555;text-decoration:none;">${escapeHtml(BUSINESS.email)}</a><br>`,
    `<a href="${escapeHtml(BUSINESS.siteUrl)}" style="color:#555555;text-decoration:underline;">${escapeHtml(BUSINESS.siteUrl)}</a>`,
    '</p>',
  ].join('')
}

const bodyTextToHtml = (text) => {
  const blocks = text.split(/\n{2,}/)

  return blocks
    .map((block) => {
      const lines = escapeHtml(block).replaceAll('\n', '<br>\n')
      return `<p style="margin:0 0 16px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;font-size:15px;line-height:1.5;color:#111111;">${lines}</p>`
    })
    .join('\n')
}

export const getCustomerEmailLogoAttachment = async () => {
  const logoPath = path.join(process.cwd(), 'public', 'brand', EMAIL_LOGO_FILENAME)
  const content = await readFile(logoPath)

  return {
    content,
    filename: EMAIL_LOGO_FILENAME,
    contentType: 'image/png',
    contentId: EMAIL_LOGO_CONTENT_ID,
  }
}

export const wrapCustomerBillingEmail = (bodyText) => {
  const footerText = buildCustomerEmailFooterText()
  const text = `${bodyText}\n\n${footerText}`

  const html = [
    '<!DOCTYPE html>',
    '<html lang="en">',
    '<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"></head>',
    '<body style="margin:0;padding:0;background-color:#ffffff;">',
    '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#ffffff;">',
    '<tr><td style="padding:24px 20px;">',
    `<a href="${escapeHtml(BUSINESS.siteUrl)}" style="display:inline-block;text-decoration:none;">`,
    `<img src="cid:${EMAIL_LOGO_CONTENT_ID}" width="${EMAIL_LOGO_DISPLAY_WIDTH}" height="${EMAIL_LOGO_DISPLAY_HEIGHT}" alt="${escapeHtml(BUSINESS.name)}" style="display:block;border:0;outline:none;text-decoration:none;width:${EMAIL_LOGO_DISPLAY_WIDTH}px;height:auto;max-width:100%;">`,
    '</a>',
    '<div style="margin-top:24px;">',
    bodyTextToHtml(bodyText),
    '</div>',
    buildCustomerEmailFooterHtml(),
    '</td></tr>',
    '</table>',
    '</body>',
    '</html>',
  ].join('')

  return { text, html }
}
