import React, { useState } from "react";

export default function StudentForm() {
  const [form, setForm] = useState({
    name: "",
    roll_no: "",
    email: "",
    course: "",
    year: "",
    grade: "",
  });

  const [status, setStatus] = useState({ type: "", message: "" });
  const [loading, setLoading] = useState(false);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((s) => ({ ...s, [name]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();

    // basic client-side validation
    if (!form.name || !form.roll_no || !form.email) {
      setStatus({ type: "error", message: "Name, Roll No and Email are required." });
      return;
    }

    setLoading(true);
    setStatus({ type: "", message: "" });

    try {
      const res = await fetch("http://localhost:5000/api/students", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const body = await res.json();

      if (!res.ok) {
        setStatus({ type: "error", message: body.message || "Failed to save" });
      } else {
        setStatus({ type: "success", message: "Student saved successfully." });
        // clear form or set returned data
        setForm({ name: "", roll_no: "", email: "", course: "", year: "", grade: "" });
      }
    } catch (err) {
      setStatus({ type: "error", message: "Network error. Could not reach server." });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="page-container fade-in-up" style={{ maxWidth: 680, margin: "24px auto" }}>
      <h2 className="page-header">Student Registration</h2>

      <form onSubmit={handleSubmit} className="resume-upload-card" style={{ padding: 18, gap: 12, display: "flex", flexDirection: "column" }}>
        {status.message && (
          <div style={{ color: status.type === "error" ? "#b91c1c" : "#065f46", marginBottom: 4 }}>
            {status.message}
          </div>
        )}

        <label>
          Name*<br />
          <input name="name" value={form.name} onChange={handleChange} />
        </label>

        <label>
          Roll No*<br />
          <input name="roll_no" value={form.roll_no} onChange={handleChange} />
        </label>

        <label>
          Email*<br />
          <input name="email" value={form.email} onChange={handleChange} type="email" />
        </label>

        <label>
          Course<br />
          <input name="course" value={form.course} onChange={handleChange} />
        </label>

        <label>
          Year<br />
          <input name="year" value={form.year} onChange={handleChange} type="number" min="1" />
        </label>

        <label>
          Grade<br />
          <input name="grade" value={form.grade} onChange={handleChange} />
        </label>

        <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
          <button type="submit" className="custom-button" disabled={loading}>
            {loading ? "Saving..." : "Save Student"}
          </button>
        </div>
      </form>
    </div>
  );
}
