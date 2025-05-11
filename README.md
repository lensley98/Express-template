# API Template

This is an Express-based API template. It includes:

- JWT authentication
- X-CSRF-Token protection
- Swagger documentation
- Route versioning
- Validation with custom utility functions
- Logging
- ESLint & Prettier
- Global error handling

## Getting Started

### 1. Clone the repository:

```bash
git clone https://github.com/lensley98/Express-template.git
cd Express-template
```

### 2. Install dependencies:

```bash
   npm install
```

### 3. Set up environment variables:

Create a .env file and set up the following variables:

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

### 4. Start the application with swagger:

```bash
 npm dev:sync
```

Once the app is running, you can access the Swagger API documentation at:

```bash
http://localhost:4003/api-docs
```

### 5. API Endpoints Overview

Below is a summary of the main API endpoints. For detailed documentation including request/response schemas, authentication requirements, and examples, please refer to the Swagger documentation.

#### Authentication

- `POST /api/v1/auth/register` - Register a new user
- `POST /api/v1/auth/login` - Authenticate and receive JWT token
- `POST /api/v1/auth/refresh-token` - Get a new access token using refresh token
- `POST /api/v1/auth/logout` - Invalidate current tokens

#### Users

- `GET /api/v1/users` - Get all users (admin only)
- `GET /api/v1/users/:id` - Get user by ID
- `PUT /api/v1/users/:id` - Update user information
- `DELETE /api/v1/users/:id` - Delete a user

_Note: All endpoints except authentication endpoints require both JWT and X-CSRF-Token headers for protection._

### 6. Authentication Requirements

All authenticated endpoints require the following headers:

- **Authorization** - Bearer token format: `Bearer {jwt_token}`
- **X-CSRF-Token** - CSRF protection token that must be included in all requests that modify data

The CSRF tokens are securely generated using `crypto.randomBytes(32).toString('hex')` and don't require any environment variables.

Example request:

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

### 7. Customizing the Template:

- Controllers: Add new controllers to the controllers/ directory.

- Validators: Create new validation schemas in validators/.

- Utilities: Add utility functions in the utilities/ directory.

- Swagger: Update the swagger.config.ts file to document your new endpoints.

- Middlewares: Add your middleware to the middleware/ directory.

- Cors: Modify the cors.config.json file for your project requirements.

### 8. **Scaffold Script or Generators**

You can create a `scaffold.js` script or use an external tool (like Yeoman) to automate project creation based on this template. However, for simplicity, you can create a manual scaffold method using `npx`.

#### Example Scaffold Script (`scaffold.js`):

```javascript
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
console.log(`New project created at ${targetDir}`);
```
