# Mini ERP CRM

## Project Overview

Mini ERP CRM is a full-stack business management application designed to manage customer information, products, inventory, and delivery challans through a centralized web interface. It provides role-based access to business operations and uses REST APIs to connect the frontend with the backend.

## Problem Statement

Managing customer records, product inventory, stock movements, and delivery challans separately can lead to inconsistent data and inefficient workflows. Mini ERP CRM addresses this problem by bringing these operations into one application with centralized data storage, authentication, and role-based permissions.

## Goals

- Centralize customer, product, inventory, and challan management.
- Implement secure authentication and role-based access control.
- Maintain inventory consistency through transactional stock updates.

## Technology Stack

- **Frontend:** React, TypeScript
- **Backend:** Node.js, Express.js
- **Database:** PostgreSQL (Supabase)
- **ORM:** Prisma
- **Authentication:** JSON Web Tokens (JWT), bcryptjs for password hashing
- **Other tools/libraries:** Axios, React Router, Prisma PostgreSQL adapter, Postman
- **Deployment:** Vercel (frontend), Render (backend), Supabase (database)

## Key Features

- JWT-based login with role-based access control.
- Customer creation, listing, retrieval, and updating.
- Product management, inventory tracking, and stock movement recording.
- Delivery challan creation and confirmation.
- Automatic stock deduction and stock movement recording when a challan is confirmed.
- REST API documentation through Postman.

## User Roles and Permissions

### Roles

- **ADMIN:** Access to administrative operations permitted by the backend.
- **SALES:** Access to customer and challan operations.
- **WAREHOUSE:** Access to product and inventory operations.
- **ACCOUNTS:** Defined as a user role; dedicated accounts workflows depend on the implemented features.

### Permissions

- Customer endpoints are restricted to `ADMIN` and `SALES`.
- Product and inventory endpoints are restricted to `ADMIN` and `WAREHOUSE`.
- Challan endpoints are restricted to `ADMIN` and `SALES`.
- Authentication is required for the protected endpoints.

### Authorization Approach

The backend uses authentication middleware to validate JWTs and authorization middleware to check the authenticated user's role before allowing access to protected routes. Frontend navigation can be adapted to the user's role, but backend authorization enforces access restrictions.

## Modules

### Module 1: Authentication

- **Purpose:** Authenticate users and identify their roles.
- **Main actions:** Login and retrieve the authenticated user's information.
- **Data stored:** User name, email, password hash, and role.

### Module 2: Customer Management

- **Purpose:** Maintain customer and business information.
- **Main actions:** Create, list, retrieve by ID, and update customers.
- **Data stored:** Name, mobile number, email, business name, GST number, customer type, address, status, follow-up date, and notes.

### Module 3: Products and Inventory

- **Purpose:** Manage product information and inventory quantities.
- **Main actions:** Create, list, retrieve, and update products; record stock movements.
- **Data stored:** Product name, SKU, category, unit price, current stock, minimum stock, warehouse location, and stock movement history.

### Module 4: Delivery Challans

- **Purpose:** Record product quantities issued to customers.
- **Main actions:** Create draft challans, list challans, and confirm draft challans.
- **Data stored:** Challan number, customer, items, product details captured at creation, quantities, status, and creator.

Confirming a challan checks product availability, decreases inventory, records outgoing stock movements, and changes the challan status to `CONFIRMED`.

## Authentication and Authorization

The application uses JWT-based authentication.

1. The user submits their email and password to the login endpoint.
2. The backend verifies the credentials against the stored user record.
3. On successful authentication, the backend returns a JWT and user information.
4. The frontend stores the token and user information in browser local storage.
5. Protected API requests use the token for authentication.
6. Middleware validates the token and checks the user's role before granting access.

Passwords are hashed using bcryptjs rather than stored as plaintext.

## Database Design

### Main Models/Tables

- `User`
- `Customer`
- `Product`
- `StockMovement`
- `Challan`
- `ChallanItem`

The database also contains Prisma's `_prisma_migrations` table for migration tracking.

### Relationships

- A customer can have multiple challans.
- A challan contains multiple challan items.
- Each challan item references a product and stores a snapshot of product details and unit price.
- A product can have multiple stock movements.
- Users are associated with created challans and stock movements.

### Important Constraints

- Product SKUs must be unique.
- Challan items reference existing products.
- Challan confirmation checks that sufficient stock is available.
- Database transactions group the inventory updates, stock movement creation, and challan status update.
- User emails are used to identify users during login and seeding.

## API Design

The backend exposes REST endpoints under `/api`.

### Endpoint 1: Login

- **Method and path:** `POST /api/auth/login`
- **Purpose:** Authenticate a user.
- **Authentication required:** No.
- **Request:**

```json
{
  "email": "admin@minierp.com",
  "password": "Admin@123"
}
```

- **Response:** Returns authentication status, a JWT, and user information on successful login.
- **Validation/errors:** Invalid credentials are rejected. Exact response status codes depend on the controller implementation.

### Endpoint 2: Get Current User

- **Method and path:** `GET /api/auth/me`
- **Purpose:** Retrieve the authenticated user's ID and role.
- **Authentication required:** Yes.
- **Request:** A valid JWT in the authorization header.
- **Response:** Returns `userId` and `role`.
- **Validation/errors:** Requests without valid authentication are rejected by the authentication middleware.

### Endpoint 3: Create Customer

- **Method and path:** `POST /api/customers`
- **Purpose:** Create a customer record.
- **Authentication required:** Yes; `ADMIN` or `SALES`.
- **Request:** Customer details, including name, mobile, business name, customer type, address, and status.
- **Response:** Returns the created customer.
- **Validation/errors:** Missing required fields return `400 Bad Request`.

### Endpoint 4: Create Product

- **Method and path:** `POST /api/products`
- **Purpose:** Create a product record.
- **Authentication required:** Yes; `ADMIN` or `WAREHOUSE`.
- **Request:** Product name, SKU, category, unit price, current stock, minimum stock, and warehouse location.
- **Response:** Returns the created product.
- **Validation/errors:** Missing required fields return `400 Bad Request`; duplicate SKUs return `409 Conflict`.

### Endpoint 5: Record Stock Movement

- **Method and path:** `POST /api/products/:id/stock`
- **Purpose:** Record incoming or outgoing stock.
- **Authentication required:** Yes; `ADMIN` or `WAREHOUSE`.
- **Request:**

```json
{
  "quantity": 5,
  "type": "IN",
  "reason": "Initial stock replenishment"
}
```

- **Response:** Returns the updated product and stock movement.
- **Validation/errors:** Invalid product IDs, non-positive quantities, invalid movement types, and insufficient stock are handled by the controller.

### Endpoint 6: Create Challan

- **Method and path:** `POST /api/challans`
- **Purpose:** Create a draft delivery challan.
- **Authentication required:** Yes; `ADMIN` or `SALES`.
- **Request:**

```json
{
  "customerId": 1,
  "items": [
    {
      "productId": 1,
      "quantity": 2
    }
  ]
}
```

- **Response:** Returns the created challan, customer, and items.
- **Validation/errors:** Requires an existing customer and at least one valid item.

### Endpoint 7: Confirm Challan

- **Method and path:** `POST /api/challans/:id/confirm`
- **Purpose:** Confirm a draft challan and update inventory.
- **Authentication required:** Yes; `ADMIN` or `SALES`.
- **Request:** Challan ID in the URL; no request body is required.
- **Response:** Returns the confirmed challan and its items.
- **Validation/errors:** Rejects invalid IDs, missing challans, non-draft challans, missing products, and insufficient stock.

For the complete endpoint list and request examples, see the Postman documentation linked below.

## Architecture and Data Flow

1. The React and TypeScript frontend handles the user interface, navigation, and user interactions.
2. Axios sends HTTP requests to the Express.js REST API. JWTs are included when accessing protected endpoints.
3. Express middleware authenticates users and enforces role-based permissions.
4. Controllers handle requests and invoke Prisma queries or transactions.
5. Prisma interacts with the PostgreSQL database hosted on Supabase.
6. API responses are returned to the frontend, which updates the interface.

## Validation and Error Handling

The application performs request validation in its controllers for required customer and product fields, stock movement quantities and types, and challan inputs.

The API returns structured JSON responses containing success indicators, messages, and data where applicable. Errors include missing fields, invalid identifiers, duplicate SKUs, missing records, and insufficient inventory.

## Security Considerations

- Passwords are hashed using bcryptjs.
- JWT authentication protects restricted API endpoints.
- Backend middleware enforces role-based access control.
- Database connection details and authentication secrets are configured through environment variables.
- Protected operations verify authentication before proceeding.

The application uses browser local storage for the JWT. This is convenient for a demonstration project but carries security trade-offs if the frontend is vulnerable to cross-site scripting (XSS). A more security-focused deployment could consider an HttpOnly, Secure cookie strategy and additional protections.

## My Contributions

- Developed the React and TypeScript frontend and Node.js/Express backend.
- Implemented JWT authentication and role-based access control.
- Built REST APIs for customer, product, inventory, and challan management.
- Integrated PostgreSQL with Prisma ORM.
- Implemented transactional stock updates and stock movement tracking during challan confirmation.
- Deployed the application using Vercel, Render, and Supabase.
- Prepared API documentation using Postman.

## Technical Challenges and Solutions

### Challenge 1: Inventory Consistency

- **Challenge:** Confirming a challan requires checking stock, decreasing product quantities, recording stock movements, and updating challan status consistently.
- **Solution:** Used a Prisma database transaction to group these related operations so that a failure can roll back the transaction.

### Challenge 2: Role-Based Access Control

- **Challenge:** Different users should only be able to access the operations permitted for their roles.
- **Solution:** Implemented JWT authentication and authorization middleware that restricts customer, product, inventory, and challan endpoints according to role.

## Testing

- Tested API endpoints using Postman.
- Verified successful authentication and protected endpoint access.
- Tested customer and product creation and retrieval.
- Tested stock movement validation and inventory updates.
- Tested challan creation and confirmation workflows.
- Verified deployed API behavior against the PostgreSQL database.

Add automated test framework names and coverage statistics only if you have implemented and run them.

## Deployment and Usage

- **Live application:** https://mini-erp-mauve.vercel.app/
- **Backend API:** https://mini-erp-opc2.onrender.com/api
- **Repository:** https://github.com/Md-Salim-khan-071/Mini-ERP
- **Postman documentation:** Add your published public documentation URL here.

### Environment Variables Required

Configure the variables required by the backend and frontend. Typical names in this project include:

- `DATABASE_URL`
- `JWT_SECRET`
- `VITE_API_URL` or the actual frontend API URL variable used by the project.

Never commit database passwords, JWT secrets, or other sensitive values to the repository.

### How to Run Locally

1. Clone the repository.
2. Install the backend and frontend dependencies in their respective directories.
3. Configure the required environment variables.
4. Apply the Prisma migrations and generate the Prisma client using the project's configured scripts.
5. Start the backend and frontend using the scripts defined in their respective `package.json` files.

Refer to the repository's actual scripts and environment configuration for exact commands.

## Results and Learnings

- Built and deployed a full-stack business management application.
- Gained practical experience integrating React, Express, Prisma, and PostgreSQL.
- Implemented authentication, role-based permissions, and transactional inventory workflows.
- Learned to deploy a frontend, backend API, and database as separate services.
- Documented REST APIs for easier testing and evaluation.

## Known Limitations

- Dedicated accounting workflows are not yet documented as implemented.
- Automated test coverage needs to be established and reported separately.
- Access tokens stored in local storage have security trade-offs.
- Inventory concurrency behavior should be tested under simultaneous stock-changing requests.
- Advanced ERP capabilities such as invoicing, payment reconciliation, and audit logging are not included unless separately implemented.

## Future Improvements

- Add automated unit and integration tests.
- Strengthen inventory concurrency handling.
- Introduce pagination and more advanced filtering for larger datasets.
- Add audit logging for important business operations.
- Implement accounting workflows, invoices, and payment tracking.
- Improve session security and login rate limiting.
- Add CI/CD checks for automated testing and builds.
- Expand dashboard analytics and low-stock alerts.
