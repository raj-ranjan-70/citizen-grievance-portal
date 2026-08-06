package com.raj.citizen_grievance_backend.util;

import org.springframework.stereotype.Component;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;

@Component
public class Sha256PasswordEncoder implements PasswordEncoder {

    private final SecureRandom secureRandom = new SecureRandom();

    @Override
    public String encode(CharSequence rawPassword) {
        if (rawPassword == null) {
            throw new IllegalArgumentException("Password cannot be null");
        }
        byte[] salt = new byte[16];
        secureRandom.nextBytes(salt);
        String saltHex = bytesToHex(salt);
        String hashHex = hash(rawPassword.toString(), saltHex);
        return saltHex + ":" + hashHex;
    }

    @Override
    public boolean matches(CharSequence rawPassword, String encodedPassword) {
        if (rawPassword == null || encodedPassword == null) {
            return false;
        }
        if (!encodedPassword.contains(":")) {
            return false;
        }
        String[] parts = encodedPassword.split(":");
        if (parts.length != 2) {
            return false;
        }
        String saltHex = parts[0];
        String expectedHashHex = parts[1];
        String actualHashHex = hash(rawPassword.toString(), saltHex);
        return expectedHashHex.equals(actualHashHex);
    }

    private String hash(String password, String saltHex) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            String saltedPassword = password + saltHex;
            byte[] hash = digest.digest(saltedPassword.getBytes(StandardCharsets.UTF_8));
            return bytesToHex(hash);
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException("SHA-256 algorithm not found", e);
        }
    }

    private String bytesToHex(byte[] bytes) {
        StringBuilder hexString = new StringBuilder();
        for (byte b : bytes) {
            String hex = Integer.toHexString(0xff & b);
            if (hex.length() == 1) {
                hexString.append('0');
            }
            hexString.append(hex);
        }
        return hexString.toString();
    }
}
