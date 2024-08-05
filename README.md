# hono-forms

A form builder and validator library for Hono applications

## Description

hono-forms is a powerful and flexible library designed to simplify form creation and validation in Hono applications. It provides an intuitive API for building forms, generating HTML, and handling form submissions with built-in validation using Zod.

## Features

- Easy-to-use form builder API
- Automatic HTML generation for forms
- Built-in validation using Zod
- TypeScript support
- Seamless integration with Hono applications

## Installation

```bash
npm install hono-forms
```

## Usage

Here's a basic example of how to use hono-forms:

```typescript
import { Hono } from "hono"
import { FormBuilder } from "hono-forms"

const app = new Hono()

const loginForm = new FormBuilder("/login", "POST")
	.addText("username", "Username", { minLength: 3, maxLength: 20 })
	.addPassword("password", "Password", { minLength: 8 })
	.setSuccessHandler(async (c) => {
		// Handle successful form submission
		return c.text("Login successful")
	})
	.setErrorHandler(async (c, error) => {
		// Handle validation errors
		return c.text(`Login failed: ${error.message}`)
	})
	.build()

app.get("/login", (c) => c.html(loginForm.render()))
loginForm.decorateRoute(app)

export default app
```

## API Reference

### `FormBuilder`

The main class for building forms.

#### Methods

- `addText(name: string, label: string, options?: TextFieldOptions): FormBuilder`
- `addPassword(name: string, label: string, options?: PasswordFieldOptions): FormBuilder`
- `addEmail(name: string, label: string, options?: EmailFieldOptions): FormBuilder`
- `addNumber(name: string, label: string, options?: NumberFieldOptions): FormBuilder`
- `addCheckbox(name: string, label: string, options?: CheckboxFieldOptions): FormBuilder`
- `addSelect(name: string, label: string, options: SelectFieldOptions): FormBuilder`
- `setSuccessHandler(fn: SuccessHandler): FormBuilder`
- `setErrorHandler(fn: ErrorHandler): FormBuilder`
- `build(): Form`

### `Form`

The result of building a form with `FormBuilder`.

#### Methods

- `render(options?: RenderOptions): string`
- `decorateRoute(app: Hono): void`

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the 0BSD License - see the [LICENSE](LICENSE) file for details.

## Author

Bjorn Pagen <11238136+bjornpagen@users.noreply.github.com>

## Links

- [GitHub Repository](https://github.com/bjornpagen/hono-forms)
- [npm Package](https://www.npmjs.com/package/hono-forms)
- [Hono Framework](https://hono.dev/)
- [Zod Validation Library](https://github.com/colinhacks/zod)
