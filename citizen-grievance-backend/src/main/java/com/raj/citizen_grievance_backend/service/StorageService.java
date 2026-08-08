package com.raj.citizen_grievance_backend.service;

import com.raj.citizen_grievance_backend.exception.BadRequestException;
import net.coobird.thumbnailator.Thumbnails;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;

import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;

@Service
public class StorageService {

    private final S3Client s3Client;

    @Value("${cloudflare.r2.bucket-name}")
    private String bucketName;

    // Allowed image content types
    private static final List<String> ALLOWED_MIME_TYPES = Arrays.asList(
            "image/jpeg", "image/png", "image/webp", "image/gif"
    );

    // Max file size: 5MB
    private static final long MAX_FILE_SIZE = 5 * 1024 * 1024;

    public StorageService(S3Client s3Client) {
        this.s3Client = s3Client;
    }

    /**
     * Process an image upload: validates, resizes, converts to WebP, and uploads to Cloudflare R2.
     * @param file the MultipartFile to upload
     * @return the generated image UUID
     */
    public String uploadImage(MultipartFile file) {
        // 1. Validation
        if (file == null || file.isEmpty()) {
            throw new BadRequestException("File is empty or not provided");
        }

        if (file.getSize() > MAX_FILE_SIZE) {
            throw new BadRequestException("File size exceeds the 5MB limit");
        }

        String contentType = file.getContentType();
        if (contentType == null || !ALLOWED_MIME_TYPES.contains(contentType.toLowerCase())) {
            throw new BadRequestException("Only JPEG, PNG, WEBP, and GIF images are allowed. Provided: " + contentType);
        }

        try {
            // 2. Load BufferedImage
            BufferedImage bufferedImage;
            try (InputStream is = file.getInputStream()) {
                bufferedImage = ImageIO.read(is);
            }

            if (bufferedImage == null) {
                throw new BadRequestException("Invalid image file or corrupted data");
            }

            // 3. Process & Resize using Thumbnailator
            // Resize to maximum bounding box of 1200x1200px while maintaining aspect ratio
            BufferedImage resizedImage = Thumbnails.of(bufferedImage)
                    .size(1200, 1200)
                    .keepAspectRatio(true)
                    .asBufferedImage();

            // 4. Convert to WebP using webp-imageio
            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            boolean written = ImageIO.write(resizedImage, "webp", baos);
            if (!written) {
                // Fallback: If webp-imageio plugin is not registered, write as png
                ImageIO.write(resizedImage, "png", baos);
            }
            byte[] processedBytes = baos.toByteArray();

            // 5. Upload to Cloudflare R2
            String imageUuid = UUID.randomUUID().toString();
            String key = imageUuid + ".webp";

            PutObjectRequest putObjectRequest = PutObjectRequest.builder()
                    .bucket(bucketName)
                    .key(key)
                    .contentType("image/webp")
                    .build();

            s3Client.putObject(putObjectRequest, RequestBody.fromBytes(processedBytes));

            return imageUuid;

        } catch (IOException e) {
            throw new BadRequestException("Failed to process or upload image: " + e.getMessage());
        }
    }
}
