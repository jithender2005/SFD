import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "@/components/ui/use-toast";
import MainLayout from "@/components/layout/MainLayout";

export default function SignIn() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [formError, setFormError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    if (!email.trim() || !password.trim()) {
      setFormError("All fields are required");
      return;
    }

    if (!/^[^@]+@[^@]+\.[^@]+$/.test(email)) {
      setFormError("Invalid email format");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(`${import.meta.env.VITE_API_URL}/signin`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Login failed");
      }

      // ✅ Save token to localStorage
      localStorage.setItem("access_token", data.access_token);
      localStorage.setItem("sf_user", JSON.stringify({ email, token: data.access_token }));

      toast({
        title: "Login successful",
        description: "Redirecting to dashboard...",
      });

      // Redirect after login
      navigate("/");

    } catch (error: any) {
      console.error("Login error:", error);
      setFormError(error.message || "Login failed. Please try again.");
      toast({
        title: "Login failed",
        description: error.message || "Invalid credentials",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <MainLayout>
      <div className="max-w-md mx-auto bg-white p-8 rounded-xl shadow-md my-8 animate-fade-in">
        <h2 className="text-2xl font-bold text-center mb-6">Sign In</h2>
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="email" className="block mb-1 text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              id="email"
              type="email"
              className="w-full border border-gray-300 px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              placeholder="your@email.com"
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="block mb-1 text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              id="password"
              type="password"
              className="w-full border border-gray-300 px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              placeholder="••••••••"
              required
            />
          </div>

          {formError && (
            <div className="text-red-500 text-sm text-center py-2 px-3 bg-red-50 rounded-md">
              {formError}
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-purple-600 text-white font-medium py-2 px-4 rounded-md hover:bg-purple-700 transition-colors disabled:opacity-50 flex justify-center items-center"
            disabled={loading}
          >
            {loading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Signing In...
              </>
            ) : (
              "Sign In"
            )}
          </button>
        </form>

        <div className="text-center mt-4 text-sm text-gray-600">
          Don't have an account?{" "}
          <Link to="/signup" className="text-purple-600 hover:underline font-medium">
            Sign Up
          </Link>
        </div>
      </div>
    </MainLayout>
  );
}
