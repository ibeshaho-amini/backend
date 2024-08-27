const Joi = require('joi');

const blogSchema = Joi.object({
    title: Joi.string().required(),
    content: Joi.string().required(),
    author: Joi.string().required(),
});

module.exports = (req, res, next) => {
    const { error } = blogSchema.validate(req.body);
    if (error) return res.status(400).send({ error: error.details[0].message });
    next();
};
