import { parseJsonResponse } from '@/services/client/parseJsonResponse';

export const fetchAdminPortfolioItems = async () => {
  const response = await fetch('/api/admin/portfolio', {
    method: 'GET',
    headers: { Accept: 'application/json' },
    cache: 'no-store',
  });

  const data = await parseJsonResponse(response);
  return data.items;
};

export const fetchAdminPortfolioItem = async (id) => {
  const response = await fetch(`/api/admin/portfolio/${encodeURIComponent(id)}`, {
    method: 'GET',
    headers: { Accept: 'application/json' },
    cache: 'no-store',
  });

  const data = await parseJsonResponse(response);
  return data.item;
};

export const createAdminPortfolioItem = async (payload) => {
  const response = await fetch('/api/admin/portfolio', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify(payload),
  });

  const data = await parseJsonResponse(response);
  return data.item;
};

export const updateAdminPortfolioItem = async (id, payload) => {
  const response = await fetch(`/api/admin/portfolio/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify(payload),
  });

  const data = await parseJsonResponse(response);
  return data.item;
};

export const deleteAdminPortfolioItem = async (id) => {
  const response = await fetch(`/api/admin/portfolio/${encodeURIComponent(id)}`, {
    method: 'DELETE',
    headers: { Accept: 'application/json' },
  });

  return parseJsonResponse(response);
};

export const uploadAdminPortfolioMedia = async (file, type = 'image') => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('type', type);

  const response = await fetch('/api/admin/portfolio/media', {
    method: 'POST',
    body: formData,
  });

  const data = await parseJsonResponse(response);
  return data.upload;
};
