package com.nhom6.taskmanagement.dto.attachment;

import lombok.Data;

@Data
public class AttachmentCreateDTO {
    private Long projectId;
    private Long taskId;
    private String filePath;
    private String originalFileName;
    private String contentType;
    private Long fileSize;
} 