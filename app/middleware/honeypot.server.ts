import { createHoneypotMiddleware } from "remix-utils/middleware/honeypot";
import {Resource} from 'sst'
// https://github.com/sergiodxa/remix-utils?tab=readme-ov-file#honeypot-middleware

export const [honeypotMiddleware, getHoneypotInputProps] = createHoneypotMiddleware({
    randomizeNameFieldName: true, // Randomize the honeypot field name
    nameFieldName: "user__confirm", // Default honeypot field name
    validFromFieldName: "from__confirm", // Optional timestamp field for validation
    encryptionSeed: Resource.encryption_seed_1.value, // Unique seed for encryption (recommended for extra security)

    onSpam(error) {
        return new Response("Ooops... something went wrong", { status: 400 });
    },
});