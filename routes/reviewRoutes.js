const express = require('express');
const reviewController = require('./../controllers/reviewController');
const authController = require('./../controllers/authController');


const router = express.Router({ mergeParams: true });

// and we actually only want authenticated users to be able to post reviews. and also 
// only users that are actually regular users, not "admins" and "tour guides".

// how we can implement that? remember our authentication section. so we start by requiring
// our authController 

// POST /tour/123456/reviews
// POST /reviews
// protect - to only be accessed by users who are authenticated.
// restrictTo - to only users with the role of user.

router.use(authController.protect);

router.route('/').get(reviewController.getAllReviews).post(authController.restrictTo('user'), reviewController.setTourUserIds, reviewController.createReview);
router.route('/:id').get(reviewController.getReview).patch(authController.restrictTo('user', 'admin'), reviewController.updateReview).delete(authController.restrictTo('user', 'admin'), reviewController.deleteReview);


module.exports = router;