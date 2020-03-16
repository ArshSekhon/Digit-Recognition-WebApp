# Hand-written Digit Recognizer Application: [Try it out!](https://arshsekhon.github.io/Digit-Recognition-WebApp/)

This is a React App that allows the user to draw digits (0-9) using the mouse and it recognizes the drawn digit. The web application utilizes TensorflowJS to process the input and predict the digit using a Convolutional Neural Network-based model.

Due to the limitations resulting from executing in the browser environment, the model only processes 28x28px input images. So the digit drawn by the user is first converted into a 28x28px image before running the recognition.

The notebook used to build and train the model can be accessed [here](https://gist.github.com/ArshSekhon/931f20aaf389b14c9c11d544d197e084).
