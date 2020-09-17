const User = require('./../models/userModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const factory = require('./handlerFactory');



const filterObj = (obj, ...allowedFields) => {
    const newObj = {};
    Object.keys(obj).forEach(el => {
        if (allowedFields.includes(el)) newObj[el] = obj[el];
    });
    return newObj;
};


// It is a good practice to implement a "/me" endpoint in any API, basically an endpoint where 
// a user can retrieve his own data. so that would be very similar to "/updateMe" "/deleteMe"
// endpoints that we already have
// we still want to use "getOne" factory function otherwise it would be very very similar code
// only problem with this is that "getOne" basically uses the id coming from the parameter in
// order to get the requested document but what we want to do now is to basically get the 
// document based on the current user id, so the id comming from the currently logged in user
// so in that way we dont need to pass in an "id" as a URL parameter.

// how we will do that? all we do here is a very simple middleware.
// we will then add this middleware before calling "getOne"
exports.getMe = (req, res, next) => {
    req.params.id = req.user.id;
    next();
};


exports.updateMe = catchAsync(async (req, res, next) => {
    // 1) Create error if user POSTs password data
    if (req.body.password || req.body.passwordConfirm) {
        return next(
        new AppError(
            'This route is not for password updates. Please use /updateMyPassword.',
            400
        )
        );
    }

    // 2) Filtered out unwanted fields names that are not allowed to be updated
    const filteredBody = filterObj(req.body, 'name', 'email');

    // 3) Update user document
    const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
        new: true,
        runValidators: true
    });

    res.status(200).json({
        status: 'success',
        data: {
        user: updatedUser
        }
    });
});


exports.deleteMe = catchAsync(async (req, res, next) => {
    await User.findByIdAndUpdate(req.user.id, { active: false });

    res.status(204).json({
        status: 'success',
        data: null
    });
});


exports.createUser = (req, res) => {
    res.status(500).json({
        status: 'error',
        message: 'This route is not defined! Please us /signup instead'
    });
};

exports.getAllUsers = factory.getAll(User);
exports.getUser = factory.getOne(User);
exports.updateUser = factory.updateOne(User);
exports.deleteUser = factory.deleteOne(User);



/*

getAllUsers
getUser
createUser
updateUser
deleteUser

These are for admin
*/



// exports.getAllUsers = catchAsync(async (req, res, next) => {
//     const users = await User.find();

//     // SEND RESPONSE
//     res.status(200).json({
//         status: 'success',
//         results: users.length,
//         data: {
//         users
//         }
//     });
// });


// exports.getUser = (req, res) => {
//     res.status(500).json({
//         status: 'error',
//         message: 'This route is not yet defined!'
//     });
// };


// exports.updateUser = (req, res) => {
//     res.status(500).json({
//         status: 'error',
//         message: 'This route is not yet defined!'
//     });
// };