const mongoose = require('mongoose');
const slugify = require('slugify');
// const validator = require('validator');

const tourSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'A tour must have a name'],
            unique: true,
            trim: true,
            maxlength: [40, 'A tour name must have less or equal then 40 characters'],
            minlength: [10, 'A tour name must have more or equal then 10 characters']
            // validate: [validator.isAlpha, 'Tour name must only contain characters']
        },
        slug: String,
        duration: {
            type: Number,
            required: [true, 'A tour must have a duration']
        },
        maxGroupSize: {
            type: Number,
            required: [true, 'A tour must have a group size']
        },
        difficulty: {
            type: String,
            required: [true, 'A tour must have a difficulty'],
            enum: {
                values: ['easy', 'medium', 'difficult'],
                message: 'Difficulty is either: easy, medium, difficult'
            }
        },
        ratingsAverage: {
            type: Number,
            default: 4.5,
            min: [1, 'Rating must be above 1.0'],
            max: [5, 'Rating must be below 5.0'],
            set: val => Math.round(val * 10) / 10
        },
        ratingsQuantity: {
            type: Number,
            default: 0
        },
        price: {
            type: Number,
            required: [true, 'A tour must have a price']
        },
        priceDiscount: {
            type: Number,
            validate: {
                validator: function (val) {
                    // this only points to current doc on NEW document creation
                    return val < this.price;
                },
                message: 'Discount price ({VALUE}) should be below regular price'
            }
        },
        summary: {
            type: String,
            trim: true,
            required: [true, 'A tour must have a description']
        },
        description: {
            type: String,
            trim: true
        },
        imageCover: {
            type: String,
            required: [true, 'A tour must have a cover image']
        },
        images: [String],
        createdAt: {
            type: Date,
            default: Date.now(),
            select: false
        },
        startDates: [Date],
        secretTour: {
            type: Boolean,
            default: false
        },
        startLocation: {
            // MongoDB uses special data fromat called GeoJSON in order to specify 
            // geo spatial data
            // this object that we defines here is not for that schema type options, but an 
            // embeded object, inside we can specify a couple of properties. inorder for 
            // this object to be recognized as geospatial JSON, we need the "type" and the 
            // "coordinate" properties. now each of these fields (sub-fields) is then gonna get
            // its own schema type options.
            type: {
                type: String,
                default: 'Point',
                enum: ['Point']
            },
            // means that we expect an array of numbers, we expect an array of numbers, coordinates 
            // of the point with the longitude first and then latitude.
            coordinates: [Number],
            address: String,
            description: String
        },
        // specifying basically an array of objects, this will then create brand new documents
        // inside of the parent document. Which in this case is "tour".
        locations: [
            {
                type: {
                    type: String,
                    default: 'Point',
                    enum: ['Point']
                },
                coordinates: [Number],
                address: String,
                description: String,
                day: Number
            }
        ],
        guides: [
            // this means that we expect a type of each of the elements in the guides array
            // to be a MongoDB ID.
            // and we say ref: 'User' is really is how we establish refrences between different
            // data sets in Mongoose.
            // for this we wont need the user to be imported into this document.
            {
                type: mongoose.Schema.ObjectId,
                ref: 'User'
            }
        ]
    },
    {
        toJSON: { virtuals: true },
        toObject: { virtuals: true }
    }
);


// tourSchema.index({ price: 1 });
tourSchema.index({ price: 1, ratingsAverage: -1 });
tourSchema.index({ slug: 1 });
tourSchema.index({ startLocation: '2dsphere' });

tourSchema.virtual('durationWeeks').get(function () {
    return this.duration / 7;
});

// Virtual Populate
tourSchema.virtual('reviews', {
    ref: 'Review',
    // this is the name of the field in the other model. so in the review model in
    // this case, where the refrence to the current model is stored. and that is in this
    // case, the Tour field.
    foreignField: 'tour',
    // now we need to do the same for the current model. so we need to say where that ID
    // is atually stored here in this current Tour model.
    localField: '_id'
    // this '_id' which is how it is called in the local model, is called 'Tour' in the 
    // foreign model. so in the Review model.
    // so this is how we connect these two models together.
});


// DOCUMENT MIDDLEWARE: runs before .save() and .create()
tourSchema.pre('save', function (next) {
    this.slug = slugify(this.name, { lower: true });
    next();
});

// MODELING TOUR GUIDES EMBEDDING
/*
tourSchema.pre('save', async function (next) {
    // "guides" is gonna be an array of all the user ids
    // so we will loop through them using a map() and then in each iteration get the 
    // user document for the current ID.
    // now we got a problem because map() will store the result of each iteration to the 
    // new element in the "guides" array. so now we have async function and that returns 
    // a promise. so the guides array is full of promises.
    // const guides = this.guides.map(async id => await User.findById(id));

    const guidesPromises = this.guides.map(async id => await User.findById(id));
    // now we need to run these promises

    this.guides = await Promise.all(guidesPromises);
    next();
});
*/

// tourSchema.pre('save', function(next) {
//   console.log('Will save document...');
//   next();
// });

// tourSchema.post('save', function(doc, next) {
//   console.log(doc);
//   next();
// });

// QUERY MIDDLEWARE
// tourSchema.pre('find', function(next) {
tourSchema.pre(/^find/, function (next) {
    this.find({ secretTour: { $ne: true } });

    this.start = Date.now();
    next();
});

tourSchema.pre(/^find/, function (next) {
    // doing this in query middleware because this will run each time there is a query
    // remember that in query middleware, "this" is always points to the current query.
    // so basically all of the queries will then automatically populate the guides field
    // with the refrenced user.
    this.populate({
        path: 'guides',
        select: '-__v -passwordChangedAt'
    });
    next();
});

tourSchema.post(/^find/, function (docs, next) {
    console.log(`Query took ${Date.now() - this.start} milliseconds!`);
    next();
});


// AGGREGATION MIDDLEWARE
// tourSchema.pre('aggregate', function (next) {
//     this.pipeline().unshift({ $match: { secretTour: { $ne: true } } });

//     console.log(this.pipeline());
//     next();
// });

const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;
