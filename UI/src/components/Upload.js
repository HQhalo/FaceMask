import React, { Component } from 'react';
import './Upload.css'
class Upload extends Component {
    state = { 
        selectFile : null,
    }
    onFileChange = (e) =>{
        var file = e.target.files[0];
        if(file && file['type'].split('/')[0] === 'image'){
            this.setState({
                selectFile: e.target.files[0]
            });
            this.props.changeImage(e.target.files[0])
        }
        else {
            alert("Choose image please!");
        }
        
    }
    onUploadFile = ()=>{
        if(this.state.selectFile){
            this.props.uploadFile(this.state.selectFile);
        }
        else {
            alert("Choose an image!")
        }
    }
    
    render() { 
        return (
            <div className="input-group upload">
            <div className="input-group-prepend">
                <span className="input-group-text btnUpload" id="inputGroupFileAddon01" onClick={this.onUploadFile}>Upload</span>
            </div>
            <div className="custom-file">
                <input type="file" className="custom-file-input" id="inputGroupFile01"
                aria-describedby="inputGroupFileAddon01" onChange={this.onFileChange}/>
                <label className="custom-file-label" htmlFor="inputGroupFile01">Choose file</label>
            </div>
            </div>

            // <div className="input-group mb-3 upload">
            //     <div className="custom-file">
            //         <input type="file" className="custom-file-input" id="inputGroupFile02" onChange={this.onFileChange}/>
            //         <label className="custom-file-label" htmlFor="inputGroupFile02">Choose file</label>
            //     </div>
            //     <div className="input-group-append">
            //         <span className="input-group-text btnUpload" onClick={this.onUploadFile} id="">Upload</span>
            //     </div>
            
            // </div>
        );
    }


}
 
export default Upload;