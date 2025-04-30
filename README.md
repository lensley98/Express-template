# API Template

This is an Express-based API template. It includes:
- JWT authentication
- Swagger documentation
- Route versioning
- Validation with custom utility functions

## Getting Started

### 1. Clone the repository:
```bash
git clone https://github.com/lensley98/Express-template.git
cd Express-template
```
### 2. Install dependencies:
```  bash
   npm install
```
### 3. Set up environment variables:
   Create a .env file and set up the following variables:

```ini
PORT=3000
SECRET_KEY=mysecretkey
DB_HOST=localhost
DB_USER=user
DB_PASSWORD=password
DB_NAME=database
```
### 4. Start the application:
  ``` bash
   npm start
   ```
   Once the app is running, you can access the Swagger API documentation at:

```bash
http://localhost:3000/api-docs
```
### 5. Customizing the Template:
- Controllers: Add new controllers to the controllers/ directory.

- Validators: Create new validation schemas in validators/.

- Utilities: Add utility functions in the utilities/ directory.

- Swagger: Update the swagger.js file to document your new endpoints.


This ensures that future users of the template know exactly how to get started and what they need to configure.

### 6. **Scaffold Script or Generators**

You can create a `scaffold.js` script or use an external tool (like Yeoman) to automate project creation based on this template. However, for simplicity, you can create a manual scaffold method using `npx`.

#### Example Scaffold Script (`scaffold.js`):

```javascript
const fs = require('fs');
const path = require('path');

const sourceDir = path.join(__dirname, 'template');  // Path to your template project
const targetDir = path.join(process.cwd(), 'new-project');  // Target directory for new project

const copyDirRecursive = (src, dest) => {
    fs.readdirSync(src).forEach(item => {
        const srcPath = path.join(src, item);
        const destPath = path.join(dest, item);
        
        if (fs.statSync(srcPath).isDirectory()) {
            fs.mkdirSync(destPath, { recursive: true });
            copyDirRecursive(srcPath, destPath);  // Recursively copy files
        } else {
            fs.copyFileSync(srcPath, destPath);  // Copy individual files
        }
    });
};

fs.mkdirSync(targetDir, { recursive: true });
copyDirRecursive(sourceDir, targetDir);
console.log(`New project created at ${targetDir}`);
