const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const STREAMS = ['CSE', 'IT', 'ECE', 'AI', 'EE'];

const studentSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    rollNumber: { type: String, required: true, unique: true, trim: true, uppercase: true },
    stream: { type: String, required: true, enum: STREAMS },
    password: { type: String, required: true, minlength: 6 },
  },
  { timestamps: true }
);

studentSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

studentSchema.methods.comparePassword = function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

module.exports = mongoose.model('Student', studentSchema);
module.exports.STREAMS = STREAMS;
