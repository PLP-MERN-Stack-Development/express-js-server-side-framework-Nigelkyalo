# Product API - Week 2 Express.js Assignment

This project implements a RESTful API for a `products` resource using Express.js. It includes logging, authentication (API key), validation, error handling, filtering, pagination, search, and statistics endpoints.

Getting started

1. Install dependencies:

```powershell
npm install
```

2. Copy `.env.example` to `.env` and set your API_KEY (optional, defaults to `secret123`):

```powershell
copy .env.example .env
# edit .env to set API_KEY
```

3. Run the server:

```powershell
npm start
# or for development with auto-reload
npm run dev
```

The server defaults to PORT 3000.

API Endpoints

- GET / -> Welcome message
- GET /api/products -> List products. Query params:
  - `category` - filter by category
  - `q` - search text in name or description
  - `page` - page number (default 1)
  - `limit` - items per page (default 10)
- GET /api/products/search?q=term -> Search by name/description
- GET /api/products/stats -> Returns total and counts by category
- GET /api/products/:id -> Get product by id
- POST /api/products -> Create product (requires API key header `x-api-key`)
- PUT /api/products/:id -> Update product (requires API key header)
- DELETE /api/products/:id -> Delete product (requires API key header)

Product shape (JSON):

```json
{
  "name": "string",
  "description": "string",
  "price": 123.45,
  "category": "string",
  "inStock": true
}
```

Headers for protected routes:

```
x-api-key: <your_api_key>
```

Examples

Create product (curl example):

```powershell
curl -X POST http://localhost:3000/api/products -H "Content-Type: application/json" -H "x-api-key: secret123" -d "{\"name\":\"Desk Lamp\",\"description\":\"LED lamp\",\"price\":29.99,\"category\":\"home\",\"inStock\":true}"
```

Notes

- This implementation uses an in-memory array for products. For persistence, replace it with a database (e.g., MongoDB).
- Error responses follow { status, statusCode, message } shape.
# Express.js RESTful API Assignment

This assignment focuses on building a RESTful API using Express.js, implementing proper routing, middleware, and error handling.

## Assignment Overview

You will:
1. Set up an Express.js server
2. Create RESTful API routes for a product resource
3. Implement custom middleware for logging, authentication, and validation
4. Add comprehensive error handling
5. Develop advanced features like filtering, pagination, and search

## Getting Started

1. Accept the GitHub Classroom assignment invitation
2. Clone your personal repository that was created by GitHub Classroom
3. Install dependencies:
   ```
   npm install
   ```
4. Run the server:
   ```
   npm start
   ```

## Files Included

- `Week2-Assignment.md`: Detailed assignment instructions
- `server.js`: Starter Express.js server file
- `.env.example`: Example environment variables file

## Requirements

- Node.js (v18 or higher)
- npm or yarn
- Postman, Insomnia, or curl for API testing

## API Endpoints

The API will have the following endpoints:

- `GET /api/products`: Get all products
- `GET /api/products/:id`: Get a specific product
- `POST /api/products`: Create a new product
- `PUT /api/products/:id`: Update a product
- `DELETE /api/products/:id`: Delete a product

## Submission

Your work will be automatically submitted when you push to your GitHub Classroom repository. Make sure to:

1. Complete all the required API endpoints
2. Implement the middleware and error handling
3. Document your API in the README.md
4. Include examples of requests and responses

## Resources

- [Express.js Documentation](https://expressjs.com/)
- [RESTful API Design Best Practices](https://restfulapi.net/)
- [HTTP Status Codes](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status) 