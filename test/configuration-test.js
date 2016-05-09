import {describe,it} from 'mocha'
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
        config(undefined, 'todos', 'find')
      }).to.throw(Error, 'You must provide url mappings')
    })

    it ('raises an error if no path is provided', function() {
      expect(() => {
        config(this.mappings, undefined, 'find')
      }).to.throw(Error, 'You must provide a path')
    })

    it ('raises an error if mappings object dosen\'t have the path key', function() {
      this.mappings = {url: this.url}
      expect(() => {
        config('find', 'todos', {}, {}, this.mappings)
      }).to.throw(Error, "No key 'todos' found in mapping configuration")
    })
  })

  describe('httpOptions', function() {
    it ('sets the passed in values', function() {
      const httpOptions = {
        params: {uid: 'foo'},
        headers: {auth: 'boo'},
        force: true
      }
      const c = config(this.mappings, 'todos', 'find', {}, httpOptions)

      expect(c.headers).to.eql(httpOptions.headers)
      expect(c.params).to.eql(httpOptions.params)
      expect(c.force).to.be.true
    })

    describe('nothing passed in', function() {
      it ('sets default values', function() {
        const c = config(this.mappings, 'todos', 'find', {id: 1})

        expect(c.headers).to.eql({})
        expect(c.params).to.eql({})
        expect(c.force).to.be.false
      })
    })
  })

  describe('url', function() {
    it ('builds from client side store query attributes', function() {
      const url = config(this.mappings, 'todos', 'find', {id: 1}).url
      expect(url).to.eql(this.url + '/1')
    })

    it ('builds from http query params', function() {
      const url = config(this.mappings, 'todos', 'find', {}, {params: {id: 1}}).url
      expect(url).to.eql(this.url + '/1')
    })

    it ('builds from other attributes passed in', function() {
      const url = config(this.mappings, 'todos', 'find', {}, {id: 1}).url
      expect(url).to.eql(this.url + '/1')
    })

    it ('can handle dynamic route segments', function() {
      this.url = 'http://todos.com/:user_id/todos'
      this.mappings = {
        todos: {
          url: this.url
        }
      }
      const url = config(this.mappings, 'todos', 'find', {user_id: 123}, {id: 1}).url
      expect(url).to.eql('http://todos.com/123/todos/1')
    })

    describe ('can handle custom identifiers in REST actions', function() {
      it ('returns the correct PUT url', function() {
        this.url = 'http://todos.com/todos'
        this.mappings = {
          todos: {
            url: this.url,
            identifier: 'uid'
          }
        }
        const url = config(this.mappings, 'todos', 'find', {uid: 123}).url
        expect(url).to.eql('http://todos.com/todos/123')
      })

      it ('returns the correct POST url', function() {
        this.url = 'http://todos.com/todos'
        this.mappings = {
          todos: {
            url: this.url,
            identifier: 'uid'
          }
        }
        const url = config(this.mappings, 'todos', 'findAll', {uid: 123}).url
        expect(url).to.eql('http://todos.com/todos')
      })
    })
  })

  describe ('model', function() {
    describe('no option passed in', function(){
      it ('defaults to false', function() {
        const model = config(this.mappings, 'todos', 'find').model
        expect(model).to.be.false
      })
    })
    describe('true is passed in', function(){
      it ('throws an error', function() {
        const mappings = {todos: {...this.mappings.todos, model: true}}
        expect(() => {
          config(mappings, 'todos', 'find').model
        }).to.throw(Error, "You must provide a class name or constructor function." +
          " Received: 'true'");
      })
    })
    describe('class constant is passed in', function() {
      class Todo {}

      it ('returns the function', function() {
        const mappings = {todos: {...this.mappings.todos, model: Todo}}
        const model = config(mappings, 'todos', 'find').model
        expect(new model).to.be.an.instanceof(Todo);
      })
    })
  })

  describe ('root', function() {
    describe('no option passed in', function(){
      it ('defaults to true', function() {
        const root = config(this.mappings, 'todos', 'find').root
        expect(root).to.be.true
      })
    })
    describe('false is passed in', function() {
      it ('returns false', function() {
        const mappings = {todos: {...this.mappings.todos, root: false}}
        const root = config(mappings, 'todos', 'find').root
        expect(root).to.be.false
      })
    })
    describe('non-boolean value is passed in', function() {
      it ('throws an error', function() {
        const mappings = {todos: {...this.mappings.todos, root: 'string'}}
        const root = () => config(mappings, 'todos', 'find').root
        expect(root).to.throw(Error, "'root' option must be a boolean value.");
      })
    })
  })
})
