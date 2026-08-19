import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Button from "../components/Button";

function Register() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    college: "",
    branch: "",
  });

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

    if (
      !formData.name ||
      !formData.email ||
      !formData.password ||
      !formData.confirmPassword
    ) {
      setError("Please fill all required fields.");
      return;
    }

    if (formData.password.length < 6) {
      setError("Password must contain at least 6 characters.");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    // Temporary frontend registration.
    localStorage.setItem("isLoggedIn", "true");
    localStorage.setItem("userName", formData.name);
    localStorage.setItem("userEmail", formData.email);
    localStorage.setItem(
      "studentProfile",
      JSON.stringify({
        fullName: formData.name,
        email: formData.email,
        college: formData.college || "",
        branch: formData.branch || "",
        graduationYear: "",
        targetRole: "",
        currentGoal: "",
        bio: "",
        skillFocus: "",
        strengths: "",
        learningPlan: "",
      })
    );

    navigate("/dashboard");
  };

  return (
    <div className="auth-page">
      <div className="auth-container register-container">
        <div className="auth-brand">
          <div className="auth-logo">AI</div>

          <h1>SkillVerify AI</h1>

          <p>
            Know your real skills.
            <br />
            Prepare for your dream job.
          </p>

          <div className="auth-feature-list">
            <div>✓ AI-powered interviews</div>
            <div>✓ Skill verification</div>
            <div>✓ Personalized learning</div>
            <div>✓ Job readiness score</div>
          </div>
        </div>

        <div className="auth-card">
          <div className="auth-header">
            <h2>Create Account 🚀</h2>
            <p>Start your personalized interview journey.</p>
          </div>

          {error && <div className="form-error">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label>Full Name *</label>

                <input
                  type="text"
                  name="name"
                  placeholder="Your name"
                  value={formData.name}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label>Email *</label>

                <input
                  type="email"
                  name="email"
                  placeholder="student@example.com"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="form-group">
              <label>College</label>

              <input
                type="text"
                name="college"
                placeholder="College / University"
                value={formData.college}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Branch</label>

              <select
                name="branch"
                value={formData.branch}
                onChange={handleChange}
              >
                <option value="">Select branch</option>
                <option value="CSE">Computer Science</option>
                <option value="IT">Information Technology</option>
                <option value="ECE">Electronics</option>
                <option value="ME">Mechanical</option>
                <option value="EE">Electrical</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Password *</label>

                <input
                  type="password"
                  name="password"
                  placeholder="Minimum 6 characters"
                  value={formData.password}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label>Confirm Password *</label>

                <input
                  type="password"
                  name="confirmPassword"
                  placeholder="Confirm password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                />
              </div>
            </div>

            <Button type="submit" fullWidth size="large">
              Create Account
            </Button>
          </form>

          <p className="auth-switch">
            Already have an account?{" "}
            <Link to="/login">Login</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Register;