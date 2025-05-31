# 🚀 API Template

![Build Status](https://img.shields.io/badge/Build-Passing-brightgreen)
![Node](https://img.shields.io/badge/Node-%3E%3D20.0.0%20%7C%7C%20%3E%3D22.0.0-blue)
![npm](https://img.shields.io/badge/npm-%3E%3D9.0.0-red)
![TypeScript](https://img.shields.io/badge/TypeScript-Supported-3178c6?logo=typescript)

A powerful Express-based API template packed with essential features for secure and scalable backend development.

---

## 📚 Table of Contents

- [✨ Features](#-features)
- [🚀 Getting Started](#-getting-started)
  - [📥 Clone the Repository](#-1-clone-the-repository)
  - [📦 Install Dependencies](#-2-install-dependencies)
  - [🔐 Set Up Environment Variables](#-3-set-up-environment-variables)
  - [▶️ Start the Application](#-4-start-the-application-with-swagger)
- [🌐 API Endpoints Overview](#-5-api-endpoints-overview)
- [🔒 Authentication Requirements](#-6-authentication-requirements)
- [🛠️ Customizing the Template](#-7-customizing-the-template)
- [⚙️ Scaffold Script](#-8-scaffold-script-or-generators)


---

## ✨ Features

This Express-based template includes:

- 🔐 **JWT authentication**  
- 🛡️ **X-CSRF-Token protection**  
- 📘 **Swagger documentation**  
- 🗂️ **Route versioning**  
- ✅ **Validation with custom utility functions**  
- 📝 **Logging**  
- 🧹 **ESLint & Prettier**  
- 💥 **Global error handling**

---

## 🚀 Getting Started

### 📥 1. Clone the repository

```bash
git clone https://github.com/lensley98/Express-template.git
cd Express-template
````

### 📦 2. Install dependencies

```bash
npm install
```

### 🔐 3. Set up environment variables

Create a `.env` file and set the following variables:

```ini
PORT=4003
SECRET_KEY=mysecretkey
DB_HOST=localhost
DB_USER=user
DB_PASSWORD=password
DB_NAME=database
REFRESH_TOKEN_SECRET=myrefreshtokensecret
BROWSER_SYNC_PORT=4004
NODE_ENV=DEV
URL=localhost
LOG_LEVEL=info
```

### ▶️ 4. Start the application with Swagger

```bash
npm run dev:sync
```

Once the app is running, open Swagger API docs at:

```
http://localhost:4003/api-docs
```

---

## 🌐 5. API Endpoints Overview

This is a summary of the core endpoints. Full docs (schemas, responses, auth) available at Swagger UI.

### 🔐 Authentication

| Method | Endpoint                     | Description                       |
|--------|------------------------------|-----------------------------------|
| POST   | `/api/v1/auth/register`      | Register a new user               |
| POST   | `/api/v1/auth/login`         | Login and receive JWT             |
| POST   | `/api/v1/auth/refresh-token` | Get a new token via refresh token |
| POST   | `/api/v1/auth/logout`        | Invalidate current tokens         |

### 👤 Users

| Method | Endpoint            | Description           |
|--------|---------------------|-----------------------|
| GET    | `/api/v1/users`     | Get all users (admin) |
| GET    | `/api/v1/users/:id` | Get user by ID        |
| PUT    | `/api/v1/users/:id` | Update user info      |
| DELETE | `/api/v1/users/:id` | Delete user           |

> ⚠️ All endpoints (except auth) require JWT and X-CSRF-Token headers.

---

## 🔒 6. Authentication Requirements

All authenticated endpoints require these headers:

* `Authorization: Bearer <jwt_token>`
* `X-CSRF-Token: <csrf_token>`

CSRF tokens are securely generated using:

```js
crypto.randomBytes(32).toString('hex')
```

No need to define them in `.env`.

### ✅ Example Authenticated Request

```javascript
fetch('/api/v1/resource', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    'X-CSRF-Token': 'f85e9341b14b5ebb3be2e64c9bd40372',
  },
  body: JSON.stringify(data),
});
```

---

## 🛠️ 7. Customizing the Template

Here’s how to extend and customize your API:

* **Controllers**
  Add new files under `controllers/`.

* **Validators**
  Add schemas under `validators/`.

* **Utilities**
  Add helper functions in `utilities/`.

* **Swagger**
  Update endpoint docs in `swagger.config.ts`.

* **Middlewares**
  Add global or route-level middleware in `middleware/`.

* **CORS Configuration**
  Modify the `cors.config.json` to match project policies.

---

## ⚙️ 8. Scaffold Script or Generators

You can use a simple script or generator like `Yeoman` to automate project creation based on this template.

### 📄 Example `scaffold.js` Script

```js
const fs = require('fs');
const path = require('path');

const sourceDir = path.join(__dirname, 'template'); // Path to your template project
const targetDir = path.join(process.cwd(), 'new-project'); // Target directory for new project

const copyDirRecursive = (src, dest) => {
  fs.readdirSync(src).forEach((item) => {
    const srcPath = path.join(src, item);
    const destPath = path.join(dest, item);

    if (fs.statSync(srcPath).isDirectory()) {
      fs.mkdirSync(destPath, { recursive: true });
      copyDirRecursive(srcPath, destPath); // Recursively copy files
    } else {
      fs.copyFileSync(srcPath, destPath); // Copy individual files
    }
  });
};

fs.mkdirSync(targetDir, { recursive: true });
copyDirRecursive(sourceDir, targetDir);
console.log(`📁 New project created at ${targetDir}`);
```

---

> ✅ Built for developers who want structure, security, and flexibility in their Express APIs.

Happy building! 🚀