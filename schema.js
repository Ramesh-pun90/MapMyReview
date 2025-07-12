// const joi = require("joi");

// module.exports.listingSchema = joi.object({
//     listing: joi.object({
//         title: joi.string().required(),
//         description: joi.string().required(),
//         location: joi.string().required(),
//         country: joi.string().required(),
//         price: joi.number().required().min(0),
//         image: joi.string().allow("", null).optional(),
//         category: joi.string().required(),
//     }).required()
// });

// module.exports.reviewSchema=joi.object({
//     review:joi.object({
//         rating:joi.number().required(),
//         comment:joi.string().required(),
//     }).required(),
// });
const joi = require("joi");

module.exports.listingSchema = joi.object({
    listing: joi.object({
        title: joi.string().required(),
        description: joi.string().required(),
        location: joi.string().required(),
        country: joi.string().required(),
        price: joi.number().required().min(0),
        image: joi.object({
            url: joi.string().uri().allow("", null),
            filename: joi.string().allow("", null),
        }).optional(),
        category: joi.string().required(),
    }).required()
});

module.exports.reviewSchema = joi.object({
    review: joi.object({
        rating: joi.number().required(),
        comment: joi.string().required(),
    }).required(),
});
