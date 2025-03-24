package main.java;

import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpHandler;
import com.sun.net.httpserver.HttpServer;
import java.awt.Desktop;
import java.io.*;
import java.net.InetSocketAddress;
import java.net.URI;
import javax.swing.*;

public class MainActivity {
    private static final int PORT = 8080; // Server port
    private static final String BASE_DIR = "src/main/resources/"; // Folder containing HTML files

    public static void main(String[] args) {
        // Start the HTTP server
        startServer();

        // Show menu to select which HTML file to open
        String selectedFile = showMenu();
        if (selectedFile != null) {
            openBrowser("http://localhost:" + PORT + "/" + selectedFile);
        } else {
            System.out.println("No valid option selected. Exiting.");
        }
    }

    // Start a simple HTTP server
    public static void startServer() {
        try {
            HttpServer server = HttpServer.create(new InetSocketAddress(PORT), 0);
            server.createContext("/", new FileHandler(BASE_DIR)); // Serve files from BASE_DIR
            server.setExecutor(null);
            server.start();
            System.out.println("Server started at http://localhost:" + PORT);
        } catch (IOException e) {
            e.printStackTrace();
            System.err.println("Error starting server: " + e.getMessage());
        }
    }

    // Show a menu to select which HTML file to open
    public static String showMenu() {
        String[] options = {"Speech to Sign (index.html)", "Sign to Text (camera_v3.html)", "Cancel"};
        int choice = JOptionPane.showOptionDialog(null,
                "Please choose an option",
                "HTML File Selector",
                JOptionPane.DEFAULT_OPTION,
                JOptionPane.INFORMATION_MESSAGE,
                null,
                options,
                options[0]);

        switch (choice) {
            case 0:
                return "index.html";
            case 1:
                return "camera_v3.html";
            default:
                return null; // User canceled or closed the dialog
        }
    }

    // Open browser to specified URL
    public static void openBrowser(String url) {
        try {
            if (Desktop.isDesktopSupported() && Desktop.getDesktop().isSupported(Desktop.Action.BROWSE)) {
                Desktop.getDesktop().browse(new URI(url));
            } 
            else {
                System.err.println("Desktop browsing not supported. Trying xdg-open...");
                try {
                    ProcessBuilder processBuilder = new ProcessBuilder("xdg-open", url);
                    processBuilder.start();
                } catch (IOException ioEx) {
                    ioEx.printStackTrace();
                    System.err.println("Failed to open browser using xdg-open.");
                }
            }
            
        } catch (Exception e) {
            e.printStackTrace();
            System.err.println("Error opening browser: " + e.getMessage());
        }
    }
}

// Handler to serve files from the resources folder
class FileHandler implements HttpHandler {
    private final String baseDir;

    public FileHandler(String baseDir) {
        this.baseDir = baseDir;
    }

    @Override
    public void handle(HttpExchange exchange) throws IOException {
        String requestedFile = exchange.getRequestURI().getPath().substring(1); // Remove leading '/'
        File file = new File(baseDir + requestedFile);
    
        if (!file.exists() || file.isDirectory()) {
            String errorMessage = "404 Not Found: " + requestedFile;
            exchange.sendResponseHeaders(404, errorMessage.length());
            exchange.getResponseBody().write(errorMessage.getBytes());
            exchange.getResponseBody().close();
            return;
        }
    
        // Determine MIME type based on file extension
        String mimeType = "application/octet-stream"; // Default fallback
        if (requestedFile.endsWith(".html")) {
            mimeType = "text/html";
        } else if (requestedFile.endsWith(".js")) {
            mimeType = "application/javascript";
        } else if (requestedFile.endsWith(".css")) {
            mimeType = "text/css";
        } else if (requestedFile.endsWith(".png")) {
            mimeType = "image/png";
        } else if (requestedFile.endsWith(".jpg") || requestedFile.endsWith(".jpeg")) {
            mimeType = "image/jpeg";
        } else if (requestedFile.endsWith(".svg")) {
            mimeType = "image/svg+xml";
        }
    
        exchange.getResponseHeaders().set("Content-Type", mimeType);
    
        byte[] fileContent = new byte[(int) file.length()];
        try (FileInputStream fis = new FileInputStream(file)) {
            fis.read(fileContent);
        }
    
        exchange.sendResponseHeaders(200, fileContent.length);
        OutputStream os = exchange.getResponseBody();
        os.write(fileContent);
        os.close();
    }
    
}
