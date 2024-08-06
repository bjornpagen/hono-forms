import { Hono, Context } from "hono"
import { z } from "zod"

interface RenderOptions<T extends Record<string, any>> {
	urlParams?: Record<string, string>
	values?: Partial<T>
}

type Form<T extends Record<string, any>> = {
	render: (options?: RenderOptions<T>) => string
	decorateRoute: (app: Hono) => void
}

interface PathParam {
	name: string
	regex?: string
}

interface BaseFieldOptions {}

interface TextFieldOptions extends BaseFieldOptions {
	optional?: boolean
	placeholder?: string
	minLength?: number
	maxLength?: number
	pattern?: RegExp
}

interface UrlFieldOptions extends BaseFieldOptions {
	optional?: boolean
	placeholder?: string
	minLength?: number
	maxLength?: number
	pattern?: RegExp
}

interface EmailFieldOptions extends BaseFieldOptions {
	optional?: boolean
	placeholder?: string
	minLength?: number
	maxLength?: number
	pattern?: RegExp
}

interface PasswordFieldOptions extends BaseFieldOptions {
	optional?: boolean
	placeholder?: string
	minLength?: number
	maxLength?: number
	pattern?: RegExp
}

interface NumberFieldOptions extends BaseFieldOptions {
	optional?: boolean
	min?: number
	max?: number
	integer?: boolean
}

interface DateFieldOptions extends BaseFieldOptions {
	optional?: boolean
	min?: Date
	max?: Date
}

interface CheckboxFieldOptions extends BaseFieldOptions {
	optional?: boolean
}

interface RangeFieldOptions extends BaseFieldOptions {
	min?: number
	max?: number
	integer?: boolean
}

interface FileFieldOptions extends BaseFieldOptions {
	optional?: boolean
	accept?: string
}

interface SelectFieldOptions extends BaseFieldOptions {
	optional?: boolean
	placeholder?: string
	options: Array<{ value: string; label: string }>
}

interface ColorFieldOptions extends BaseFieldOptions {}

interface TelFieldOptions extends BaseFieldOptions {
	optional?: boolean
	placeholder?: string
	pattern?: RegExp
	minLength?: number
	maxLength?: number
}

type FormField =
	| { type: "text"; name: string; label: string; options: TextFieldOptions }
	| { type: "url"; name: string; label: string; options: UrlFieldOptions }
	| { type: "email"; name: string; label: string; options: EmailFieldOptions }
	| { type: "number"; name: string; label: string; options: NumberFieldOptions }
	| { type: "date"; name: string; label: string; options: DateFieldOptions }
	| { type: "checkbox"; name: string; label: string; options: CheckboxFieldOptions }
	| { type: "password"; name: string; label: string; options: PasswordFieldOptions }
	| { type: "range"; name: string; label: string; options: RangeFieldOptions }
	| { type: "file"; name: string; label: string; options: FileFieldOptions }
	| { type: "select"; name: string; label: string; options: SelectFieldOptions }
	| { type: "color"; name: string; label: string; options: ColorFieldOptions }
	| { type: "tel"; name: string; label: string; options: TelFieldOptions }

type SideEffect<T> = (data: T) => Promise<void>
type SuccessHandler = (c: Context) => Promise<Response>
type ErrorHandler = (c: Context, error: Error) => Promise<Response>

export class FormBuilder<T extends Record<string, any>> {
	#fields: FormField[] = []
	#method: "GET" | "POST"
	#sideEffect?: SideEffect<T>
	#successHandler?: SuccessHandler
	#errorHandler?: ErrorHandler
	#pathPattern: string

	constructor(pathPattern: string, method: "GET" | "POST" = "POST") {
		this.#pathPattern = pathPattern
		this.#method = method
	}

	addText<K extends keyof T>(name: K & string, label: string, options: TextFieldOptions = {}): FormBuilder<T> {
		this.#fields.push({ name, label, type: "text", options })
		return this
	}

	addUrl<K extends keyof T>(name: K & string, label: string, options: UrlFieldOptions = {}): FormBuilder<T> {
		this.#fields.push({ name, label, type: "url", options })
		return this
	}

	addEmail<K extends keyof T>(name: K & string, label: string, options: EmailFieldOptions = {}): FormBuilder<T> {
		this.#fields.push({ name, label, type: "email", options })
		return this
	}

	addNumber<K extends keyof T>(name: K & string, label: string, options: NumberFieldOptions = {}): FormBuilder<T> {
		this.#fields.push({ name, label, type: "number", options })
		return this
	}

	addDate<K extends keyof T>(name: K & string, label: string, options: DateFieldOptions = {}): FormBuilder<T> {
		this.#fields.push({ name, label, type: "date", options })
		return this
	}

	addCheckbox<K extends keyof T>(name: K & string, label: string, options: CheckboxFieldOptions = {}): FormBuilder<T> {
		this.#fields.push({ name, label, type: "checkbox", options })
		return this
	}

	addPassword<K extends keyof T>(name: K & string, label: string, options: PasswordFieldOptions = {}): FormBuilder<T> {
		this.#fields.push({ name, label, type: "password", options })
		return this
	}

	addRange<K extends keyof T>(name: K & string, label: string, options: RangeFieldOptions = {}): FormBuilder<T> {
		this.#fields.push({ name, label, type: "range", options })
		return this
	}

	addFile<K extends keyof T>(name: K & string, label: string, options: FileFieldOptions = {}): FormBuilder<T> {
		this.#fields.push({ name, label, type: "file", options })
		return this
	}

	addSelect<K extends keyof T>(name: K & string, label: string, options: SelectFieldOptions): FormBuilder<T> {
		this.#fields.push({ name, label, type: "select", options })
		return this
	}

	addColor<K extends keyof T>(name: K & string, label: string, options: ColorFieldOptions = {}): FormBuilder<T> {
		this.#fields.push({ name, label, type: "color", options })
		return this
	}

	addTel<K extends keyof T>(name: K & string, label: string, options: TelFieldOptions = {}): FormBuilder<T> {
		this.#fields.push({ name, label, type: "tel", options })
		return this
	}

	setSideEffect(fn: SideEffect<T>): FormBuilder<T> {
		this.#sideEffect = fn
		return this
	}

	setSuccessHandler(fn: SuccessHandler): FormBuilder<T> {
		this.#successHandler = fn
		return this
	}

	setErrorHandler(fn: ErrorHandler): FormBuilder<T> {
		this.#errorHandler = fn
		return this
	}

	#parsePathPattern(pathPattern: string): PathParam[] {
		let params: PathParam[] = []
		let regex = /:([a-zA-Z_][a-zA-Z0-9_]*)({([^}]+)})?/g
		let match

		while ((match = regex.exec(pathPattern)) !== null) {
			params.push({
				name: match[1],
				regex: match[3]
			})
		}

		return params
	}

	#createHtmlGenerator(
		pathPattern: string,
		pathParameters: PathParam[],
		method: "GET" | "POST",
		fields: FormField[]
	): (urlParams?: Record<string, string>, defaultValues?: Partial<T>) => string {
		return (urlParams: Record<string, string> = {}, defaultValues: Partial<T> = {}) => {
			let actionPath = pathPattern
			let missingParams: string[] = []
			let invalidParams: string[] = []

			for (let { name, regex } of pathParameters) {
				let value = urlParams[name]
				if (value === undefined || value === "") {
					missingParams.push(name)
				} else {
					if (regex && !new RegExp(`^${regex}$`).test(value)) {
						invalidParams.push(name)
					}
					actionPath = actionPath.replace(new RegExp(`:${name}(\\{[^}]+\\})?`), encodeURIComponent(value))
				}
			}

			if (missingParams.length > 0) {
				throw new Error(`Missing required path parameters: ${missingParams.join(", ")}`)
			}

			if (invalidParams.length > 0) {
				throw new Error(`Invalid values for path parameters: ${invalidParams.join(", ")}`)
			}

			let hasFileInput = fields.some((field) => field.type === "file")
			let html = `<form action="${actionPath}" method="${method}"${hasFileInput ? ' enctype="multipart/form-data"' : ""}>`
			for (let field of fields) {
				let inputType: string
				let step: string | undefined
				let min: string | undefined
				let max: string | undefined
				let minLength: string | undefined
				let maxLength: string | undefined
				let pattern: string | undefined
				let placeholder: string | undefined

				switch (field.type) {
					case "date":
						inputType = field.type
						min = field.options.min !== undefined ? convertToLocalDate(field.options.min) : undefined
						max = field.options.max !== undefined ? convertToLocalDate(field.options.max) : undefined
						break
					case "number":
					case "range":
						inputType = field.type
						step = field.options.integer ? "1" : undefined
						min = field.options.min !== undefined ? String(field.options.min) : undefined
						max = field.options.max !== undefined ? String(field.options.max) : undefined
						break
					case "text":
					case "url":
					case "password":
					case "email":
					case "tel":
						inputType = field.type
						placeholder = field.options.placeholder
						minLength = field.options.minLength !== undefined ? String(field.options.minLength) : undefined
						maxLength = field.options.maxLength !== undefined ? String(field.options.maxLength) : undefined
						pattern = field.options.pattern !== undefined ? field.options.pattern.source : undefined
						break
					case "checkbox":
					case "file":
					case "color":
						inputType = field.type
						break
					case "select":
						html += `<label>${field.label}:`
						html += `<select name="${field.name}"${!field.options.optional ? " required" : ""}>`
						if (field.options.placeholder)
							html += `<option value disabled selected>${field.options.placeholder}</option>`
						for (let option of field.options.options) {
							let isSelected =
								defaultValues[field.name as keyof T] === option.value ||
								(Array.isArray(defaultValues[field.name as keyof T]) &&
									defaultValues[field.name as keyof T].includes(option.value))
							html += `<option value="${option.value}"${isSelected ? " selected" : ""}>${option.label}</option>`
						}
						html += `</select></label>`
						continue
				}

				html += `<label>${field.label}:`
				html += `<input type="${inputType}" name="${field.name}"`
				if (step !== undefined) html += ` step="${step}"`
				if (min !== undefined) html += ` min="${min}"`
				if (max !== undefined) html += ` max="${max}"`
				if (minLength !== undefined) html += ` minlength="${minLength}"`
				if (maxLength !== undefined) html += ` maxlength="${maxLength}"`
				if (pattern !== undefined) html += ` pattern="${pattern}"`
				if (placeholder !== undefined) html += ` placeholder="${placeholder}"`
				if (!(field.options as any)?.optional) html += " required"

				// Use defaultValues for setting the value attribute
				if (field.type !== "password" && field.type !== "file" && defaultValues[field.name as keyof T] !== undefined) {
					let value = defaultValues[field.name as keyof T] as any

					if (typeof value === "boolean") {
						if (value) html += " checked"
					} else if (value instanceof Date) {
						html += ` value="${convertToLocalDate(value)}"`
					} else if (typeof value === "number" || typeof value === "string") {
						html += ` value="${value}"`
					} else {
						throw new Error(`Unsupported value type for input field: ${typeof value}`)
					}
				}
				if (field.type === "file") {
					if (field.options.accept) html += ` accept="${field.options.accept}"`
				}
				html += `></label>`
			}
			html += `<button type="submit">Submit</button></form>`
			return html
		}
	}

	#createZodSchema(fields: FormField[]): z.ZodObject<Record<string, z.ZodTypeAny>> {
		let schemaFields: Record<string, z.ZodTypeAny> = {}
		for (let field of fields) {
			let schema
			switch (field.type) {
				case "color":
					schema = z.string().regex(/^#[0-9A-Fa-f]{6}$/)
					break
				case "text":
				case "password":
				case "tel":
					schema = z.string()
					if (field.options.minLength) schema = schema.min(field.options.minLength)
					if (field.options.maxLength) schema = schema.max(field.options.maxLength)
					if (field.options.pattern) schema = schema.regex(field.options.pattern)
					if (field.options.optional) schema = schema.optional()
					break
				case "url":
					schema = z.string().url()
					if (field.options.minLength) schema = schema.min(field.options.minLength)
					if (field.options.maxLength) schema = schema.max(field.options.maxLength)
					if (field.options.pattern) schema = schema.regex(field.options.pattern)
					if (field.options.optional) schema = schema.optional()
					break
				case "email":
					schema = z.string().email()
					if (field.options.minLength) schema = schema.min(field.options.minLength)
					if (field.options.maxLength) schema = schema.max(field.options.maxLength)
					if (field.options.pattern) schema = schema.regex(field.options.pattern)
					if (field.options.optional) schema = schema.optional()
					break
				case "range":
					schema = z.coerce.number()
					if (field.options.min !== undefined) schema = schema.min(field.options.min)
					if (field.options.max !== undefined) schema = schema.max(field.options.max)
					if (field.options.integer) schema = schema.int()
					break
				case "number":
					schema = z.coerce.number()
					if (field.options.min !== undefined) schema = schema.min(field.options.min)
					if (field.options.max !== undefined) schema = schema.max(field.options.max)
					if (field.options.integer) schema = schema.int()
					if (field.options.optional) schema = schema.optional()
					break
				case "date":
					schema = z.coerce.date()
					if (field.options.min) schema = schema.min(field.options.min)
					if (field.options.max) schema = schema.max(field.options.max)
					if (field.options.optional) schema = schema.optional()
					break
				case "checkbox":
					schema = z.coerce.boolean()
					if (!field.options.optional) schema = schema.pipe(z.literal<boolean>(true))
					break
				case "file":
					schema = z.instanceof(File)
					if (field.options.optional) schema = schema.optional()
					break
				case "select":
					let enumValues = field.options.options.map((opt) => opt.value)
					schema = z.enum(enumValues as [string, ...string[]])
					if (field.options.optional) schema = schema.optional()
					break
			}
			if (field.type !== "select" && field.type !== "color" && field.type !== "range" && field.type !== "checkbox") {
				schema = z
					.any()
					.transform((v) => (v === "" ? undefined : v))
					.pipe(schema)
			}

			schemaFields[field.name] = schema
		}
		return z.object(schemaFields)
	}

	#createRouteDecorator(
		pathPattern: string,
		method: "GET" | "POST",
		zodSchema: z.ZodObject<Record<string, z.ZodTypeAny>>,
		sideEffect: SideEffect<T> | undefined,
		successHandler: SuccessHandler,
		errorHandler: ErrorHandler
	) {
		return (app: Hono) => {
			app.on(method, pathPattern, async (c) => {
				let body = method === "GET" ? c.req.query() : await c.req.parseBody()

				try {
					let data = zodSchema.parse(body)

					if (sideEffect) {
						await sideEffect(data as T)
					}

					return await successHandler(c)
				} catch (err) {
					if (err instanceof Error) {
						return await errorHandler(c, err)
					}
					throw err
				}
			})
		}
	}

	build(): Form<T> {
		if (!this.#errorHandler) {
			throw new Error("Error handler not set")
		}
		if (!this.#successHandler) {
			throw new Error("Success handler not set")
		}

		const zodSchema = this.#createZodSchema(this.#fields)
		const pathParams = this.#parsePathPattern(this.#pathPattern)
		const generateHtml = this.#createHtmlGenerator(this.#pathPattern, pathParams, this.#method, this.#fields)
		const decorateRoute = this.#createRouteDecorator(
			this.#pathPattern,
			this.#method,
			zodSchema,
			this.#sideEffect,
			this.#successHandler,
			this.#errorHandler
		)

		return {
			render: (options: RenderOptions<T> = {}) => generateHtml(options.urlParams, options.values),
			decorateRoute
		}
	}
}

const convertToLocalDate = (t: Date) => {
	return t.toISOString().split("T")[0]
}
