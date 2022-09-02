import { IUser } from './user';

interface IContext {
  user: IUser['user'];
  userLogout: () => void;
}
export default IContext;
