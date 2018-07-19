import React, { Component } from 'react';
import './App.css';
import Header from './components/Header.js';
import SearchResults from './components/SearchResults.js';

class App extends Component {

  render() {
    return (
      <div className="App">
        <Header />
        <SearchResults />
      </div>
    );
  }
}

export default App;
