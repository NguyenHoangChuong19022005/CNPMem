package com.platform.careerguidance;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import java.awt.Desktop;
import java.io.BufferedReader;
import java.io.File;
import java.io.InputStreamReader;
import java.net.URI;

@SpringBootApplication
public class CareerguidanceApplication {
    public static void main(String[] args) {
        SpringApplication.run(CareerguidanceApplication.class, args);
        launchFrontendAndBrowser();
    }

    private static void launchFrontendAndBrowser() {
        try {
            File frontendDir = findFrontendDir();
            
            if (frontendDir != null) {
                System.out.println("Starting frontend dev server from: " + frontendDir.getAbsolutePath());
                ProcessBuilder pb = new ProcessBuilder("cmd.exe", "/c", "npm run dev");
                pb.directory(frontendDir);
                pb.redirectErrorStream(true);
                Process process = pb.start();
                
                // Read and print frontend console output asynchronously
                new Thread(() -> {
                    try (BufferedReader reader = new BufferedReader(new InputStreamReader(process.getInputStream()))) {
                        String line;
                        while ((line = reader.readLine()) != null) {
                            System.out.println("[Frontend] " + line);
                        }
                    } catch (Exception e) {
                        e.printStackTrace();
                    }
                }).start();
                
                // Wait a moment for Vite server to start, then open the browser
                new Thread(() -> {
                    try {
                        Thread.sleep(3000);
                        System.out.println("Opening browser to http://localhost:5173 ...");
                        if (Desktop.isDesktopSupported() && Desktop.getDesktop().isSupported(Desktop.Action.BROWSE)) {
                            Desktop.getDesktop().browse(new URI("http://localhost:5173"));
                        } else {
                            Runtime.getRuntime().exec("rundll32 url.dll,FileProtocolHandler http://localhost:5173");
                        }
                    } catch (Exception e) {
                        System.err.println("Could not open browser automatically: " + e.getMessage());
                    }
                }).start();
            } else {
                System.err.println("Frontend directory (containing package.json) not found in workspace!");
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    private static File findFrontendDir() {
        File[] targets = {
            new File("CNPMem/frontend"),
            new File("../frontend"),
            new File("frontend"),
            new File("../../frontend")
        };
        for (File target : targets) {
            if (target.exists() && new File(target, "package.json").exists()) {
                return target;
            }
        }
        
        // Search upwards in the directory tree
        File currentDir = new File(".").getAbsoluteFile();
        while (currentDir != null) {
            File test1 = new File(currentDir, "CNPMem/frontend");
            if (test1.exists() && new File(test1, "package.json").exists()) {
                return test1;
            }
            File test2 = new File(currentDir, "frontend");
            if (test2.exists() && new File(test2, "package.json").exists()) {
                return test2;
            }
            currentDir = currentDir.getParentFile();
        }
        return null;
    }
}