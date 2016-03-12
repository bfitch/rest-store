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
        const adapter = ajaxAdapter(mockAxios, options);

        adapter.find('http://todos.com/3', {}, {}).then(data => {
          expect(data).to.eql({id: 3, title: 'cool'})
          done()
        })
      })
    })
  })
})
