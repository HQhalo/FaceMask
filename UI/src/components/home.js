import React, { Component } from 'react';
import './home.css'
class Home extends Component {
    constructor(props){
        super(props);
        this.videoDemo = React.createRef();
    }
    state = {  }
    componentDidMount(){
        console.log("mount");
        

        // this.videoDemo.current.play();
    }
    
    render() { 
        return ( 
            <div className="container-flur">
                <div className = "row videoView">
                                          
                        <video ref={this.videoDemo} src = {"demo.mp4"}id="idvideoDemo" onPlaying={this.onPlayVideo} muted autoPlay loop></video>    
                        <div className="infoText">
                            <h1>YOLO v3</h1>
                            <h1>Face Mask Detection</h1>
                            <div className="redirect">
                                <a href="object">YOLO v3</a>
                                <a href="/myobject">Face Mask</a>
                            </div>
                            
                        </div>

                </div>    
            </div>
            
        );
    }
}
 
export default Home;