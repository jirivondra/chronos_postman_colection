export const prerequest = `
if (!pm.collectionVariables.get('todo_id')) {
    throw new Error('todo_id is not set — run Create Todo first');
}
`

export const test = `
pm.test('Status is 200 OK', function () {
    pm.response.to.have.status(200);
});

pm.test('Returned ID matches the requested one', function () {
    const body = pm.response.json();
    const expectedId = parseInt(pm.collectionVariables.get('todo_id'));
    pm.expect(body.id).to.equal(expectedId);
});

pm.test('Todo has all required fields', function () {
    const body = pm.response.json();
    pm.expect(body).to.have.all.keys('id', 'title', 'completed');
});
`
