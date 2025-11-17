// src/utils/idHelper.js
async function nextId(Model, prefix, fieldName) {
  const count = await Model.countDocuments();
  const num = (count + 1).toString().padStart(3, "0");
  return `${prefix}${num}`;
}

module.exports = { nextId };
