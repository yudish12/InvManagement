const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const userSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
  },
  { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } }
);

userSchema.statics = {
  createUser: async function (obj) {
    obj.password = await bcrypt.hash(obj.password, config.SALT_ROUNDS);
    console.log(obj.password);
    return this.create(obj);
  },
};

module.exports = {
  name: "User",
  schema: userSchema,
};
