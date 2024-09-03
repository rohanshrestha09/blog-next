import Joi from 'joi';

export const loginDto = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

export const registerDto = Joi.object({
  name: Joi.string().required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(8).max(18).required(),
  dateOfBirth: Joi.date().required(),
});

export const completeProfileDto = Joi.object({
  password: Joi.string().min(8).max(18).required(),
});

export const updateProfileDto = Joi.object({
  name: Joi.string(),
  bio: Joi.string(),
  website: Joi.string().uri(),
  dateOfBirth: Joi.date(),
});

export const deleteProfileDto = Joi.object({
  password: Joi.string().required(),
});

export const changePasswordDto = Joi.object({
  oldPassword: Joi.string().required(),
  newPassword: Joi.string().min(8).max(18).required(),
});

export const sendPasswordResetMailDto = Joi.object({
  email: Joi.string().email().required(),
});

export const resetPasswordDto = Joi.object({
  password: Joi.string().min(8).max(18).required(),
});
