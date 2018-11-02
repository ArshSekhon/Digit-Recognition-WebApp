import 'bootstrap/dist/css/bootstrap-grid.min.css';
import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import WritingCanvas from './WritingCanvas.js'
import sample from './sample';
import Modal from 'react-responsive-modal'

class App extends Component {
  
  state = {
    helpOpen:true,
  }

  init(){
    
  }

  onOpenModal = () => {
    this.setState({ helpOpen: true });
  };
 
  onCloseModal = () => {
    this.setState({ helpOpen: false });
  };

  render() {
    const {helpOpen} = this.state;

    return (
      <div className="App">
        <Modal open={helpOpen} className="help-modal" onClose={this.onCloseModal} center>
            <h2 className="help-app-title">Hand-Written Digit Recogniser</h2>
            <p className="help-app-intro-body">Draw any digit 0-9 using your mouse or touch-screen and a nueral network will predict what you drew. For best results, please draw large and vertically straight characters at center of canvas. 
              Feel free to experiment with different shapes and forms for digits.
            </p>
            <h3 className="help-app-under-the-hood-title">Under the Hood</h3>
            <p className="help-app-under-the-hood-body">There is a Convolutional Nueral Network working behind the scene. It was trained on MNIST dataset and code used for training the nueral network can be found here: <a href="https://arshsekhon.github.io">https://arshsekhon.github.io</a></p>
        </Modal>
        
        <WritingCanvas height={350} width={350}/>

      </div>
    );
  }


}

export default App;
