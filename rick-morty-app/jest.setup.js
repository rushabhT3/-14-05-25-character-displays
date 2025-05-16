// jest.setup.js
require("@testing-library/jest-dom");

// Add TextEncoder polyfill
if (typeof TextEncoder === "undefined") {
  const { TextEncoder, TextDecoder } = require("util");
  global.TextEncoder = TextEncoder;
  global.TextDecoder = TextDecoder;
}
