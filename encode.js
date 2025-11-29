// encode.js
const fs = require("fs");
const key = fs.readFileSync("./module-55-smart-deals-website-firebase-admin.json", "utf8");
const base64 = Buffer.from(key).toString("base64");
console.log(base64);