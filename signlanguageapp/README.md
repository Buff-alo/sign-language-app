Sign Language Model

#To make this project work--- open the MainActivity.java file change the directories in the code to wherever you saved the both html files

This code ( case 0: // Open speech to sign openHtmlFile("path/to/index.html"); break; case 1: // Open camera to sign openHtmlFile("path/to/camera.html"); break; ) Run the java class file: Select which ever option you want to run

NB: Make sure you have internet to run the index.html file evrytime to make google api work Also, internet is required for the first few times for the camera.html to run

Train your speech to sign model in the script file and add the corresponding image or gif file to the image example ('hello' - in the script file should have a corresponding 'hello.png/jpg' file in the images folder) Train your sign to text model in the camera.html file, thus; the script section on the bottom