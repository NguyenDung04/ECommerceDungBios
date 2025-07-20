// src/app/models/Course.js
import mongoose from 'mongoose';
import mongooseDelete from 'mongoose-delete';

const Schema = mongoose.Schema;

const Course = new Schema({
  name: { type: String, required: true, maxLength: 100 },
  img_courses: { type: String, default: 'No image' },
  description: { type: String, default: 'No description', maxLength: 500 },
  slug: { type: String, unique: true, required: true, maxLength: 100 },
}, {
  timestamps: true,
});

Course.plugin(mongooseDelete, { overrideMethods: 'all', deletedAt: true });


export default mongoose.model('Course', Course);
