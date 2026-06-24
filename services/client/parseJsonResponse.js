export const parseJsonResponse = async (response) => {
  const data = await response.json();

  if (!response.ok) {
    const message = data.message || 'Request failed.';
    const error = new Error(message);
    error.details = data.errors;
    throw error;
  }

  return data;
};
