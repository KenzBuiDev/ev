// src/utils/generateId.js
exports.generateId = (prefix) => {
  return `${prefix}${String(Date.now()).slice(-3)}`;
};
