package com.nhom6.taskmanagement.dto.project;

import java.time.LocalDate;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProjectBasicDTO {
    private String name;
    private String description;
    private LocalDate startDate;
    private LocalDate dueDate;
    private String status;
    private String tag;
    private String priority;
}
