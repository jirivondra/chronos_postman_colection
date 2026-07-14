export const test = `
pm.test('Status is 200 OK', function () {
    pm.response.to.have.status(200);
});

pm.test('Response is an array', function () {
    const body = pm.response.json();
    pm.expect(body).to.be.an('array');
});

pm.test('Each todo has id, title and completed', function () {
    const body = pm.response.json();
    body.forEach(function (todo) {
        pm.expect(todo).to.have.property('id');
        pm.expect(todo).to.have.property('title');
        pm.expect(todo).to.have.property('completed');
    });
});

pm.test('Content-Type is application/json', function () {
    pm.response.to.have.header('Content-Type');
    pm.expect(pm.response.headers.get('Content-Type')).to.include('application/json');
});

// Pagination pattern — saves cursor for the next page if the API supports pagination.
// Current API does not support pagination, script is ready for future use.
const body = pm.response.json();
const cursor = body.next_cursor || body.next || null;
if (cursor) {
    pm.collectionVariables.set('next_cursor', cursor);
    console.log('Next page available, cursor:', cursor);
} else {
    pm.collectionVariables.unset('next_cursor');
}
`
