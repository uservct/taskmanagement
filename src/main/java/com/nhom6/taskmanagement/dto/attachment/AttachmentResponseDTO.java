package com.nhom6.taskmanagement.dto.attachment;

import java.time.LocalDateTime;

import com.nhom6.taskmanagement.dto.user.UserSummaryDTO;

import lombok.Data;

@Data
public class AttachmentResponseDTO {
    private Long id;
    private String originalFileName;
    private String contentType;
    private Long fileSize;
    private LocalDateTime uploadedAt;
    private UserSummaryDTO uploadedBy;
    private String filePath;
} 