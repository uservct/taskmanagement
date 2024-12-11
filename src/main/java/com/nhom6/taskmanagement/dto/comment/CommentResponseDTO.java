package com.nhom6.taskmanagement.dto.comment;

import java.time.LocalDateTime;
import java.util.List;

import com.nhom6.taskmanagement.dto.user.UserSummaryDTO;

import lombok.Data;
import com.fasterxml.jackson.annotation.JsonFormat;

@Data
public class CommentResponseDTO {
    private Long id;
    private String content;
    private UserSummaryDTO createdBy;
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime createdAt;
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime updatedAt;
} 