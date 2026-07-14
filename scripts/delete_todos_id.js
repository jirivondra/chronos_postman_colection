export const prerequest = `
if (!pm.collectionVariables.get('todo_id')) {
    throw new Error('todo_id is not set — run Create Todo first');
}
`

export const test = `
pm.test('Status is 204 No Content', function () {
    pm.response.to.have.status(204);
});

pm.test('Response body is empty', function () {
    pm.expect(pm.response.text()).to.be.empty;
});

pm.collectionVariables.unset('todo_id');
`
