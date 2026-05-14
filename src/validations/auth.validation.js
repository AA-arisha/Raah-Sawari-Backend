import Joi from "joi";

export const registerSchema = Joi.object({
  name: Joi.string().min(2).max(50).required(),

  email: Joi.string().email().required(),

  password: Joi.string().min(6).required(),

  role: Joi.string().valid("RIDER", "DRIVER").optional(),

  vehicleType: Joi.string()
    .valid("BIKE", "CAR", "RICKSHAW")
    .when("role", {
      is: "DRIVER",
      then: Joi.required(),
      otherwise: Joi.optional(),
    }),
});

export const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
});