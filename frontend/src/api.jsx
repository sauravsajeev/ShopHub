import axios from "axios"
const API = axios.create({ baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api" })

export function setAuth(token) {
  if (token) API.defaults.headers.common["Authorization"] = `Bearer ${token}`
  else delete API.defaults.headers.common["Authorization"]
}

export const auth = {
  signup: (payload) => API.post("/auth/signup", payload),
  login: (email, password) => API.post("/auth/login", { email, password }),
  logout: () => API.post("/auth/logout"),
  checkAdmin: () => API.get("/auth/check-admin"),
}

export const items = {
  list: (params) => API.get("/items", { params }),
  get: (id) => API.get(`/items/${id}`),
  create: (payload) => API.post("/items", payload),
  update: (id, payload) => API.put(`/items/${id}`, payload),
  delete: (id) => API.delete(`/items/${id}`),
  getFilters: () => API.get("/items/filters"),
}

export const cart = {
  get: () => API.get("/cart"),
  add: (itemId, qty = 1) => API.post("/cart/add", { itemId, qty }),
  remove: (itemId) => API.post("/cart/remove", { itemId }),
}
