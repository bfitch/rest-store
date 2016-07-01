import { describe, it } from 'mocha'
import { expect } from 'chai'
import config from '../src/configuration'

describe('configuration', function () {
  const mappingUrl = 'http://todos.com/todos'
  const mappings = {
    todos: {
      url: mappingUrl
    }
  }

  describe('required parameters', function () {
    it('raises an error if no mappings are provided', function () {
      expect(() => {
        config(undefined, 'todos', 'find')
      }).to.throw(Error, 'You must provide url mappings')
    })

    it('raises an error if no path is provided', function () {
      expect(() => {
        config(mappings, undefined, 'find')
      }).to.throw(Error, 'You must provide a path')
    })

    it("raises an error if mappings object dosen't have the path key", function () {
      const mappings = {url: mappingUrl}
      expect(() => {
        config('find', 'todos', {}, {}, mappings)
      }).to.throw(Error, "No key 'todos' found in mapping configuration")
    })
  })

  describe('httpOptions', function () {
    it('sets the passed in values', function () {
      const httpOptions = {
        params: {uid: 'foo'},
        headers: {auth: 'boo'},
        force: true
      }
      const c = config(mappings, 'todos', 'find', {}, httpOptions)

      expect(c.headers).to.eql(httpOptions.headers)
      expect(c.params).to.eql(httpOptions.params)
      expect(c.force).to.be.true
    })

    describe('nothing passed in', function () {
      it('sets default values', function () {
        const c = config(mappings, 'todos', 'find', {id: 1})

        expect(c.headers).to.eql({})
        expect(c.params).to.eql({})
        expect(c.force).to.be.false
      })
    })
  })

  describe('transformResponse hook', function () {
    const mappings = {
      todos: {
        transformResponse: function () { return 'woot' }
      }
    }

    it('sets a custom function to transform http responses', function () {
      const c = config(mappings, 'todos', 'find')
      expect(c.transformResponse()).to.eql('woot')
    })
  })

  describe('url', function () {
    describe('find', function () {
      it('builds from client side store query attributes', function () {
        const url = config(mappings, 'todos', 'find', {id: 1}).url
        expect(url).to.eql(mappingUrl + '/1')
      })

      it('builds from http query params', function () {
        const url = config(mappings, 'todos', 'find', {}, {params: {id: 1}}).url
        expect(url).to.eql(mappingUrl + '/1')
      })

      it('builds from other attributes passed in', function () {
        const url = config(mappings, 'todos', 'find', {}, {id: 1}).url
        expect(url).to.eql(mappingUrl + '/1')
      })
    })

    describe('findAll', function () {
      it('builds from client side store query attributes', function () {
        const url = config(mappings, 'todos', 'findAll', {id: 1}).url
        expect(url).to.eql(mappingUrl)
      })

      it('builds from http query params', function () {
        const url = config(mappings, 'todos', 'findAll', {}, {params: {id: 1}}).url
        expect(url).to.eql(mappingUrl)
      })

      it('builds from other attributes passed in', function () {
        const url = config(mappings, 'todos', 'findAll', {}, {id: 1}).url
        expect(url).to.eql(mappingUrl)
      })
    })

    describe('create', function () {
      it('builds from client side store query attributes', function () {
        const url = config(mappings, 'todos', 'create', {id: 1}).url
        expect(url).to.eql(mappingUrl)
      })

      it('builds from http query params', function () {
        const url = config(mappings, 'todos', 'create', {}, {params: {id: 1}}).url
        expect(url).to.eql(mappingUrl)
      })

      it('builds from other attributes passed in', function () {
        const url = config(mappings, 'todos', 'create', {}, {id: 1}).url
        expect(url).to.eql(mappingUrl)
      })
    })

    describe('update', function () {
      it('builds from client side store query attributes', function () {
        const url = config(mappings, 'todos', 'update', {id: 1}).url
        expect(url).to.eql(mappingUrl + '/1')
      })

      it('builds from http query params', function () {
        const url = config(mappings, 'todos', 'update', {}, {params: {id: 1}}).url
        expect(url).to.eql(mappingUrl + '/1')
      })

      it('builds from other attributes passed in', function () {
        const url = config(mappings, 'todos', 'update', {}, {id: 1}).url
        expect(url).to.eql(mappingUrl + '/1')
      })
    })

    describe('delete', function () {
      it('builds from client side store query attributes', function () {
        const url = config(mappings, 'todos', 'delete', {id: 1}).url
        expect(url).to.eql(mappingUrl + '/1')
      })

      it('builds from http query params', function () {
        const url = config(mappings, 'todos', 'delete', {}, {params: {id: 1}}).url
        expect(url).to.eql(mappingUrl + '/1')
      })

      it('builds from other attributes passed in', function () {
        const url = config(mappings, 'todos', 'delete', {}, {id: 1}).url
        expect(url).to.eql(mappingUrl + '/1')
      })
    })

    describe('dynamic route segments', function () {
      it('builds the url from a client side query', function () {
        const mappingUrl = 'http://todos.com/:user_id/todos'
        const mappings = {
          todos: {
            url: mappingUrl
          }
        }
        const url = config(mappings, 'todos', 'find', {user_id: 123}, {id: 1}).url
        expect(url).to.eql('http://todos.com/123/todos/1')
      })

      it('builds the url from attributes', function () {
        const mappingUrl = 'http://todos.com/:user_id/todos/:todo_id/comments'
        const mappings = {
          todos: {
            url: mappingUrl,
            identifier: 'uid'
          }
        }
        const url = config(
          mappings, 'todos', 'update', {title: 'cool'}, {uid: 'abc', todo_id: 5, user_id: 3}
        ).url
        expect(url).to.eql('http://todos.com/3/todos/5/comments/abc')
      })

      it('builds the url from params', function () {
        const mappingUrl = 'http://cool.com/conversations/:conversation_id/recent_messages'
        const mappings = {
          recent_messages: {
            url: mappingUrl
          }
        }
        const url = config(
          mappings, 'recent_messages', 'find', {conversation_id: 'abc'}, {params: {id: '123xyz'}}
        ).url
        expect(url).to.eql('http://cool.com/conversations/abc/recent_messages/123xyz')
      })
    })

    describe('can handle custom identifiers in REST actions', function () {
      const mappingUrl = 'http://todos.com/todos'
      const mappings = {
        todos: {
          url: mappingUrl,
          identifier: 'uid'
        }
      }

      it('returns the correct PUT url', function () {
        const url = config(mappings, 'todos', 'find', {uid: 123}).url
        expect(url).to.eql('http://todos.com/todos/123')
      })

      it('returns the correct POST url', function () {
        const url = config(mappings, 'todos', 'create', {uid: 123}).url
        expect(url).to.eql('http://todos.com/todos')
      })

      it('returns the correct findAll (GET) url', function () {
        const url = config(mappings, 'todos', 'findAll', {uid: 123}).url
        expect(url).to.eql('http://todos.com/todos')
      })

      it('returns the correct DELETE url', function () {
        const url = config(mappings, 'todos', 'delete', {uid: 123}).url
        expect(url).to.eql('http://todos.com/todos/123')
      })
    })
  })
})
