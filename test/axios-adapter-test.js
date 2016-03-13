import {describe,it} from 'mocha';
import {expect} from 'chai';
import ajaxAdapter from '../src/axios-adapter';

describe('axiosAdapter', function() {
  describe('find', function() {
    const apiResponse = {todo: {id: 3, title: 'cool'}}
    const mockAxios = (options) => {
      return (
          new Promise((resolve, reject) => {
            resolve(apiResponse)
          })
      )
    }

    describe('no model passed in', function() {
      it ('makes an ajax request and returns the correct data', function(done) {
        const options = { root: true, model: false };
        const adapter = ajaxAdapter(mockAxios)(options);

        return adapter.find('http://todos.com/3', {}, {}).then(data => {
          expect(data).to.eql({id: 3, title: 'cool'})
          done()
        })
      })

      describe('root is true', function() {
        const apiResponse = {}
        const mockAxios = (options) => {
          return (new Promise((resolve, reject) => {
            resolve(apiResponse)
          }))
        }

        it ('throws an error if response has not root key', function(done) {
          const options = { root: true, model: false };
          const adapter = ajaxAdapter(mockAxios)(options);

          return adapter.find('http://todos.com/3', {}, {}).catch(error => {
            expect(error.message).to.eql(
              'Expecting a root key in ajax response. But the response was empty.'
            )
            done()
          })
        })
      })

      describe('root is false', function() {
        const apiResponse = {id: 3, title: 'cool'};
        const mockAxios = (options) => {
          return (new Promise((resolve, reject) => {
            resolve(apiResponse)
          }))
        }

        it ('makes an ajax request and returns the correct data', function(done) {
          const options = { root: false, model: false };
          const adapter = ajaxAdapter(mockAxios)(options);

          return adapter.find('http://todos.com/3', {}, {}).then(data => {
            expect(data).to.eql({id: 3, title: 'cool'})
            done()
          })
        })
      })
    })

    describe('model is passed in', function() {
      const apiResponse = {todo: {id: 3, title: 'cool'}};
      const mockAxios   = (options) => {
        return (new Promise((resolve, reject) => {
          resolve(apiResponse)
        }))
      }
      class Todo {
        constructor(attrs) {
          Object.assign(this, attrs);
        }
      }

      it ('instantiates the model and inserts it in the store', function(done) {
        const options = {root: true, model: Todo};
        const adapter = ajaxAdapter(mockAxios)(options);

        return adapter.find('http://todos.com/3', {}, {}).then(data => {
          expect(data).to.be.an.instanceof(Todo);
          expect(data.id).to.eql(3);
          expect(data.title).to.eql('cool');
          done()
        })
      })
    })
  })
})
