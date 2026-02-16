import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { AxiosError } from "axios";

import { api } from "../../lib/ApiClient";

export default function RegisterPage() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    if (loading) return;

    setError(null);
    setLoading(true);

    try {
      await api.post("/auth/register", {
        email: email.trim(),
        password,
      });

      // Redirect to login after successful registration
      navigate("/", { replace: true });

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
          <h1 className="text-3xl font-semibold">Create Account</h1>
          <p className="text-neutral-400 text-sm">
            Join and manage your tasks.
          </p>
        </div>

        <form onSubmit={handleRegister} className="space-y-6">

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
            disabled={loading || !email || password.length < 6}
            className="button-primary w-full"
          >
            {loading ? "Creating..." : "Register"}
          </button>
        </form>

        <div className="text-center text-sm text-neutral-400">
          Already have an account?{" "}
          <Link to="/" className="text-white hover:underline">
            Login
          </Link>
        </div>

      </div>
    </div>
  );
}
