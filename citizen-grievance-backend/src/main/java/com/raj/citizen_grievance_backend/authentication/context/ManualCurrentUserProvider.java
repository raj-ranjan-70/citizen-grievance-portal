package com.raj.citizen_grievance_backend.authentication.context;

import com.raj.citizen_grievance_backend.authentication.exception.UnauthenticatedException;
import com.raj.citizen_grievance_backend.entity.User;
import org.springframework.stereotype.Component;

import java.util.Optional;

@Component
public class ManualCurrentUserProvider implements CurrentUserProvider {

    private final UserContext userContext;

    public ManualCurrentUserProvider(UserContext userContext) {
        this.userContext = userContext;
    }

    @Override
    public Optional<User> getCurrentUser() {
        return Optional.ofNullable(userContext.getCurrentUser());
    }

    @Override
    public User getCurrentUserOrThrow() {
        User user = userContext.getCurrentUser();
        if (user == null) {
            throw new UnauthenticatedException("Full authentication is required to access this resource");
        }
        return user;
    }
}
