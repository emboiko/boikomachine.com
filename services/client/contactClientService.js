import { parseJsonResponse } from '@/services/client/parseJsonResponse';

export const submitContactForm = async ({ name, email, phone, message, files, turnstileToken }) => {
  const formData = new FormData();
  formData.append('name', name);
  formData.append('email', email);
  formData.append('phone', phone || '');
  formData.append('message', message);
  formData.append('turnstileToken', turnstileToken);

  for (const file of files) {
    formData.append('files', file);
  }

  const response = await fetch('/api/contact', {
    method: 'POST',
    body: formData,
  });

  return parseJsonResponse(response);
};
