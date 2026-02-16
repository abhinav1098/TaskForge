import { api } from "../../lib/ApiClient";

export type Task = {
  id: number;
  title: string;
  priority: number;
  completed: boolean;
};

export const getTasks = async (): Promise<Task[]> => {
  const res = await api.get("/tasks");
  return res.data;
};

export const createTask = async (title: string, priority: number) => {
  const res = await api.post("/tasks", { title, priority });
  return res.data;
};

export const deleteTask = async (id: number) => {
  await api.delete(`/tasks/${id}`);
};

export const updateTask = async (
  id: number,
  updates: Partial<Task>
) => {
  const res = await api.put(`/tasks/${id}`, updates);
  return res.data;
};
