import React, { Component } from 'react';
import axios from 'axios'
import './FaceMask.css';

class FaceMask extends Component {
    state = {
        capture: false,
        alert: false,
        thres: "0.3",
    }
    constructor(props) {
        super(props);
        
        this.videoTag = React.createRef();
        this.drawCanvas = React.createRef();
        this.videoContainer = React.createRef();
        this.cameraOptions = React.createRef();
        this.thresRange = React.createRef();
        this.triggerSound = React.createRef();
        this.buttonAlert = React.createRef();

        this.updateInterval = 300;
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
        this.getCameraSelection();
        //create a canvas for drawing object boundaries
        this.drawCtx = this.drawCanvas.current.getContext("2d"); 
        this.thresRange.current.value = 0.3;
        
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
        
        axios.post(process.env.REACT_APP_URL_API+"/api/test?confThres="+this.state.thres, formData).then((response) => {
            // console.log(response.data[0].label);
            console.log(response.data);
            if(this.state.capture){
                response.data.forEach((obj) =>{
                    if(this.state.alert && obj.label === 'face_no_mask'){
                        this.triggerSound.current.play();
                    }
                } );
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
        this.onClickStop();
        console.log(this.cameraOptions.current.value);  
        const constraints = {
            audio: false,
            video: {
                width: {min: 640, ideal: 1280, max: 1920},
                height: {min: 480, ideal: 720, max: 1080},
                deviceId: {
                    exact: this.cameraOptions.current.value
                  }
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
            capture : true,
        });
    }
    onClickStop = ()=>{
        if(this.localStream){
            this.drawCtx.clearRect(0,0,this.drawCanvas.current.width,this.drawCanvas.current.height);
            this.videoTag.current.srcObject = null;
            this.localStream.getVideoTracks()[0].stop();
            this.setState({
                capture : false,
            });
        }
    }
    onClickAlert = () =>{
        console.log(this.buttonAlert);
        if(this.buttonAlert.current.textContent === 'Alert'){
            this.buttonAlert.current.textContent = "Stop";
        }
        else{
            this.buttonAlert.current.textContent = "Alert";
        }
        this.setState({
            alert: !this.state.alert,
        });
    }
    getCameraSelection = async () => {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = devices.filter(device => device.kind === 'videoinput');
        const options = videoDevices.map(videoDevice => {
          return `<option value="${videoDevice.deviceId}">${videoDevice.label}</option>`;
        });
        this.cameraOptions.current.innerHTML = options.join('');
      };
    changeRangeSlider = () =>{
        // console.log( this.thresRange.current.value);
        this.setState({
            thres:this.thresRange.current.value,
        });
    }
    render() {
        return (
            <div className = "container-fluid">
                <div className='row '>
                    <div className='col-3 management'>           
                        <div>
                            <span onClick={this.onClickCapture} className='btn'>Capture</span>
                            <span onClick={this.onClickStop} className='btn'>Stop</span>
                        </div>
                        <div>
                            <select ref={this.cameraOptions} name="" id="">
                                <option value="">Select camera</option>
                            </select>
                        </div>
                        
                        <div className="form-group">
                            <label htmlFor="formControlRange">ConfThres: </label>
                            <span>{this.state.thres}</span>
                            <input ref={this.thresRange} onChange={this.changeRangeSlider}  type="range" className="custom-range" min="0.001" max="1" step="0.001"  id="customRange3"/>
                        </div>
                        <span ref={this.buttonAlert} onClick={this.onClickAlert} className='btn'>Alert</span>
                    </div>
                    <div ref = {this.videoContainer}className="col-8 videoStream justify-content-md-center">
                        <canvas ref={this.drawCanvas}  width={912} height={513}/>
                        <video ref={this.videoTag} width={912} height={513} onPlaying={this.onPlay}id= "videoElement" autoPlay></video>
                    </div>
                </div>
                <audio ref = {this.triggerSound} src={"363920__samsterbirdies__8-bit-error.wav"} preload="auto"></audio>
            </div>
            
            
        );
    }
}
 
export default FaceMask;







