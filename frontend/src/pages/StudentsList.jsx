import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function StudentsList() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  async function load() {
    setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/students");
      const body = await res.json();
      if (!res.ok) throw new Error(body.message || "Failed to load");
      setStudents(body.data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function handleDelete(id) {
    if (!confirm("Delete this student?")) return;
    try {
      const res = await fetch(`http://localhost:5000/api/students/${id}`, { method: "DELETE" });
      const body = await res.json();
      if (!res.ok) throw new Error(body.message || "Delete failed");
      // Refresh
      load();
    } catch (err) {
      alert(err.message || "Delete failed");
    }
  }

  return (
    <div style={{ maxWidth: 900, margin: "20px auto" }} className="fade-in-up">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 className="page-header">Students</h2>
        <div>
          <button className="custom-button" onClick={() => navigate('/student-form')}>New Student</button>
        </div>
      </div>

      {loading && <div>Loading...</div>}
      {error && <div style={{ color: '#b91c1c' }}>{error}</div>}

      {!loading && !students.length && <div>No students found.</div>}

      {!loading && students.length > 0 && (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={{ textAlign: 'left', padding: 8 }}>Name</th>
              <th style={{ textAlign: 'left', padding: 8 }}>Roll No</th>
              <th style={{ textAlign: 'left', padding: 8 }}>Email</th>
              <th style={{ textAlign: 'left', padding: 8 }}>Course</th>
              <th style={{ textAlign: 'left', padding: 8 }}>Year</th>
              <th style={{ textAlign: 'left', padding: 8 }}>Grade</th>
              <th style={{ textAlign: 'left', padding: 8 }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {students.map((s) => (
              <tr key={s.id} style={{ borderTop: '1px solid #eee' }}>
                <td style={{ padding: 8 }}>{s.name}</td>
                <td style={{ padding: 8 }}>{s.roll_no}</td>
                <td style={{ padding: 8 }}>{s.email}</td>
                <td style={{ padding: 8 }}>{s.course}</td>
                <td style={{ padding: 8 }}>{s.year}</td>
                <td style={{ padding: 8 }}>{s.grade}</td>
                <td style={{ padding: 8 }}>
                  <button className="custom-button" onClick={() => navigate(`/students/${s.id}`)}>Edit</button>
                  <button className="custom-button" style={{ marginLeft: 8, background: '#ef4444', color: '#fff' }} onClick={() => handleDelete(s.id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
