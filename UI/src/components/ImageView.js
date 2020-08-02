import React, { Component } from 'react';
import './ImageView.css'
class ImageView extends Component {

    convertCoods(boxes,[cw,ch,iw,ih]){
        var x = boxes[0]/iw*cw;
        var y = boxes[1]/ih*ch;
        var w = (boxes[2]-boxes[0])/iw*cw;
        var h = (boxes[3]-boxes[1])/ih*ch;
        return [x,y,w,h];
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
    drawBoxs(ctx,[cw,ch,iw,ih]){
        
        if(this.props.dataResult){
            this.props.dataResult.map((box)=>{
                ctx.beginPath();
                ctx.lineWidth = "2";
                var color = this.RGBToHex(box.color);

                ctx.strokeStyle = color;
                var [x,y,w,h] =this.convertCoods(box.boxes,[cw,ch,iw,ih]);
                // console.log(box.label);
                // console.log(box.boxes);
                // console.log(x,y,w,h);
                ctx.rect(x,y,w,h);
                
                ctx.stroke();

                ctx.font = '14px Arial';
                ctx.fillStyle = color;
                ctx.fillText(box.label, x, y-5)
                return {};
            });
        }
    }
    draw(){
        const canvas = this.refs.canvas
        const ctx = canvas.getContext("2d")
        const img = this.refs.image

        img.onload = () => {
            console.log("load image");
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);           
            this.drawBoxs(ctx,[canvas.width, canvas.height,img.width,img.height]);    
        }
    }

    componentDidMount(){
        
        this.draw();
    }
    

    render() { 
        return (
            <div className='imageView'>
                <canvas ref="canvas" width={640} height={425} />
                <img ref="image" src={this.props.imageView ?this.props.imageView:"/example.jpg" }
                     className="hidden"  alt='something'/>
                {/* <img className='image' src = {this.props.imageView ?this.props.imageView:"/example.jpg" }></img> */}
            </div>
        );
    }
}
 
export default ImageView;