const express = require('express');
const tourController = require('./../controllers/tourController');
const authController = require('./../controllers/authController');
const reviewRouter = require('./../routes/reviewRoutes');


const router = express.Router();

// router.param('id', tourController.checkID);

// POST /tour/123456/reviews
// GET /tour/123456/reviews
// GET /tour/123456/reviews/9

// router.route('/:tourId/reviews').post(authController.protect, authController.restrictTo('user'), reviewController.createReview);

// tourRouter should use the review router in case it ever encounters a route like this
// and this is actuallyy again mounting a router. and that exactly we did in the app.js
router.use('/:tourId/reviews', reviewRouter);
// so when we have a URL like this "/tour/123456/reviews" it will start by getting into the tour
// router (in app.js), because it starts with "/tours" is basically it is rerouted to the tour
// router.
// then when it reaches the tour router then it will match the URL "router.use('/:tourId/reviews', reviewRouter);" and then it will again br rerouted to the review Router. and like this we have the 
// tour router and the review router nicely separated and decoupled from one another.


router.route('/top-5-cheap').get(tourController.aliasTopTours, tourController.getAllTours);

router.route('/tour-stats').get(tourController.getTourStats);
router.route('/monthly-plan/:year').get(authController.protect, authController.restrictTo('admin', 'lead-guide', 'guide'), tourController.getMonthlyPlan);

router.route('/tours-within/:distance/center/:latlng/unit/:unit').get(tourController.getToursWithin);
// we could do that
// /tours-distance?distance=233&center=-40,45&unit=mi
// but will do that
// /tours-within/233/center/-40,45/unit/mi

router.route('/distances/:latlng/unit/:unit').get(tourController.getDistances);

router.route('/').get(tourController.getAllTours).post(authController.protect, authController.restrictTo('admin', 'lead-guide'), tourController.createTour);

router.route('/:id').get(tourController.getTour).patch(authController.protect, authController.restrictTo('admin', 'lead-guide'), tourController.updateTour).delete(authController.protect, authController.restrictTo('admin', 'lead-guide'), tourController.deleteTour);


module.exports = router;