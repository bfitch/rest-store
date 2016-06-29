import {describe,it} from 'mocha';
import {expect} from 'chai';
import sinon from 'sinon';
import axios from 'axios';
import ajaxAdapter from '../src/axios-adapter';

describe('axiosAdapter', function() {
  describe('find', function() {
    // TODO: figure out how to stub main axios instance
    // const axiosStub = sinon.collection.stub(axios, 'constructor').returns({
    //   then() {
    //     return { data: 'data'};
    //   }
    // });


    it ('makes an ajax request and returns the correct data', function() {
      const adapter = ajaxAdapter(axios);

      // return adapter.find('http://todos.com/3', {}, {}).then(response => {
      //   expect(response).to.eql('data')
      // })
    })
  })
})
