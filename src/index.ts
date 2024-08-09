import { Hono, Context } from "hono"
import { z } from "zod"

interface RenderOptions {
	urlParams?: Record<string, string>
	values?: Record<string, any>
}

type Form = {
	render: (options?: RenderOptions) => string
	decorateRoute: (app: any) => void
}

interface PathParam {
	name: string
	regex?: string
}

interface TextFieldOptions {
	optional?: boolean
	placeholder?: string
	minLength?: number
	maxLength?: number
	pattern?: RegExp
}

interface UrlFieldOptions {
	optional?: boolean
	placeholder?: string
	minLength?: number
	maxLength?: number
	pattern?: RegExp
}

interface EmailFieldOptions {
	optional?: boolean
	placeholder?: string
	minLength?: number
	maxLength?: number
	pattern?: RegExp
}

interface PasswordFieldOptions {
	optional?: boolean
	placeholder?: string
	minLength?: number
	maxLength?: number
	pattern?: RegExp
}

interface NumberFieldOptions {
	optional?: boolean
	min?: number
	max?: number
	integer?: boolean
}

interface DateFieldOptions {
	optional?: boolean
	min?: Date
	max?: Date
}

interface CheckboxFieldOptions {
	optional?: boolean
}

interface RangeFieldOptions {
	min?: number
	max?: number
	integer?: boolean
}

interface FileFieldOptions {
	optional?: boolean
	accept?: string
}

interface SelectFieldOptions {
	optional?: boolean
	placeholder?: string
	options: Array<{ value: string; label: string }>
}

interface TelFieldOptions {
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
	| { type: "color"; name: string; label: string; options: undefined }
	| { type: "tel"; name: string; label: string; options: TelFieldOptions }
	| { type: "hidden"; name: string; label: undefined; options: undefined }

export class FormBuilder {
	#fields: FormField[] = []
	#method: "GET" | "POST"
	#sideEffect?: (c: Context, data: Record<string, any>) => Promise<void>
	#successHandler?: (c: Context) => Promise<Response>
	#errorHandler?: (c: Context, error: Error) => Promise<Response>
	#pathPattern: string

	constructor(pathPattern: string, method: "GET" | "POST" = "POST") {
		this.#pathPattern = pathPattern
		this.#method = method
	}

	addText(name: string, label: string, options: TextFieldOptions = {}): FormBuilder {
		this.#fields.push({ name, label, type: "text", options })
		return this
	}

	addUrl(name: string, label: string, options: UrlFieldOptions = {}): FormBuilder {
		this.#fields.push({ name, label, type: "url", options })
		return this
	}

	addEmail(name: string, label: string, options: EmailFieldOptions = {}): FormBuilder {
		this.#fields.push({ name, label, type: "email", options })
		return this
	}

	addNumber(name: string, label: string, options: NumberFieldOptions = {}): FormBuilder {
		this.#fields.push({ name, label, type: "number", options })
		return this
	}

	addDate(name: string, label: string, options: DateFieldOptions = {}): FormBuilder {
		this.#fields.push({ name, label, type: "date", options })
		return this
	}

	addCheckbox(name: string, label: string, options: CheckboxFieldOptions = {}): FormBuilder {
		this.#fields.push({ name, label, type: "checkbox", options })
		return this
	}

	addPassword(name: string, label: string, options: PasswordFieldOptions = {}): FormBuilder {
		this.#fields.push({ name, label, type: "password", options })
		return this
	}

	addRange(name: string, label: string, options: RangeFieldOptions = {}): FormBuilder {
		this.#fields.push({ name, label, type: "range", options })
		return this
	}

	addFile(name: string, label: string, options: FileFieldOptions = {}): FormBuilder {
		this.#fields.push({ name, label, type: "file", options })
		return this
	}

	addSelect(name: string, label: string, options: SelectFieldOptions): FormBuilder {
		this.#fields.push({ name, label, type: "select", options })
		return this
	}

	addColor(name: string, label: string): FormBuilder {
		this.#fields.push({ name, label, type: "color", options: undefined })
		return this
	}

	addTel(name: string, label: string, options: TelFieldOptions = {}): FormBuilder {
		this.#fields.push({ name, label, type: "tel", options })
		return this
	}

	addHidden(name: string): FormBuilder {
		this.#fields.push({ name, label: undefined, type: "hidden", options: undefined })
		return this
	}

	setSideEffect(fn: (c: Context, data: Record<string, any>) => Promise<void>): FormBuilder {
		this.#sideEffect = fn
		return this
	}

	setSuccessHandler(fn: (c: Context) => Promise<Response>): FormBuilder {
		this.#successHandler = fn
		return this
	}

	setErrorHandler(fn: (c: Context, error: Error) => Promise<Response>): FormBuilder {
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
	): (urlParams?: Record<string, string>, defaultValues?: Record<string, any>) => string {
		return (urlParams: Record<string, string> = {}, defaultValues: Record<string, any> = {}) => {
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
					case "hidden":
						let value = defaultValues[field.name] as any
						html += `<input type="hidden" name="${field.name}"`
						if (value !== undefined) html += ` value="${value}"`
						html += `>`
						continue
					case "select":
						html += `<label>${field.label}:`
						html += `<select name="${field.name}"${!field.options.optional ? " required" : ""}>`
						if (field.options.placeholder)
							html += `<option value disabled selected>${field.options.placeholder}</option>`
						for (let option of field.options.options) {
							let isSelected =
								defaultValues[field.name] === option.value ||
								(Array.isArray(defaultValues[field.name]) && defaultValues[field.name].includes(option.value))
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
				if (field.type !== "password" && field.type !== "file" && defaultValues[field.name] !== undefined) {
					let value = defaultValues[field.name] as any

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
				case "hidden":
					schema = z.string()
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
		sideEffect: ((c: Context, data: Record<string, any>) => Promise<void>) | undefined,
		successHandler: (c: Context) => Promise<Response>,
		errorHandler: (c: Context, error: Error) => Promise<Response>
	) {
		return (app: any) => {
			app.on(method, pathPattern, async (c: Context) => {
				let body = method === "GET" ? c.req.query() : await c.req.parseBody()

				try {
					let data = zodSchema.parse(body)

					if (sideEffect) {
						await sideEffect(c, data)
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

	build(): Form {
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
			render: (options: RenderOptions = {}) => generateHtml(options.urlParams, options.values),
			decorateRoute
		}
	}
}

const convertToLocalDate = (t: Date) => {
	return t.toISOString().split("T")[0]
}
