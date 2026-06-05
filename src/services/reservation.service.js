import { http } from "@/api/http";

export const getReservations = () =>
  http.get("/reservations");

export const getReservationById = (id) =>
  http.get(`/reservations/${id}`);

export const createReservation = (data) =>
  http.post("/reservations", data);

export const updateReservation = (id, data) =>
  http.put(`/reservations/${id}`, data);

export const patchReservation = (id, data) =>
  http.patch(`/reservations/${id}`, data);

export const deleteReservation = (id) =>
  http.delete(`/reservations/${id}`);
