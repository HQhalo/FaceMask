import React, { Component } from 'react';

class Loading extends Component {
    state = {  }
    render() { 
        return (
            <img src={"/Spin-1s-200px.svg"} style={this.styleLoading()}  alt="something"></img>
        );
    }

    styleLoading = () => {
        return this.props.load ? 
        {
            position:"fixed",
            left:'40%',
            top:"40%" 
        }:{
            display:"none"
        }
    }
}
 
export default Loading;