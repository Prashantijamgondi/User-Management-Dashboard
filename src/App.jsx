import React from 'react';
import axios from 'axios';
import { DEPARTMENTS, mapApiUsers, validateUser, processUsers } from './utils';

const API_URL = import.meta.env.VITE_API_URL || 'https://jsonplaceholder.typicode.com/users';

export default function App() {
  const [users, setUsers] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState('');
  const [search, setSearch] = React.useState('');
  const [filters, setFilters] = React.useState({ firstName: '', lastName: '', email: '', department: '' });
  const [draftFilters, setDraftFilters] = React.useState({ firstName: '', lastName: '', email: '', department: '' });
  const [showFilters, setShowFilters] = React.useState(false);
  const [sortField, setSortField] = React.useState('id');
  const [sortOrder, setSortOrder] = React.useState('asc');
  const [currentPage, setCurrentPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(10);
  const [modalOpen, setModalOpen] = React.useState(false);
  const [deleteTarget, setDeleteTarget] = React.useState(null);
  const [editingUser, setEditingUser] = React.useState(null);
  const [form, setForm] = React.useState({ firstName: '', lastName: '', email: '', department: '' });
  const [formErrors, setFormErrors] = React.useState({});
  const [toast, setToast] = React.useState(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    window.clearTimeout(showToast.timer);
    showToast.timer = window.setTimeout(() => setToast(null), 2500);
  };

  const fetchUsers = React.useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const response = await axios.get(API_URL);
      setUsers(mapApiUsers(response.data));
    } catch {
      setError('Failed to load users. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    let active = true;
    const initialLoad = async () => {
      try {
        const response = await axios.get(API_URL);
        if (active) {
          setUsers(mapApiUsers(response.data));
        }
      } catch {
        if (active) {
          setError('Failed to load users. Please check your connection and try again.');
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };
    initialLoad();
    return () => {
      active = false;
    };
  }, []);

  const { filtered, paginated, totalPages, safePage } = processUsers({
    users,
    search,
    filters,
    sortField,
    sortOrder,
    currentPage,
    pageSize,
  });

  const openAdd = () => {
    setEditingUser(null);
    setForm({ firstName: '', lastName: '', email: '', department: '' });
    setFormErrors({});
    setModalOpen(true);
  };

  const openEdit = (user) => {
    setEditingUser(user);
    setForm(user);
    setFormErrors({});
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingUser(null);
    setFormErrors({});
  };

  const submitUser = async (e) => {
    e.preventDefault();
    const errors = validateUser(form);
    setFormErrors(errors);
    if (Object.keys(errors).length) return;

    try {
      setIsSubmitting(true);
      if (editingUser) {
        // JSONPlaceholder only persists IDs 1-10. For custom/newly created IDs (> 10), we only update locally.
        if (editingUser.id <= 10) {
          await axios.put(`${API_URL}/${editingUser.id}`, { ...editingUser, ...form });
        }
        setUsers((prev) => prev.map((user) => (user.id === editingUser.id ? { ...user, ...form } : user)));
        showToast('User updated successfully');
      } else {
        const nextId = users.length ? Math.max(...users.map((user) => user.id)) + 1 : 1;
        await axios.post(API_URL, form);
        setUsers((prev) => [{ id: nextId, ...form }, ...prev]);
        showToast('User added successfully');
      }
      closeModal();
      setCurrentPage(1);
    } catch {
      showToast('Request failed. Please try again.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const deleteUser = async () => {
    if (!deleteTarget) return;
    try {
      setIsSubmitting(true);
      // JSONPlaceholder only persists IDs 1-10. For custom/newly created IDs (> 10), we only delete locally.
      if (deleteTarget.id <= 10) {
        await axios.delete(`${API_URL}/${deleteTarget.id}`);
      }
      const updatedUsers = users.filter((user) => user.id !== deleteTarget.id);
      setUsers(updatedUsers);
      setDeleteTarget(null);
      showToast('User deleted successfully');

      const { totalPages: newTotalPages } = processUsers({
        users: updatedUsers,
        search,
        filters,
        sortField,
        sortOrder,
        currentPage,
        pageSize,
      });
      if (currentPage > newTotalPages) {
        setCurrentPage(newTotalPages);
      }
    } catch {
      showToast('Delete failed. Please try again.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const activeFiltersCount = Object.values(filters).filter(Boolean).length;

  return (
    <div style={styles.app}>
      <style>{cssText}</style>
      <header style={styles.header}>
        <div>
          <h1 style={styles.title}>User Management Dashboard</h1>
        </div>
        <button style={styles.primaryButton} onClick={openAdd}>Add User</button>
      </header>

      <section style={styles.toolbar}>
        <input
          aria-label="Search users"
          placeholder="Search by ID, name, email, or department"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setCurrentPage(1);
          }}
          style={styles.input}
        />
        <select value={sortField} onChange={(e) => setSortField(e.target.value)} style={styles.select}>
          <option value="id">Sort: ID</option>
          <option value="firstName">First Name</option>
          <option value="lastName">Last Name</option>
          <option value="email">Email</option>
          <option value="department">Department</option>
        </select>
        <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value)} style={styles.select}>
          <option value="asc">Ascending</option>
          <option value="desc">Descending</option>
        </select>
        <button style={styles.secondaryButton} onClick={() => setShowFilters((prev) => !prev)}>
          Filters {activeFiltersCount ? `(${activeFiltersCount})` : ''}
        </button>
      </section>

      {showFilters && (
        <section style={styles.filterCard}>
          <div style={styles.filterGrid}>
            <input placeholder="First Name" value={draftFilters.firstName} onChange={(e) => setDraftFilters((prev) => ({ ...prev, firstName: e.target.value }))} style={styles.input} />
            <input placeholder="Last Name" value={draftFilters.lastName} onChange={(e) => setDraftFilters((prev) => ({ ...prev, lastName: e.target.value }))} style={styles.input} />
            <input placeholder="Email" value={draftFilters.email} onChange={(e) => setDraftFilters((prev) => ({ ...prev, email: e.target.value }))} style={styles.input} />
            <select value={draftFilters.department} onChange={(e) => setDraftFilters((prev) => ({ ...prev, department: e.target.value }))} style={styles.select}>
              <option value="">All Departments</option>
              {DEPARTMENTS.map((department) => <option key={department} value={department}>{department}</option>)}
            </select>
          </div>
          <div style={styles.filterActions}>
            <button
              style={styles.secondaryButton}
              onClick={() => {
                const empty = { firstName: '', lastName: '', email: '', department: '' };
                setDraftFilters(empty);
                setFilters(empty);
                setCurrentPage(1);
              }}
            >
              Clear
            </button>
            <button
              style={styles.primaryButton}
              onClick={() => {
                setFilters(draftFilters);
                setCurrentPage(1);
                setShowFilters(false);
              }}
            >
              Apply Filters
            </button>
          </div>
        </section>
      )}

      {error && (
        <div style={styles.errorBox}>
          <span>{error}</span>
          <button style={styles.secondaryButton} onClick={fetchUsers}>Retry</button>
        </div>
      )}

      <section style={styles.statsRow}>
        <div style={styles.statCard}><strong>{users.length}</strong><span>Total Users</span></div>
        <div style={styles.statCard}><strong>{filtered.length}</strong><span>Visible Users</span></div>
        <div style={styles.statCard}><strong>{new Set(users.map((user) => user.department)).size}</strong><span>Departments</span></div>
        <div style={styles.statCard}><strong>{safePage}/{totalPages}</strong><span>Page</span></div>
      </section>

      <section style={styles.tableWrap}>
        <table style={styles.table}>
          <thead>
            <tr>
              {['ID', 'First Name', 'Last Name', 'Email', 'Department', 'Actions'].map((head) => (
                <th key={head} style={styles.th}>{head}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="6" style={styles.emptyCell}>Loading users...</td></tr>
            ) : paginated.length ? (
              paginated.map((user) => (
                <tr key={user.id}>
                  <td style={styles.td}>{user.id}</td>
                  <td style={styles.td}>{user.firstName}</td>
                  <td style={styles.td}>{user.lastName}</td>
                  <td style={styles.td}>{user.email}</td>
                  <td style={styles.td}>{user.department}</td>
                  <td style={styles.td}>
                    <div style={styles.actionRow}>
                      <button style={styles.secondaryButton} onClick={() => openEdit(user)}>Edit</button>
                      <button style={styles.dangerButton} onClick={() => setDeleteTarget(user)}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr><td colSpan="6" style={styles.emptyCell}>No users found.</td></tr>
            )}
          </tbody>
        </table>
      </section>

      <section style={styles.paginationBar}>
        <div style={styles.paginationLeft}>
          <span>Rows per page</span>
          <select value={pageSize} onChange={(e) => { setPageSize(Number(e.target.value)); setCurrentPage(1); }} style={styles.select}>
            {[10, 25, 50, 100].map((size) => <option key={size} value={size}>{size}</option>)}
          </select>
        </div>
        <div style={styles.paginationRight}>
          <button style={styles.secondaryButton} disabled={safePage === 1} onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}>Previous</button>
          <span>Page {safePage} of {totalPages}</span>
          <button style={styles.secondaryButton} disabled={safePage === totalPages} onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}>Next</button>
        </div>
      </section>

      {modalOpen && (
        <div style={styles.overlay}>
          <form style={styles.modal} onSubmit={submitUser}>
            <h2 style={styles.modalTitle}>{editingUser ? 'Edit User' : 'Add User'}</h2>
            <div style={styles.formGrid}>
              <Field label="First Name" value={form.firstName} onChange={(value) => setForm((prev) => ({ ...prev, firstName: value }))} error={formErrors.firstName} disabled={isSubmitting} />
              <Field label="Last Name" value={form.lastName} onChange={(value) => setForm((prev) => ({ ...prev, lastName: value }))} error={formErrors.lastName} disabled={isSubmitting} />
              <Field label="Email" value={form.email} onChange={(value) => setForm((prev) => ({ ...prev, email: value }))} error={formErrors.email} type="email" disabled={isSubmitting} />
              <div>
                <label style={styles.label}>Department</label>
                <select value={form.department} onChange={(e) => setForm((prev) => ({ ...prev, department: e.target.value }))} style={styles.select} disabled={isSubmitting}>
                  <option value="">Select Department</option>
                  {DEPARTMENTS.map((department) => <option key={department} value={department}>{department}</option>)}
                </select>
                {formErrors.department && <small style={styles.errorText}>{formErrors.department}</small>}
              </div>
            </div>
            <div style={styles.modalActions}>
              <button type="button" style={styles.secondaryButton} onClick={closeModal} disabled={isSubmitting}>Cancel</button>
              <button type="submit" style={styles.primaryButton} disabled={isSubmitting}>
                {isSubmitting ? (editingUser ? 'Saving...' : 'Creating...') : (editingUser ? 'Save Changes' : 'Create User')}
              </button>
            </div>
          </form>
        </div>
      )}

      {deleteTarget && (
        <div style={styles.overlay}>
          <div style={styles.modal}>
            <h2 style={styles.modalTitle}>Delete User</h2>
            <p>Are you sure you want to delete <strong>{deleteTarget.firstName} {deleteTarget.lastName}</strong>?</p>
            <div style={styles.modalActions}>
              <button style={styles.secondaryButton} onClick={() => setDeleteTarget(null)} disabled={isSubmitting}>Cancel</button>
              <button style={styles.dangerButton} onClick={deleteUser} disabled={isSubmitting}>
                {isSubmitting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && <div style={{ ...styles.toast, ...(toast.type === 'error' ? styles.toastError : styles.toastSuccess) }}>{toast.message}</div>}
    </div>
  );
}

function Field({ label, value, onChange, error, type = 'text', disabled = false }) {
  return (
    <div>
      <label style={styles.label}>{label}</label>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)} style={styles.input} disabled={disabled} />
      {error && <small style={styles.errorText}>{error}</small>}
    </div>
  );
}

const styles = {
  app: { fontFamily: 'Inter, system-ui, sans-serif', background: '#f6f7fb', minHeight: '100vh', color: '#1f2937', padding: '24px', maxWidth: '1200px', margin: '0 auto' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px', flexWrap: 'wrap', marginBottom: '20px' },
  title: { margin: 0, fontSize: '32px' },
  subtitle: { margin: '6px 0 0', color: '#6b7280' },
  toolbar: { display: 'grid', gridTemplateColumns: '2fr 1fr 1fr auto', gap: '12px', marginBottom: '16px' },
  input: { width: '100%', padding: '12px 14px', borderRadius: '10px', border: '1px solid #d1d5db', fontSize: '14px', background: '#fff', boxSizing: 'border-box' },
  select: { width: '100%', padding: '12px 14px', borderRadius: '10px', border: '1px solid #d1d5db', fontSize: '14px', background: '#fff', boxSizing: 'border-box' },
  primaryButton: { padding: '12px 16px', borderRadius: '10px', border: 'none', background: '#0f766e', color: '#fff', fontWeight: 600, cursor: 'pointer' },
  secondaryButton: { padding: '10px 14px', borderRadius: '10px', border: '1px solid #d1d5db', background: '#fff', color: '#111827', cursor: 'pointer' },
  dangerButton: { padding: '10px 14px', borderRadius: '10px', border: 'none', background: '#dc2626', color: '#fff', cursor: 'pointer' },
  filterCard: { background: '#fff', border: '1px solid #e5e7eb', borderRadius: '14px', padding: '16px', marginBottom: '16px' },
  filterGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' },
  filterActions: { display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '14px' },
  errorBox: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '10px', background: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c', padding: '14px 16px', borderRadius: '12px', marginBottom: '16px' },
  statsRow: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '12px', marginBottom: '16px' },
  statCard: { display: 'flex', flexDirection: 'column', gap: '6px', background: '#fff', border: '1px solid #e5e7eb', borderRadius: '14px', padding: '16px' },
  tableWrap: { overflowX: 'auto', background: '#fff', border: '1px solid #e5e7eb', borderRadius: '16px' },
  table: { width: '100%', borderCollapse: 'collapse', minWidth: '760px' },
  th: { textAlign: 'left', padding: '14px', fontSize: '13px', background: '#f9fafb', borderBottom: '1px solid #e5e7eb' },
  td: { padding: '14px', borderBottom: '1px solid #f1f5f9', fontSize: '14px' },
  actionRow: { display: 'flex', gap: '8px' },
  emptyCell: { padding: '28px', textAlign: 'center', color: '#6b7280' },
  paginationBar: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px', marginTop: '16px', background: '#fff', border: '1px solid #e5e7eb', borderRadius: '14px', padding: '14px 16px' },
  paginationLeft: { display: 'flex', alignItems: 'center', gap: '10px' },
  paginationRight: { display: 'flex', alignItems: 'center', gap: '10px' },
  overlay: { position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', zIndex: 1000 },
  modal: { width: '100%', maxWidth: '560px', background: '#fff', borderRadius: '18px', padding: '24px', boxShadow: '0 20px 60px rgba(15, 23, 42, 0.2)' },
  modalTitle: { marginTop: 0, marginBottom: '18px' },
  formGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' },
  label: { display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px' },
  errorText: { color: '#dc2626', marginTop: '6px', display: 'block' },
  modalActions: { display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' },
  toast: { position: 'fixed', right: '20px', bottom: '20px', padding: '14px 18px', borderRadius: '12px', color: '#fff', fontWeight: 600, zIndex: 1200 },
  toastSuccess: { background: '#059669' },
  toastError: { background: '#dc2626' },
};

const cssText = `
  * { box-sizing: border-box; }
  body { margin: 0; }
  button:disabled { opacity: 0.55; cursor: not-allowed; }
  @media (max-width: 768px) {
    .toolbar-responsive { grid-template-columns: 1fr; }
  }
`;
