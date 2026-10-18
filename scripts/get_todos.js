export const test = `
pm.test('Status is 200 OK', function () {
    pm.response.to.have.status(200);
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
