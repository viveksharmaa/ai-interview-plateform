import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Button from "../components/Button";

function Login() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setError("");
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.email || !formData.password) {
      setError("Please enter email and password.");
      return;
    }

    // Temporary frontend login.
    // Later this will connect with backend authentication.
    const friendlyName = formData.email
      ? formData.email.split("@")[0].replace(/[._-]/g, " ")
      : "Student";

    localStorage.setItem("isLoggedIn", "true");
    localStorage.setItem("userName", friendlyName);
    localStorage.setItem("userEmail", formData.email);

    const savedProfile = localStorage.getItem("studentProfile");

    if (!savedProfile) {
      localStorage.setItem(
        "studentProfile",
        JSON.stringify({
          fullName: friendlyName,
          email: formData.email,
          phone: "",
          college: "",
          branch: "",
          graduationYear: "",
          targetRole: "",
          currentGoal: "",
          bio: "",
          skillFocus: "",
          strengths: "",
          learningPlan: "",
        })
      );
    }

    navigate("/dashboard");
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-brand">
          <div className="auth-logo">AI</div>

          <h1>SkillVerify AI</h1>

          <p>
            Verify your skills. Practice interviews.
            <br />
            Become job ready.
          </p>
        </div>

        <div className="auth-card">
          <div className="auth-header">
            <h2>Welcome Back 👋</h2>
            <p>Login to continue your interview preparation.</p>
          </div>

          {error && <div className="form-error">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Email Address</label>

              <input
                type="email"
                name="email"
                placeholder="student@example.com"
                value={formData.email}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <div className="label-row">
                <label>Password</label>

                <button
                type="button"
                className="forgot-btn"
                onClick={() =>
                  setError(
                    "Password reset is available in the full production app. For this demo, continue with your account credentials or create a new one."
                  )
                }
                >
                  Forgot Password?
                </button>
              </div>

              <div className="password-wrapper">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                />

                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? "🙈" : "👁️"}
                </button>
              </div>
            </div>

            <Button type="submit" fullWidth size="large">
              Login
            </Button>
          </form>

          <div className="auth-divider">
            <span>OR</span>
          </div>

          <p className="auth-switch">
            Don't have an account?{" "}
            <Link to="/register">Create Account</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;