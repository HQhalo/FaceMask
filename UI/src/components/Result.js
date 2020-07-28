import React, { Component } from 'react';
import './Result.css'
class Result extends Component {
    
    render() { 
        if(this.props.dataResult)
        return ( 
            <div className='result'>
                {this.props.dataResult.map( (box )=>{
                    return (
                        <div className="itemBox">
                            <p>Label: {box.label}</p>
                            <p>Boxes: {box.boxes[0]+" "+box.boxes[1]+" "+box.boxes[2]+" "+box.boxes[3]}</p>
                            <p>Confidence: {box.confidence}</p>
                            <br></br>
                        </div>
                    );
                })}
            </div>
        );
        else {
            return (
                <div className='result'>
                
                </div> 
            );
        }
    }
}
 
export default Result;