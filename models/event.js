const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  id: {
    type: String,
    unique: false
  },
  title: {
    type: String,
  },
  subtitle: {
    type: String,
  },
  date: {
    type: String,
  },
  days: {
    type: String,
  },
  color: {
    type: String,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  createdByUser: {
    type: String,
    ref: 'User',
  },
  createdByEmail: {
    type: String,
    ref: 'User',
  },
  status: {
    type: String,
    enum: ['past', 'future'],
    default: 'future' // Default status is "future"
  }
});

const EventModel = mongoose.model('Event', eventSchema);

module.exports = EventModel;
