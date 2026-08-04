package com.raj.citizen_grievance_backend.authentication.context;

import com.raj.citizen_grievance_backend.entity.User;
import java.util.Optional;

public interface CurrentUserProvider {
    Optional<User> getCurrentUser();
    User getCurrentUserOrThrow();
}
