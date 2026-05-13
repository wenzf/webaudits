import { createHoneypotMiddleware } from "remix-utils/middleware/honeypot";

// https://github.com/sergiodxa/remix-utils?tab=readme-ov-file#honeypot-middleware

export const [honeypotMiddleware, getHoneypotInputProps] = createHoneypotMiddleware({
	randomizeNameFieldName: false, // Randomize the honeypot field name
	nameFieldName: "name__confirm", // Default honeypot field name
	validFromFieldName: "from__confirm", // Optional timestamp field for validation
	encryptionSeed: undefined, // Unique seed for encryption (recommended for extra security)

	onSpam(error) {
		// Handle SpamError here and return a Response
		return new Response("Spam detected", { status: 400 });
	},
});