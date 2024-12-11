package com.nhom6.taskmanagement.dto.task;

import java.time.LocalDate;
import java.util.List;

import com.nhom6.taskmanagement.model.TaskStatus;

import lombok.Data;

@Data
public class TaskUpdateDTO {
    private String name;
    private String description;
    private LocalDate startDate;
    private LocalDate dueDate;
    private TaskStatus status;
    private List<Long> assigneeIds;
}
