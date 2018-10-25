
import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import WritingCanvas from './WritingCanvas.js'
import sample from './sample';

class App extends Component {



  render() {
    return (
      <div className="App">
        <WritingCanvas height={500} width={500}/>
      </div>
    );
  }/*
  componentDidMount() {
    // Make sure to copy model.bin to the public directory.
    const model = new Model({
      filepath: 'model.bin',
    });

    // Perform a prediction and write the results to the console.
    model.ready()
      .then(() => model.predict({
        input: new Float32Array(sample),
      }))
      .then(({ output }) => {
        let predictionProbability = -1;
        let predictedDigit = null;
        Object.entries(output).forEach(([digit, probability]) => {
          if (probability > predictionProbability) {
            predictionProbability = probability;
            predictedDigit = digit;
          }
        });
        document.write(
          `Predicted ${predictedDigit} with probability ${predictionProbability.toFixed(3)}.`,
        );
      })
      .catch((error) => {
        console.log(error);
      });
  }*/



}

export default App;
