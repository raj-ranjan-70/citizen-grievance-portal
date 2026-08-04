package com.raj.citizen_grievance_backend.authentication.exception;

public class ConcurrentSessionException extends RuntimeException {
    public ConcurrentSessionException(String message) {
        super(message);
    }
}
