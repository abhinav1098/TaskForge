import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../auth/context";
import { api } from "../../lib/ApiClient";

type Task = {
  id: number;
  title: string;
  priority: number;
  completed: boolean;
};

type Filter = "all" | "active" | "completed";

export default function TasksPage() {
  const { logout } = useAuth();

  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [priority, setPriority] = useState(2);
  const [creating, setCreating] = useState(false);

  const [filter, setFilter] = useState<Filter>("all");
  const [sortHighFirst, setSortHighFirst] = useState(true);

  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingTitle, setEditingTitle] = useState("");

  // ==========================
  // FETCH TASKS
  // ==========================

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const res = await api.get<Task[]>("/tasks");
        setTasks(res.data);
      } catch {
        setError("Failed to load tasks.");
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, []);

  // ==========================
  // CREATE
  // ==========================

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || creating) return;

    setCreating(true);
    setError(null);

    try {
      const res = await api.post<Task>("/tasks", {
        title: title.trim(),
        priority,
      });

      setTasks((prev) => [res.data, ...prev]);
      setTitle("");
      setPriority(2);

    } catch {
      setError("Failed to create task.");
    } finally {
      setCreating(false);
    }
  };

  // ==========================
  // TOGGLE
  // ==========================

  const toggleComplete = async (task: Task) => {
    const previous = [...tasks];

    setTasks((prev) =>
      prev.map((t) =>
        t.id === task.id ? { ...t, completed: !t.completed } : t
      )
    );

    try {
      await api.put(`/tasks/${task.id}`, {
        completed: !task.completed,
      });
    } catch {
      setTasks(previous);
      setError("Failed to update task.");
    }
  };

  // ==========================
  // DELETE
  // ==========================

  const deleteTask = async (id: number) => {
    const previous = [...tasks];

    setTasks((prev) => prev.filter((t) => t.id !== id));

    try {
      await api.delete(`/tasks/${id}`);
    } catch {
      setTasks(previous);
      setError("Failed to delete task.");
    }
  };

  // ==========================
  // EDIT
  // ==========================

  const startEdit = (task: Task) => {
    setEditingId(task.id);
    setEditingTitle(task.title);
  };

  const saveEdit = async (task: Task) => {
    if (!editingTitle.trim()) return;

    const previous = [...tasks];

    setTasks((prev) =>
      prev.map((t) =>
        t.id === task.id ? { ...t, title: editingTitle.trim() } : t
      )
    );

    setEditingId(null);

    try {
      await api.put(`/tasks/${task.id}`, {
        title: editingTitle.trim(),
      });
    } catch {
      setTasks(previous);
      setError("Failed to update task.");
    }
  };

  // ==========================
  // FILTER + SORT
  // ==========================

  const filteredTasks = useMemo(() => {
    let result = [...tasks];

    if (filter === "active") {
      result = result.filter((t) => !t.completed);
    }

    if (filter === "completed") {
      result = result.filter((t) => t.completed);
    }

    result.sort((a, b) =>
      sortHighFirst
        ? b.priority - a.priority
        : a.priority - b.priority
    );

    return result;
  }, [tasks, filter, sortHighFirst]);

  const completedCount = tasks.filter((t) => t.completed).length;

  // ==========================
  // RENDER
  // ==========================

  return (
    <div className="min-h-screen px-6 py-12 max-w-4xl mx-auto space-y-10">

      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-semibold">Your Tasks</h1>
          <p className="text-sm text-neutral-400">
            {completedCount} of {tasks.length} completed
          </p>
        </div>
        <button
          onClick={logout}
          className="text-sm text-neutral-400 hover:text-white transition"
        >
          Logout
        </button>
      </div>

      {error && (
        <div className="text-red-400 text-sm text-center">
          {error}
        </div>
      )}

      {/* ADD TASK */}
      <div className="card p-6">
        <form
          onSubmit={handleCreate}
          className="flex items-center gap-4 flex-wrap"
        >
          <input
            type="text"
            placeholder="Enter task title..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="input flex-1 min-w-[200px]"
            disabled={creating}
          />

          <select
            value={priority}
            onChange={(e) => setPriority(Number(e.target.value))}
            className="input w-36"
            disabled={creating}
          >
            <option value={1}>Low</option>
            <option value={2}>Normal</option>
            <option value={3}>Medium</option>
            <option value={4}>High</option>
            <option value={5}>Critical</option>
          </select>

          <button
            type="submit"
            disabled={creating || !title.trim()}
            className="button-primary px-6 whitespace-nowrap"
          >
            {creating ? "Adding..." : "Add"}
          </button>
        </form>
      </div>

      {/* CONTROLS */}
      <div className="flex justify-between items-center text-sm flex-wrap gap-4">
        <div className="flex gap-3">
          {["all", "active", "completed"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f as Filter)}
              className={`px-3 py-1 rounded-full transition ${
                filter === f
                  ? "bg-neutral-800 text-white"
                  : "text-neutral-400 hover:text-white"
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        <button
          onClick={() => setSortHighFirst(!sortHighFirst)}
          className="text-neutral-400 hover:text-white transition"
        >
          Sort: {sortHighFirst ? "High → Low" : "Low → High"}
        </button>
      </div>

      {/* TASK LIST */}
      <div className="space-y-4">

        {loading && (
          <div className="text-center py-10 text-neutral-500">
            Loading tasks...
          </div>
        )}

        {!loading && filteredTasks.length === 0 && (
          <div className="text-center py-10 text-neutral-500">
            No tasks here yet.
          </div>
        )}

        {filteredTasks.map((task) => (
          <div
            key={task.id}
            className="card p-5 flex justify-between items-center hover:border-neutral-700 transition"
          >
            <div className="flex items-center gap-4 flex-1">

              <input
                type="checkbox"
                checked={task.completed}
                onChange={() => toggleComplete(task)}
                className="w-4 h-4 accent-white"
              />

              {editingId === task.id ? (
                <input
                  value={editingTitle}
                  onChange={(e) => setEditingTitle(e.target.value)}
                  onBlur={() => saveEdit(task)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") saveEdit(task);
                    if (e.key === "Escape") setEditingId(null);
                  }}
                  autoFocus
                  className="input flex-1"
                />
              ) : (
                <div
                  onDoubleClick={() => startEdit(task)}
                  className="flex-1 cursor-pointer"
                >
                  <p
                    className={`${
                      task.completed
                        ? "line-through text-neutral-500"
                        : ""
                    }`}
                  >
                    {task.title}
                  </p>

                  <span className="text-xs px-3 py-1 rounded-full bg-neutral-800 text-neutral-300">
                    Priority {task.priority}
                  </span>
                </div>
              )}
            </div>

            <button
              onClick={() => deleteTask(task.id)}
              className="text-sm text-red-400 hover:text-red-300 transition ml-4"
            >
              Delete
            </button>
          </div>
        ))}

      </div>
    </div>
  );
}
