// import {describe, it} from 'mocha';
// import {expect} from 'chai';
// import _ from '../index';

// REST API
//
// store.findAll('todos', attrs, prams);  // GET /todos?attrs     READ #index
// store.find('todos', {id: 1}, params);  // GET /todos/1?params  READ #show
//
// store.create('todos', null, attrs);    // POST /todos          CREATE #create
// store.update('todos', {id: 1}, attrs); // PUT /todos/1         UPDATE #update
//
// store.delete('todos', 1)               // DELETE /todos/1      DELETE #destroy
//
// CONFIG
//
// controller.addModules({
//   store: REST({}, {
//     todos: {url: 'http://localhost:4000/todos', root: false, identifier: 'uid'}, // identifier: default to id
//     // user:        {url: 'api/v1/users', root: 'practice_users'},
//     comments:    {url: 'todos/:todo_id/comments/'},
//     // currentUser: {url: `${host}/api/v1/me.json`, root: false},
//     // tasks: {url: 'patients/:patient_guid/tasks, root: false, identifier: 'uid'},
//   }),
//
//  USAGE
//
// ({input, state, services}) => {
// services.store.find(
//     'todos',
//     {id: input.id},
//     { user_id: state.get('user_id'),
//       params: {user_id: state.get('currentUserId')},
//       headers: {token: state.get('authToken')}
//     })
//     .then({data: [] || {})
//      .catch()
// },
//

// describe('', () => {
//   expect().to.be.ok
// });
