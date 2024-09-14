import Joi from 'joi';
import { genre } from 'server/enums/genre';

export const createBlogDto = Joi.object({
  title: Joi.string().required(),
  content: Joi.string().required(),
  isPublished: Joi.boolean(),
  genre: Joi.alternatives()
    .try(Joi.array().items(...Object.values(genre)), Joi.string().allow(...Object.values(genre)))
    .required(),
});
