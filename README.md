# React User Management Dashboard

A compact React.js solution for the Tacnique assignment using only **4 files**:

```
react-user-dashboard/
├── package.json
├── index.html
└── src/
    └── main.jsx
```

## What's Included

- React + Vite setup
- Axios API integration with JSONPlaceholder
- View, add, edit, delete users
- Search, sort, filter popup section
- Pagination with 10 / 25 / 50 / 100
- Responsive layout
- Client-side validation
- Error handling with retry
- Built-in Vitest + Testing Library tests inside the same `main.jsx` file to keep file count low

## Assumptions

JSONPlaceholder `/users` does not provide `firstName`, `lastName`, or `department`. So:
- `name` is split into `firstName` and `lastName`
- `department` is assigned from a rotating predefined list
- POST/PUT/DELETE succeed as mock API calls, but persistence is handled in React state locally

## Run Locally

### 1. Create project
```bash
npm install
```

### 2. Start development server
```bash
npm run dev
```

Open the URL shown in terminal, usually:
```bash
http://localhost:5173
```

### 3. Production build
```bash
npm run build
npm run preview
```

## Run Tests

### Run all tests once
```bash
npm test
```

### Watch mode
```bash
npm run test:watch
```

## What the Tests Cover

- `mapApiUsers()` correctly transforms API response
- `validateUser()` catches empty fields and invalid emails
- `processUsers()` correctly filters, sorts, and paginates
- component smoke test confirms dashboard heading renders

## Manual Testing Checklist

### Fetch and view
- Start app
- Confirm users load in table
- Confirm stats update

### Add user
- Click **Add User**
- Submit empty form -> validation errors should appear
- Enter valid values -> user should appear at top of list

### Edit user
- Click **Edit** on any row
- Change one field
- Save changes
- Confirm updated value in table

### Delete user
- Click **Delete**
- Confirm modal
- User should disappear from table

### Search / filter / sort
- Search by first name or email
- Open filters and apply department filter
- Change sort field and order

### Pagination
- Change rows per page to 10 / 25 / 50 / 100
- Move between pages with Previous / Next

### Error handling
- Turn off internet or block network request in devtools
- Reload app
- Retry button should appear in error banner

## Submission Notes

This version uses **React.js**, which aligns better with the preferred frontend stack in the assignment.
Because you asked for very few files, everything is intentionally kept in `src/main.jsx` instead of splitting into many components.
