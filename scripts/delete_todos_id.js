export const prerequest = `
if (!pm.collectionVariables.get('todo_id')) {
    const daysAhead = Math.floor(Math.random() * 30) + 1;
    const dueDate = new Date(Date.now() + daysAhead * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
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
                due_date: dueDate
            })
        }
    });
    const body = res.json();
    pm.collectionVariables.set('todo_id', body.id);
    console.log('todo_id was not set — auto-created todo with ID:', body.id);
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
