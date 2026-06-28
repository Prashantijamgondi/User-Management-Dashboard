export const DEPARTMENTS = ['Engineering', 'Sales', 'HR', 'Marketing', 'IT', 'Finance', 'Design', 'Operations'];

export const mapApiUsers = (apiUsers) =>
  apiUsers.map((user, index) => {
    const parts = user.name.trim().split(' ');
    return {
      id: user.id,
      firstName: parts[0] || '',
      lastName: parts.slice(1).join(' ') || '',
      email: user.email,
      department: DEPARTMENTS[index % DEPARTMENTS.length],
    };
  });

export const validateUser = (form) => {
  const errors = {};
  if (!form.firstName.trim()) errors.firstName = 'First name is required';
  if (!form.lastName.trim()) errors.lastName = 'Last name is required';
  if (!form.email.trim()) errors.email = 'Email is required';
  else if (!/\S+@\S+\.\S+/.test(form.email)) errors.email = 'Invalid email format';
  if (!form.department.trim()) errors.department = 'Department is required';
  return errors;
};

export const processUsers = ({ users, search, filters, sortField, sortOrder, currentPage, pageSize }) => {
  const query = search.trim().toLowerCase();
  const filtered = users.filter((user) => {
    const matchesSearch =
      !query ||
      [user.id, user.firstName, user.lastName, user.email, user.department]
        .join(' ')
        .toLowerCase()
        .includes(query);

    const matchesFilter =
      (!filters.firstName || user.firstName.toLowerCase().includes(filters.firstName.toLowerCase())) &&
      (!filters.lastName || user.lastName.toLowerCase().includes(filters.lastName.toLowerCase())) &&
      (!filters.email || user.email.toLowerCase().includes(filters.email.toLowerCase())) &&
      (!filters.department || user.department === filters.department);

    return matchesSearch && matchesFilter;
  });

  const sorted = [...filtered].sort((a, b) => {
    if (!sortField) return 0;
    if (sortField === 'id') return sortOrder === 'asc' ? a.id - b.id : b.id - a.id;
    const aValue = String(a[sortField] ?? '').toLowerCase();
    const bValue = String(b[sortField] ?? '').toLowerCase();
    return sortOrder === 'asc' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
  });

  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const safePage = Math.min(currentPage, totalPages);
  const startIndex = (safePage - 1) * pageSize;
  const paginated = sorted.slice(startIndex, startIndex + pageSize);

  return { filtered, sorted, paginated, totalPages, safePage };
};
