package com.nhom6.taskmanagement.dto.task;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;

import com.nhom6.taskmanagement.dto.user.UserSummaryDTO;
import com.nhom6.taskmanagement.dto.attachment.AttachmentResponseDTO;
import com.nhom6.taskmanagement.dto.comment.CommentResponseDTO;
import com.nhom6.taskmanagement.model.TaskStatus;

import lombok.Data;

@Data
public class TaskResponseDTO {
    private Long id;
    private String name;
    private String description;
    private TaskStatus status;
    private LocalDate startDate;
    private LocalDate dueDate;
    private String tag;
    private List<UserSummaryDTO> assignees;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private Long projectId;
    private String projectName;
    private Set<AttachmentResponseDTO> attachments;
    private Set<CommentResponseDTO> comments;
}