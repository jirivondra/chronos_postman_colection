# Chronos — Postman Collections

This repository stores Postman collections for the Todo App API. The collections are intended primarily for **manual testing in Postman**.

Since this repository is used only for manual testing, there is no need for a paid Postman subscription. All changes to collections are made in the free version of Postman and synced to the repository via export and commit.

> Automated API tests are maintained in a separate repository:
> [Chronos_App_Api_Testing](https://github.com/jirivondra/Chronos_App_Api_Testing)

## Repository Structure

```
collections/
  todo-app.postman_collection.json   ← main collection
environments/
  local.postman_environment.json     ← local environment (localhost:8000)
scripts/
  <method>_<path>.js                 ← hand-written pre-request/test scripts, one file per endpoint
sync-manifest.json                   ← maps each endpoint key to the request name it syncs into
```

## Prerequisites — Running the Application Locally

To use these collections and get relevant API responses, you need to have the application running locally.

Clone and set up the application from the [Chronost_App repository](https://github.com/jirivondra/Chronost_App) and follow the instructions in its [README](https://github.com/jirivondra/Chronost_App#readme).

## How to Import the Collections

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

## How to Update the Collections

**Method, URL and path changes are automated.** Whenever `api/main.py` changes in [Chronost_App](https://github.com/jirivondra/Chronost_App), a workflow there regenerates the request shapes from the OpenAPI spec and opens a PR here with the update. The PR body lists any endpoint that's newly added (not yet wired to a request via `sync-manifest.json`) or missing a test script — review and merge it like any other PR.

```mermaid
sequenceDiagram
    actor Dev as Developer
    participant App as Chronost_App (main)
    participant CI as postman-sync workflow
    participant Repo as chronos_postman_colection
    actor Rev as Reviewer

    Dev->>App: Merge PR touching api/main.py
    App->>CI: Trigger (push to main, paths: api/main.py)
    CI->>CI: export_openapi.py -> openapi.json
    CI->>CI: generate.js -> one skeleton file per endpoint
    CI->>Repo: Checkout (scripts/, sync-manifest.json, collections/*.json)
    CI->>CI: compose.js (skeletons + scripts + manifest -> new collection.json)
    CI->>CI: check-missing-scripts.js -> checklist
    CI->>Repo: Open PR (branch sync/openapi-update)
    Repo-->>Rev: PR with updated collection + checklist
    Rev->>Repo: Review & merge (or add missing scripts/manifest entries first)
```

The sync never touches `header`, `body`, or the request's test/pre-request scripts, and it never touches folders or requests that aren't listed in `sync-manifest.json` (e.g. the `Errors` folder, or scenario requests like `Get Next Page`) — those stay fully hand-maintained. See [`postman-sync/README.md`](https://github.com/jirivondra/Chronost_App/blob/main/postman-sync/README.md) in Chronost_App for the pipeline implementation details.

To change a script:

1. Edit the matching file in `scripts/<method>_<path>.js` (e.g. `scripts/get_todos_id.js`), exporting `prerequest` and/or `test` as template-literal strings
2. Commit and push — the next sync PR will pick it up

To add a request for a brand-new endpoint:

1. Create the request by hand in Postman, export, and commit it as usual (see below)
2. Add an entry to `sync-manifest.json` mapping the endpoint key to the request's name
3. Optionally add `scripts/<key>.js` for its test script

Everything else not covered by the automated sync (environment values, new folders, error-scenario requests) is still exported and committed manually:

1. Make your changes in Postman
2. Right-click the collection → **Export JSON** → save over `collections/todo-app.postman_collection.json`
3. To export the environment: click `...` next to the environment → **Export** → save over `environments/local.postman_environment.json`
4. Commit and push the changes:
   ```bash
   git add collections/ environments/
   git commit -m "fix: update collection"
   git push
   ```

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

The **Errors** folder tests error states:
- `404` for a non-existent ID
- `422` for a missing required field
- `401` for missing authentication

To run all tests at once, use the **Collection Runner** (the ▶ button next to the collection).

## Using with Other Tools

The collections are stored in Postman Collection v2.1 format, which is supported by other API clients as well. This means you are not locked into Postman — the same collections can be used in tools like Bruno or Insomnia with a one-time import:

- **Bruno** — guide for importing Postman collections: [docs.usebruno.com](https://docs.usebruno.com/get-started/import-export-data/postman-migration)
- **Insomnia** — supports Postman collection import via File → Import
