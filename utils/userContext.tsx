import { createContext } from 'react';
import type IContext from '../interface/context';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const userContext = createContext<IContext | any>(null);

export default userContext;
