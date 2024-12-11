package com.nhom6.taskmanagement.dto.project;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;

import com.nhom6.taskmanagement.dto.attachment.AttachmentResponseDTO;
import com.nhom6.taskmanagement.dto.comment.CommentResponseDTO;
import com.nhom6.taskmanagement.dto.task.TaskResponseDTO;
import com.nhom6.taskmanagement.dto.user.UserSummaryDTO;
import com.nhom6.taskmanagement.model.ProjectPriority;
import com.nhom6.taskmanagement.model.ProjectStatus;
import com.nhom6.taskmanagement.model.TagProject;
import com.nhom6.taskmanagement.model.TaskStatus;
import lombok.Data;

@Data
public class ProjectResponseDTO {
    private Long id;
    private String name;
    private String description;
    private ProjectStatus status;
    private LocalDate startDate;
    private LocalDate dueDate;
    private ProjectPriority priority;
    private TagProject tag;
    private Set<UserSummaryDTO> members;
    private Set<TaskResponseDTO> tasks;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private Set<AttachmentResponseDTO> attachments;
    private Set<CommentResponseDTO> comments;

    public int getCompletedTasksCount() {
        return (int) tasks.stream()
                .filter(task -> task.getStatus() == TaskStatus.DONE)
                .count();
    }

    public int getTasksCount() {
        return tasks.size();
    }
}
