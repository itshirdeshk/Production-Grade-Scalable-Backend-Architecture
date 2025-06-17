import { z } from 'zod';
import { Header } from './utils';

export default {
    apiKey: z.object({
        [Header.API_KEY]: z.string().nonempty("API Key is required")
    }),
}

