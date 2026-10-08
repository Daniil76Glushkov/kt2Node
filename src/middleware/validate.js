module.exports = function validate(schema) {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
      errors: {
        wrap: {
          label: false
        }
      }
    });

    if (error) {
      return res.status(400).json({
        message: "Ошибка валидации",
        details: error.details.map(item => item.message)
      });
    }

    req.body = value;
    next();
  };
};

