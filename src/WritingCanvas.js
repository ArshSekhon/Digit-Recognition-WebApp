import { Model } from 'keras-js';
import React, {Component} from 'react';
import ReactDOM from 'react-dom';
import './WritingCanvas.css'
import * as tf from'@tensorflow/tfjs'
import * as ReactD3 from 'react-d3-components'
import {isMobile} from 'react-device-detect'

class WritingCanvas extends Component{

    constructor(props) {
        super(props);
        console.log("isMobile",isMobile)
        this.defaultPredictions =[
          {x: '0', y: 0},
          {x: '1', y: 0},
          {x: '2', y: 0},
          {x: '3', y: 0},
          {x: '4', y: 0},
          {x: '5', y: 0},
          {x: '6', y: 0},
          {x: '7', y: 0},
          {x: '8', y: 0},
          {x: '9', y: 0}];

        this.state = {
            isDrawing: false,
            lastX: 0,
            lastY: 0,
            direction: true,
            controlDisplay: "none",
            controlLefb: "100%",
            customColor: false,
            color: "#n",
            customStroke: false,
            maxWidth: 100,
            minWidth: 30,
            width: this.props.width,
            height: this.props.height,
            predictionsOpen:false,
            predictions:this.defaultPredictions,
        };

        this.draw = this.draw.bind(this);
        this.clearCanvas = this.clearCanvas.bind(this);
        this.predictDigit = this.predictDigit.bind(this); 
        this.getMinBox = this.getMinBox.bind(this);
        this.printImageTensor = this.printImageTensor.bind(this);
        this.coords = [];

        this.model = new Model({
          filepath: 'model.bin',
        });
    }


    onOpenModal = () => {
      this.setState({ predictionsOpen: true });
    };
  
    onCloseModal = () => {
      this.setState({ predictionsOpen: false });
    };

    canvas () {
        return document.querySelector("#draw");
    }
    ctx () {
        return this.canvas().getContext("2d");
    }
    componentDidMount() {
        const canvas = this.canvas()
        const ctx = this.ctx()
        if(this.props.fullscreen === true){
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        }
        ctx.strokeStyle = "#000000";
        ctx.lineJoin = "round";
        ctx.lineCap = "round";
        ctx.lineWidth = Number(this.state.minWidth) + 1;
 
    }



    draw(e) {
        const ctx = this.ctx();

        if(this.state.isDrawing){
            ctx.strokeStyle = this.state.color;

            this.coords.push({
              'x':e.nativeEvent.offsetX,
              'y':e.nativeEvent.offsetY
              }); 

            ctx.beginPath();
            ctx.moveTo(this.state.lastX, this.state.lastY);
            ctx.lineTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
            ctx.stroke();
            this.setState({
                lastX: e.nativeEvent.offsetX,
                lastY: e.nativeEvent.offsetY
            })
        }
    }


    render () { 
        return (
            <div>
                <canvas id="draw" width={this.props.width} height={this.props.height} 
                        onMouseMove={(e)=>{
                                    this.draw(e); 
                        }}
                        onMouseDown={(e) => {
                            this.setState({
                                isDrawing: true,
                                lastX: e.nativeEvent.offsetX,
                                lastY: e.nativeEvent.offsetY
                            });
                            if(e.nativeEvent.offsetX >=0 && e.nativeEvent.offsetY >= 0)  
                            {	  
                              this.coords.push({
                                                'x':e.nativeEvent.offsetX,
                                                'y':e.nativeEvent.offsetY
                                                }); 
                            }}
                        }
                        onMouseUp={
                            (e) => {this.setState({isDrawing: false})
                                if(e.nativeEvent.offsetX >=0 && e.nativeEvent.offsetY >= 0)  
                                {	  
                                  this.coords.push({
                                                    'x':e.nativeEvent.offsetX,
                                                    'y':e.nativeEvent.offsetY
                                                    }); 
                                }
                                this.predictDigit(e);
                            }
                        }
                        onMouseOut={
                            (e) => {
                              this.setState({isDrawing: false});
                              this.predictDigit(e);
                            }
                        }
                        
                    className="writing-canvas"/>
                <div>
                  <canvas height={28} width={28} id="minst" style={{"scale":"10"}}></canvas>
                </div>
                <input type="Button" onClick={this.clearCanvas} value="Clear Canvas" className="clear-button" onChange={() => {}}/>
                <ReactD3.BarChart
                  data={[{
                      label: 'Numbers',
                      values: this.state.predictions
                  }]}
                  width={400}
                  height={400}
                  margin={{top: 10, bottom: 50, left: 50, right: 10}}/>
            </div>
        )
    }
    predictDigit(e){ 
        
        var mbb = this.getMinBox()
        //cacluate the dpi of the current window 
        const dpi = window.devicePixelRatio;


        console.log(mbb,dpi)

        //extract the image data  
        var height = (mbb.max.y-mbb.min.y)*dpi;
        var width = (mbb.max.x-mbb.min.x)*dpi;

        var padding_determinee = (height>width)?height:width;
        var margin_ratio=3.0/7.0;

        var top_left_adjustment =  margin_ratio * padding_determinee;
        top_left_adjustment = (top_left_adjustment<100)?100:top_left_adjustment;

        var height_width_adjustment = top_left_adjustment * 2;


        console.log("height_width_adjustment",height_width_adjustment,"top_left_adjustment",top_left_adjustment);

        height = (mbb.max.y-mbb.min.y) * dpi + height_width_adjustment;
        width = (mbb.max.x-mbb.min.x)*dpi+ height_width_adjustment;


        var left = mbb.min.x*dpi-top_left_adjustment;
        var top = mbb.min.y*dpi-top_left_adjustment;
        var margin = 50;
           
        if(height>0 && width>0)
          try{
            this.printImageTensor(this.ctx().getImageData(left, top, width, height))
          }catch(e){}
          
    }

    clearCanvas(e){
        const canvas = this.canvas();
        const ctx = this.ctx(canvas);

        this.coords = [];
        ctx.clearRect(0,0,canvas.width, canvas.height);

        var minstContext = document.querySelector("#minst").getContext("2d");
        minstContext.clearRect(0,0,28,28)
        console.log(this.defaultPredictions)
        this.setState({predictions: this.defaultPredictions});
        console.log(this.state.predictions)
    }
    
    async printImageTensor(data){
      var tensor = await this.preprocess(data).data();
      var pixelData = []; 
      
      var row =[]
      for(var i=3;i<tensor.length;i+=4){
        
        row.push(tensor[i])
      } 
      var minstContext = document.querySelector("#minst").getContext("2d");
      var imgData = minstContext.getImageData(0,0,28,28)
      
      console.log("imag", imgData.data.length)
      for (var i=0;i<imgData.data.length;i+=4)
        { 
          imgData.data[i+0]=0;
          imgData.data[i+1]=0;
          imgData.data[i+2]=0;
          imgData.data[i+3]=255*tensor[i+3];
        } 
        minstContext.putImageData(imgData,0,0,0,0,28,28);


        
  
      // Perform a prediction and write the results to the console.
      this.model.ready()
        .then(() => this.model.predict({
          input: new Float32Array(row),
        }))
        .then(({ output }) => {
          let predictionProbability = -1;
          let predictedDigit = null;
          var previousPredictions = this.state.predictions;
          
          console.log(previousPredictions)
          Object.entries(output).forEach(([digit, probability]) => {
            if (probability > predictionProbability) {
              predictionProbability = probability;
              predictedDigit = digit;
            }
            previousPredictions[digit].y = probability;

            console.log(
              `Predicted ${digit} with probability ${probability.toFixed(3)}.`,
            );
          });

          this.setState({predictions:previousPredictions})
          console.log(
            `~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~\n\
            Final Prediction is ${predictedDigit}!!!!.\n~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~`,
          );
        })
        .catch((error) => {
          console.log(error);
        });
      
    }

    preprocess(imgData)
    {
    return tf.tidy(()=>{
        //convert the image data to a tensor 
        var tensor = tf.fromPixels(imgData, 4)
        //resize to 28 x 28 
        var resized = tf.image.resizeBilinear(tensor, [28, 28]).toFloat()
        // Normalize the image 
        var offset = tf.scalar(255.0);
        var normalized = (resized.div(offset));
        //We add a dimension to get a batch shape 
        return normalized
        //return resized
    })
    }

     

    getMinBox(){
	
      var coorX = this.coords.map(function(p) {return p.x});
      var coorY = this.coords.map(function(p) {return p.y});
      //find top left corner 
      var min_coords = {
       x : Math.min.apply(null, coorX),
       y : Math.min.apply(null, coorY)
      }
      //find right bottom corner 
      var max_coords = {
       x : Math.max.apply(null, coorX),
       y : Math.max.apply(null, coorY)
      }
      return {
       min : min_coords,
       max : max_coords
      }
   }
   


}
export default WritingCanvas;