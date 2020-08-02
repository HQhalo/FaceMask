import React, { Component } from 'react';
import axios from 'axios'
import './FaceMask.css';

class FaceMask extends Component {
    state = {
        capture: false,
    }
    constructor(props) {
        super(props);
        this.videoTag = React.createRef();
        this.drawCanvas = React.createRef();
        this.videoContainer = React.createRef();
        this.updateInterval = 3050;
        this.sizeImageUpload = 720;
        this.localStream = null;
    }
    convertCoods = (boxes,[cw,ch,iw,ih])=>{
        var x = boxes[0]/iw*cw;
        var y = boxes[1]/ih*ch;
        var w = (boxes[2]-boxes[0])/iw*cw;
        var h = (boxes[3]-boxes[1])/ih*ch;
        return [x,y,w,h];
    }

    componentDidMount(){
        this.imageCanvas = document.createElement('canvas');
        this.imageCtx = this.imageCanvas.getContext("2d");
        
        //create a canvas for drawing object boundaries
        this.drawCtx = this.drawCanvas.current.getContext("2d"); 
        
    }
    drawBoxes = (objs)=>{
        this.drawCtx.clearRect(0,0,this.drawCanvas.current.width,this.drawCanvas.current.height);
        let cw = this.drawCanvas.current.width;
        let ch = this.drawCanvas.current.height;
        let iw = this.imageCanvas.width;
        let ih = this.imageCanvas.height;
        
        objs.forEach(obj =>{
            let color = this.RGBToHex(obj.color);
            let [x,y,w,h] =this.convertCoods(obj.boxes,[cw,ch,iw,ih]);
           
            this.drawCtx.fillStyle = color;
            this.drawCtx.fillText(obj.label + "(" + Math.round(obj.confidence * 100) + "%)", x , y - 5);
            this.drawCtx.strokeStyle = color;
            this.drawCtx.strokeRect(x, y, w, h);
           
        });
    }
    RGBToHex = ([r,g,b]) =>{
        r = r.toString(16);
        g = g.toString(16);
        b = b.toString(16);
      
        if (r.length === 1)
          r = "0" + r;
        if (g.length === 1)
          g = "0" + g;
        if (b.length === 1)
          b = "0" + b;
      
        return "#" + r + g + b;
    }
    uploadFile = (file) =>{
        const formData = new FormData();      
        formData.append( 
        "image", 
        file,
        file.name 
        ); 
        
        axios.post(process.env.REACT_APP_URL_API+"/api/test", formData).then((response) => {
            // console.log(response.data[0].label);
            console.log(response.data);
            if(this.state.capture){
                this.drawBoxes(response.data);
            }
            else{
                this.drawCtx.clearRect(0,0,this.drawCanvas.current.width,this.drawCanvas.current.height);
            }

            }, (error) => {
                
          });
    }
    sendImageFromCanvas = ()=>{
        if(this.state.capture){
            console.log("send");
            this.imageCtx.drawImage(this.videoTag.current, 0, 0, this.videoTag.current.videoWidth, this.videoTag.current.videoHeight
                , 0, 0, this.sizeImageUpload, this.sizeImageUpload * (this.videoTag.current.videoHeight / this.videoTag.current.videoWidth));
    
            this.imageCanvas.toBlob(this.uploadFile, 'image/jpeg');
            setTimeout(this.sendImageFromCanvas, this.updateInterval);
        }
    }
    startObjectDetection = ()=>{
        this.imageCanvas.width = this.sizeImageUpload;
        this.imageCanvas.height = this.sizeImageUpload * (this.videoTag.current.videoHeight / this.videoTag.current.videoWidth);

        //Some styles for the drawcanvas
        this.drawCtx.lineWidth = 3;
        this.drawCtx.font = "18px Verdana";

        this.sendImageFromCanvas();
    }

    onPlay = ()=>{
        console.log("video playing");
        
        this.startObjectDetection();
        
    }
    onClickCapture = ()=>{    
        const constraints = {
            audio: false,
            video: {
                width: {min: 640, ideal: 1280, max: 1920},
                height: {min: 480, ideal: 720, max: 1080}
            }
        };
        navigator.mediaDevices.getUserMedia(constraints)
            .then(stream => {
                this.localStream = stream;
                this.videoTag.current.srcObject = stream;
            })
            .catch(err => {
                console.log('navigator.getUserMedia error: ', err)
            });
        
        this.setState({
            capture : !this.state.capture,
        });
    }
    onClickStop = ()=>{
        if(this.localStream){
            this.drawCtx.clearRect(0,0,this.drawCanvas.current.width,this.drawCanvas.current.height);
            this.videoTag.current.srcObject = null;
            this.localStream.getVideoTracks()[0].stop();
            this.setState({
                capture : !this.state.capture,
            });
        }
    }
    render() {
        return (
            <div className = "container">
                <div ref = {this.videoContainer}className="row videoStream">
                    <canvas ref={this.drawCanvas}  width={1000} height={562}/>
                    <video ref={this.videoTag} width={1000} height={562} onPlaying={this.onPlay}id= "videoElement" autoPlay></video>
                </div>
                <div className = "row ">
                    <div className='col-6'>
                        <span onClick={this.onClickCapture} className='btn'>Capture</span>
                        <span onClick={this.onClickStop} className='btn'>Stop</span>
                    </div>
                    
                </div>
            </div>
            
            
        );
    }
}
 
export default FaceMask;







