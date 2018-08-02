import React, { Component } from 'react';

import { ApolloProvider } from "react-apollo";

import client from '../../network/client';

import { MuiThemeProvider, createMuiTheme } from '@material-ui/core/styles';
import blueGrey from '@material-ui/core/colors/blueGrey';

import Canvas from '../Canvas';
import QueryTable from '../Table';


const theme = createMuiTheme({
  palette: {
    type: 'light',
    primary: {
      main: blueGrey[700]
    },
    secondary: {
      main: blueGrey[500]
    },
  },
  status: {
    danger: 'orange',
  },
});


class App extends Component {
  render() {
    return (
      <div className="App">
        <ApolloProvider client={client}>
          <MuiThemeProvider theme={theme}>
            <Canvas>
              <QueryTable/>
            </Canvas>
          </MuiThemeProvider>
        </ApolloProvider>
      </div>
    )
  }
}

export default App;
