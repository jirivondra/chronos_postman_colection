export const test = `
pm.test('Status is 201 Created', function () {
    pm.response.to.have.status(201);
});

pm.test('Response contains the id of the new todo', function () {
    const body = pm.response.json();
    pm.expect(body).to.have.property('id');
    pm.expect(body.id).to.be.a('number');
    // Saves ID for Get Todo by ID, Update Todo and Delete Todo
    pm.collectionVariables.set('todo_id', body.id);
    console.log('Todo created with ID:', body.id);
});

pm.test('Todo has the correct title', function () {
    const requestBody = JSON.parse(pm.request.body.raw);
    const responseBody = pm.response.json();
    pm.expect(responseBody.title).to.equal(requestBody.title);
});

pm.test('Todo is created as incomplete', function () {
    const body = pm.response.json();
    pm.expect(body.completed).to.be.false;
});
`
