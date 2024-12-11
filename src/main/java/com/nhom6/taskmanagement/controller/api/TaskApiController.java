package com.nhom6.taskmanagement.controller.api;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.DeleteMapping;
import com.nhom6.taskmanagement.dto.task.TaskResponseDTO;
import com.nhom6.taskmanagement.dto.task.TaskUpdateDTO;
import com.nhom6.taskmanagement.dto.task.TaskStatusUpdateDTO;
import com.nhom6.taskmanagement.service.TaskService;
import org.springframework.web.bind.annotation.RequestMapping;

@RestController
@RequestMapping("/api/tasks")
public class TaskApiController {
    @Autowired
    private TaskService taskService;

    @GetMapping("/{id}")
    public ResponseEntity<TaskResponseDTO> getTaskById(@PathVariable Long id) {
        return ResponseEntity.ok(taskService.getTaskById(id));
    }

    @PatchMapping("/{id}")
    public ResponseEntity<TaskResponseDTO> updateTask(@PathVariable Long id, @RequestBody TaskUpdateDTO taskUpdateDTO) {
        return ResponseEntity.ok(taskService.updateTask(id, taskUpdateDTO));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTask(@PathVariable Long id) {
        taskService.deleteTask(id);
        return ResponseEntity.noContent().build();
    }

    // Update task status
    @PatchMapping("/{id}/status")
    public ResponseEntity<TaskResponseDTO> updateTaskStatus(@PathVariable Long id, @RequestBody TaskStatusUpdateDTO data) {
        return ResponseEntity.ok(taskService.updateTaskStatus(id, data.getStatus()));
    }
}
