import React, { useState, useEffect, useCallback } from 'react';

import { employeeApi, departmentApi } from './api';

import './app.css';

// ── Status Badge ─────────────────────────────────────────────────────

function StatusBadge({ status }) {

  const map = {

    active: { label: 'Active', cls: 'badge-active' },

    inactive: { label: 'Inactive', cls: 'badge-inactive' },

    on_leave: { label: 'On Leave', cls: 'badge-leave' },

  };

  const { label, cls } = map[status] || { label: status, cls: '' };

  return <span className={`badge ${cls}`}>{label}</span>;

}

// ── Avatar ───────────────────────────────────────────────────────────

function Avatar({ initials, name }) {

  const colors = ['#c0392b', '#8e44ad', '#2980b9', '#16a085', '#d35400', '#27ae60', '#2c3e50', '#e67e22'];

  const idx = (name?.charCodeAt(0) || 0) % colors.length;

  return (
<div className="avatar" style={{ background: colors[idx] }}>

      {initials || name?.slice(0, 2).toUpperCase()}
</div>

  );

}

// ── Stat Card ────────────────────────────────────────────────────────

function StatCard({ label, value, sub, accent }) {

  return (
<div className="stat-card" style={{ '--accent': accent }}>
<div className="stat-value">{value}</div>
<div className="stat-label">{label}</div>

      {sub && <div className="stat-sub">{sub}</div>}
</div>

  );

}

// ── Modal ────────────────────────────────────────────────────────────

function Modal({ title, onClose, children }) {

  useEffect(() => {

    const h = (e) => e.key === 'Escape' && onClose();

    window.addEventListener('keydown', h);

    return () => window.removeEventListener('keydown', h);

  }, [onClose]);

  return (
<div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
<div className="modal">
<div className="modal-header">
<h2>{title}</h2>
<button className="modal-close" onClick={onClose}>✕</button>
</div>

        {children}
</div>
</div>

  );

}

// ── Employee Form ────────────────────────────────────────────────────

function EmployeeForm({ employee, departments, onSave, onClose }) {

  const [form, setForm] = useState({

    first_name: employee?.first_name || '',

    last_name: employee?.last_name || '',

    email: employee?.email || '',

    phone: employee?.phone || '',

    position: employee?.position || '',

    department_id: employee?.department_id || '',

    salary: employee?.salary || '',

    status: employee?.status || 'active',

    hire_date: employee?.hire_date?.split('T')[0] || new Date().toISOString().split('T')[0],

  });

  const [saving, setSaving] = useState(false);

  const [error, setError] = useState('');

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  const submit = async (e) => {

    e.preventDefault();

    setSaving(true); setError('');

    try {

      await onSave(form);

      onClose();

    } catch (err) {

      setError(err.message);

    } finally {

      setSaving(false);

    }

  };

  return (
<form onSubmit={submit} className="emp-form">

      {error && <div className="form-error">{error}</div>}
<div className="form-row">
<div className="form-group">
<label>First Name *</label>
<input required value={form.first_name} onChange={set('first_name')} placeholder="Jane" />
</div>
<div className="form-group">
<label>Last Name *</label>
<input required value={form.last_name} onChange={set('last_name')} placeholder="Smith" />
</div>
</div>
<div className="form-row">
<div className="form-group">
<label>Email *</label>
<input required type="email" value={form.email} onChange={set('email')} placeholder="jane@company.com" />
</div>
<div className="form-group">
<label>Phone</label>
<input value={form.phone} onChange={set('phone')} placeholder="+1-555-0100" />
</div>
</div>
<div className="form-row">
<div className="form-group">
<label>Position *</label>
<input required value={form.position} onChange={set('position')} placeholder="Software Engineer" />
</div>
<div className="form-group">
<label>Department</label>
<select value={form.department_id} onChange={set('department_id')}>
<option value="">— Unassigned —</option>

            {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
</select>
</div>
</div>
<div className="form-row">
<div className="form-group">
<label>Salary (USD)</label>
<input type="number" value={form.salary} onChange={set('salary')} placeholder="90000" min="0" />
</div>
<div className="form-group">
<label>Status</label>
<select value={form.status} onChange={set('status')}>
<option value="active">Active</option>
<option value="inactive">Inactive</option>
<option value="on_leave">On Leave</option>
</select>
</div>
</div>
<div className="form-group">
<label>Hire Date *</label>
<input required type="date" value={form.hire_date} onChange={set('hire_date')} />
</div>
<div className="form-actions">
<button type="button" className="btn-ghost" onClick={onClose}>Cancel</button>
<button type="submit" className="btn-primary" disabled={saving}>

          {saving ? 'Saving…' : employee ? 'Update Employee' : 'Add Employee'}
</button>
</div>
</form>

  );

}

// ── Main App ─────────────────────────────────────────────────────────

export default function App() {

  const [employees, setEmployees] = useState([]);

  const [departments, setDepartments] = useState([]);

  const [stats, setStats] = useState(null);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState('');

  const [search, setSearch] = useState('');

  const [filterStatus, setFilterStatus] = useState('');

  const [filterDept, setFilterDept] = useState('');

  const [page, setPage] = useState(1);

  const [pagination, setPagination] = useState({});

  const [modal, setModal] = useState(null); // null | 'add' | 'edit' | 'view' | 'delete'

  const [selected, setSelected] = useState(null);

  const [activeTab, setActiveTab] = useState('employees');

  const [toast, setToast] = useState(null);

  const showToast = (msg, type = 'success') => {

    setToast({ msg, type });

    setTimeout(() => setToast(null), 3500);

  };

  const loadData = useCallback(async () => {

    setLoading(true); setError('');

    try {

      const [empRes, deptRes, statsRes] = await Promise.all([

        employeeApi.getAll({ search, status: filterStatus, department_id: filterDept, page, limit: 10 }),

        departmentApi.getAll(),

        employeeApi.getStats(),

      ]);

      setEmployees(empRes.data);

      setPagination(empRes.pagination);

      setDepartments(deptRes);

      setStats(statsRes);

    } catch (e) {

      setError(e.message);

    } finally {

      setLoading(false);

    }

  }, [search, filterStatus, filterDept, page]);

  useEffect(() => { loadData(); }, [loadData]);

  const handleCreate = async (data) => {

    await employeeApi.create(data);

    showToast('Employee added successfully');

    loadData();

  };

  const handleUpdate = async (data) => {

    await employeeApi.update(selected.id, data);

    showToast('Employee updated');

    loadData();

  };

  const handleDelete = async () => {

    await employeeApi.remove(selected.id);

    showToast('Employee removed', 'error');

    setModal(null);

    loadData();

  };

  const fmt = (n) => n != null ? `$${Number(n).toLocaleString()}` : '—';

  const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : '—';

  return (
<div className="app">

      {/* Toast */}

      {toast && <div className={`toast toast-${toast.type}`}>{toast.msg}</div>}

      {/* Sidebar */}
<aside className="sidebar">
<div className="sidebar-brand">
<div className="brand-icon">E</div>
<div>
<div className="brand-name">EmpCore</div>
<div className="brand-sub">HR Platform</div>
</div>
</div>
<nav className="sidebar-nav">

          {[

            { id: 'employees', icon: '◎', label: 'Employees' },

            { id: 'departments', icon: '⬡', label: 'Departments' },

            { id: 'analytics', icon: '▦', label: 'Analytics' },

          ].map(t => (
<button

              key={t.id}

              className={`nav-item ${activeTab === t.id ? 'active' : ''}`}

              onClick={() => setActiveTab(t.id)}
>
<span className="nav-icon">{t.icon}</span>
<span>{t.label}</span>
</button>

          ))}
</nav>
<div className="sidebar-footer">
<div className="sidebar-version">v1.0.0 · GKE</div>
</div>
</aside>

      {/* Main */}
<main className="main">

        {/* Header */}
<header className="topbar">
<div className="topbar-left">
<h1 className="page-title">

              {activeTab === 'employees' && 'Employee Directory'}

              {activeTab === 'departments' && 'Departments'}

              {activeTab === 'analytics' && 'Analytics'}
</h1>
</div>
<div className="topbar-right">

            {activeTab === 'employees' && (
<button className="btn-primary" onClick={() => setModal('add')}>

                + New Employee
</button>

            )}
</div>
</header>

        {/* Stats Row */}

        {stats && activeTab === 'employees' && (
<div className="stats-row">
<StatCard label="Total Employees" value={stats.total} accent="#e74c3c" />
<StatCard

              label="Active"

              value={stats.by_status.find(s => s.status === 'active')?.count || 0}

              sub="currently working"

              accent="#27ae60"

            />
<StatCard

              label="On Leave"

              value={stats.by_status.find(s => s.status === 'on_leave')?.count || 0}

              accent="#f39c12"

            />
<StatCard

              label="Avg. Salary"

              value={fmt(stats.avg_salary)}

              accent="#8e44ad"

            />
</div>

        )}

        {/* Employees Tab */}

        {activeTab === 'employees' && (
<div className="content-panel">
<div className="toolbar">
<div className="search-wrap">
<span className="search-icon">⌕</span>
<input

                  className="search-input"

                  placeholder="Search name, email, position…"

                  value={search}

                  onChange={e => { setSearch(e.target.value); setPage(1); }}

                />
</div>
<div className="filters">
<select value={filterStatus} onChange={e => { setFilterStatus(e.target.value); setPage(1); }}>
<option value="">All Status</option>
<option value="active">Active</option>
<option value="inactive">Inactive</option>
<option value="on_leave">On Leave</option>
</select>
<select value={filterDept} onChange={e => { setFilterDept(e.target.value); setPage(1); }}>
<option value="">All Depts</option>

                  {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
</select>
</div>
</div>

            {error && <div className="alert-error">{error}</div>}
<div className="table-wrap">
<table className="data-table">
<thead>
<tr>
<th>Employee</th>
<th>Position</th>
<th>Department</th>
<th>Status</th>
<th>Salary</th>
<th>Hired</th>
<th></th>
</tr>
</thead>
<tbody>

                  {loading ? (
<tr><td colSpan={7} className="loading-row">
<div className="spinner" />
</td></tr>

                  ) : employees.length === 0 ? (
<tr><td colSpan={7} className="empty-row">No employees found</td></tr>

                  ) : employees.map(emp => (
<tr key={emp.id} className="data-row" onClick={() => { setSelected(emp); setModal('view'); }}>
<td>
<div className="emp-cell">
<Avatar initials={emp.avatar_initials} name={emp.first_name} />
<div>
<div className="emp-name">{emp.first_name} {emp.last_name}</div>
<div className="emp-email">{emp.email}</div>
</div>
</div>
</td>
<td>{emp.position}</td>
<td>{emp.department_name || <span className="muted">—</span>}</td>
<td><StatusBadge status={emp.status} /></td>
<td className="mono">{fmt(emp.salary)}</td>
<td className="muted">{fmtDate(emp.hire_date)}</td>
<td onClick={e => e.stopPropagation()}>
<div className="row-actions">
<button className="act-btn" title="Edit" onClick={() => { setSelected(emp); setModal('edit'); }}>✎</button>
<button className="act-btn danger" title="Delete" onClick={() => { setSelected(emp); setModal('delete'); }}>✕</button>
</div>
</td>
</tr>

                  ))}
</tbody>
</table>
</div>

            {pagination.pages > 1 && (
<div className="pagination">
<button disabled={page <= 1} onClick={() => setPage(p => p - 1)} className="page-btn">← Prev</button>
<span className="page-info">Page {page} of {pagination.pages} · {pagination.total} total</span>
<button disabled={page >= pagination.pages} onClick={() => setPage(p => p + 1)} className="page-btn">Next →</button>
</div>

            )}
</div>

        )}

        {/* Departments Tab */}

        {activeTab === 'departments' && (
<div className="content-panel">
<div className="dept-grid">

              {departments.map(d => (
<div key={d.id} className="dept-card">
<div className="dept-icon">⬡</div>
<div className="dept-name">{d.name}</div>
<div className="dept-desc">{d.description}</div>
<div className="dept-count">{d.employee_count} employees</div>
</div>

              ))}
</div>
</div>

        )}

        {/* Analytics Tab */}

        {activeTab === 'analytics' && stats && (
<div className="content-panel">
<div className="analytics-grid">
<div className="analytics-card">
<h3>Headcount by Department</h3>
<div className="bar-chart">

                  {stats.by_department.map((d, i) => (
<div key={i} className="bar-row">
<span className="bar-label">{d.name}</span>
<div className="bar-track">
<div

                          className="bar-fill"

                          style={{ width: `${(d.count / Math.max(...stats.by_department.map(x => x.count))) * 100}%` }}

                        />
</div>
<span className="bar-val">{d.count}</span>
</div>

                  ))}
</div>
</div>
<div className="analytics-card">
<h3>Status Distribution</h3>
<div className="status-dist">

                  {stats.by_status.map((s, i) => (
<div key={i} className="dist-item">
<StatusBadge status={s.status} />
<span className="dist-count">{s.count} employees</span>
<span className="dist-pct">{Math.round((s.count / stats.total) * 100)}%</span>
</div>

                  ))}
</div>
<div className="avg-salary-block">
<div className="avg-label">Average Salary</div>
<div className="avg-value">{fmt(stats.avg_salary)}</div>
<div className="avg-sub">across all employees</div>
</div>
</div>
</div>
</div>

        )}
</main>

      {/* Modals */}

      {modal === 'add' && (
<Modal title="New Employee" onClose={() => setModal(null)}>
<EmployeeForm departments={departments} onSave={handleCreate} onClose={() => setModal(null)} />
</Modal>

      )}

      {modal === 'edit' && selected && (
<Modal title="Edit Employee" onClose={() => setModal(null)}>
<EmployeeForm employee={selected} departments={departments} onSave={handleUpdate} onClose={() => setModal(null)} />
</Modal>

      )}

      {modal === 'view' && selected && (
<Modal title="Employee Details" onClose={() => setModal(null)}>
<div className="emp-detail">
<div className="detail-header">
<Avatar initials={selected.avatar_initials} name={selected.first_name} />
<div>
<div className="detail-name">{selected.first_name} {selected.last_name}</div>
<div className="detail-pos">{selected.position}</div>
<StatusBadge status={selected.status} />
</div>
</div>
<div className="detail-grid">

              {[

                ['Email', selected.email],

                ['Phone', selected.phone || '—'],

                ['Department', selected.department_name || '—'],

                ['Salary', fmt(selected.salary)],

                ['Hire Date', fmtDate(selected.hire_date)],

              ].map(([k, v]) => (
<div key={k} className="detail-item">
<span className="detail-key">{k}</span>
<span className="detail-val">{v}</span>
</div>

              ))}
</div>
<div className="form-actions">
<button className="btn-ghost" onClick={() => setModal(null)}>Close</button>
<button className="btn-primary" onClick={() => setModal('edit')}>Edit</button>
</div>
</div>
</Modal>

      )}

      {modal === 'delete' && selected && (
<Modal title="Remove Employee" onClose={() => setModal(null)}>
<div className="delete-confirm">
<div className="delete-icon">⚠</div>
<p>Remove <strong>{selected.first_name} {selected.last_name}</strong> from the system? This cannot be undone.</p>
<div className="form-actions">
<button className="btn-ghost" onClick={() => setModal(null)}>Cancel</button>
<button className="btn-danger" onClick={handleDelete}>Delete Employee</button>
</div>
</div>
</Modal>

      )}
</div>

  );

}