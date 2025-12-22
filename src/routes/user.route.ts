import { validate } from "../middleware/validate";
import { createProductSchema } from "../schemas/user.schema";

// Example: use Zod as a gatekeeper before hitting your DB/business logic.
// This is framework-agnostic; you call it from inside your route handler.

export const validateCreateProduct = validate(createProductSchema);

// In a Next.js route handler (for example), you might do:
//
// const result = validateCreateProduct({ body: await req.json() });
// if ("status" in result && result.status === 400) {
//   return NextResponse.json(result, { status: 400 });
// }
// const { body } = result;
// ... proceed with safe, parsed data ...
