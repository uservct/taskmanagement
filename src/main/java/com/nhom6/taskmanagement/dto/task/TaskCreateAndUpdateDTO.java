package com.nhom6.taskmanagement.dto.task;

import java.time.LocalDate;
import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TaskCreateAndUpdateDTO {
    private Long id;
    private String name;
    private String description;
    private LocalDate startDate;
    private LocalDate dueDate;
    private String status;
    private List<Long> assigneeIds;
}
