import {describe, it} from 'mocha'
import {expect} from 'chai'
import config from '../src/configuration'

describe('configuration', function() {
  describe('required parameters', function() {
    beforeEach(function() {
      this.url      = 'http://todos.com/todos'
      this.mappings = {
        todos: {
          url: this.url
        }
      }
    })

    it ('raises an error if no mappings are provided', function() {
      expect(() => {
        config('find', 'todos', {}, {})
      }).to.throw(Error, 'You must provide url mappings')
    })

    it ('raises an error if no path is provided', function() {
      expect(() => {
        config('find', undefined, {}, {}, this.mappings)
      }).to.throw(Error, 'You must provide a path')
    })
  })

  describe('httpOptions', function() {
    it ('sets the passed in values', function() {
      const httpOptions = {
        params: {uid: 'foo'},
        headers: {auth: 'boo'},
        force: true
      }
      const c = config('find', 'todos', {}, httpOptions, this.mappings)

      expect(c.headers).to.eql(httpOptions.headers)
      expect(c.params).to.eql(httpOptions.params)
      expect(c.force).to.be.true
    })

    describe('nothing passed in', function() {
      it ('sets default values', function() {
        const c = config('find', 'todos', {id: 1}, undefined, this.mappings)

        expect(c.headers).to.eql({})
        expect(c.params).to.eql({})
        expect(c.force).to.be.false
      })
    })
  })

  describe('url', function() {
    it ('returns the url', function() {
      const url = config('find', 'todos', {id: 1}, {}, this.mappings).url
      expect(url).to.eql(this.url + '/1')
    })
  })

  describe('root', function() {
    describe('no option passed in', function(){
      it ('defaults to the path', function() {
        const root = config('find', 'todos', {}, {}, this.mappings).root
        expect(root).to.eql('todos')
      })
    })
    describe('false is passed in', function() {
      it ('returns false', function() {
        const mappings = {todos: {...this.mappings.todos, root: false}}
        const root = config('find', 'todos', {}, {}, mappings).root
        expect(root).to.be.false
      })
    })
    describe('custom root name is passed in', function() {
      it ('returns the custom root name', function() {
        const mappings = {todos: {...this.mappings.todos, root: 'customRootName'}}
        const root = config('find', 'todos', {}, {}, mappings).root
        expect(root).to.be.eql('customRootName')
      })
    })
  })
})
