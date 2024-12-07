const jwt = require("jsonwebtoken");
const admin = require("firebase-admin");
const { onRequest } = require("firebase-functions/v2/https");
const logger = require("firebase-functions/logger");

const SECRET_KEY = "ad2d2d2q22e2d3r3ed22";

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
    const authHeader = req.headers["authorization"];
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
    res
      .status(500)
      .json({ error: "An error occurred while adding/updating data." });
  }
});

function logAuthToken(authToken) {
  try {
    const decoded = jwt.verify(authToken, SECRET_KEY);
    return decoded; // Return decoded payload for potential use
  } catch (error) {
    console.error("Error: Invalid or Expired Token");
    console.error("Details:", error.message);
    throw new Error("Unauthorized access");
  }
}
exports.getAllData = onRequest(async (req, res) => {
  try {
    const authHeader = req.headers["authorization"];
    if (!authHeader) {
      return res.status(401).json({ message: "Unauthorized access" });
    }

    const token = authHeader.split(" ")[1];
    if (!token) {
      return res.status(401).json({ message: "Unauthorized access" });
    }

    const serviceAccount = logAuthToken(token);

    const remoteConfig = admin.remoteConfig();
    const template = await remoteConfig.getTemplate();

    const globalParameters = template.parameters || {};
    const parameterGroups = template.parameterGroups || {};
    console.log(globalParameters, parameterGroups);

    const allData = {};

    // Define the expected properties for both lightTheme and darkTheme
    const lightThemeDefaults = [
      "light_primary",
      "light_secondary",
      "light_surface",
      "light_background",
      "light_error",
      "light_onPrimary",
      "light_onSecondary",
      "light_onSurface",
      "light_onBackground",
      "light_onError",
    ];
    const darkThemeDefaults = [
      "dark_primary",
      "dark_secondary",
      "dark_surface",
      "dark_background",
      "dark_error",
      "dark_onPrimary",
      "dark_onSecondary",
      "dark_onSurface",
      "dark_onBackground",
      "dark_onError",
    ];

    // Extract global parameters (optional, depending on your needs)
    Object.entries(globalParameters).forEach(([key, value]) => {
      allData[key] = value.defaultValue?.value || "";
    });

    // Directly add the lightTheme and darkTheme objects
    const lightTheme = {};
    lightThemeDefaults.forEach((key) => {
      lightTheme[key] =
        parameterGroups["lightTheme"]?.parameters?.[key]?.defaultValue?.value ||
        "";
    });

    const darkTheme = {};
    darkThemeDefaults.forEach((key) => {
      darkTheme[key] =
        parameterGroups["darkTheme"]?.parameters?.[key]?.defaultValue?.value ||
        "";
    });

    // Add lightTheme and darkTheme directly to the response
    allData.lightTheme = lightTheme;
    allData.darkTheme = darkTheme;

    res.json(allData);
  } catch (error) {
    console.error("Error in /getAllData:", error);
    res.status(500).json({ error: "An error occurred while fetching data." });
  }
});

exports.getAllWidgets = onRequest(async (req, res) => {
  try {
    const authHeader = req.headers["authorization"];
    if (!authHeader) {
      return res.status(401).json({ message: "Unauthorized access" });
    }

    const token = authHeader.split(" ")[1];
    if (!token) {
      return res.status(401).json({ message: "Unauthorized access" });
    }

    const serviceAccount = logAuthToken(token);

    const remoteConfig = admin.remoteConfig();
    const template = await remoteConfig.getTemplate();

    const globalParameters = template.parameters || {};
    const parameterGroups = template.parameterGroups || {};

    const allData = {};

    // Log parameterGroups to inspect its structure
    console.log("parameterGroups:", JSON.stringify(parameterGroups, null, 2));

    // Check if "widgets" group exists
    const widgetsGroup = parameterGroups["widgets"];
    if (widgetsGroup) {
      console.log("widgetsGroup:", JSON.stringify(widgetsGroup, null, 2));

      allData.widgets = {};

      for (const key in widgetsGroup.parameters) {
        if (widgetsGroup.parameters.hasOwnProperty(key)) {
          let widgetValue = widgetsGroup.parameters[key].defaultValue.value; // Corrected here to access the correct value

          // Log the widget value for each widget
          console.log(`widget value for ${key}:`, widgetValue);

          // Check if the value is valid
          if (widgetValue && widgetValue !== "undefined") {
            try {
              // Parse the JSON string
              let widgetData = JSON.parse(widgetValue);

              // Log the parsed widget data
              console.log(`parsed data for ${key}:`, widgetData);

              // Replace null values with empty strings
              for (const prop in widgetData) {
                if (
                  widgetData.hasOwnProperty(prop) &&
                  widgetData[prop] === null
                ) {
                  widgetData[prop] = "";
                }
              }

              // Assign the modified widget data to the allData response
              allData.widgets[key] = widgetData;
            } catch (err) {
              console.error(`Error parsing JSON for widget ${key}:`, err);
              allData.widgets[key] = {}; // Return an empty object if parsing fails
            }
          } else {
            console.warn(`Invalid value for widget ${key}:`, widgetValue);
            allData.widgets[key] = {}; // If the value is invalid or undefined, return an empty object
          }
        }
      }
    } else {
      console.warn("No widgets group found in parameterGroups");
    }

    res.json(allData);
  } catch (error) {
    console.error("Error in /getAllData:", error);
    res.status(500).json({ error: "An error occurred while fetching data." });
  }
});
