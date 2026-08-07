package com.raj.citizen_grievance_backend.config;

import com.raj.citizen_grievance_backend.entity.Department;
import com.raj.citizen_grievance_backend.entity.Role;
import com.raj.citizen_grievance_backend.entity.User;
import com.raj.citizen_grievance_backend.repository.UserRepository;
import com.raj.citizen_grievance_backend.util.PasswordEncoder;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
public class DatabaseSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public DatabaseSeeder(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) throws Exception {
        if (!userRepository.existsByEmail("admin@citizen.com")) {
            User admin = User.builder()
                    .name("System Admin")
                    .email("admin@citizen.com")
                    .passwordHash(passwordEncoder.encode("password"))
                    .role(Role.ADMIN)
                    .department(Department.NONE)
                    .build();
            userRepository.save(admin);
        }
    }
}
