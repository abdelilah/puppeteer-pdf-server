# Puppeteer PDF server

This is a simple server that uses [Puppeteer](https://pptr.dev/) to generate PDFs from HTML. It uses a simple HTTP server that receives either a URL or HTML content and returns a PDF.

## Usage

### Running the server

#### Using npm

```bash
npx puppeteer-pdf-server
```

#### Using Docker

```bash
docker run -p 3000:3000 -d --name puppeteer-pdf-server abdelilah/puppeteer-pdf-server
```

#### Using the source code

```bash
npm install # To install dependencies
npm start
```

### Making a request

#### Generate a PDF from a URL

This can be done by sending a POST request to the server with a JSON body containing the URL like `{"url": "https://example.com"}`.

```bash
curl -X POST -H "Content-Type: application/json" -d '{"url": "https://example.com"}' http://localhost:3000 > example.pdf
```

#### Generate a PDF from HTML content

This can be done by sending a POST request to the server with a JSON body containing the HTML content like `{"html": "<h1>Hello, world!</h1>"}`. Alternatively you can also send the HTML content directly as a the request data.

```bash
# Using a JSON body
curl -X POST -H "Content-Type: application/json" -d '{"html": "<h1>Hello, world!</h1>"}' http://localhost:3000 > example.pdf

# Using the request data
curl -X POST -H "Content-Type: text/html" -d "<h1>Hello, world!</h1>" http://localhost:3000 > example.pdf
```

#### PDF options

You can also specify options for the PDF generation by sending a JSON body with the `options` key. The options are the same as the ones used by Puppeteer's `page.pdf` method. For example:

```bash
curl -X POST -H "Content-Type: application/json" -d '{"url": "https://example.com", "options": {"format": "A4"}}' http://localhost:3000 > example.pdf
```
