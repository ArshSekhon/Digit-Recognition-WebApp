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
        
        console.log(this.defaultPredictions)
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
            minWidth: 20,
            width: this.props.width,
            height: this.props.height,
            predictionsOpen:false,
            predictions:[
              {x: '0', y: 0},
              {x: '1', y: 0},
              {x: '2', y: 0},
              {x: '3', y: 0},
              {x: '4', y: 0},
              {x: '5', y: 0},
              {x: '6', y: 0},
              {x: '7', y: 0},
              {x: '8', y: 0},
              {x: '9', y: 0}]
        };

        this.draw = this.draw.bind(this);
        this.clearCanvas = this.clearCanvas.bind(this);
        this.predictDigit = this.predictDigit.bind(this); 
        this.getMinBox = this.getMinBox.bind(this);
        this.processImageWithModel = this.processImageWithModel.bind(this);
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
        <div className="container">
            <div className="row justify-content-center align-items-center align-self-center">
                <div className="col-sm-4">
                  <div className="row"><h2 className="col-sm-12 align-self-start">DRAW HERE</h2></div>
                  
                  <canvas id="draw" className="row writing-canvas" width={this.props.width} height={this.props.height} 
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
                        }/>
                  </div>
                <div className="predictions-bar-graph col-sm-4">
                  <div className="row"><h2 className="col-sm-12 align-self-start">PREDICTIONS</h2></div>
                    <ReactD3.BarChart 
                    className="row"
                      data={[{
                          label: 'Numbers',
                          values: this.state.predictions
                      }]}
                      tooltipHtml={(x,y,y0)=>{return "Probability of being "+x+" is "+Math.round(parseFloat(y0) * 10)/10+"% "}}
                      width={this.state.width}
                      height={this.state.height}
                      xAxis={{label: "Digit"}}
                      yAxis={{label: "Probability"}}
                      margin={{top: 10, bottom: 50, left: 50, right: 10}}/>
                </div>
 
                <div className="col-sm-4">
                  <div className="row"><h2 className="col-sm-12 align-self-start">WHAT NEURAL NETWORK SAW</h2></div>
                  <canvas height={28} width={28} id="mnist-canvas" className="row"></canvas>
                </div>

                
            </div>
            <div className="row align-items-center clear-button-row">
                  <div className="col-sm-12 align-self-center">
                    <button onClick={this.clearCanvas} className="btn clear-button" onChange={() => {}}>Clear Everything</button>   
                  </div>
            </div>
          </div>
            
        )
    }
    predictDigit(e){ 
        
        var mbb = this.getMinBox()
        //cacluate the dpi of the current window 
        const dpi = window.devicePixelRatio;

 

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
            this.processImageWithModel(this.ctx().getImageData(left, top, width, height))
          }catch(e){}
          
    }

    clearCanvas(e){
        const canvas = this.canvas();
        const ctx = this.ctx(canvas);

        this.coords = [];
        ctx.clearRect(0,0,canvas.width, canvas.height);

        var mnistContext = document.querySelector("#mnist-canvas").getContext("2d");
        mnistContext.clearRect(0,0,28,28) 
 
        this.setState({predictions:[{x: '0', y: 0},
                                    {x: '1', y: 0},
                                    {x: '2', y: 0},
                                    {x: '3', y: 0},
                                    {x: '4', y: 0},
                                    {x: '5', y: 0},
                                    {x: '6', y: 0},
                                    {x: '7', y: 0},
                                    {x: '8', y: 0},
                                    {x: '9', y: 0}]});
    }
    
    async processImageWithModel(data){
      var tensor = await this.preprocess(data).data();
      var pixelData = []; 
      
      var row =[]
      for(var i=3;i<tensor.length;i+=4){
        
        row.push(tensor[i])
      } 
      var mnistContext = document.querySelector("#mnist-canvas").getContext("2d");
      var imgData = mnistContext.getImageData(0,0,28,28)
      
      console.log("imag", imgData.data.length)
      for (var i=0;i<imgData.data.length;i+=4)
        { 
          imgData.data[i+0]=0;
          imgData.data[i+1]=0;
          imgData.data[i+2]=0;
          imgData.data[i+3]=255*tensor[i+3];
        } 
        mnistContext.putImageData(imgData,0,0,0,0,28,28);


        
  
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
            previousPredictions[digit].y = probability*100;

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