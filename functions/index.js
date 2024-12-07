const jwt = require("jsonwebtoken");
const admin = require("firebase-admin");
const { onRequest } = require("firebase-functions/v2/https");
const logger = require("firebase-functions/logger");

const SECRET_KEY = 'ad2d2d2q22e2d3r3ed22';

// Initialize Firebase Admin SDK
if (admin.apps.length === 0) {
  admin.initializeApp();
}

exports.createToken = onRequest((req, res) => {
  const payload = req.body;

  const token = jwt.sign(payload, SECRET_KEY);
  logAuthToken(token);

  res.json({ token });
});

exports.setData = onRequest(async (req, res) => {
  try {
    const authHeader = req.headers['authorization'];
    if (!authHeader) {
      return res.status(401).json({ message: "Unauthorized access" });
    }

    const token = authHeader.split(" ")[1];
    if (!token) {
      return res.status(401).json({ message: "Unauthorized access" });
    }

    const serviceAccount = logAuthToken(token);

    const { groupName, parameters } = req.body;

    if (!parameters || typeof parameters !== "object") {
      return res
        .status(400)
        .json({ error: "Invalid 'parameters' field. It must be an object." });
    }

    const remoteConfig = admin.remoteConfig();
    const template = await remoteConfig.getTemplate();

    // Function to determine and store the correct type
    const storeValue = (value) => {
      if (typeof value === "boolean") {
        return value; // Boolean value
      } else if (typeof value === "number") {
        return value; // Number value
      } else if (Array.isArray(value) || typeof value === "object") {
        return JSON.stringify(value); // JSON-encoded value for objects/arrays
      } else {
        return value; // String value (default)
      }
    };

    if (!groupName) {
      // Global parameters
      Object.entries(parameters).forEach(([key, value]) => {
        template.parameters[key] = {
          defaultValue: { value: storeValue(value) },
        };
      });
    } else {
      // Group-specific parameters
      const parameterGroups = template.parameterGroups || {};
      if (!parameterGroups[groupName]) {
        parameterGroups[groupName] = {
          parameters: {},
          description: `Group for ${groupName}`,
        };
      }

      Object.entries(parameters).forEach(([key, value]) => {
        parameterGroups[groupName].parameters[key] = {
          defaultValue: { value: storeValue(value) },
        };
      });

      template.parameterGroups = parameterGroups;
    }

    // Publish the updated template
    await remoteConfig.publishTemplate(template);

    res.json({ message: "Data added/updated successfully." });
  } catch (error) {
    console.error("Error in /setData:", error);
    res.status(500).json({ error: "An error occurred while adding/updating data." });
  }
});

function logAuthToken(authToken) {
  try {
    const decoded = jwt.verify(authToken, SECRET_KEY);

    console.log("Authorization Token:", authToken);
    console.log("Decoded Payload:", decoded);
    return decoded; // Return decoded payload for potential use
  } catch (error) {
    console.error("Error: Invalid or Expired Token");
    console.error("Details:", error.message);
    throw new Error("Unauthorized access");
  }
}
