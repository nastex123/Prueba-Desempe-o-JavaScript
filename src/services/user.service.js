import { http } from "@/api/http";

export const getUsers = () =>
  http.get("/users");
