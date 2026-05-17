# Chronos — Postman Collections

This repository stores Postman collections for the Todo App API. The collections are intended primarily for **manual testing in Postman**.

> Automated API tests are maintained in a separate repository:
> [Chronos_App_Api_Testing](https://github.com/jirivondra/Chronos_App_Api_Testing)

## Repository Structure

```
collections/
  todo-app.postman_collection.json   ← main collection
environments/
  local.postman_environment.json     ← local environment (localhost:8000)
  staging.postman_environment.json   ← staging (fill in credentials before use)
```

## Prerequisites — Running the Application Locally

To use these collections and get relevant API responses, you need to have the application running locally.

Clone and set up the application from the [todo_app repository](https://github.com/jirivondra/todo_app) and follow the instructions in its [README](https://github.com/jirivondra/todo_app#readme).

## How to Connect the Repository to Postman

1. Clone this repository:
   ```bash
   git clone https://github.com/jirivondra/chronos_postman_colection.git
   ```

2. Open Postman → click **Import**

3. Drag and drop or select the files:
   - `collections/todo-app.postman_collection.json`
   - `environments/local.postman_environment.json`

4. In the top right corner of Postman, select the **Todo App - Local** environment

5. Start the application locally and begin testing

> **Tip:** Whenever you modify a collection in Postman, export it back to the repository and commit the changes — this keeps the repository up to date.

## Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/todos` | List all todos |
| POST | `/todos` | Create a new todo |
| GET | `/todos/{id}` | Get a todo by ID |
| PUT | `/todos/{id}` | Update a todo |
| DELETE | `/todos/{id}` | Delete a todo |

## Authentication

The API uses **HTTP Basic Auth**.
Default credentials for the local environment: `admin` / `secret`

## Request Chaining

The collection is designed to be run in the following order:

1. **Create Todo** → automatically saves `todo_id` to a collection variable
2. **Get Todo by ID** → uses `todo_id`
3. **Update Todo** → uses `todo_id`
4. **Delete Todo** → uses `todo_id` and then clears it

## Tests

Each request includes automated tests (the **Tests** tab in Postman):
- HTTP status code verification
- Response body structure validation
- Data type checks

The **Edge Cases** folder tests error states:
- `404` for a non-existent ID
- `422` for a missing required field
- `401` for missing authentication

To run all tests at once, use the **Collection Runner** (the ▶ button next to the collection).

## Using with Other Tools

The collections are in Postman Collection v2.1 format. They can also be imported into other API clients, but the import process differs:

- **Bruno** — guide for importing Postman collections: [docs.usebruno.com](https://docs.usebruno.com/get-started/import-export-data/postman-migration)
- **Insomnia** — supports Postman collection import via File → Import
