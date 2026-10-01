import { toNestErrors } from '@hookform/resolvers';
import type { FieldError, FieldValues, Resolver } from 'react-hook-form';
import type { z } from 'zod/v4';

// ponytail: @hookform/resolvers 3.x only reads Zod 3 errors; switch back to zodResolver on resolvers v5.
export function zod4Resolver<T extends FieldValues>(schema: z.ZodType): Resolver<T> {
  return async (values, _context, options) => {
    const result = await schema.safeParseAsync(values);
    if (result.success) return { values: result.data as T, errors: {} };
    const errors: Record<string, FieldError> = {};
    for (const issue of result.error.issues) {
      errors[issue.path.join('.')] ??= { type: issue.code, message: issue.message };
    }
    return { values: {}, errors: toNestErrors(errors, options) };
  };
}
