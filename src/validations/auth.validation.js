import Joi from "joi";

// ✅ FIX #2: Joi validates uppercase "RIDER"/"DRIVER" — matches what frontend sends after .toUpperCase()
export const registerSchema = Joi.object({
  name: Joi.string().min(2).max(50).required().messages({
    "string.empty": "Name is required",
    "string.min": "Name must be at least 2 characters",
    "string.max": "Name must not exceed 50 characters",
  }),
  email: Joi.string().email().required().messages({
    "string.empty": "Email is required",
    "string.email": "Please provide a valid email address",
  }),
  password: Joi.string().min(6).required().messages({
    "string.empty": "Password is required",
    "string.min": "Password must be at least 6 characters",
  }),
  role: Joi.string().valid("RIDER", "DRIVER").optional(),

  vehicleType: Joi.string().when("role", {
    is: "DRIVER",
    then: Joi.string().required().messages({ "string.empty": "Vehicle type is required" }),
    otherwise: Joi.optional(),
  }),
  vehicleModel: Joi.string().when("role", {
    is: "DRIVER",
    then: Joi.string().required().messages({ "string.empty": "Vehicle model is required" }),
    otherwise: Joi.optional(),
  }),
  vehicleNumber: Joi.string().when("role", {
    is: "DRIVER",
    then: Joi.string().required().messages({ "string.empty": "Vehicle number plate is required" }),
    otherwise: Joi.optional(),
  }),
  vehicleColor: Joi.string().when("role", {
    is: "DRIVER",
    then: Joi.string().required().messages({ "string.empty": "Vehicle color is required" }),
    otherwise: Joi.optional(),
  }),
  // ✅ FIX #4: These are now URL strings from Cloudinary, not File objects
  cnicFront: Joi.string().when("role", {
    is: "DRIVER",
    then: Joi.string().uri().required().messages({
      "string.empty": "CNIC front image is required",
      "string.uri": "CNIC front must be a valid image URL",
    }),
    otherwise: Joi.optional(),
  }),
  license: Joi.string().when("role", {
    is: "DRIVER",
    then: Joi.string().uri().required().messages({
      "string.empty": "Driving license image is required",
      "string.uri": "License must be a valid image URL",
    }),
    otherwise: Joi.optional(),
  }),
  // ✅ FIX #3: cnicBack removed entirely
});

export const loginSchema = Joi.object({
  email: Joi.string().email().required().messages({
    "string.empty": "Email is required",
    "string.email": "Please provide a valid email address",
  }),
  password: Joi.string().min(6).required().messages({
    "string.empty": "Password is required",
    "string.min": "Password must be at least 6 characters",
  }),
});
