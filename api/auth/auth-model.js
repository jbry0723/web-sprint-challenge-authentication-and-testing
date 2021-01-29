const db = require("../../data/dbConfig");

module.exports = {
  add,
  findById,
  findByUsername,
};

async function add(user) {
  const [id] = await db("users").insert(user, "id");
  return findById(id);
}

function findById(id) {
  return db("users").where({ id }).first();
}

function findByUsername(username) {
  return db("users").where("username", username).first();
}
