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

  describe('transformResponse hook', function() {
    const mappings = {
      todos: {
        transformResponse: function() { return 'woot'; }
      }
    }

    it ('sets a custom function to transform http responses', function() {
      const c = config(mappings, 'todos', 'find');
      expect(c.transformResponse()).to.eql('woot')
    })
  })

  describe('url', function() {
    describe('find', function() {
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
    })

    describe('findAll', function() {
      it ('builds from client side store query attributes', function() {
        const url = config(this.mappings, 'todos', 'findAll', {id: 1}).url
        expect(url).to.eql(this.url)
      })

      it ('builds from http query params', function() {
        const url = config(this.mappings, 'todos', 'findAll', {}, {params: {id: 1}}).url
        expect(url).to.eql(this.url)
      })

      it ('builds from other attributes passed in', function() {
        const url = config(this.mappings, 'todos', 'findAll', {}, {id: 1}).url
        expect(url).to.eql(this.url)
      })
    })

    describe('create', function() {
      it ('builds from client side store query attributes', function() {
        const url = config(this.mappings, 'todos', 'create', {id: 1}).url
        expect(url).to.eql(this.url)
      })

      it ('builds from http query params', function() {
        const url = config(this.mappings, 'todos', 'create', {}, {params: {id: 1}}).url
        expect(url).to.eql(this.url)
      })

      it ('builds from other attributes passed in', function() {
        const url = config(this.mappings, 'todos', 'create', {}, {id: 1}).url
        expect(url).to.eql(this.url)
      })
    })

    describe('update', function() {
      it ('builds from client side store query attributes', function() {
        const url = config(this.mappings, 'todos', 'update', {id: 1}).url
        expect(url).to.eql(this.url + '/1')
      })

      it ('builds from http query params', function() {
        const url = config(this.mappings, 'todos', 'update', {}, {params: {id: 1}}).url
        expect(url).to.eql(this.url + '/1')
      })

      it ('builds from other attributes passed in', function() {
        const url = config(this.mappings, 'todos', 'update', {}, {id: 1}).url
        expect(url).to.eql(this.url + '/1')
      })
    })

    describe('delete', function() {
      it ('builds from client side store query attributes', function() {
        const url = config(this.mappings, 'todos', 'delete', {id: 1}).url
        expect(url).to.eql(this.url + '/1')
      })

      it ('builds from http query params', function() {
        const url = config(this.mappings, 'todos', 'delete', {}, {params: {id: 1}}).url
        expect(url).to.eql(this.url + '/1')
      })

      it ('builds from other attributes passed in', function() {
        const url = config(this.mappings, 'todos', 'delete', {}, {id: 1}).url
        expect(url).to.eql(this.url + '/1')
      })
    })

    describe('dynamic route segments', function() {
      it ('builds the url from a client side query', function() {
        this.url = 'http://todos.com/:user_id/todos'
        this.mappings = {
          todos: {
            url: this.url
          }
        }
        const url = config(this.mappings, 'todos', 'find', {user_id: 123}, {id: 1}).url
        expect(url).to.eql('http://todos.com/123/todos/1')
      })

      it ('builds the url from attributes', function() {
        this.url = 'http://todos.com/:user_id/todos/:todo_id/comments'
        this.mappings = {
          todos: {
            url: this.url,
            identifier: 'uid'
          }
        }
        const url = config(
          this.mappings, 'todos', 'update', {title: 'cool'}, {uid: 'abc', todo_id: 5, user_id: 3}
        ).url
        expect(url).to.eql('http://todos.com/3/todos/5/comments/abc')
      })

      it ('builds the url from params', function() {
        this.url = 'http://cool.com/conversations/:conversation_id/recent_messages'
        this.mappings = {
          recent_messages: {
            url: this.url
          }
        }
        const url = config(
          this.mappings, 'recent_messages', 'find', {conversation_id: 'abc'}, {params: {id: '123xyz'}}
        ).url
        expect(url).to.eql('http://cool.com/conversations/abc/recent_messages/123xyz')
      })
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
        const url = config(this.mappings, 'todos', 'create', {uid: 123}).url
        expect(url).to.eql('http://todos.com/todos')
      })

      it ('returns the correct findAll (GET) url', function() {
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

      it ('returns the correct DELETE url', function() {
        this.url = 'http://todos.com/todos'
        this.mappings = {
          todos: {
            url: this.url,
            identifier: 'uid'
          }
        }
        const url = config(this.mappings, 'todos', 'delete', {uid: 123}).url
        expect(url).to.eql('http://todos.com/todos/123')
      })
    })
  })
})
