package com.nhom6.taskmanagement.dto.comment;

import lombok.Data;

@Data
public class CommentCreateDTO {
    private String content;
    private Long projectId;
    private Long taskId;
} 