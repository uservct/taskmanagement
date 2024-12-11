package com.nhom6.taskmanagement.dto;

import java.time.LocalDate;
import java.util.List;
import lombok.Data;
import com.nhom6.taskmanagement.dto.task.TaskDTO;

@Data
public class ProjectDTO {
    private String name;
    private String description;
    private String status;
    private LocalDate startDate;
    private LocalDate dueDate;
    private String priority;
    private String tag;
    private List<Long> memberIds;
    private List<TaskDTO> tasks;
}