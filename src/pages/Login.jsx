import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/login.css";
import {
  loginAdmin,
  loginReceptionist,
  loginDoctor,
  loginScanner,
  loginBiller
} from "../api/auth";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(""); // For error messages
  const navigate = useNavigate();

  // 🔄 Auto-redirect if already logged in
  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role")?.toLowerCase();

    if (token && role) {
      // Direct them to their respective dashboard
      navigate(`/${role}`);
    }
  }, [navigate]);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // 1️⃣ Admin
      try {
        const res = await loginAdmin({ email, password });
        localStorage.setItem("token", res.data.token);
        localStorage.setItem("role", res.data.admin.role);
        navigate("/admin");
        return;
      } catch { }

      // 2️⃣ Receptionist
      try {
        const res = await loginReceptionist({ email, password });
        localStorage.setItem("token", res.data.token);
        localStorage.setItem("role", "receptionist");
        navigate("/receptionist");
        return;
      } catch { }

      // 3️⃣ Doctor
      try {
        const res = await loginDoctor({ email, password });
        localStorage.setItem("token", res.data.token);
        localStorage.setItem("role", "doctor");
        navigate("/doctor");
        return;
      } catch { }

      // 4️⃣ Scanner
      try {
        const res = await loginScanner({ email, password });
        localStorage.setItem("token", res.data.token);
        localStorage.setItem("role", "scanner");
        navigate("/scanner");
        return;
      } catch { }

      // 5️⃣ Biller
      try {
        const res = await loginBiller({ email, password });
        localStorage.setItem("token", res.data.token);
        localStorage.setItem("role", "biller");
        navigate("/biller");
        return;
      } catch { }

      setError("Invalid credentials. Please check your email and password.");
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Effect for cursor tracking
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e) => {
    setMousePos({ x: e.clientX, y: e.clientY });
  };

  return (
    <div className="login-container" onMouseMove={handleMouseMove}>
      <div
        className="cursor-point"
        style={{
          left: mousePos.x,
          top: mousePos.y
        }}
      />
      <form onSubmit={submit}>
        <h1 style={{ textAlign: "center", marginBottom: "10px", fontSize: "1.5rem", color: "var(--primary-600)" }}>NS multispeciality hospital</h1>
        <h2>Welcome Back</h2>

        {error && (
          <div style={{
            color: '#f87171',
            background: 'rgba(239, 68, 68, 0.1)',
            padding: '10px',
            borderRadius: '8px',
            marginBottom: '15px',
            fontSize: '14px',
            textAlign: 'center'
          }}>
            {error}
          </div>
        )}

        <input
          type="email"
          placeholder="Email Address"
          onChange={(e) => setEmail(e.target.value)}
          required
          disabled={loading}
        />

        <input
          type="password"
          placeholder="Password"
          onChange={(e) => setPassword(e.target.value)}
          required
          disabled={loading}
        />

        <button disabled={loading}>
          {loading ? "Signing in..." : "Login"}
        </button>
      </form>
    </div>
  );
}
