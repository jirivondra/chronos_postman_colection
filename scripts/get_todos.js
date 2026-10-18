export const test = `
// Saves the cursor for Get Next Page, if the response provides one.
const body = pm.response.json();
const cursor = body.next_cursor || body.next || null;
if (cursor) {
    pm.collectionVariables.set('next_cursor', cursor);
    console.log('Next page available, cursor:', cursor);
} else {
    pm.collectionVariables.unset('next_cursor');
}
`
