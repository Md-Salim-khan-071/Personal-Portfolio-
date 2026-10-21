
# FocusFlow

## Project Overview

FocusFlow is a full-stack personal productivity dashboard designed to help users organize tasks, manage focus sessions, and track their productivity from a single interface.

It addresses the problem of switching between multiple productivity tools by bringing task management, a Pomodoro timer, productivity visualization, progress tracking, and quick notes together in one application.

The project combines a responsive frontend with a Python FastAPI backend and a PostgreSQL database to provide cloud-based task persistence.

## Features

- **Task Management:** Create, edit, complete, and delete tasks.
- **Task Categories:** Organize tasks into daily, weekly, and milestone categories.
- **Task History:** Archive tasks and track completed tasks.
- **Pomodoro Timer:** Manage focus and break sessions with start, pause, and reset controls.
- **Productivity Heatmap:** Visualize productivity activity and maintain streaks.
- **Progress Dashboard:** View productivity progress and task-related statistics.
- **Quick Notes:** Create and manage notes directly from the dashboard.
- **Dashboard Widgets:** Display the clock, date, personalized greeting, weather, and motivational quotes.
- **Theme Customization:** Switch the dashboard theme.
- **Responsive Interface:** Adapt the layout for desktop, tablet, and mobile screens.
- **Cloud-Based Task Persistence:** Store task data in PostgreSQL through the backend API.
- **REST API:** Perform task CRUD operations through FastAPI endpoints.

**Storage note:** Tasks are stored in the cloud database. Pomodoro, heatmap, quick notes, and interface preferences currently use browser localStorage.

## Technology Stack

- **Frontend:** HTML5, CSS3, JavaScript
- **Backend:** Python, FastAPI, Uvicorn
- **Database:** PostgreSQL
- **ORM:** SQLAlchemy
- **Database Hosting:** Supabase
- **Frontend Deployment:** Vercel
- **Backend Deployment:** Render
- **API Communication:** REST API using Fetch
- **Local Persistence:** Browser localStorage
- **API Testing:** FastAPI Swagger UI

## System Architecture

FocusFlow follows a frontend-backend-database architecture.

### Architecture Flow

```text
User
  |
  v
Frontend (HTML, CSS, JavaScript)
  |
  | HTTP requests using Fetch API
  v
Backend (FastAPI on Render)
  |
  | SQLAlchemy ORM
  v
PostgreSQL Database (Supabase)
```

### How It Works

1. The user interacts with the FocusFlow frontend hosted on Vercel.
2. JavaScript sends HTTP requests to the FastAPI backend using the Fetch API.
3. FastAPI processes requests through the task API routes.
4. SQLAlchemy handles database operations.
5. PostgreSQL stores task records persistently through Supabase.
6. The backend returns JSON responses to the frontend.
7. The frontend updates the interface using the returned data.

Other productivity features, including Pomodoro sessions, heatmap data, and quick notes, currently rely on browser localStorage rather than the backend database.

## API Endpoints

The backend exposes REST endpoints for task management.

Base URL: `YOUR_RENDER_BACKEND_URL`

### 1. Create a Task

- **Method:** `POST`
- **Endpoint:** `/tasks/`
- **Purpose:** Creates a new task in the database.

**Request body:**

```json
{
  "title": "Complete project documentation",
  "category": "Daily"
}
```

**Response:** A JSON object containing the created task, including its generated ID, completion status, archive status, creation timestamp, and other task fields.

### 2. Retrieve Tasks

- **Method:** `GET`
- **Endpoint:** `/tasks/`
- **Purpose:** Retrieves the tasks stored in the database.

**Request:** No request body required.

**Response:** A JSON array containing task records.

### 3. Update a Task

- **Method:** `PUT`
- **Endpoint:** `/tasks/{task_id}`
- **Purpose:** Updates an existing task, such as its title, category, completion status, archive status, or completion date.

**Example request body:**

```json
{
  "title": "Complete project documentation",
  "completed": true
}
```

**Response:** A JSON object representing the updated task.

### 4. Delete a Task

- **Method:** `DELETE`
- **Endpoint:** `/tasks/{task_id}`
- **Purpose:** Deletes a task from the database.

**Request:** The task ID is provided as a URL parameter. No request body is required.

**Response:** A confirmation response indicating that the task was deleted.

### 5. Root Endpoint

- **Method:** `GET`
- **Endpoint:** `/`
- **Purpose:** Confirms that the API is running.

**Response:**

```json
{
  "message": "FocusFlow API is running"
}
```

### 6. Health Check

- **Method:** `GET`
- **Endpoint:** `/health`
- **Purpose:** Checks the API and database connection status.

**Response:**

```json
{
  "status": "healthy",
  "database": "connected"
}
```

The health check reports whether the database connection succeeds.

### Interactive API Documentation

FastAPI automatically generates interactive API documentation at:

`YOUR_RENDER_BACKEND_URL/docs`

Use this page to inspect endpoint schemas and test requests against the deployed backend.

## Database Design

FocusFlow currently uses PostgreSQL hosted on Supabase.

### Table: `tasks`

| Column | Data Type | Description |
|---|---|---|
| `id` | Integer | Primary key; uniquely identifies each task |
| `user_id` | Integer, nullable | Reserved for future user association; authentication is not implemented |
| `title` | String (255) | Task title; required |
| `category` | String (50) | Task category; required |
| `completed` | Boolean | Indicates whether the task is completed |
| `archived` | Boolean | Indicates whether the task is archived |
| `created_at` | DateTime | Records when the task was created |
| `completed_date` | Date, nullable | Stores the task completion date when available |

### Constraints and Defaults

- `id` is the primary key and is indexed.
- `title` and `category` are non-nullable.
- `user_id` and `completed_date` can be null.
- `completed` defaults to `false`.
- `archived` defaults to `false`.
- `created_at` uses a default timestamp generated by the backend model.

### Relationships

No user table or user-to-task relationship is currently implemented. The `user_id` column is nullable and does not currently provide user isolation.

Pomodoro sessions, notes, heatmap data, and interface preferences are not stored in this PostgreSQL table; they currently use localStorage.

## Authentication and Authorization

Authentication and authorization are **not currently implemented**.

- The application does not have a login or registration system.
- The task API does not currently associate requests with authenticated users.
- The `user_id` column is reserved for potential future user association.
- Tasks are not isolated by user.
- The deployed API should not be treated as a secure multi-user service in its current state.

Authentication, authorization, user-specific database queries, and appropriate database access policies are planned improvements before supporting multiple users securely.

## Key Implementation Details

### 1. FastAPI Backend

FastAPI provides the REST API for task management. Routes handle task creation, retrieval, updates, and deletion.

### 2. SQLAlchemy ORM

SQLAlchemy maps Python task objects to PostgreSQL records and manages database queries.

### 3. Pydantic Schemas

Pydantic models define the accepted task input fields and the structure of task responses. The update schema allows optional fields so individual task properties can be updated.

### 4. Database Connection

The backend loads database connection settings from environment variables. SQLAlchemy creates the database engine and session factory, and the health endpoint checks connectivity.

### 5. Frontend-Backend Integration

The frontend uses JavaScript's Fetch API to communicate with the deployed FastAPI backend. Task operations use HTTP requests instead of relying exclusively on localStorage.

### 6. Task State Management

The frontend retrieves tasks from the backend and renders them in the interface. Task creation, editing, completion, and deletion are synchronized with the API.

### 7. Pomodoro Timer

The timer supports focus and break sessions, pause and reset controls, audio notifications, and session counting. Its timing logic is designed to remain accurate when the browser tab is inactive.

### 8. Productivity Tracking

The heatmap and progress dashboard visualize productivity using locally available task and Pomodoro activity data.

### 9. Cross-Origin Requests

The FastAPI application uses CORS middleware to permit frontend requests from a separate deployment origin. The current permissive development configuration should be restricted to trusted origins for production hardening.

## Challenges and Solutions

### 1. Connecting the Backend to PostgreSQL

**Challenge:** Establishing a reliable connection between a locally developed FastAPI backend and a hosted Supabase PostgreSQL database.

**Solution:** Configured database connection parameters through environment variables and used SQLAlchemy's database URL construction to handle credentials safely.

### 2. Designing a Suitable Task Schema

**Challenge:** The original frontend task objects contained fields that were not represented in the initial database table.

**Solution:** Updated the SQLAlchemy model and PostgreSQL table to include task categories, completion status, archive status, creation timestamps, and completion dates.

### 3. Migrating Task Persistence

**Challenge:** Replacing localStorage-based task persistence without disrupting existing dashboard functionality.

**Solution:** Integrated the Fetch API with FastAPI task endpoints while retaining localStorage for features that have not yet been migrated.

### 4. Deploying the Backend

**Challenge:** Configuring the backend deployment to find its dependencies and start the FastAPI application correctly.

**Solution:** Configured Render to use the `Backend` directory, install dependencies from `requirements.txt`, and start Uvicorn on the deployment-provided port.

### 5. Deploying the Frontend

**Challenge:** Resolving a deployment issue caused by the frontend entry file's capitalization.

**Solution:** Renamed `Index.html` to `index.html` so the deployed frontend could load its default entry page correctly.

### 6. Managing Git Synchronization

**Challenge:** Resolving rejected Git pushes caused by differences between the local branch and the remote repository.

**Solution:** Used Git status checks, fetches, and rebasing to reconcile branch history rather than force-pushing over remote changes.

### 7. Responsive Design

**Challenge:** Adapting a dashboard containing multiple widgets and productivity sections to smaller screens.

**Solution:** Added responsive CSS breakpoints and adjusted layouts, component widths, spacing, and heatmap overflow behavior.

## Testing

Testing was performed manually during development.

- **API testing:** Used FastAPI Swagger UI at `/docs` to test task endpoints.
- **Database connectivity:** Used the `/health` endpoint to verify the API's database connection.
- **CRUD testing:** Created, retrieved, edited, completed, and deleted tasks through the application and verified persistence after refreshing the page.
- **Deployment testing:** Checked the deployed frontend and backend to confirm that the application and API were accessible.
- **Frontend integration testing:** Verified that task operations communicated with the deployed backend.
- **Responsive testing:** Checked the dashboard layout at different viewport sizes.

No automated unit-test or integration-test suite is currently documented as implemented.

## My Contributions

I designed and implemented FocusFlow as a personal productivity dashboard, including:

- Developed the frontend interface using HTML, CSS, and JavaScript.
- Implemented task management, task history, Pomodoro timer, productivity heatmap, progress dashboard, and quick notes.
- Built a Python FastAPI backend exposing REST endpoints for task CRUD operations.
- Designed the SQLAlchemy task model and Pydantic request and response schemas.
- Connected the backend to PostgreSQL hosted on Supabase.
- Integrated frontend task operations with the backend using the Fetch API.
- Configured environment-based database credentials.
- Deployed the frontend to Vercel and the backend to Render.
- Tested task persistence, API behavior, and deployed application functionality.
- Improved the interface for smaller screens through responsive CSS.

## Limitations and Future Improvements

### Current Limitations

- No authentication or user registration.
- No user-specific task isolation.
- Only task data is persisted in the cloud database.
- Pomodoro data, heatmap data, quick notes, and UI preferences rely on browser localStorage.
- Local browser data is not automatically synchronized across devices.
- Automated test coverage has not yet been established.
- CORS configuration and database access policies require further production hardening.

### Planned Improvements

- Implement authentication and authorization.
- Associate tasks with authenticated users and enforce user-specific access.
- Migrate notes, Pomodoro sessions, and productivity records to the backend.
- Add secure cross-device synchronization.
- Introduce automated unit and integration tests.
- Improve API validation and standardized error responses.
- Restrict CORS to trusted frontend origins.
- Add database migrations and structured logging.
- Improve accessibility and continue refining responsive behavior.

## Links

- **GitHub Repository:** https://github.com/Md-Salim-khan-071/FocusFlow
- **Live Demo:** https://focus-flow-liart-gamma.vercel.app/

