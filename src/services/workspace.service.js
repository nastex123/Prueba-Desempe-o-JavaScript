import { http } from "@/api/http";

export const getWorkspaces = () =>
  http.get("/workspaces");

export const getWorkspaceById = (id) =>
  http.get(`/workspaces/${id}`);

export const createWorkspace = (data) =>
  http.post("/workspaces", data);

export const updateWorkspace = (id, data) =>
  http.put(`/workspaces/${id}`, data);

export const deleteWorkspace = (id) =>
  http.delete(`/workspaces/${id}`);
