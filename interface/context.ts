import { IUserInfo } from './user';

interface IContext {
  userInfo: IUserInfo['user'];
  userLogout: () => void;
}
export default IContext;
