import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { AxiosError } from "axios";

import { loginUser } from "./api";
import { useAuth } from "./context";

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (loading) return;

    setError(null);
    setLoading(true);

    try {
      const data = await loginUser({
        username: email.trim(),
        password,
      });

      // 🔥 Store both tokens
      login(data.access_token, data.refresh_token);

      navigate("/tasks", { replace: true });

    } catch (err) {
      const axiosError = err as AxiosError<{ detail?: string }>;

      if (axiosError.response?.data?.detail) {
        setError(axiosError.response.data.detail);
      } else {
        setError("Network error. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <div className="card w-full max-w-md p-10 space-y-8">

        <div className="text-center space-y-2">
          <h1 className="text-3xl font-semibold">Task Manager</h1>
          <p className="text-neutral-400 text-sm">
            Login to continue.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">

          <input
            type="email"
            placeholder="Email"
            className="input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
            autoFocus
            required
          />

          <input
            type="password"
            placeholder="Password"
            className="input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
            minLength={6}
            required
          />

          {error && (
            <div className="text-red-400 text-sm text-center">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !email || !password}
            className="button-primary w-full"
          >
            {loading ? "Signing in..." : "Login"}
          </button>
        </form>

        <div className="text-center text-sm text-neutral-400">
          Don’t have an account?{" "}
          <Link to="/register" className="text-white hover:underline">
            Register
          </Link>
        </div>

      </div>
    </div>
  );
}
