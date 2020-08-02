import React, { Component } from 'react';
import Result from './Result'
import Upload from './Upload'
import ImageView from './ImageView'
import Loading from './Loading'
import axios from 'axios'
class Object extends Component {
    state = { 
        imageView: null,
        dataResult: null,
        load: false
    }
    uploadFile = (file)=>{
        
        this.setState({
            load:true});

        const formData = new FormData();      
        formData.append( 
        "image", 
        file,
        file.name 
        ); 
        
        axios.post(process.env.REACT_APP_URL_API+"/api/yolo", formData).then((response) => {
            // console.log(response.data[0].label);
            console.log(response.data);
            this.setState({
                load:false,
                imageView :  URL.createObjectURL(file),
                newBoxes : true,
                dataResult:
                    response.data
                }
            );
            }, (error) => {
                alert(error);
                this.setState({
                    load:false});
          });

    } 
    changeImage = (file) =>{
        this.setState({
            dataResult: null,
            imageView :  URL.createObjectURL(file)
            });
    }
    render() { 
        return (
            <> 
                <div className='container' >
                    <div className='row'>
                        <div className='col-sm-8'>
                            <ImageView flag = {this.state.newBoxes} imageView = {this.state.imageView} dataResult = {this.state.dataResult}/>
                        </div>
                        <div className = 'col-sm-4'>
                            <Result dataResult = {this.state.dataResult} />
                        </div>
                    </div>
                    <div>
                        <Loading load = {this.state.load}/>
                    </div>
                    <div className='row'>
                        <div className='col-6'>
                            <Upload uploadFile={this.uploadFile} changeImage = {this.changeImage}/>
                        </div>
                    </div>
                </div>
                
            </> 
        );
        
    }
}
 
export default Object;