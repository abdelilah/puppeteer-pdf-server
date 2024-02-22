#!/usr/bin/env node
const http = require('http');
const puppeteer = require('puppeteer');

let browser = null;

const getBrowser = async () => {
	if (!browser) {
		browser = await puppeteer.launch({
			executablePath: '/usr/bin/google-chrome',
			args: [' --no-sandbox'],
		});
	}

	return browser;
};

const getPage = async () => {
	const browser = await getBrowser();
	const page = await browser.newPage();
	await page.setDefaultTimeout(5000);
	await page.setViewport({ width: 1080, height: 1024 });

	return page;
};

const getPDFFromURL = async (url) => {
	const page = await getPage();
	await page.goto(url);
	await page.waitForNetworkIdle();
	const pdf = await page.pdf({ format: 'A4' });
	await page.close();

	return pdf;
};

const getPDFFromJSON = async ({ html, options = {} }) => {
	const page = await getPage();
	await page.setContent(html);
	await page.waitForNetworkIdle();

	const pdf = await page.pdf({
		format: 'A4',
		displayHeaderFooter: true,
		printBackground: true,
		...options,
	});

	await page.close();

	return pdf;
};

const handleInvalidRequest = (res) => {
	res.writeHead(400, { 'Content-Type': 'application/json' });
	res.end(JSON.stringify({ error: 'Invalid request' }));
};

// Warm up the browser
getBrowser();

// Start the server
const server = http
	.createServer(async (req, res) => {
		const startTime = Date.now();
		let body = '';

		req.on('data', (chunk) => {
			body += chunk.toString();
		});

		req.on('end', async () => {
			let bodyObj;
			let html = '';
			let url = null;
			let options = {};

			try {
				bodyObj = JSON.parse(body);

				url = bodyObj.url || null;
				html = bodyObj.html;
				options = bodyObj.options || {};
			} catch (err) {
				html = body;
			}

			let pdf;

			if (url) {
				pdf = await getPDFFromURL(url);
			} else if (html) {
				pdf = await getPDFFromJSON({ html, options });
			} else {
				return handleInvalidRequest(res);
			}

			const endTime = Date.now();
			console.log('Request completed', {
				duration: endTime - startTime,
				pdfSize: pdf.length,
				client: req.socket.remoteAddress,
			});

			res.writeHead(200, {
				'Content-Type': 'application/pdf',
				'Content-Disposition': 'attachment; filename=download.pdf',
				'Content-Length': pdf.length,
			});
			res.end(pdf);
		});
	})
	.listen(process.env.PORT || 3000);

process.on('SIGTERM', async () => {
	if (browser) {
		await browser.close();
	}

	server.close(() => {
		console.log('Process terminated');
	});
});
