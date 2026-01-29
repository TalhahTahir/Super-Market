package com.talha.supermarket.config;

public class ResourceNotFoundException extends RuntimeException {
    
    public ResourceNotFoundException(String message) {
        super(message);
    }

    public ResourceNotFoundException(String resourceName, Long id) {
        super(resourceName + " not found with id: " + id);
    }

    public ResourceNotFoundException(String string, String string2, String managerName) {
        super(string + " not found with " + string2 + ": " + managerName);
    }
}
