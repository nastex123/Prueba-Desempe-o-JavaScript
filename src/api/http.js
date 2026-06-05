const API_URL = "http://localhost:3001";

const request = async (
  endpoint,
  options = {}
) => {
  try {
    const response = await fetch(
      `${API_URL}${endpoint}`,
      {
        headers: {
          "Content-Type": "application/json",
        },
        ...options,
      }
    );

    if (!response.ok) {
      throw new Error(
        `HTTP Error ${response.status}`
      );
    }

    return await response.json();
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const http = {
  get: (endpoint) =>
    request(endpoint),

  post: (endpoint, data) =>
    request(endpoint, {
      method: "POST",
      body: JSON.stringify(data),
    }),

  put: (endpoint, data) =>
    request(endpoint, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  patch: (endpoint, data) =>
    request(endpoint, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),

  delete: (endpoint) =>
    request(endpoint, {
      method: "DELETE",
    }),
};