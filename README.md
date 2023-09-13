## trastero

Trastero is a simple proof of concept fullstack app to explore exposing a backend via GraphQL. 

#### local development

Start up two terminals:

*backend*

```
./trastero $ make images
```

```
./trastero $ make start
```

*frontend*
```
./trastero/trastero-ui $ yarn start
```

By default, this should start up everything you need. Navigating to [localhost:3000](http://localhost:3000).


---

You can test your graphql queries directly via [api.localhost:8080/graphiql](http://api.localhost:8080/graphiql) endpoint. 

>TIP: The resolver **requires** a collection name when fetching item data.
```
query Query {
  collection(name: "images")
  items {
    edges {
      node {
        url
      }
    }
  }
}
```

You can also inspect and manage your mongo database via the web interface mongo express @ [api.localhost:8081](http://api.localhost:8081)
