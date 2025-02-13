Sign Language Model

This model is run using th java server make sure you have java installed on your PC and also the extension installed on VS code.

#To make this project work--- open the MainActivity.java file change the directories in the code to wherever you saved the both html files

This code ( case 0: // Open speech to sign openHtmlFile("path/to/index.html"); break; case 1: // Open camera to sign openHtmlFile("path/to/camera.html"); break; ) Run the java class file: Select which ever option you want to run

NB: Make sure you have internet to run the index.html file evrytime to make google api work Also, internet is required for the first few times for the camera.html to run

Train your speech to sign model in the script file and add the corresponding image or gif file to the image example ('hello' - in the script file should have a corresponding 'hello.png/jpg' file in the images folder) Train your sign to text model in the camera.html file, thus; the script section on the bottom

To train your gesture recognition model follow the steps in this link:: https://ai.google.dev/edge/mediapipe/solutions/customization/gesture_recognizer and replace the .task file in the project directory with your new .task file

This model only supports only six sign gestures thus: ILoveyou, thumbs Up, thumbs down, pointing up, pointing down, hello and also recognizes only one hand at a time unlike our previous versions thats recognized hands simultaneously.


Make sure you have your internet connected for etter experirence.
