import {z} from 'zod';
import { Header } from './utils';

// Express headers are accessed as req.headers['header-name'] directly
export const apiKeySchema = z.object({
    [Header.API_KEY]: z.string().nonempty("API Key is required")
})

