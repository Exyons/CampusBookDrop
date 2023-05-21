const Joi = require('joi');

module.exports.signupSchema = Joi.object({
    firstname: Joi.string().required(),
    lastname: Joi.string().required(),
    email: Joi.string().email().required(),
    mobile: Joi.string().pattern(/^[0-9]{10}$/), // Assuming 10-digit mobile number
    password: Joi.string()
        .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@#$%^&+=]).{8,20}$/)
        .required()
        .messages({
            'password.pattern.base': 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one symbol from @#$%^&+=',
            'password.min': 'Password must be at least 8 characters long',
            'password.max': 'Password cannot exceed 20 characters'
        }),
    username: Joi.string().alphanum().min(3).max(30).required()
});

module.exports.bookSchema = Joi.object({
    title: Joi.string().required(),
    programme: Joi.string().required(),
    price: Joi.number().min(0).required(),
    year: Joi.number().integer().min(1).max(4).required(), 
    semester: Joi.number().integer().min(1).max(8).required(), 
    description: Joi.string().required(),
    condition: Joi.string().required(),
    damages: Joi.string().required(),
    branch: Joi.string().required(),
    qty: Joi.number().integer().min(0).required()
});

module.exports.addressSchema = Joi.object({
    name: Joi.string().required(),
    mobile: Joi.string().pattern(/^[0-9]{10}$/),
    room: Joi.number().integer().min(1).max(750).required(),
    hostel: Joi.string().required()
});