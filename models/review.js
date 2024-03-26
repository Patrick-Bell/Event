const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
    id: {
        type: String,
        unique: true,
    },
    name: {
        type: String,
        ref: 'User',
    },
    image: {
        type: String,
        ref: 'User',
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    joined: {
        type: String,
        ref: 'User',
    },
    dateSubmitted: {
        type: String,
    },
    reviewRating: {
        type: String,
    },
    reviewTitle: {
        type: String,
    },
    reviewText: {
        type: String,
    }
})

const ReviewModel = mongoose.model('Review', reviewSchema)

module.exports = ReviewModel