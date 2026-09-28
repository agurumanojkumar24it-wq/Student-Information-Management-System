# StudentHub Backend

Node.js + Express + MongoDB Atlas backend for StudentHub.

## Requirements
- Node.js
- MongoDB Atlas account
- Internet connection

MongoDB does NOT need to be installed on the laptop. The backend connects directly to MongoDB Atlas using `MONGO_URI`.

## Setup

1. Open this folder in VS Code.
2. Run:

```bash
npm install
```

3. Create `.env` from `.env.example`.
4. Put your MongoDB Atlas connection string into `MONGO_URI`.
5. Put a long random value into `JWT_SECRET`.
6. Run:

```bash
npm run dev
```

Backend: https://student-information-management-syst-henna.vercel.app
Health check: https://student-information-management-syst-henna.vercel.app/api/health

## MongoDB Atlas

Create or use a MongoDB Atlas account. Create a database user, create/use a cluster, and allow the IP address of the machine running the backend in Atlas Network Access. Copy the Node.js driver connection string into `.env`.

Example:

```env
MONGO_URI=mongodb+srv://USERNAME:PASSWORD@cluster0.xxxxx.mongodb.net/studenthub?retryWrites=true&w=majority
```

Do not upload `.env` to GitHub.

## API

Auth:
- POST `/api/auth/register`
- POST `/api/auth/login`
- GET `/api/auth/me`

Students:
- GET/POST `/api/students`
- GET/PUT/DELETE `/api/students/:id`

Faculty:
- GET/POST `/api/faculty`
- PUT/DELETE `/api/faculty/:id`

Courses:
- GET/POST `/api/courses`
- PUT/DELETE `/api/courses/:id`

Subjects:
- GET/POST `/api/subjects`
- PUT/DELETE `/api/subjects/:id`

Attendance:
- GET/POST `/api/attendance`
- PUT/DELETE `/api/attendance/:id`

Marks:
- GET/POST `/api/marks`
- PUT/DELETE `/api/marks/:id`

Protected routes require:

`Authorization: Bearer YOUR_JWT_TOKEN`

The backend validates marks from 0-100 and prevents duplicate attendance for the same student + subject + date.
