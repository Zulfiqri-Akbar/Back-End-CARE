const { Storage } = require("@google-cloud/storage");
const path = require("path");
const fs = require("fs");

// Resolve the path to the service account key file
const serviceAccountKeyPath = path.resolve(__dirname, "../serviceaccountkey.json");
if (!fs.existsSync(serviceAccountKeyPath)) {
  throw new Error(`Service account key file not found at ${serviceAccountKeyPath}`);
}

const storage = new Storage({
  projectId: "capstone-care", 
  keyFilename: serviceAccountKeyPath,
});

module.exports = storage;