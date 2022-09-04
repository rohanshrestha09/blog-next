import { IQueryUser, IUser } from './user';
import { IBlog } from './blog';
import IFiles from './files';

interface IMiddleware extends IUser, IBlog, IQueryUser, IFiles {}

export default IMiddleware;
