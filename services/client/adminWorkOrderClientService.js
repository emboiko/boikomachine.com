import { parseJsonResponse } from '@/services/client/parseJsonResponse'

export const fetchAdminWorkOrders = async () => {
  const response = await fetch('/api/admin/work-orders', {
    method: 'GET',
    headers: { Accept: 'application/json' },
    cache: 'no-store',
  })

  const data = await parseJsonResponse(response)
  return data.workOrders
}

export const fetchAdminWorkOrder = async (id) => {
  const response = await fetch(`/api/admin/work-orders/${encodeURIComponent(id)}`, {
    method: 'GET',
    headers: { Accept: 'application/json' },
    cache: 'no-store',
  })

  const data = await parseJsonResponse(response)
  return data.workOrder
}

export const createAdminWorkOrder = async (payload) => {
  const response = await fetch('/api/admin/work-orders', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify(payload),
  })

  const data = await parseJsonResponse(response)
  return data.workOrder
}

export const updateAdminWorkOrder = async (id, payload) => {
  const response = await fetch(`/api/admin/work-orders/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify(payload),
  })

  const data = await parseJsonResponse(response)
  return data.workOrder
}

const postWorkOrderAction = async (id, action, payload) => {
  const response = await fetch(`/api/admin/work-orders/${encodeURIComponent(id)}/${action}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify(payload || {}),
  })

  return parseJsonResponse(response)
}

export const sendAdminWorkOrder = async (id) => {
  return postWorkOrderAction(id, 'send')
}

export const sendAdminWorkOrderInvoice = async (id) => {
  return postWorkOrderAction(id, 'invoice')
}

export const startAdminWorkOrder = async (id) => {
  return postWorkOrderAction(id, 'start')
}

export const completeAdminWorkOrder = async (id) => {
  return postWorkOrderAction(id, 'complete')
}

export const recordAdminWorkOrderPayment = async (id, payload) => {
  return postWorkOrderAction(id, 'payments', payload)
}
