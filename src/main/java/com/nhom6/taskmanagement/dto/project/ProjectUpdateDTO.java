package com.nhom6.taskmanagement.dto.project;

import java.util.List;

import com.nhom6.taskmanagement.dto.task.TaskCreateAndUpdateDTO;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProjectUpdateDTO {
    private ProjectBasicDTO basic;
    private List<Long> memberIds;
    private List<TaskCreateAndUpdateDTO> tasks;
}
