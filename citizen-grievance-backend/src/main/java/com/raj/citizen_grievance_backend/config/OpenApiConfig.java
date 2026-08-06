package com.raj.citizen_grievance_backend.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI citizenGrievanceOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("Citizen Grievance Portal API")
                        .description("REST API documentation for the Citizen Grievance Portal - Phase 1 (Authentication and User Management)")
                        .version("1.0.0"));
    }
}
