import { FormBuilder } from "."
import { Hono } from "hono"

describe("FormBuilder", () => {
	let formBuilder: FormBuilder
	let app: Hono

	beforeEach(() => {
		formBuilder = new FormBuilder("/test/:id")
		app = new Hono()
	})

	describe("Constructor", () => {
		it("should create a FormBuilder with POST method by default", () => {
			const form = formBuilder
				.addText("name", "Name")
				.setSuccessHandler(async () => new Response("Success"))
				.setErrorHandler(async () => new Response("Error"))
				.build()
			const html = form.render({ urlParams: { id: "123" } })
			expect(html).toContain('method="POST"')
		})

		it("should create a FormBuilder with GET method when specified", () => {
			const getFormBuilder = new FormBuilder("/test/:id", "GET")
			const form = getFormBuilder
				.addText("name", "Name")
				.setSuccessHandler(async () => new Response("Success"))
				.setErrorHandler(async () => new Response("Error"))
				.build()
			const html = form.render({ urlParams: { id: "123" } })
			expect(html).toContain('method="GET"')
		})
	})

	describe("Field Addition", () => {
		describe("Text Field", () => {
			it("should add a basic text field", () => {
				const form = formBuilder
					.addText("name", "Name")
					.setSuccessHandler(async () => new Response("Success"))
					.setErrorHandler(async () => new Response("Error"))
					.build()
				const html = form.render({ urlParams: { id: "123" } })
				expect(html).toContain('type="text"')
				expect(html).toContain('name="name"')
			})

			it("should add a text field with all options", () => {
				const regex = /^[A-Za-z]+$/
				const form = formBuilder
					.addText("name", "Name", {
						minLength: 2,
						maxLength: 50,
						pattern: regex,
						optional: true,
						placeholder: "Enter your name"
					})
					.setSuccessHandler(async () => new Response("Success"))
					.setErrorHandler(async () => new Response("Error"))
					.build()
				const html = form.render({ urlParams: { id: "123" } })
				expect(html).toContain('type="text"')
				expect(html).toContain('name="name"')
				expect(html).toContain('minlength="2"')
				expect(html).toContain('maxlength="50"')
				expect(html).toContain(`pattern="${regex.source}"`)
				expect(html).toContain('placeholder="Enter your name"')
				expect(html).not.toContain("required")
			})
		})

		describe("URL Field", () => {
			it("should add a basic URL field", () => {
				const form = formBuilder
					.addUrl("website", "Website")
					.setSuccessHandler(async () => new Response("Success"))
					.setErrorHandler(async () => new Response("Error"))
					.build()
				const html = form.render({ urlParams: { id: "123" } })
				expect(html).toContain('type="url"')
				expect(html).toContain('name="website"')
			})

			it("should add a URL field with all options", () => {
				const regex = /^https:\/\/.*$/
				const form = formBuilder
					.addUrl("website", "Website", {
						minLength: 10,
						maxLength: 100,
						pattern: regex,
						optional: true,
						placeholder: "https://example.com"
					})
					.setSuccessHandler(async () => new Response("Success"))
					.setErrorHandler(async () => new Response("Error"))
					.build()
				const html = form.render({ urlParams: { id: "123" } })
				expect(html).toContain('type="url"')
				expect(html).toContain('name="website"')
				expect(html).toContain('minlength="10"')
				expect(html).toContain('maxlength="100"')
				expect(html).toContain(`pattern="${regex.source}"`)
				expect(html).toContain('placeholder="https://example.com"')
				expect(html).not.toContain("required")
			})
		})

		describe("Email Field", () => {
			it("should add a basic email field", () => {
				const form = formBuilder
					.addEmail("email", "Email")
					.setSuccessHandler(async () => new Response("Success"))
					.setErrorHandler(async () => new Response("Error"))
					.build()
				const html = form.render({ urlParams: { id: "123" } })
				expect(html).toContain('type="email"')
				expect(html).toContain('name="email"')
			})

			it("should add an email field with all options", () => {
				const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
				const form = formBuilder
					.addEmail("email", "Email", {
						optional: true,
						placeholder: "your@email.com",
						minLength: 5,
						maxLength: 50,
						pattern: regex
					})
					.setSuccessHandler(async () => new Response("Success"))
					.setErrorHandler(async () => new Response("Error"))
					.build()
				const html = form.render({ urlParams: { id: "123" } })
				expect(html).toContain('type="email"')
				expect(html).toContain('name="email"')
				expect(html).toContain('placeholder="your@email.com"')
				expect(html).toContain('minlength="5"')
				expect(html).toContain('maxlength="50"')
				expect(html).toContain(`pattern="${regex.source}"`)
				expect(html).not.toContain("required")
			})
		})

		describe("Number Field", () => {
			it("should add a basic number field", () => {
				const form = formBuilder
					.addNumber("age", "Age")
					.setSuccessHandler(async () => new Response("Success"))
					.setErrorHandler(async () => new Response("Error"))
					.build()
				const html = form.render({ urlParams: { id: "123" } })
				expect(html).toContain('type="number"')
				expect(html).toContain('name="age"')
			})

			it("should add a number field with all options", () => {
				const form = formBuilder
					.addNumber("age", "Age", { min: 0, max: 120, integer: true, optional: true })
					.setSuccessHandler(async () => new Response("Success"))
					.setErrorHandler(async () => new Response("Error"))
					.build()
				const html = form.render({ urlParams: { id: "123" } })
				expect(html).toContain('type="number"')
				expect(html).toContain('name="age"')
				expect(html).toContain('min="0"')
				expect(html).toContain('max="120"')
				expect(html).toContain('step="1"')
				expect(html).not.toContain("required")
			})
		})

		describe("Date Field", () => {
			it("should add a basic date field", () => {
				const form = formBuilder
					.addDate("birthdate", "Birth Date")
					.setSuccessHandler(async () => new Response("Success"))
					.setErrorHandler(async () => new Response("Error"))
					.build()
				const html = form.render({ urlParams: { id: "123" } })
				expect(html).toContain('type="date"')
				expect(html).toContain('name="birthdate"')
			})

			it("should add a date field with all options", () => {
				const form = formBuilder
					.addDate("birthdate", "Birth Date", {
						min: new Date(Date.UTC(2000, 0, 1)),
						max: new Date(Date.UTC(2023, 11, 31)),
						optional: true
					})
					.setSuccessHandler(async () => new Response("Success"))
					.setErrorHandler(async () => new Response("Error"))
					.build()
				const html = form.render({ urlParams: { id: "123" } })
				expect(html).toContain('type="date"')
				expect(html).toContain('name="birthdate"')
				expect(html).toContain('min="2000-01-01"')
				expect(html).toContain('max="2023-12-31"')
				expect(html).not.toContain("required")
			})
		})

		describe("Checkbox Field", () => {
			it("should add a basic checkbox field", () => {
				const form = formBuilder
					.addCheckbox("subscribe", "Subscribe to newsletter")
					.setSuccessHandler(async () => new Response("Success"))
					.setErrorHandler(async () => new Response("Error"))
					.build()
				const html = form.render({ urlParams: { id: "123" } })
				expect(html).toContain('type="checkbox"')
				expect(html).toContain('name="subscribe"')
			})

			it("should add a checkbox field with optional setting", () => {
				const form = formBuilder
					.addCheckbox("subscribe", "Subscribe to newsletter", { optional: true })
					.setSuccessHandler(async () => new Response("Success"))
					.setErrorHandler(async () => new Response("Error"))
					.build()
				const html = form.render({ urlParams: { id: "123" } })
				expect(html).toContain('type="checkbox"')
				expect(html).toContain('name="subscribe"')
				expect(html).not.toContain("required")
			})
		})

		describe("Password Field", () => {
			it("should add a basic password field", () => {
				const form = formBuilder
					.addPassword("password", "Password")
					.setSuccessHandler(async () => new Response("Success"))
					.setErrorHandler(async () => new Response("Error"))
					.build()
				const html = form.render({ urlParams: { id: "123" } })
				expect(html).toContain('type="password"')
				expect(html).toContain('name="password"')
			})

			it("should add a password field with all options", () => {
				const regex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/
				const form = formBuilder
					.addPassword("password", "Password", {
						minLength: 8,
						maxLength: 20,
						pattern: regex,
						optional: true,
						placeholder: "Enter a strong password"
					})
					.setSuccessHandler(async () => new Response("Success"))
					.setErrorHandler(async () => new Response("Error"))
					.build()
				const html = form.render({ urlParams: { id: "123" } })
				expect(html).toContain('type="password"')
				expect(html).toContain('name="password"')
				expect(html).toContain('minlength="8"')
				expect(html).toContain('maxlength="20"')
				expect(html).toContain(`pattern="${regex.source}"`)
				expect(html).toContain('placeholder="Enter a strong password"')
				expect(html).not.toContain("required")
			})
		})

		describe("Range Field", () => {
			it("should add a basic range field", () => {
				const form = formBuilder
					.addRange("volume", "Volume")
					.setSuccessHandler(async () => new Response("Success"))
					.setErrorHandler(async () => new Response("Error"))
					.build()
				const html = form.render({ urlParams: { id: "123" } })
				expect(html).toContain('type="range"')
				expect(html).toContain('name="volume"')
			})

			it("should add a range field with all options", () => {
				const form = formBuilder
					.addRange("volume", "Volume", { min: 0, max: 100, integer: true })
					.setSuccessHandler(async () => new Response("Success"))
					.setErrorHandler(async () => new Response("Error"))
					.build()
				const html = form.render({ urlParams: { id: "123" } })
				expect(html).toContain('type="range"')
				expect(html).toContain('name="volume"')
				expect(html).toContain('min="0"')
				expect(html).toContain('max="100"')
				expect(html).toContain('step="1"')
			})
		})

		describe("File Field", () => {
			it("should add a basic file field", () => {
				const form = formBuilder
					.addFile("avatar", "Avatar")
					.setSuccessHandler(async () => new Response("Success"))
					.setErrorHandler(async () => new Response("Error"))
					.build()
				const html = form.render({ urlParams: { id: "123" } })
				expect(html).toContain('type="file"')
				expect(html).toContain('name="avatar"')
			})

			it("should add a file field with all options", () => {
				const form = formBuilder
					.addFile("avatar", "Avatar", { accept: "image/*", optional: true })
					.setSuccessHandler(async () => new Response("Success"))
					.setErrorHandler(async () => new Response("Error"))
					.build()
				const html = form.render({ urlParams: { id: "123" } })
				expect(html).toContain('type="file"')
				expect(html).toContain('name="avatar"')
				expect(html).toContain('accept="image/*"')
				expect(html).not.toContain("required")
			})
		})

		describe("Select Field", () => {
			it("should add a basic select field", () => {
				const options = [
					{ value: "option1", label: "Option 1" },
					{ value: "option2", label: "Option 2" }
				]
				const form = formBuilder
					.addSelect("choice", "Choice", { options })
					.setSuccessHandler(async () => new Response("Success"))
					.setErrorHandler(async () => new Response("Error"))
					.build()
				const html = form.render({ urlParams: { id: "123" } })
				expect(html).toContain('<select name="choice"')
				expect(html).toContain('<option value="option1">Option 1</option>')
				expect(html).toContain('<option value="option2">Option 2</option>')
			})

			it("should add a select field with all options", () => {
				const options = [
					{ value: "option1", label: "Option 1" },
					{ value: "option2", label: "Option 2" }
				]
				const form = formBuilder
					.addSelect("choice", "Choice", {
						options,
						optional: true,
						placeholder: "Select an option"
					})
					.setSuccessHandler(async () => new Response("Success"))
					.setErrorHandler(async () => new Response("Error"))
					.build()
				const html = form.render({ urlParams: { id: "123" } })
				expect(html).toContain('<select name="choice"')
				expect(html).toContain("<option value disabled selected>Select an option</option>")
				expect(html).toContain('<option value="option1">Option 1</option>')
				expect(html).toContain('<option value="option2">Option 2</option>')
				expect(html).not.toContain("required")
			})
		})

		describe("Color Field", () => {
			it("should add a basic color field", () => {
				const form = formBuilder
					.addColor("favcolor", "Favorite Color")
					.setSuccessHandler(async () => new Response("Success"))
					.setErrorHandler(async () => new Response("Error"))
					.build()
				const html = form.render({ urlParams: { id: "123" } })
				expect(html).toContain('type="color"')
				expect(html).toContain('name="favcolor"')
			})
		})

		describe("Tel Field", () => {
			it("should add a basic tel field", () => {
				const form = formBuilder
					.addTel("phone", "Phone Number")
					.setSuccessHandler(async () => new Response("Success"))
					.setErrorHandler(async () => new Response("Error"))
					.build()
				const html = form.render({ urlParams: { id: "123" } })
				expect(html).toContain('type="tel"')
				expect(html).toContain('name="phone"')
			})

			it("should add a tel field with all options", () => {
				const regex = /^\d{3}-\d{3}-\d{4}$/
				const form = formBuilder
					.addTel("phone", "Phone Number", {
						pattern: regex,
						placeholder: "123-456-7890",
						minLength: 10,
						maxLength: 12,
						optional: true
					})
					.setSuccessHandler(async () => new Response("Success"))
					.setErrorHandler(async () => new Response("Error"))
					.build()
				const html = form.render({ urlParams: { id: "123" } })
				expect(html).toContain('type="tel"')
				expect(html).toContain('name="phone"')
				expect(html).toContain(`pattern="${regex.source}"`)
				expect(html).toContain('placeholder="123-456-7890"')
				expect(html).toContain('minlength="10"')
				expect(html).toContain('maxlength="12"')
				expect(html).not.toContain("required")
			})
		})
	})

	describe("Form Rendering", () => {
		it("should render a form with multiple fields and complex URL pattern", () => {
			const complexFormBuilder = new FormBuilder("/users/:userId/posts/:postId/edit")
			const form = complexFormBuilder
				.addText("title", "Title")
				.addSelect("category", "Category", {
					options: [
						{ value: "tech", label: "Technology" },
						{ value: "lifestyle", label: "Lifestyle" }
					]
				})
				.setSuccessHandler(async () => new Response("Success"))
				.setErrorHandler(async () => new Response("Error"))
				.build()
			const html = form.render({ urlParams: { userId: "123", postId: "456" } })
			expect(html).toContain('<form action="/users/123/posts/456/edit" method="POST">')
			expect(html).toContain('name="title"')
			expect(html).toContain('name="category"')
		})

		it("should render a form with default values", () => {
			const form = formBuilder
				.addText("name", "Name")
				.addEmail("email", "Email")
				.addNumber("age", "Age")
				.addDate("birthdate", "Birth Date")
				.addCheckbox("subscribe", "Subscribe")
				.addSelect("country", "Country", {
					options: [
						{ value: "us", label: "USA" },
						{ value: "ca", label: "Canada" }
					]
				})
				.setSuccessHandler(async () => new Response("Success"))
				.setErrorHandler(async () => new Response("Error"))
				.build()
			const html = form.render({
				urlParams: { id: "123" },
				values: {
					name: "John Doe",
					email: "john@example.com",
					age: 30,
					birthdate: "1990-01-01",
					subscribe: true,
					country: "ca"
				}
			})
			expect(html).toContain('value="John Doe"')
			expect(html).toContain('value="john@example.com"')
			expect(html).toContain('value="30"')
			expect(html).toContain('value="1990-01-01"')
			expect(html).toContain("checked")
			expect(html).toContain('<option value="ca" selected>')
		})

		it("should handle form with regex-based URL parameters", () => {
			const regexFormBuilder = new FormBuilder("/items/:id{\\d+}/edit")
			const form = regexFormBuilder
				.addText("name", "Item Name")
				.setSuccessHandler(async () => new Response("Success"))
				.setErrorHandler(async () => new Response("Error"))
				.build()

			const html = form.render({ urlParams: { id: "123" } })
			expect(html).toContain('<form action="/items/123/edit" method="POST">')

			expect(() => form.render({ urlParams: { id: "abc" } })).toThrow("Invalid values for path parameters: id")
		})

		it("should handle deeply nested URL parameters", () => {
			const complexFormBuilder = new FormBuilder("/users/:userId/posts/:postId/comments/:commentId/edit")
			const form = complexFormBuilder
				.addText("content", "Comment Content")
				.setSuccessHandler(async () => new Response("Success"))
				.setErrorHandler(async () => new Response("Error"))
				.build()
			const html = form.render({ urlParams: { userId: "123", postId: "456", commentId: "789" } })
			expect(html).toContain('<form action="/users/123/posts/456/comments/789/edit" method="POST">')
		})
	})

	describe("Form Submission and Validation", () => {
		it("should handle valid form submission with all field types", async () => {
			const successHandler = jest.fn().mockImplementation(() => new Response("Success"))
			const errorHandler = jest.fn().mockImplementation(() => new Response("Error"))
			const sideEffect = jest.fn()

			const form = formBuilder
				.addText("name", "Name", { minLength: 2 })
				.addEmail("email", "Email")
				.addNumber("age", "Age", { min: 18 })
				.addDate("birthdate", "Birth Date")
				.addCheckbox("subscribe", "Subscribe")
				.addPassword("password", "Password", { minLength: 8 })
				.addRange("volume", "Volume", { min: 0, max: 100 })
				.addSelect("country", "Country", {
					options: [
						{ value: "us", label: "USA" },
						{ value: "ca", label: "Canada" }
					]
				})
				.addColor("favcolor", "Favorite Color")
				.addTel("phone", "Phone Number", { pattern: /^\d{3}-\d{3}-\d{4}$/ })
				.setSideEffect(sideEffect)
				.setSuccessHandler(successHandler)
				.setErrorHandler(errorHandler)
				.build()

			form.decorateRoute(app)

			const req = new Request("http://localhost/test/123", {
				method: "POST",
				headers: { "Content-Type": "application/x-www-form-urlencoded" },
				body: "name=John&email=john@example.com&age=30&birthdate=1990-01-01&subscribe=on&password=password123&volume=50&country=us&favcolor=%23ff0000&phone=123-456-7890"
			})

			const res = await app.fetch(req)

			expect(successHandler).toHaveBeenCalled()
			expect(errorHandler).not.toHaveBeenCalled()
			expect(sideEffect).toHaveBeenCalledWith({
				name: "John",
				email: "john@example.com",
				age: 30,
				birthdate: new Date(Date.UTC(1990, 0, 1)),
				subscribe: true,
				password: "password123",
				volume: 50,
				country: "us",
				favcolor: "#ff0000",
				phone: "123-456-7890"
			})
			expect(await res.text()).toBe("Success")
		})

		it("should handle form submission with missing optional fields", async () => {
			const successHandler = jest.fn().mockImplementation(() => new Response("Success"))
			const errorHandler = jest.fn().mockImplementation(() => new Response("Error"))

			const form = formBuilder
				.addText("name", "Name", { optional: true })
				.addEmail("email", "Email")
				.addNumber("age", "Age", { optional: true })
				.setSuccessHandler(successHandler)
				.setErrorHandler(errorHandler)
				.build()

			form.decorateRoute(app)

			const req = new Request("http://localhost/test/123", {
				method: "POST",
				headers: { "Content-Type": "application/x-www-form-urlencoded" },
				body: "email=john@example.com"
			})

			const res = await app.fetch(req)

			expect(successHandler).toHaveBeenCalled()
			expect(errorHandler).not.toHaveBeenCalled()
			expect(await res.text()).toBe("Success")
		})

		it("should handle invalid form submission", async () => {
			const successHandler = jest.fn().mockImplementation(() => new Response("Success"))
			const errorHandler = jest.fn().mockImplementation(() => new Response("Error"))

			const form = formBuilder
				.addText("name", "Name", { minLength: 2 })
				.addEmail("email", "Email")
				.addNumber("age", "Age", { min: 18, max: 100 })
				.setSuccessHandler(successHandler)
				.setErrorHandler(errorHandler)
				.build()

			form.decorateRoute(app)

			const req = new Request("http://localhost/test/123", {
				method: "POST",
				headers: { "Content-Type": "application/x-www-form-urlencoded" },
				body: "name=J&email=invalid-email&age=15"
			})

			const res = await app.fetch(req)

			expect(successHandler).not.toHaveBeenCalled()
			expect(errorHandler).toHaveBeenCalled()
			expect(await res.text()).toBe("Error")
		})

		it("should handle GET method form submission", async () => {
			const getFormBuilder = new FormBuilder("/search", "GET")
			const successHandler = jest.fn().mockImplementation(() => new Response("Success"))
			const errorHandler = jest.fn().mockImplementation(() => new Response("Error"))

			const form = getFormBuilder
				.addText("query", "Search Query")
				.setSuccessHandler(successHandler)
				.setErrorHandler(errorHandler)
				.build()

			form.decorateRoute(app)

			const req = new Request("http://localhost/search?query=test+search", {
				method: "GET"
			})

			const res = await app.fetch(req)

			expect(successHandler).toHaveBeenCalled()
			expect(errorHandler).not.toHaveBeenCalled()
			expect(await res.text()).toBe("Success")
		})

		it("should handle file upload", async () => {
			const successHandler = jest.fn().mockImplementation(() => new Response("Success"))
			const errorHandler = jest.fn().mockImplementation(() => new Response("Error"))

			const form = formBuilder
				.addFile("avatar", "Avatar", { accept: "image/*" })
				.setSuccessHandler(successHandler)
				.setErrorHandler(errorHandler)
				.build()

			form.decorateRoute(app)

			const formData = new FormData()
			const file = new File(["test file content"], "test.jpg", { type: "image/jpeg" })
			formData.append("avatar", file)

			const req = new Request("http://localhost/test/123", {
				method: "POST",
				body: formData
			})

			const res = await app.fetch(req)

			expect(successHandler).toHaveBeenCalled()
			expect(errorHandler).not.toHaveBeenCalled()
			expect(await res.text()).toBe("Success")
		})
	})

	describe("Edge Cases and Error Handling", () => {
		it("should handle empty form submission", async () => {
			const successHandler = jest.fn().mockImplementation(() => new Response("Success"))
			const errorHandler = jest.fn().mockImplementation(() => new Response("Error"))

			const form = formBuilder
				.addText("name", "Name", { optional: true })
				.addEmail("email", "Email", { optional: true })
				.setSuccessHandler(successHandler)
				.setErrorHandler(errorHandler)
				.build()

			form.decorateRoute(app)

			const req = new Request("http://localhost/test/123", {
				method: "POST",
				headers: { "Content-Type": "application/x-www-form-urlencoded" },
				body: ""
			})

			const res = await app.fetch(req)

			expect(successHandler).toHaveBeenCalled()
			expect(errorHandler).not.toHaveBeenCalled()
			expect(await res.text()).toBe("Success")
		})

		it("should handle form submission with extra fields", async () => {
			const successHandler = jest.fn().mockImplementation(() => new Response("Success"))
			const errorHandler = jest.fn().mockImplementation(() => new Response("Error"))

			const form = formBuilder
				.addText("name", "Name")
				.setSuccessHandler(successHandler)
				.setErrorHandler(errorHandler)
				.build()

			form.decorateRoute(app)
			const req = new Request("http://localhost/test/123", {
				method: "POST",
				headers: { "Content-Type": "application/x-www-form-urlencoded" },
				body: "name=John&extra=field"
			})

			const res = await app.fetch(req)

			expect(successHandler).toHaveBeenCalled()
			expect(errorHandler).not.toHaveBeenCalled()
			expect(await res.text()).toBe("Success")
		})

		it("should handle form submission with malformed data", async () => {
			const successHandler = jest.fn().mockImplementation(() => new Response("Success"))
			const errorHandler = jest.fn().mockImplementation(() => new Response("Error"))

			const form = formBuilder
				.addNumber("age", "Age")
				.setSuccessHandler(successHandler)
				.setErrorHandler(errorHandler)
				.build()

			form.decorateRoute(app)

			const req = new Request("http://localhost/test/123", {
				method: "POST",
				headers: { "Content-Type": "application/x-www-form-urlencoded" },
				body: "age=not_a_number"
			})

			const res = await app.fetch(req)

			expect(successHandler).not.toHaveBeenCalled()
			expect(errorHandler).toHaveBeenCalled()
			expect(await res.text()).toBe("Error")
		})

		it("should throw error when building form without setting error handler", () => {
			const formWithoutErrorHandler = formBuilder
				.addText("name", "Name")
				.setSuccessHandler(async () => new Response("Success"))

			expect(() => formWithoutErrorHandler.build()).toThrow("Error handler not set")
		})

		it("should throw error when building form without setting success handler", () => {
			const formWithoutSuccessHandler = formBuilder
				.addText("name", "Name")
				.setErrorHandler(async () => new Response("Error"))

			expect(() => formWithoutSuccessHandler.build()).toThrow("Success handler not set")
		})
	})

	describe("Form Builder Chaining", () => {
		it("should allow chaining of all methods", () => {
			const sideEffect = jest.fn()
			const successHandler = jest.fn().mockImplementation(() => new Response("Success"))
			const errorHandler = jest.fn().mockImplementation(() => new Response("Error"))

			const form = formBuilder
				.addText("name", "Name")
				.addEmail("email", "Email")
				.addNumber("age", "Age")
				.addDate("birthdate", "Birth Date")
				.addCheckbox("subscribe", "Subscribe")
				.addPassword("password", "Password")
				.addRange("volume", "Volume")
				.addFile("avatar", "Avatar")
				.addSelect("country", "Country", {
					options: [
						{ value: "us", label: "USA" },
						{ value: "ca", label: "Canada" }
					]
				})
				.addColor("favcolor", "Favorite Color")
				.addTel("phone", "Phone Number")
				.addUrl("website", "Website")
				.setSideEffect(sideEffect)
				.setSuccessHandler(successHandler)
				.setErrorHandler(errorHandler)
				.build()

			expect(form).toHaveProperty("render")
			expect(form).toHaveProperty("decorateRoute")
		})
	})

	describe("Zod Schema Validation", () => {
		let app: Hono
		let sideEffect: jest.Mock
		let successHandler: jest.Mock
		let errorHandler: jest.Mock
		let form

		beforeEach(() => {
			app = new Hono()
			sideEffect = jest.fn()
			successHandler = jest.fn().mockImplementation(() => new Response("Success"))
			errorHandler = jest.fn().mockImplementation(() => new Response("Error"))

			form = formBuilder
				.addText("username", "Username", { minLength: 3, maxLength: 20, pattern: /^[a-zA-Z0-9_]+$/ })
				.addEmail("email", "Email")
				.addNumber("age", "Age", { min: 18, max: 120, integer: true })
				.addUrl("website", "Website")
				.addDate("birthdate", "Birthdate", { min: new Date(1900, 0, 1), max: new Date() })
				.addCheckbox("terms", "Accept Terms")
				.addSelect("country", "Country", {
					options: [
						{ value: "us", label: "USA" },
						{ value: "ca", label: "Canada" }
					]
				})
				.addPassword("password", "Password", { minLength: 8 })
				.addRange("volume", "Volume", { min: 0, max: 100 })
				.addColor("favoriteColor", "Favorite Color")
				.addTel("phone", "Phone Number", { pattern: /^\d{3}-\d{3}-\d{4}$/ })
				.setSideEffect(sideEffect)
				.setSuccessHandler(successHandler)
				.setErrorHandler(errorHandler)
				.build()

			form.decorateRoute(app)
		})

		const testCases = [
			{
				name: "Valid input for all fields",
				body: "username=validuser&email=user@example.com&age=30&website=https://example.com&birthdate=1990-01-01&terms=on&country=us&password=password123&volume=50&favoriteColor=%23ff0000&phone=123-456-7890",
				expectedResult: "Success",
				expectedSideEffectData: {
					username: "validuser",
					email: "user@example.com",
					age: 30,
					website: "https://example.com",
					birthdate: new Date("1990-01-01T00:00:00.000Z"),
					terms: true,
					country: "us",
					password: "password123",
					volume: 50,
					favoriteColor: "#ff0000",
					phone: "123-456-7890"
				}
			},
			{
				name: "Invalid username (too short)",
				body: "username=ab&email=user@example.com&age=30&website=https://example.com&birthdate=1990-01-01&terms=on&country=us&password=password123&volume=50&favoriteColor=%23ff0000&phone=123-456-7890",
				expectedResult: "Error",
				expectedSideEffectData: null
			},
			{
				name: "Invalid username (contains special characters)",
				body: "username=invalid@user&email=user@example.com&age=30&website=https://example.com&birthdate=1990-01-01&terms=on&country=us&password=password123&volume=50&favoriteColor=%23ff0000&phone=123-456-7890",
				expectedResult: "Error",
				expectedSideEffectData: null
			},
			{
				name: "Invalid email",
				body: "username=validuser&email=invalid-email&age=30&website=https://example.com&birthdate=1990-01-01&terms=on&country=us&password=password123&volume=50&favoriteColor=%23ff0000&phone=123-456-7890",
				expectedResult: "Error",
				expectedSideEffectData: null
			},
			{
				name: "Invalid age (below min)",
				body: "username=validuser&email=user@example.com&age=17&website=https://example.com&birthdate=1990-01-01&terms=on&country=us&password=password123&volume=50&favoriteColor=%23ff0000&phone=123-456-7890",
				expectedResult: "Error",
				expectedSideEffectData: null
			},
			{
				name: "Invalid age (above max)",
				body: "username=validuser&email=user@example.com&age=121&website=https://example.com&birthdate=1990-01-01&terms=on&country=us&password=password123&volume=50&favoriteColor=%23ff0000&phone=123-456-7890",
				expectedResult: "Error",
				expectedSideEffectData: null
			},
			{
				name: "Invalid age (non-integer)",
				body: "username=validuser&email=user@example.com&age=30.5&website=https://example.com&birthdate=1990-01-01&terms=on&country=us&password=password123&volume=50&favoriteColor=%23ff0000&phone=123-456-7890",
				expectedResult: "Error",
				expectedSideEffectData: null
			},
			{
				name: "Invalid website",
				body: "username=validuser&email=user@example.com&age=30&website=not-a-url&birthdate=1990-01-01&terms=on&country=us&password=password123&volume=50&favoriteColor=%23ff0000&phone=123-456-7890",
				expectedResult: "Error",
				expectedSideEffectData: null
			},
			{
				name: "Invalid birthdate (before min)",
				body: "username=validuser&email=user@example.com&age=30&website=https://example.com&birthdate=1899-12-31&terms=on&country=us&password=password123&volume=50&favoriteColor=%23ff0000&phone=123-456-7890",
				expectedResult: "Error",
				expectedSideEffectData: null
			},
			{
				name: "Invalid birthdate (after max)",
				body: "username=validuser&email=user@example.com&age=30&website=https://example.com&birthdate=2100-01-01&terms=on&country=us&password=password123&volume=50&favoriteColor=%23ff0000&phone=123-456-7890",
				expectedResult: "Error",
				expectedSideEffectData: null
			},
			{
				name: "Missing required checkbox",
				body: "username=validuser&email=user@example.com&age=30&website=https://example.com&birthdate=1990-01-01&country=us&password=password123&volume=50&favoriteColor=%23ff0000&phone=123-456-7890",
				expectedResult: "Error",
				expectedSideEffectData: null
			},
			{
				name: "Invalid country option",
				body: "username=validuser&email=user@example.com&age=30&website=https://example.com&birthdate=1990-01-01&terms=on&country=fr&password=password123&volume=50&favoriteColor=%23ff0000&phone=123-456-7890",
				expectedResult: "Error",
				expectedSideEffectData: null
			},
			{
				name: "Invalid password (too short)",
				body: "username=validuser&email=user@example.com&age=30&website=https://example.com&birthdate=1990-01-01&terms=on&country=us&password=short&volume=50&favoriteColor=%23ff0000&phone=123-456-7890",
				expectedResult: "Error",
				expectedSideEffectData: null
			},
			{
				name: "Invalid volume (below min)",
				body: "username=validuser&email=user@example.com&age=30&website=https://example.com&birthdate=1990-01-01&terms=on&country=us&password=password123&volume=-1&favoriteColor=%23ff0000&phone=123-456-7890",
				expectedResult: "Error",
				expectedSideEffectData: null
			},
			{
				name: "Invalid volume (above max)",
				body: "username=validuser&email=user@example.com&age=30&website=https://example.com&birthdate=1990-01-01&terms=on&country=us&password=password123&volume=101&favoriteColor=%23ff0000&phone=123-456-7890",
				expectedResult: "Error",
				expectedSideEffectData: null
			},
			{
				name: "Invalid color format",
				body: "username=validuser&email=user@example.com&age=30&website=https://example.com&birthdate=1990-01-01&terms=on&country=us&password=password123&volume=50&favoriteColor=red&phone=123-456-7890",
				expectedResult: "Error",
				expectedSideEffectData: null
			},
			{
				name: "Invalid phone number format",
				body: "username=validuser&email=user@example.com&age=30&website=https://example.com&birthdate=1990-01-01&terms=on&country=us&password=password123&volume=50&favoriteColor=%23ff0000&phone=1234567890",
				expectedResult: "Error",
				expectedSideEffectData: null
			}
		]

		it.each(testCases)("$name", async ({ body, expectedResult, expectedSideEffectData }) => {
			const req = new Request("http://localhost/test/123", {
				method: "POST",
				headers: { "Content-Type": "application/x-www-form-urlencoded" },
				body
			})

			const res = await app.fetch(req)
			expect(await res.text()).toBe(expectedResult)

			if (expectedResult === "Success") {
				expect(successHandler).toHaveBeenCalled()
				expect(errorHandler).not.toHaveBeenCalled()
				expect(sideEffect).toHaveBeenCalledWith(expectedSideEffectData)
			} else {
				expect(errorHandler).toHaveBeenCalled()
				expect(successHandler).not.toHaveBeenCalled()
				expect(sideEffect).not.toHaveBeenCalled()
			}
		})

		it("should handle empty form submission", async () => {
			const req = new Request("http://localhost/test/123", {
				method: "POST",
				headers: { "Content-Type": "application/x-www-form-urlencoded" },
				body: ""
			})

			const res = await app.fetch(req)
			expect(await res.text()).toBe("Error")
			expect(errorHandler).toHaveBeenCalled()
			expect(successHandler).not.toHaveBeenCalled()
			expect(sideEffect).not.toHaveBeenCalled()
		})

		it("should handle form submission with extra fields", async () => {
			const req = new Request("http://localhost/test/123", {
				method: "POST",
				headers: { "Content-Type": "application/x-www-form-urlencoded" },
				body: "username=validuser&email=user@example.com&age=30&website=https://example.com&birthdate=1990-01-01&terms=on&country=us&password=password123&volume=50&favoriteColor=%23ff0000&phone=123-456-7890&extraField=someValue"
			})

			const res = await app.fetch(req)
			expect(await res.text()).toBe("Success")
			expect(successHandler).toHaveBeenCalled()
			expect(errorHandler).not.toHaveBeenCalled()
			expect(sideEffect).toHaveBeenCalledWith({
				username: "validuser",
				email: "user@example.com",
				age: 30,
				website: "https://example.com",
				birthdate: new Date("1990-01-01T00:00:00.000Z"),
				terms: true,
				country: "us",
				password: "password123",
				volume: 50,
				favoriteColor: "#ff0000",
				phone: "123-456-7890"
			})
			// Note: extraField is not included in the side effect data as it's not part of the form definition
		})

		it("should handle form submission with missing required fields", async () => {
			const req = new Request("http://localhost/test/123", {
				method: "POST",
				headers: { "Content-Type": "application/x-www-form-urlencoded" },
				body: "username=validuser&email=user@example.com"
			})

			const res = await app.fetch(req)
			expect(await res.text()).toBe("Error")
			expect(errorHandler).toHaveBeenCalled()
			expect(successHandler).not.toHaveBeenCalled()
			expect(sideEffect).not.toHaveBeenCalled()
		})

		it("should handle form submission with boolean fields", async () => {
			const req = new Request("http://localhost/test/123", {
				method: "POST",
				headers: { "Content-Type": "application/x-www-form-urlencoded" },
				body: "username=validuser&email=user@example.com&age=30&website=https://example.com&birthdate=1990-01-01&terms=true&country=us&password=password123&volume=50&favoriteColor=%23ff0000&phone=123-456-7890"
			})

			const res = await app.fetch(req)
			expect(await res.text()).toBe("Success")
			expect(successHandler).toHaveBeenCalled()
			expect(errorHandler).not.toHaveBeenCalled()
			expect(sideEffect).toHaveBeenCalledWith({
				username: "validuser",
				email: "user@example.com",
				age: 30,
				website: "https://example.com",
				birthdate: new Date("1990-01-01T00:00:00.000Z"),
				terms: true,
				country: "us",
				password: "password123",
				volume: 50,
				favoriteColor: "#ff0000",
				phone: "123-456-7890"
			})
		})

		it("should handle form submission with number fields as strings", async () => {
			const req = new Request("http://localhost/test/123", {
				method: "POST",
				headers: { "Content-Type": "application/x-www-form-urlencoded" },
				body: "username=validuser&email=user@example.com&age=30&website=https://example.com&birthdate=1990-01-01&terms=on&country=us&password=password123&volume=50&favoriteColor=%23ff0000&phone=123-456-7890"
			})

			const res = await app.fetch(req)
			expect(await res.text()).toBe("Success")
			expect(successHandler).toHaveBeenCalled()
			expect(errorHandler).not.toHaveBeenCalled()
			expect(sideEffect).toHaveBeenCalledWith({
				username: "validuser",
				email: "user@example.com",
				age: 30, // Note: This is coerced to a number
				website: "https://example.com",
				birthdate: new Date("1990-01-01T00:00:00.000Z"),
				terms: true,
				country: "us",
				password: "password123",
				volume: 50, // Note: This is coerced to a number
				favoriteColor: "#ff0000",
				phone: "123-456-7890"
			})
		})
	})
})
