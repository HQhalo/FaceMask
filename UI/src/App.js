import React from 'react';
import './App.css';
import Home from './components/home'
import Object from './components/object'
import FaceMask from './components/FaceMask'
import Nav from './components/layout/nav'
import {BrowserRouter as Router, Route}from 'react-router-dom'

class App extends React.Component {
  
  render() { 
    return (
      <Router>
        <div className="App">
          <Nav/>
          <Route path='/' exact component={Home}/>
          <Route path='/object' exact component={Object}/>
          <Route path='/myobject' exact component={FaceMask}/>
        </div>
      </Router>
      
    );
  }
}
 
export default App;