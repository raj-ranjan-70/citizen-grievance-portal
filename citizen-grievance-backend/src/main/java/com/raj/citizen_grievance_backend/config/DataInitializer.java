package com.raj.citizen_grievance_backend.config;

import com.raj.citizen_grievance_backend.entity.ComplaintCategory;
import com.raj.citizen_grievance_backend.repository.ComplaintCategoryRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class DataInitializer implements CommandLineRunner {

    private final ComplaintCategoryRepository categoryRepository;

    public DataInitializer(ComplaintCategoryRepository categoryRepository) {
        this.categoryRepository = categoryRepository;
    }

    @Override
    public void run(String... args) {
        List<String[]> categories = List.of(
                new String[]{"Roads & Infrastructure", "Issues related to roads, bridges, and public infrastructure"},
                new String[]{"Water Supply", "Problems with water supply, quality, or drainage"},
                new String[]{"Electricity", "Power outages, faulty wiring, or streetlight issues"},
                new String[]{"Sanitation", "Garbage collection, sewage, and cleanliness concerns"},
                new String[]{"Public Safety", "Safety hazards, crime reports, and emergency concerns"},
                new String[]{"Other", "General complaints that don't fit other categories"}
        );

        for (String[] cat : categories) {
            if (categoryRepository.findByName(cat[0]).isEmpty()) {
                categoryRepository.save(
                        ComplaintCategory.builder()
                                .name(cat[0])
                                .description(cat[1])
                                .build()
                );
            }
        }
    }
}
