import { createContext } from 'react';
import { RequestQueue } from '../request-queue';

export const AicRequestQueueContext = createContext(new RequestQueue());
