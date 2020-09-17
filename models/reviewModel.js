// review (text) / rating / createdAt / ref to tour / ref to user
// so basically two parent refrencing
const mongoose = require('mongoose');
const Tour = require('./tourModel');


const reviewSchema = new mongoose.Schema({
    review: {
        type: String,
        require: [true, 'Review can not be empty!']
    },
    rating: {
        type: Number,
        min: 1,
        max: 5
    },
    createdAt: {
        type: Date,
        default: Date.now()
    },
    // Each "Review" document now knows exactly what "tour" it belongs to, while the tour of course
    // does know initially what reviews, and how many reviews there are
    // but that is a problem that we actually solve a bit later
    tour: {
        type: mongoose.Schema.ObjectId,
        ref: 'Tour',
        required: [true, 'Review must belong to a tour.']
    },
    // next up when there is a review we not only want to know, what tour it belongs to, but also
    // who wrote this review.
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: [true, 'Review must belong to a user']
    }
},
    {
        toJSON: { virtuals: true },
        toObject: { virtuals: true }
    }
);


reviewSchema.index({ tour: 1, user: 1 }, { unique: true });


reviewSchema.pre(/^find/, function (next) {

    // we specify the options object because we only want to select a couple of
    // fields and not the entire tour and also not the entire user.

    // path: 'tour' means that the "tour" fields in the schema is going to be the one
    // that is populated based on the tour model because that what we specified ref: 'Tour'
    /*
    this.populate({
        path: 'tour',
        select: 'name'
    }).populate({
        path: 'user',
        select: 'name photo'
    });
    */

    this.populate({
        path: 'user',
        select: 'name photo'
    });

    next();
});



reviewSchema.statics.calcAverageRatings = async function(tourId) {
    const stats = await this.aggregate([
        {
            $match: { tour: tourId }
        },
        {
            $group: {
                _id: '$tour',
                nRating: { $sum: 1 },
                avgRating: { $avg: '$rating' }
            }
        }
    ]);
    // console.log(stats);

    if (stats.length > 0) {
        await Tour.findByIdAndUpdate(tourId, {
            ratingsQuantity: stats[0].nRating,
            ratingsAverage: stats[0].avgRating
        });
    } else {
        await Tour.findByIdAndUpdate(tourId, {
            ratingsQuantity: 0,
            ratingsAverage: 4.5
        });
    }
};

reviewSchema.post('save', function() {
    // "this" points to current review
    this.constructor.calcAverageRatings(this.tour);
});

// review is UPDATED or DELETED using
// findByIdAndUpdate
// findByIdAndDelete
// and for these we do not have document middleware but query middleware
// so in query we do not have access to document in order to then do something 
// similar to "this.constructor.calcAverageRatings(this.tour);" because we need
// access to current review so then from there we can extract the tourId and then
// calculate the stats
// so we are going to use pre middleware
reviewSchema.pre(/^findOneAnd/, async function(next) {
    this.r = await this.findOne();
    // console.log(this.r);
    next();
});

reviewSchema.post(/^findOneAnd/, async function() {
    // await this.findOne(); does NOT work here, query has already executed
    await this.r.constructor.calcAverageRatings(this.r.tour);
});


const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;