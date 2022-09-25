import { createContext } from 'react';
import type IContext from '../interface/context';

const userContext = createContext<IContext | any>(null);

export default userContext;
