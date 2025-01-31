package main.java;

import java.awt.Desktop;
import java.io.File;
import java.io.IOException;
import javax.swing.*;

public class MainActivity {

    public static void main(String[] args) {
        // Display a simple menu for the user to choose an option
        String[] options = {"Speech to sign", "Sign to text", "Cancel"};
        int choice = JOptionPane.showOptionDialog(null, 
                "Please choose an option", 
                "HTML File Opener", 
                JOptionPane.DEFAULT_OPTION, 
                JOptionPane.INFORMATION_MESSAGE, 
                null, 
                options, 
                options[0]);

        // Perform action based on the user's choice
        switch (choice) {
            case 0: // Open speech to sign
                openHtmlFile("C:/Users/project/signlanguageapp/src/main/resources/index.html");
                break;
            case 1: // Open camera to sign
                openHtmlFile("C:/Users/project/signlanguageapp/src/main/resources/camera.html");
                break;
            case 2: // Cancel
                System.out.println("Operation canceled.");
                break;
            default:
                System.out.println("No valid option selected.");
        }
    }

    // Method to open an HTML file
    public static void openHtmlFile(String filePath) {
        try {
            File file = new File(filePath);
            if (file.exists()) {
                Desktop desktop = Desktop.getDesktop();
                desktop.open(file);
            } else {
                JOptionPane.showMessageDialog(null, "File does not exist: " + filePath, "Error", JOptionPane.ERROR_MESSAGE);
            }
        } catch (IOException e) {
            JOptionPane.showMessageDialog(null, "Error opening file: " + e.getMessage(), "Error", JOptionPane.ERROR_MESSAGE);
        }
    }
}
