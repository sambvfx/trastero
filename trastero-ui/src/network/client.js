import ApolloClient from 'apollo-boost';


const client = new ApolloClient({
  uri: 'http://api.localhost:8080/graphql'
});


export default client
