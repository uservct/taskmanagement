package com.nhom6.taskmanagement.dto.task;

import java.util.List;
import java.time.LocalDate;
import lombok.Data;

@Data
public class TaskDTO {
    private String name;
    private String description;
    private LocalDate startDate;
    private LocalDate dueDate;
    private List<Long> assigneeIds;
}

