package com.tableorder.file.dto;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class FileUploadResponse {

    private final String url;
    private final String filename;
}
