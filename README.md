# User Management Dashboard

A simple user management app built with React + Vite. It fetches users from a mock API and lets you view, add, edit, and delete them.

---

## Features

- View all users in a table
- Search, filter, and sort users
- Add, edit, and delete users
- Pagination (10 / 25 / 50 / 100 rows)
- Form validation
- Loading states and toast notifications
- Error handling with retry

---

## Project Structure

```
user-management-dashboard/
├── src/
│   ├── App.jsx          # Main dashboard UI and logic
│   ├── utils.js         # Helper functions (filter, sort, validate)
│   ├── main.jsx         # App entry point
│   └── App.test.jsx     # Unit tests
├── .env                 # Your local environment variables (not committed)
├── .env.example         # Template — copy this to .env to get started
├── index.html
└── package.json
```

---

## Getting Started

### 1. Clone and install dependencies
```bash
npm install
```

### 2. Set up environment variables
```bash
# Copy the example file
cp .env.example .env
```

The `.env` file looks like this:
```
VITE_API_URL=https://jsonplaceholder.typicode.com/users
```

### 3. Start the dev server
```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## Notes

- This app uses [JSONPlaceholder](https://jsonplaceholder.typicode.com/) as a free mock API
- The API only has 10 real users (IDs 1–10). Users you add locally get IDs > 10 and are managed in client state only
- The `name` field from the API is split into `firstName` and `lastName`
- `department` is assigned from a rotating predefined list since the API doesn't provide one

---

## Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run lint` | Run ESLint checks |
| `npm run preview` | Preview the production build |
