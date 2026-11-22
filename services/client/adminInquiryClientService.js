import { parseJsonResponse } from '@/services/client/parseJsonResponse'

export const fetchAdminInquiries = async () => {
  const response = await fetch('/api/admin/inquiries', {
    method: 'GET',
    headers: { Accept: 'application/json' },
    cache: 'no-store',
  })
  const data = await parseJsonResponse(response)
  return data.inquiries
}

export const fetchAdminInquiry = async (id) => {
  const response = await fetch(`/api/admin/inquiries/${encodeURIComponent(id)}`, {
    method: 'GET',
    headers: { Accept: 'application/json' },
    cache: 'no-store',
  })
  const data = await parseJsonResponse(response)
  return data.inquiry
}

export const updateAdminInquiryStatus = async (id, status, message) => {
  const body = { status }

  if (message) {
    body.message = message
  }

  const response = await fetch(`/api/admin/inquiries/${encodeURIComponent(id)}/status`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify(body),
  })
  const data = await parseJsonResponse(response)
  return data
}

export const addAdminInquiryNote = async (id, text, author) => {
  const response = await fetch(`/api/admin/inquiries/${encodeURIComponent(id)}/notes`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({ text, author }),
  })
  const data = await parseJsonResponse(response)
  return data.inquiry
}
