package com.raj.citizen_grievance_backend.service;

import com.raj.citizen_grievance_backend.dto.SignupRequest;
import com.raj.citizen_grievance_backend.dto.UserResponse;
import com.raj.citizen_grievance_backend.entity.Role;
import com.raj.citizen_grievance_backend.entity.User;
import com.raj.citizen_grievance_backend.exception.EmailAlreadyExistsException;
import com.raj.citizen_grievance_backend.exception.ResourceNotFoundException;
import com.raj.citizen_grievance_backend.repository.RoleRepository;
import com.raj.citizen_grievance_backend.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collections;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;

    public UserService(UserRepository userRepository, RoleRepository roleRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional
    public UserResponse registerCitizen(SignupRequest signupRequest) {
        if (userRepository.existsByEmail(signupRequest.getEmail())) {
            throw new EmailAlreadyExistsException("Email already exists: " + signupRequest.getEmail());
        }

        Role citizenRole = roleRepository.findByName("ROLE_CITIZEN")
                .orElseThrow(() -> new ResourceNotFoundException("Role ROLE_CITIZEN not found in database"));

        User user = User.builder()
                .name(signupRequest.getName())
                .email(signupRequest.getEmail().toLowerCase().trim())
                .password(passwordEncoder.encode(signupRequest.getPassword()))
                .roles(Collections.singleton(citizenRole))
                .build();

        User savedUser = userRepository.save(user);

        return mapToUserResponse(savedUser);
    }

    public UserResponse getUserByEmail(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + email));
        return mapToUserResponse(user);
    }

    public UserResponse mapToUserResponse(User user) {
        String roleName = user.getRoles().isEmpty() ? "citizen" : 
                user.getRoles().iterator().next().getName().replace("ROLE_", "").toLowerCase();

        return UserResponse.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .role(roleName)
                .build();
    }
}
