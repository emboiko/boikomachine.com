export const parseJsonResponse = async (response) => {
  let data = null;

  try {
    data = await response.json();
  } catch {
    throw new Error('The server returned an unexpected response. Try refreshing the page.');
  }

  if (!response.ok) {
    const message = data?.message || 'Request failed.';
    const error = new Error(message);
    error.details = data?.errors;
    throw error;
  }

  return data;
};
