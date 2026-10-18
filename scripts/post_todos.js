export const prerequest = `
const moment = require('moment');
pm.collectionVariables.set('due_date', moment().add(7, 'days').format('YYYY-MM-DD'));
`

export const test = `
const body = pm.response.json();
pm.collectionVariables.set('todo_id', body.id);
`
