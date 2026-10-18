export const test = `
pm.test('Status is 201 Created', function () {
    pm.response.to.have.status(201);
});

const body = pm.response.json();

pm.test('Response contains a numeric id', function () {
    pm.expect(body.id).to.be.a('number');
});

// Saves ID for Get Todo by ID, Update Todo and Delete Todo.
// Kept outside pm.test so a failing assertion elsewhere can't skip it.
if (typeof body.id === 'number') {
    pm.collectionVariables.set('todo_id', body.id);
    console.log('Todo created with ID:', body.id);
}
`
