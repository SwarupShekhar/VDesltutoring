import { ZodError, ZodTypeAny, ZodIssue, ZodType } from "zod";

/**
 * Framework-agnostic Zod validator.
 * Pass in any Zod schema and the raw request pieces you care about.
 * It will either return the parsed data or throw a ZodError.
 */
export const validate =
  (schema: ZodTypeAny) =>
  (payload: { body?: unknown; query?: unknown; params?: unknown }) => {
    try {
      // parse() will throw an error if validation fails
      return schema.parse(payload);
    } catch (error) {
      if (error instanceof ZodError) {
        // Re-throw with a cleaner shape you can handle in your route handler
        throw {
          status: 400,
          errors: (error.issues as ZodIssue[]).map((issue) => ({
            path: issue.path,
            message: issue.message,
          })),
        };
      }

      throw {
        status: 500,
        errors: [{ path: [], message: "Internal Server Error" }],
      };
    }
  };

/**
 * Simple helper for validating arbitrary payloads (e.g. webhooks).
 * Returns a success flag plus either parsed data or a normalized error list.
 */
type ValidationError = { path: (string | number)[]; message: string };

export const validateSchema = <T>(
  schema: ZodType<T>,
  payload: unknown
): { success: true; data: T } | { success: false; errors: ValidationError[] } => {
  try {
    const parsed = schema.parse(payload);
    return { success: true, data: parsed };
  } catch (error) {
    if (error instanceof ZodError) {
      return {
        success: false,
        errors: (error.issues as ZodIssue[]).map((issue) => ({
          path: issue.path.map((segment) =>
            typeof segment === "string" || typeof segment === "number"
              ? segment
              : String(segment)
          ),
          message: issue.message,
        })),
      };
      }

    return {
      success: false,
      errors: [{ path: [], message: "Internal Server Error" }],
    };
    }
  };

