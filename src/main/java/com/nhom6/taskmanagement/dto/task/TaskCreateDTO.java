package com.nhom6.taskmanagement.dto.task;

import java.time.LocalDate;
import java.util.List;

import lombok.Data;

@Data
public class TaskCreateDTO {
    private String name;
    private String description;
    private LocalDate startDate;
    private LocalDate dueDate;
    private List<Long> assigneeIds;
}

