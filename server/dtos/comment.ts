import Joi from 'joi';

export const createCommentDto = Joi.object({
  content: Joi.string().required(),
  blogId: Joi.number().required(),
});
