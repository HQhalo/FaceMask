import React, { Component } from 'react';
import Result from './Result'
import Upload from './Upload'
import ImageView from './ImageView'
import Loading from './Loading'
import axios from 'axios'
class Object extends Component {
    constructor(props){
        super(props);
        this.selectModel = React.createRef();
        // axios.get("https://an25x8hv93h-496ff2e9c6d22116-5000-colab.googleusercontent.com").then((res)=>{
        //     console.log(res.data);
        // });
    }
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
        
        let url = process.env.REACT_APP_URL_API+"/api/" + this.selectModel.current.value;
        axios.post(url, formData).then((response) => {
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
                        <div className='col-4 '>
                            <select ref={this.selectModel} className='form-control'>
                                <option value='yolo'>YOLO</option>
                                <option value='test'>FACE MASK</option>
                            </select>
                        </div>
                    </div>
                </div>
                
            </> 
        );
        
    }
}
 
export default Object;