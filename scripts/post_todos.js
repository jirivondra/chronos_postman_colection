export const prerequest = `
// due_date = today + 7 days (YYYY-MM-DD), reused by Create Todo and Update Todo bodies.
// moment is built into the Postman sandbox (dayjs is not, and pm.require doesn't work in newman).
const moment = require('moment');
pm.collectionVariables.set('due_date', moment().add(7, 'days').format('YYYY-MM-DD'));
`

export const test = `
// Saves the new todo's ID — Get Todo by ID, Update Todo and Delete Todo read it via {{todo_id}} in their URL.
const body = pm.response.json();
if (typeof body.id === 'number') {
    pm.collectionVariables.set('todo_id', body.id);
    console.log('Todo created with ID:', body.id);
}
`
