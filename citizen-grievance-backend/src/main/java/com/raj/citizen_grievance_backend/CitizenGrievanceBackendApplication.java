package com.raj.citizen_grievance_backend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class CitizenGrievanceBackendApplication {

	public static void main(String[] args) {
		SpringApplication.run(CitizenGrievanceBackendApplication.class, args);
	}

}
