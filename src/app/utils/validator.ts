import { ZodSchema } from "zod"

const validator = (form:any, schema:ZodSchema) => {
    const validated = schema.safeParse(form)
    if (!validated.success) {
        return {errors: validated.error.flatten().fieldErrors}
    }
    return {errors: null}
}
export default validator
