// Checks a newman run of the collection: every request must return its endpoint's success status
// code from the OpenAPI spec, a JSON body whenever it has one, and no unresolved {{variable}} may be
// left in a sent request. The collection itself holds no pm.test assertions (it's for manual calls
// only), so this is what verifies it actually works. API behaviour is tested in the Mocha repo.
import fs from 'node:fs'
import { Buffer } from 'node:buffer'

function argFor(argv, flag) {
  const index = argv.indexOf(flag)
  if (-1 === index) {
    throw new Error(`Missing required argument ${flag}`)
  }
  return argv[index + 1]
}

// Same key convention as sync-manifest.json (see Chronost_App's postman-sync/canonical-key.js):
// method + path segments, path params collapsed to "id" — e.g. PUT /todos/{todo_id} -> put_todos_id.
function canonicalKey(method, specPath) {
  const segments = specPath
    .split('/')
    .filter(Boolean)
    .map((segment) => (segment.startsWith('{') ? 'id' : segment))
  return [method.toLowerCase(), ...segments].join('_')
}

function successStatusByKey(spec) {
  const byKey = new Map()
  for (const [specPath, methods] of Object.entries(spec.paths ?? {})) {
    for (const [method, operation] of Object.entries(methods)) {
      const code = Object.keys(operation.responses ?? {}).find(
        (status) => !status.startsWith('4') && !status.startsWith('5')
      )
      if (code) {
        byKey.set(canonicalKey(method, specPath), Number(code))
      }
    }
  }
  return byKey
}

// Every endpoint of this API answers in JSON, so any response that carries a body must be JSON.
// Bodiless responses (e.g. 204 from Delete) are skipped, even though they still send a JSON
// Content-Type.
function nonJsonBodyProblem(response) {
  const body = Buffer.from(response.stream?.data ?? []).toString('utf8')
  if ('' === body) {
    return null
  }
  const contentType =
    response.header?.find((header) => 'content-type' === header.key.toLowerCase())?.value ?? ''
  if (!contentType.includes('application/json')) {
    return `Content-Type is "${contentType || 'missing'}", not JSON`
  }
  try {
    JSON.parse(body)
    return null
  } catch {
    return 'body is not valid JSON'
  }
}

function decodeUrlPart(part) {
  try {
    return decodeURIComponent(part)
  } catch {
    return part
  }
}

// newman reports the request as actually sent, i.e. after variable substitution — so a "{{name}}"
// left in it means the variable was never set (e.g. Delete run without Create first). URL parts
// come URL-encoded ("%7B%7Btodo_id%7D%7D"), so they're decoded before matching.
function unresolvedVariables(request) {
  const url = request.url ?? {}
  const parts = [
    ...[
      ...(url.host ?? []),
      ...(url.path ?? []),
      ...(url.query ?? []).filter((param) => !param.disabled).map((param) => param.value ?? ''),
    ].map(decodeUrlPart),
    ...(request.header ?? []).filter((header) => !header.disabled).map((header) => header.value),
    request.body?.raw ?? '',
  ]
  const found = parts.join(' ').match(/\{\{[^}]+\}\}/g) ?? []
  return [...new Set(found)].map((variable) => `\`${variable}\``)
}

function main() {
  const argv = process.argv.slice(2)
  const report = JSON.parse(fs.readFileSync(argFor(argv, '--results'), 'utf8'))
  const spec = JSON.parse(fs.readFileSync(argFor(argv, '--spec'), 'utf8'))
  const manifest = JSON.parse(fs.readFileSync(argFor(argv, '--manifest'), 'utf8'))
  const outPath = argFor(argv, '--out')

  const statusByKey = successStatusByKey(spec)
  const expectedByName = new Map(
    Object.entries(manifest).map(([key, name]) => [name, statusByKey.get(key) ?? null])
  )

  const rows = report.run.executions.map((execution) => {
    const name = execution.item.name
    const expected = expectedByName.get(name) ?? null
    const actual = execution.response?.code ?? null
    const problems = []
    if (null === expected) {
      // The collection holds only successful calls to endpoints in the spec — anything else
      // (e.g. a hand-added error example) doesn't belong here; error cases are tested in Mocha.
      problems.push('not mapped to an endpoint of the spec in sync-manifest.json')
    }
    if (null === actual) {
      problems.push('no response')
    } else {
      if (null !== expected && actual !== expected) {
        problems.push(`expected ${expected}, got ${actual}`)
      }
      const jsonProblem = nonJsonBodyProblem(execution.response)
      if (jsonProblem) {
        problems.push(jsonProblem)
      }
    }
    const unresolved = unresolvedVariables(execution.request)
    if (unresolved.length > 0) {
      problems.push(`unresolved ${unresolved.join(', ')} (variable not set by an earlier request?)`)
    }
    const result = problems.length > 0 ? `❌ ${problems.join('; ')}` : '✅'
    return { name, expected, actual, result, failed: problems.length > 0 }
  })

  // Script errors (e.g. a pre-request that throws) and any failed pm.test land in run.failures.
  const errors = report.run.failures ?? []
  const failedCount = rows.filter((row) => row.failed).length + errors.length

  const lines = [
    `## Postman collection run: ${0 === failedCount ? '✅ passed' : `❌ ${failedCount} failed`}`,
    '',
    `Ran ${rows.length} request(s) against a live API. Each one must return the success status code from the OpenAPI spec, a JSON body whenever it has one, and leave no \`{{variable}}\` unresolved.`,
    '',
    '| Request | Expected | Actual | Result |',
    '| --- | --- | --- | --- |',
    ...rows.map(
      (row) => `| ${row.name} | ${row.expected ?? '—'} | ${row.actual ?? '—'} | ${row.result} |`
    ),
  ]
  if (errors.length > 0) {
    lines.push('', 'Errors:', '')
    errors.forEach((failure) => {
      lines.push(
        `- **${failure.source?.name ?? 'unknown request'}**: ${failure.error?.message ?? 'unknown error'}`
      )
    })
  }

  fs.writeFileSync(outPath, `${lines.join('\n')}\n`)
  console.log(lines.join('\n'))
  if (failedCount > 0) {
    process.exitCode = 1
  }
}

main()
