import Joi from 'joi';

export const validateLead = (req, res, next) => {
    const schema = Joi.object({
        name: Joi.string().trim().required().messages({
            'any.required': 'Name is required.',
            'string.empty': 'Name cannot be empty.'
        }),
        dob: Joi.string().pattern(/^\d{4}-\d{2}-\d{2}$/).required().messages({
            'string.pattern.base': 'DOB must be in YYYY-MM-DD format (e.g., 1999-03-23).',
            'any.required': 'Date of Birth is required.'
        }),
        email: Joi.string().email().trim().required().messages({
            'string.email': 'Please provide a valid email address.',
            'any.required': 'Email is required.'
        }),
        loanAmount: Joi.number().positive().required().messages({
            'number.base': 'Loan amount must be a number.',
            'number.positive': 'Loan amount must be greater than 0.',
            'any.required': 'Loan amount is required.'
        }),
        employeeType: Joi.string().valid('Salaried', 'Self-Employed', 'Full-Time').required().messages({
            'any.only': 'Employee Type must be either Salaried, Self-Employed, or Full-Time.',
            'any.required': 'Employee Type is required.'
        }),
        pancard: Joi.string().uppercase().pattern(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/).required().messages({
            'string.pattern.base': 'Please enter a valid PAN Card number format (e.g., ABCDE1234F).',
            'any.required': 'PAN Card number is required.'
        }),
        mobile: Joi.string().length(10).pattern(/^[0-9]+$/).required().messages({
            'string.length': 'Mobile number must be exactly 10 digits.',
            'string.pattern.base': 'Mobile number must contain only digits.',
            'any.required': 'Mobile number is required.'
        })
    });

    const { error, value } = schema.validate(req.body, { abortEarly: false });

    if (error) {
        const errorMessages = error.details.map(err => err.message);
        return res.status(400).json({
            success: false,
            status: "validation_error",
            errors: errorMessages
        });
    }

    req.body = value;
    next();
};