# Firebase Remote Config API with Node.js and Cloud Functions

## **Overview**

This project leverages **Firebase Cloud Functions** to interact with **Firebase Remote Config**. It uses secure **JWT-based authentication** to allow users to manage and retrieve configuration data, such as themes and widget settings.

The purpose is to simplify managing dynamic configuration values through APIs.

---

## **Folder Structure**

```plaintext
app_cloud_config_server/
├── functions/
│   ├── .gitignore
│   ├── index.js               # Core implementation of APIs
│   ├── package-lock.json      # Dependencies lock file
│   └── package.json           # Project dependencies
├── .firebaserc                # Firebase project configuration
├── .gitignore                 # Ignore file for Git
└── firebase.json              # Firebase emulator and deployment settings
```

---

## **API Methods**

### **1. `createToken`**

- **Purpose**:
  - Securely convert Firebase credentials into a **JWT token** to avoid storing sensitive information in raw format.
- **Key Features**:
  - Takes user credentials (provided in the request body).
  - Generates a signed JWT token using the `jsonwebtoken` library.
  - Returns the JWT token, which can later be used for secure authentication.

---

### **2. `setData`**

- **Purpose**:
  - Add or update parameters (global or grouped) in **Firebase Remote Config**.
- **Key Features**:
  - Decodes the JWT token to retrieve Firebase credentials.
  - Initializes Firebase Remote Config using the credentials.
  - Accepts group and parameters from the request body and updates/creates them.
  - Supports multiple types: strings, numbers, booleans, objects, and arrays.

---

### **3. `getAllData`**

- **Purpose**:
  - Retrieve all configuration data from **Firebase Remote Config**, including themes and global parameters.
- **Key Features**:
  - Decodes the JWT token for secure access.
  - Fetches all parameters and grouped data, such as `lightTheme` and `darkTheme`.
  - Returns the configuration in a structured format for easy use.

---

### **4. `getAllWidgets`**

- **Purpose**:
  - Fetch all widget configurations stored under the `widgets` group in **Firebase Remote Config**.
- **Key Features**:
  - Parses widget JSON data safely.
  - Replaces `null` values with empty strings for better usability.
  - Handles invalid or missing widget data gracefully by returning empty objects.

---

## **Dependencies**

Below is the list of dependencies used in this project and their purpose:

| Dependency           | Purpose                                                             |
| -------------------- | ------------------------------------------------------------------- |
| `firebase-admin`     | Firebase Admin SDK for interacting with Firebase services.          |
| `firebase-functions` | Firebase Functions library for cloud function development.          |
| `jsonwebtoken`       | Generate and verify JWT tokens for secure authentication.           |
| `firebase-tools`     | Firebase CLI for deploying and emulating Firebase services locally. |

### **Installation**

To install the required dependencies, run the following commands in the `functions/` directory:

```bash
npm install
```

---

## **Running the Project Locally**

For local testing, we use the **Firebase Emulator Suite**. Follow these steps:

1. **Install Firebase CLI**:  
   If you don't have Firebase CLI installed, run:

   ```bash
   npm install -g firebase-tools
   ```

2. **Login to Firebase**:  
   Authenticate your Firebase account by running:

   ```bash
   firebase login
   ```

3. **Setup Emulator**:  
   Initialize the Firebase Emulator by running:

   ```bash
   firebase init emulators
   ```

   - Select the emulators you want to enable (e.g., Hosting, Functions).
   - Configure the ports as needed.

4. **Start Emulator**:  
   Run the emulator locally:

   ```bash
   firebase emulators:start
   ```

5. **Test Locally**:  
   Use tools like **Postman** or **curl** to send HTTP requests to the local endpoint (e.g., `http://localhost:5001`).

---

## **Usage Examples**

### **1. `createToken`**

**Endpoint**: `POST /createToken`  
**Request Body**:

```json
{
  "uid": "user123",
  "email": "user@example.com"
}
```

**Response**:

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

### **2. `setData`**

**Endpoint**: `POST /setData`  
**Headers**:

```plaintext
Authorization: Bearer <JWT_TOKEN>
```

**Request Body**:

```json
{
  "groupName": "lightTheme",
  "parameters": {
    "light_primary": "#FFFFFF",
    "light_secondary": "#000000"
  }
}
```

**Response**:

```json
{
  "message": "Data added/updated successfully."
}
```

---

### **3. `getAllData`**

**Endpoint**: `GET /getAllData`  
**Headers**:

```plaintext
Authorization: Bearer <JWT_TOKEN>
```

**Response**:

```json
{
  "lightTheme": {
    "light_primary": "#FFFFFF",
    "light_secondary": "#000000"
  },
  "darkTheme": {
    "dark_primary": "#000000",
    "dark_secondary": "#FFFFFF"
  }
}
```

---

## **Firebase Deployment**

1. **Deploy Functions**:  
   Run the following command to deploy the functions to Firebase:

   ```bash
   firebase deploy --only functions
   ```

2. **Monitor Logs**:  
   View function logs in real-time with:
   ```bash
   firebase functions:log
   ```

---

## **Security Note**

- Do **not** share the JWT `SECRET_KEY` or Firebase service account credentials publicly.
- Make sure to handle tokens securely, and avoid storing them in plain text.

---

## **Contributors**

- **Author**: FUZAIL ZAMAN
  Contact: [GitHub](https://github.com/FUZAIL-GIT)
- **Author**: Muhammad Huzaifa
  Contact: [GitHub](https://github.com/MuhammadHuzaifa21)
- **Author**: Sabeeh Uddin
  Contact: [GitHub](https://github.com/sab-eeh)
- **Author**: FizzaMubeenAOT
  Contact: [GitHub](https://github.com/FizzaMubeenAOT)

---
