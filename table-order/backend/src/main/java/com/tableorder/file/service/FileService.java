package com.tableorder.file.service;

import com.tableorder.common.exception.BusinessException;
import com.tableorder.file.dto.FileUploadResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import jakarta.annotation.PostConstruct;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Set;
import java.util.UUID;

@Slf4j
@Service
public class FileService {

    private static final Set<String> ALLOWED_CONTENT_TYPES = Set.of(
            "image/jpeg", "image/png", "image/webp"
    );
    private static final Set<String> ALLOWED_EXTENSIONS = Set.of(
            "jpg", "jpeg", "png", "webp"
    );
    private static final long MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

    @Value("${file.upload-dir}")
    private String uploadDir;

    private Path uploadPath;

    @PostConstruct
    public void init() {
        uploadPath = Paths.get(uploadDir).toAbsolutePath().normalize();
        try {
            Files.createDirectories(uploadPath);
        } catch (IOException e) {
            throw new RuntimeException("Could not create upload directory", e);
        }
    }

    public FileUploadResponse uploadImage(MultipartFile file) {
        validateImageFile(file);

        String originalFilename = file.getOriginalFilename();
        String extension = getExtension(originalFilename);
        String newFilename = UUID.randomUUID() + "." + extension;

        try {
            Path targetPath = uploadPath.resolve(newFilename);
            file.transferTo(targetPath.toFile());
        } catch (IOException e) {
            throw new RuntimeException("Failed to store file", e);
        }

        String url = "/api/files/images/" + newFilename;

        return FileUploadResponse.builder()
                .url(url)
                .filename(newFilename)
                .build();
    }

    public void deleteImage(String filename) {
        try {
            Path filePath = uploadPath.resolve(filename).normalize();
            Files.deleteIfExists(filePath);
        } catch (IOException e) {
            log.warn("Failed to delete file: {}", filename, e);
        }
    }

    private void validateImageFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new BusinessException("INVALID_FILE", "파일이 비어있습니다");
        }

        if (file.getSize() > MAX_FILE_SIZE) {
            throw new BusinessException("FILE_TOO_LARGE", "파일 크기는 5MB 이하여야 합니다");
        }

        String contentType = file.getContentType();
        if (contentType == null || !ALLOWED_CONTENT_TYPES.contains(contentType)) {
            throw new BusinessException("INVALID_FILE_TYPE", "허용된 파일 형식: jpg, png, webp");
        }

        String extension = getExtension(file.getOriginalFilename());
        if (!ALLOWED_EXTENSIONS.contains(extension.toLowerCase())) {
            throw new BusinessException("INVALID_FILE_TYPE", "허용된 파일 형식: jpg, png, webp");
        }
    }

    private String getExtension(String filename) {
        if (filename == null || !filename.contains(".")) {
            return "";
        }
        return filename.substring(filename.lastIndexOf('.') + 1);
    }
}
