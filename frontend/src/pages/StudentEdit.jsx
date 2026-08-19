import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

export default function StudentEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', roll_no: '', email: '', course: '', year: '', grade: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const res = await fetch(`http://localhost:5000/api/students/${id}`);
        const body = await res.json();
        if (!res.ok) throw new Error(body.message || 'Failed to load');
        setForm({
          name: body.data.name || '',
          roll_no: body.data.roll_no || '',
          email: body.data.email || '',
          course: body.data.course || '',
          year: body.data.year || '',
          grade: body.data.grade || '',
        });
      } catch (err) {
        setError(err.message);
      } finally { setLoading(false); }
    }
    load();
  }, [id]);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm(s => ({ ...s, [name]: value }));
  }

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch(`http://localhost:5000/api/students/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.message || 'Save failed');
      alert('Saved');
      navigate('/students');
    } catch (err) {
      alert(err.message || 'Save failed');
    } finally { setSaving(false); }
  }

  async function handleDelete() {
    if (!confirm('Delete this student?')) return;
    try {
      const res = await fetch(`http://localhost:5000/api/students/${id}`, { method: 'DELETE' });
      const body = await res.json();
      if (!res.ok) throw new Error(body.message || 'Delete failed');
      alert('Deleted');
      navigate('/students');
    } catch (err) {
      alert(err.message || 'Delete failed');
    }
  }

  if (loading) return <div style={{padding:20}}>Loading...</div>;
  if (error) return <div style={{padding:20, color:'#b91c1c'}}>{error}</div>;

  return (
    <div style={{ maxWidth: 680, margin: "24px auto" }} className="fade-in-up">
      <h2 className="page-header">Edit Student</h2>

      <form onSubmit={handleSave} className="resume-upload-card" style={{ padding: 18, gap: 12, display: "flex", flexDirection: "column" }}>
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
          <button type="submit" className="custom-button" disabled={saving}>
            {saving ? "Saving..." : "Save"}
          </button>
          <button type="button" className="custom-button" style={{ background: '#ef4444', color: '#fff' }} onClick={handleDelete}>Delete</button>
          <button type="button" className="custom-button" onClick={() => window.history.back()}>Cancel</button>
        </div>
      </form>
    </div>
  );
}
