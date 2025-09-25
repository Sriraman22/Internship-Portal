import React, { useState } from "react";
import API from "../api";
import { useNavigate } from "react-router-dom";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  async function handleLogin(e) {
    e.preventDefault();
    try {
      const res = await API.post("/auth/login", { email, password });

      // ✅ store token + role
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("role", res.data.user.role);

      // ✅ redirect based on role
      if (res.data.user.role.toLowerCase() === "student") {
        navigate("/dashboard");
      } else if (res.data.user.role.toLowerCase() === "coordinator") {
        navigate("/dashboard");
      } else if (res.data.user.role.toLowerCase() === "hod") {
        navigate("/dashboard");
      } else if (res.data.user.role.toLowerCase() === "admin") {
        navigate("/dashboard");
      } else {
        setError("Unknown role");
      }
    } catch (err) {
      console.error(err);
      setError("Invalid email or password");
    }
  }

  return (
    <div>
      <h2>Login</h2>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <form onSubmit={handleLogin}>
        <input
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button type="submit">Login</button>
      </form>
    </div>
  );
}

export default Login;
