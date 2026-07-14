export const prerequest = `
if (!pm.collectionVariables.get('todo_id')) {
    const res = await pm.sendRequest({
        url: pm.variables.replaceIn('{{protocol}}{{host}}{{port}}/todos'),
        method: 'POST',
        header: { 'Content-Type': 'application/json' },
        auth: {
            type: 'basic',
            basic: [
                { key: 'username', value: pm.variables.get('username') },
                { key: 'password', value: pm.variables.get('password') }
            ]
        },
        body: {
            mode: 'raw',
            raw: JSON.stringify({
                title: 'Auto-created todo',
                description: 'Auto-created by pre-request script',
                completed: false,
                due_date: '2026-12-31'
            })
        }
    });
    const body = res.json();
    pm.collectionVariables.set('todo_id', body.id);
    console.log('todo_id was not set — auto-created todo with ID:', body.id);
}
`

export const test = `
pm.test('Status is 200 OK', function () {
    pm.response.to.have.status(200);
});

pm.test('Todo is now marked as completed', function () {
    const body = pm.response.json();
    pm.expect(body.completed).to.be.true;
});

pm.test('ID has not changed', function () {
    const body = pm.response.json();
    const expectedId = parseInt(pm.collectionVariables.get('todo_id'));
    pm.expect(body.id).to.equal(expectedId);
});
`
