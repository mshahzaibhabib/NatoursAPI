const Review = require('./../models/reviewModel');
const factory = require('./handlerFactory');



exports.setTourUserIds = (req, res, next) => {
    // Allow nested route
    // so basically if we didn't specify the tour ID in the body, then we want to define 
    // that as the one comming from the URL
    if (!req.body.tour) req.body.tour = req.params.tourId;
    // we get "req.user" from the protect middleware
    if (!req.body.user) req.body.user = req.user.id;
    next();
}

exports.getAllReviews = factory.getAll(Review);
exports.getReview = factory.getOne(Review);
exports.createReview = factory.createOne(Review);
exports.updateReview = factory.updateOne(Review);
exports.deleteReview = factory.deleteOne(Review);


// exports.getAllReviews = catchAsync(async (req, res, next) => {

//     // check if there is a tourId and if there is one well then we are only going to search for
//     // reviews where the tour is equal to that tourId
//     let filter = {};
//     if (req.params.tourId) filter = { tour: req.params.tourId };
//     // so again if there is a tourId then basically, this object here is what will be passed to the 
//     // find() and so then only the reviews where the tour matches the id are going to be found.
//     // so if it is all regular API call without nested route, well then that filter will simply 
//     // be this empty object and we will find all the reviews

//     const reviews = await Review.find(filter);

//     res.status(200).json({
//         status: 'success',
//         results: reviews.length,
//         data: {
//             reviews
//         }
//     });
// });


// exports.createReview = catchAsync(async (req, res, next) => {
    
//     const newReview = await Review.create(req.body);
//     // again if there are any fields on the body that are not in the review schema then they
//     // will simply be ignored.

//     res.status(201).json({
//         status: 'success',
//         data: {
//             newReview
//         }
//     });
// });