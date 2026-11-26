
import { useState } from "react";
import "./Auth.css";

function Auth({ onLogin }) {
  const [isLogin, setIsLogin] = useState(true);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    if (!isLogin && formData.password !== formData.confirmPassword) {
      setMessage("Passwords do not match!");
      return;
    }

    setLoading(true);

    try {
      const endpoint = isLogin ? "login" : "register";

      const response = await fetch(
        `https://campusmess1.onrender.com/api/auth/${endpoint}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: formData.name,
            email: formData.email,
            password: formData.password,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Something went wrong");
      }

      if (isLogin) {
        if (!data.token || !data.user?.role) {
          throw new Error("Login response is missing user information.");
        }

        localStorage.setItem("campusmessToken", data.token);
        localStorage.setItem("campusmessRole", data.user.role);

        onLogin(data.user.role);
      } else {
        setMessage("Registration successful! Please login.");
        setIsLogin(true);
      }

      setFormData({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
      });
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="auth-section" id="login">
      <div className="auth-container">
        <div className="auth-visual">
          <h2>Welcome to CampusMess</h2>
          <p>
            Your hostel meals, feedback and food experience in one place.
          </p>
        </div>

        <div className="auth-form-wrapper">
          <h2>{isLogin ? "Student / Admin Login" : "Create Account"}</h2>

          <p>
            {isLogin
              ? "Login to access your CampusMess account."
              : "Register to get started with CampusMess."}
          </p>

          <form onSubmit={handleSubmit}>
            {!isLogin && (
              <input
                type="text"
                name="name"
                placeholder="Full Name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            )}

            <input
              type="email"
              name="email"
              placeholder="Email Address"
              value={formData.email}
              onChange={handleChange}
              required
            />

            <input
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              required
            />

            {!isLogin && (
              <input
                type="password"
                name="confirmPassword"
                placeholder="Confirm Password"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
              />
            )}

            <button type="submit" disabled={loading}>
              {loading
                ? "Please wait..."
                : isLogin
                  ? "Login"
                  : "Register"}
            </button>
          </form>

          {message && <p className="auth-message">{message}</p>}

          <p className="auth-switch">
            {isLogin
              ? "Don't have an account?"
              : "Already have an account?"}

            <button
              type="button"
              onClick={() => {
                setIsLogin(!isLogin);
                setMessage("");
              }}
            >
              {isLogin ? " Register" : " Login"}
            </button>
          </p>
        </div>
      </div>
    </section>
  );
}

export default Auth;
