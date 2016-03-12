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
    it ('builds from client side store query attributes', function() {
      const url = config('find', 'todos', {id: 1}, {}, this.mappings).url
      expect(url).to.eql(this.url + '/1')
    })

    it ('builds from http query params', function() {
      const url = config('find', 'todos', {}, {params: {id: 1}}, this.mappings).url
      expect(url).to.eql(this.url + '/1')
    })

    it ('builds from other attributes passed in', function() {
      const url = config('find', 'todos', {}, {id: 1}, this.mappings).url
      expect(url).to.eql(this.url + '/1')
    })

    it ('builds from client side query attributes', function() {
      const url = config('find', 'todos', {id: 1}, {}, this.mappings).url
      expect(url).to.eql(this.url + '/1')
    })

    it ('can handle dynamic route segments', function() {
      this.url = 'http://todos.com/:user_id/todos'
      this.mappings = {
        todos: {
          url: this.url
        }
      }
      const url = config('find', 'todos', {user_id: 123}, {id: 1}, this.mappings).url
      expect(url).to.eql('http://todos.com/123/todos/1')
    })

    describe ('can handle custom identifiers in REST actions', function() {
      it ('retutns the correct PUT url', function() {
        this.url = 'http://todos.com/todos'
        this.mappings = {
          todos: {
            url: this.url,
            identifier: 'uid'
          }
        }
        const url = config('find', 'todos', {uid: 123}, {}, this.mappings).url
        expect(url).to.eql('http://todos.com/todos/123')
      })

      it ('retutns the correct POST url', function() {
        this.url = 'http://todos.com/todos'
        this.mappings = {
          todos: {
            url: this.url,
            identifier: 'uid'
          }
        }
        const url = config('findAll', 'todos', {uid: 123}, {}, this.mappings).url
        expect(url).to.eql('http://todos.com/todos')
      })
    })
  })

  describe ('model', function() {
    describe('no option passed in', function(){
      it ('defaults to false', function() {
        const model = config('find', 'todos', {}, {}, this.mappings).model
        expect(model).to.be.false
      })
    })
    describe('true is passed in', function() {
      it ('returns true', function() {
        const mappings = {todos: {...this.mappings.todos, model: true}}
        const model = config('find', 'todos', {}, {}, mappings).model
        expect(model).to.be.true
      })
    })
    describe('non-boolean value is passed in', function() {
      it ('throws an error', function() {
        const mappings = {todos: {...this.mappings.todos, model: 'string'}}
        const model = () => config('find', 'todos', {}, {}, mappings).model
        expect(model).to.throw(Error, "'model' option must be a boolean value.");
      })
    })
  })

  describe ('root', function() {
    describe('no option passed in', function(){
      it ('defaults to true', function() {
        const root = config('find', 'todos', {}, {}, this.mappings).root
        expect(root).to.be.true
      })
    })
    describe('false is passed in', function() {
      it ('returns false', function() {
        const mappings = {todos: {...this.mappings.todos, root: false}}
        const root = config('find', 'todos', {}, {}, mappings).root
        expect(root).to.be.false
      })
    })
    describe('non-boolean value is passed in', function() {
      it ('throws an error', function() {
        const mappings = {todos: {...this.mappings.todos, root: 'string'}}
        const root = () => config('find', 'todos', {}, {}, mappings).root
        expect(root).to.throw(Error, "'root' option must be a boolean value.");
      })
    })
  })
})
