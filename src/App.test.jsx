import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import App from './App';
import { mapApiUsers, validateUser, processUsers } from './utils';

describe('utility logic', () => {
  it('maps API users into assignment shape', () => {
    const mapped = mapApiUsers([{ id: 1, name: 'Leanne Graham', email: 'leanne@example.com' }]);
    expect(mapped[0]).toEqual({
      id: 1,
      firstName: 'Leanne',
      lastName: 'Graham',
      email: 'leanne@example.com',
      department: 'Engineering',
    });
  });

  it('validates invalid form data', () => {
    const result = validateUser({ firstName: '', lastName: '', email: 'bad', department: '' });
    expect(result.firstName).toBeTruthy();
    expect(result.lastName).toBeTruthy();
    expect(result.email).toBe('Invalid email format');
    expect(result.department).toBeTruthy();
  });

  it('filters sorts and paginates users', () => {
    const users = [
      { id: 2, firstName: 'Bob', lastName: 'Zed', email: 'bob@mail.com', department: 'Sales' },
      { id: 1, firstName: 'Alice', lastName: 'Lane', email: 'alice@mail.com', department: 'Engineering' },
    ];
    const result = processUsers({
      users,
      search: 'ali',
      filters: { firstName: '', lastName: '', email: '', department: '' },
      sortField: 'firstName',
      sortOrder: 'asc',
      currentPage: 1,
      pageSize: 10,
    });
    expect(result.filtered).toHaveLength(1);
    expect(result.paginated[0].firstName).toBe('Alice');
  });
});

describe('component smoke test', () => {
  it('renders heading', () => {
    render(<App />);
    expect(screen.getByText('User Management Dashboard')).toBeInTheDocument();
  });
});
