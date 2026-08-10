package com.raj.citizen_grievance_backend.config;

import com.raj.citizen_grievance_backend.filter.AuthInterceptor;
import com.raj.citizen_grievance_backend.filter.RoleAuthInterceptor;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    private final AuthInterceptor authInterceptor;
    private final RoleAuthInterceptor roleAuthInterceptor;

    public WebConfig(AuthInterceptor authInterceptor, RoleAuthInterceptor roleAuthInterceptor) {
        this.authInterceptor = authInterceptor;
        this.roleAuthInterceptor = roleAuthInterceptor;
    }

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        // 1. Authentication interceptor — validates the session for all protected routes
        registry.addInterceptor(authInterceptor)
                .addPathPatterns(
                        "/api/v1/citizen/**",
                        "/api/v1/officer/**",
                        "/api/v1/admin/**",
                        "/api/v1/notifications/**",
                        "/api/v1/complaints/**"
                )
                .excludePathPatterns(
                        "/api/v1/auth/login",
                        "/api/v1/auth/signup",
                        "/api/v1/auth/logout",
                        "/swagger-ui/**",
                        "/v3/api-docs/**",
                        "/swagger-resources/**",
                        "/webjars/**"
                );

        // 2. Role authorization interceptor — enforces path-segment based role enforcement
        //    /api/v1/notifications/** is intentionally excluded — all roles can receive notifications
        registry.addInterceptor(roleAuthInterceptor)
                .addPathPatterns(
                        "/api/v1/citizen/**",
                        "/api/v1/officer/**",
                        "/api/v1/admin/**"
                );
    }

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**")
                .allowedOrigins("http://localhost:5173", "http://localhost:5174", "https://grievance.rajranjan.qzz.io/")
                .allowedMethods("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS")
                .allowedHeaders("*")
                .allowCredentials(true);
    }
}
