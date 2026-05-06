package com.tableorder.file.controller;

import com.tableorder.common.dto.ApiResponse;
import com.tableorder.file.dto.FileUploadResponse;
import com.tableorder.file.service.FileService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequiredArgsConstructor
public class FileController {

    private final FileService fileService;

    @PostMapping("/api/admin/files/upload")
    public ResponseEntity<ApiResponse<FileUploadResponse>> uploadImage(
            @RequestParam("file") MultipartFile file) {
        FileUploadResponse response = fileService.uploadImage(file);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @DeleteMapping("/api/admin/files/{filename}")
    public ResponseEntity<Void> deleteImage(@PathVariable String filename) {
        fileService.deleteImage(filename);
        return ResponseEntity.noContent().build();
    }
}
