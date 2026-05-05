# Team Task Manager

This is a production-ready Team Task Manager web application built from scratch with a modern MERN stack.

## Features list

- User Authentication (Register, Login, Logout, Token Refresh, Profile)
- Project Management (Create, View, Update, Delete Projects)
- Task Management (Create, View, Update, Delete Tasks)
- Kanban Board for task status visualization
- Role-based access control (Project Admin, Project Member)
- Dashboard with key statistics (Total Projects, Total Tasks, Tasks by Status, Overdue Tasks, Recent Activity, My Assigned Tasks)
- Member Management within projects (Add/Remove members, assign roles)
- Zod for request validation
- Global error handling

## Tech Stack table

| Category    | Technology                               |
| :---------- | :--------------------------------------- |
| **Frontend**  | React.js, Tailwind CSS, React Router v6, TanStack React Query, Axios |
| **Backend**   | Node.js, Express.js                      |
| **Database**  | MongoDB Atlas (Cloud DB)                 |
| **ODM**       | Mongoose                                 |
| **Auth**      | JWT (Access Token + Refresh Token), bcrypt |
| **Validation**| Zod                                      |
| **Utilities** | dotenv, cors                             |

## Local Setup

Follow these steps to set up the project locally:

1.  **Clone the repository:**

    ```bash
    git clone <repository-url>
    cd team-task-manager
    ```

2.  **Create MongoDB Atlas free cluster:**

    -   Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
    -   Create a free account and set up a new cluster (M0 tier).
    -   Create a database user with a strong password.
    -   Allow access from anywhere (or your IP address).
    -   Get your connection string (MONGO_URI).

3.  **Setup `/backend/.env`:**

    Create a `.env` file in the `/backend` directory with the following variables:

    ```env
    MONGO_URI=mongodb+srv://<username>:<password>@<cluster-name>.mongodb.net/<database-name>?retryWrites=true&w=majority
    JWT_SECRET=YOUR_VERY_STRONG_AND_LONG_JWT_SECRET
    JWT_REFRESH_SECRET=ANOTHER_VERY_STRONG_AND_LONG_JWT_REFRESH_SECRET
    PORT=5000
    CLIENT_URL=http://localhost:5173
    ```

    -   Replace `<username>`, `<password>`, `<cluster-name>`, and `<database-name>` with your MongoDB Atlas details.
    -   Generate strong random strings for `JWT_SECRET` and `JWT_REFRESH_SECRET`.

4.  **Setup `/frontend/.env`:**

    Create a `.env` file in the `/frontend` directory with the following variable:

    ```env
    VITE_API_URL=http://localhost:5000/api
    ```

5.  **Install dependencies:**

    ```bash
    # Install backend dependencies
    cd backend
    npm install

    # Install frontend dependencies
    cd ../frontend
    npm install
    ```

6.  **Seed the database (optional but recommended):**

    ```bash
    cd ../backend
    node scripts/seed.js
    ```

7.  **Run the applications:**

    ```bash
    # In the /backend directory
    npm start

    # In the /frontend directory
    npm run dev
    ```

    The frontend will be available at `http://localhost:5173` and the backend API at `http://localhost:5000/api`.

## .env Variables Table

| Variable           | Description                                    | Example                                                              |
| :----------------- | :--------------------------------------------- | :------------------------------------------------------------------- |
| `MONGO_URI`        | MongoDB Atlas connection string                | `mongodb+srv://user:pass@cluster.mongodb.net/db?retryWrites=true` |
| `JWT_SECRET`       | Secret key for signing JWT access tokens       | `your_access_token_secret`                                           |
| `JWT_REFRESH_SECRET`| Secret key for signing JWT refresh tokens      | `your_refresh_token_secret`                                          |
| `PORT`             | Port for the backend server                    | `5000`                                                               |
| `CLIENT_URL`       | URL of the frontend application (for CORS)     | `http://localhost:5173`                                              |
| `VITE_API_URL`     | Base URL for the backend API (frontend)        | `http://localhost:5000/api`                                          |

## API Docs

### Auth Endpoints

| Method | Endpoint             | Auth       | Body                                 | Response                               |
| :----- | :------------------- | :--------- | :----------------------------------- | :------------------------------------- |
| `POST` | `/api/auth/register` | None       | `{ name, email, password }`          | `{ accessToken, refreshToken, user }`  |
| `POST` | `/api/auth/login`    | None       | `{ email, password }`                | `{ accessToken, refreshToken, user }`  |
| `POST` | `/api/auth/refresh`  | None       | `{ refreshToken }`                   | `{ accessToken }`                      |
| `POST` | `/api/auth/logout`   | None       | `{ refreshToken }`                   | `null`                                 |
| `GET`  | `/api/auth/me`       | `Bearer`   | None                                 | `{ user }`                             |

### Project Endpoints

| Method   | Endpoint                     | Auth       | Body                                 | Response                               |
| :------- | :--------------------------- | :--------- | :----------------------------------- | :------------------------------------- |
| `POST`   | `/api/projects`              | `Bearer`   | `{ name, description? }`             | `{ project }`                          |
| `GET`    | `/api/projects`              | `Bearer`   | None                                 | `[project]`                            |
| `GET`    | `/api/projects/:id`          | `Bearer`   | None                                 | `{ project, stats }`                   |
| `PUT`    | `/api/projects/:id`          | `Bearer`   | `{ name?, description? }`            | `{ project }`                          |
| `DELETE` | `/api/projects/:id`          | `Bearer`   | None                                 | `null`                                 |
| `POST`   | `/api/projects/:id/members`  | `Bearer`   | `{ email, role? }`                   | `{ project }`                          |
| `DELETE` | `/api/projects/:id/members/:userId`| `Bearer`   | None                                 | `{ project }`                          |

### Task Endpoints

| Method   | Endpoint                             | Auth       | Body                                                              | Response                               |
| :------- | :----------------------------------- | :--------- | :---------------------------------------------------------------- | :------------------------------------- |
| `POST`   | `/api/projects/:projectId/tasks`     | `Bearer`   | `{ title, description?, priority?, dueDate?, assigneeId? }`       | `{ task }`                             |
| `GET`    | `/api/projects/:projectId/tasks`     | `Bearer`   | `?status=TODO&priority=HIGH&assigneeId=xxx`                       | `[task]`                               |
| `GET`    | `/api/projects/:projectId/tasks/:taskId`| `Bearer`   | None                                                              | `{ task }`                             |
| `PUT`    | `/api/projects/:projectId/tasks/:taskId`| `Bearer`   | `{ title?, description?, status?, priority?, dueDate?, assigneeId? }`| `{ task }`                             |
| `DELETE` | `/api/projects/:projectId/tasks/:taskId`| `Bearer`   | None                                                              | `null`                                 |

### Dashboard Endpoint

| Method | Endpoint           | Auth       | Body | Response                               |
| :----- | :----------------- | :--------- | :--- | :------------------------------------- |
| `GET`  | `/api/dashboard`   | `Bearer`   | None | `{ totalProjects, totalTasks, tasksByStatus, overdueTasks, recentTasks, myAssignedTasks }` |

## Role Permissions Table

| Action                    | Project ADMIN | Project MEMBER |
| :------------------------ | :-----------: | :------------: |
| Create project            |      ✅       |      ✅        |
| View project              |      ✅       |      ✅        |
| Edit / Delete project     |      ✅       |      ❌        |
| Add / Remove members      |      ✅       |      ❌        |
| Create task               |      ✅       |      ✅        |
| Edit any task             |      ✅       |      ❌        |
| Edit own / assigned task  |      ✅       |      ✅        |
| Delete task               |      ✅       |  creator only  |
| Assign task to others     |      ✅       |      ✅        |
