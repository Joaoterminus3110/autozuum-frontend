import axios from "axios";

export const API_BASE_URL = "http://localhost:3333";

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Coloca o token automaticamente em todas as requisições
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ─── AUTH ─────────────────────────────────────────────────────────────────────
export async function login(email, password) {
  const res = await api.post("/auth/login", { email, password });
  return res.data;
}

// ─── USERS ────────────────────────────────────────────────────────────────────
export async function createUser(data) {
  const res = await api.post("/users", data);
  return res.data;
}

export async function getAllUsers() {
  const res = await api.get("/users");
  return res.data;
}

export async function getUserById(id) {
  const res = await api.get(`/users/${id}`);
  return res.data;
}

export async function updateUser(id, data) {
  const res = await api.put(`/users/${id}`, data);
  return res.data;
}

export async function deleteUser(id) {
  await api.delete(`/users/${id}`);
}

// ─── VEHICLES ─────────────────────────────────────────────────────────────────
export async function getVehicles() {
  const res = await api.get("/vehicles");
  return res.data;
}

export async function getVehicleById(id) {
  const res = await api.get(`/vehicles/${id}`);
  return res.data;
}

export async function createVehicle(data) {
  // userId não precisa mais enviar, o backend pega pelo token
  const res = await api.post("/vehicles", data);
  return res.data;
}

export async function updateVehicle(id, data) {
  const res = await api.put(`/vehicles/${id}`, data);
  return res.data;
}

export async function deleteVehicle(id) {
  await api.delete(`/vehicles/${id}`);
}

// ─── VEHICLE IMAGES ───────────────────────────────────────────────────────────
export async function addVehicleImage(data) {
  const res = await api.post("/images", data);
  return res.data;
}

export async function deleteVehicleImage(id) {
  await api.delete(`/images/${id}`);
}

// ─── PROPOSALS ────────────────────────────────────────────────────────────────
export async function createProposal(data) {
  // buyerId não precisa mais enviar, o backend pega pelo token
  const res = await api.post("/proposals", data);
  return res.data;
}

export async function getProposalsByVehicle(vehicleId) {
  const res = await api.get(`/proposals/vehicle/${vehicleId}`);
  return res.data;
}

export async function updateProposalStatus(id, status) {
  const res = await api.put(`/proposals/${id}/status`, { status });
  return res.data;
}

// ─── REVIEWS ──────────────────────────────────────────────────────────────────
export async function createReview(data) {
  const res = await api.post("/reviews", data);
  return res.data;
}

export async function getReviewsByUser(userId) {
  const res = await api.get(`/reviews/user/${userId}`);
  return res.data;
}

// ─── HELPER ───────────────────────────────────────────────────────────────────
export function getImageUrl(filename) {
  if (!filename) return null;

  // Se o filename já vier com a "/", a gente tira ela para não duplicar
  const cleanFilename = filename.startsWith("/")
    ? filename.substring(1)
    : filename;

  return `${API_BASE_URL}/${cleanFilename}`;
}

export default api;
