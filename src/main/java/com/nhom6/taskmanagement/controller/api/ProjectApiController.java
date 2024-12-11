package com.nhom6.taskmanagement.controller.api;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;

import com.nhom6.taskmanagement.dto.task.TaskCreateDTO;
import com.nhom6.taskmanagement.dto.task.TaskResponseDTO;
import com.nhom6.taskmanagement.dto.project.ProjectUpdateDTO;
import com.nhom6.taskmanagement.dto.project.ProjectResponseDTO;
import com.nhom6.taskmanagement.service.ProjectService;
import com.nhom6.taskmanagement.service.TaskService;

import jakarta.validation.Valid;
import java.util.Map;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@RestController
@RequestMapping("/api/projects")
public class ProjectApiController {

    private final Logger logger = LoggerFactory.getLogger(ProjectApiController.class);

    private final TaskService taskService;
    private final ProjectService projectService;

    public ProjectApiController(TaskService taskService, ProjectService projectService) {
        this.taskService = taskService;   
        this.projectService = projectService;
    }

    // Update project
    @PatchMapping("/{id}/update")
    public ResponseEntity<?> updateProject(@PathVariable Long id, @RequestBody ProjectUpdateDTO projectUpdateDTO) {
        try {
            ProjectResponseDTO updatedProject = projectService.updateProject(id, projectUpdateDTO);
            return ResponseEntity.ok(updatedProject);
        } catch (ResponseStatusException e) {
            return ResponseEntity.status(e.getStatusCode())
                .body(Map.of("message", e.getReason()));
        } catch (Exception e) {
            logger.error("Error updating project with id {}: {}", id, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("message", "An error occurred while updating the project"));
        }
    }

     // Create task
     @PostMapping("/{id}/add-task")
     public ResponseEntity<TaskResponseDTO> createTask(
             @PathVariable Long id,
             @Valid @RequestBody TaskCreateDTO createDTO) {
         TaskResponseDTO response = taskService.createTask(id, createDTO);
         return ResponseEntity.ok(response);
     }





}
