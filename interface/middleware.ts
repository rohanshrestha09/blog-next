import { IQueryUser, IUser } from './user';
import { IBlog } from './blog';

interface IMiddleware extends IUser, IBlog, IQueryUser {
  files: any;
}

export default IMiddleware;
