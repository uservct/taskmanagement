package com.nhom6.taskmanagement.service;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.nhom6.taskmanagement.dto.task.TaskCreateDTO;
import com.nhom6.taskmanagement.dto.task.TaskResponseDTO;
import com.nhom6.taskmanagement.dto.task.TaskUpdateDTO;
import com.nhom6.taskmanagement.exception.ResourceNotFoundException;
import com.nhom6.taskmanagement.mapper.TaskMapper;
import com.nhom6.taskmanagement.model.Project;
import com.nhom6.taskmanagement.model.Task;
import com.nhom6.taskmanagement.model.User;
import com.nhom6.taskmanagement.repository.ProjectRepository;
import com.nhom6.taskmanagement.repository.TaskRepository;
import com.nhom6.taskmanagement.model.TaskStatus;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;


@Service
@Transactional
@RequiredArgsConstructor
@Slf4j
public class TaskService {
    private final TaskMapper taskMapper;
    private final TaskRepository taskRepository;
    private final UserService userService;
    private final ProjectRepository projectRepository;
    
// Get task
    public TaskResponseDTO getTaskById(Long id) {
        Task task = taskRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Task not found"));
        return taskMapper.toResponseDTO(task);
    }

// Get task of current user
    public List<TaskResponseDTO> getTasksOfUser() {
        User currentUser = userService.getCurrentUser();
        List<Task> tasks = taskRepository.findByAssigneesContaining(currentUser);
        return taskMapper.toResponseDTOs(tasks);
    }

// Get tasks by project id
    public List<Task> getTasksByProjectId(Long projectId) {
        return taskRepository.findByProjectId(projectId);
    }

// Get all tasks
    public List<TaskResponseDTO> getAllTasks() {
        List<Task> tasks = taskRepository.findAll();
        return taskMapper.toResponseDTOs(tasks);
    }

    
// Create task
    public TaskResponseDTO createTask(Long projectId, TaskCreateDTO createDTO) {
        Project project = projectRepository.findById(projectId)
            .orElseThrow(() -> new ResourceNotFoundException("Project not found"));
            
        User currentUser = userService.getCurrentUser();
        
        Task task = taskMapper.toEntity(createDTO);
        task.setProject(project);
        task.setCreatedBy(currentUser);
        task.setCreatedAt(LocalDateTime.now());
        task.setUpdatedAt(LocalDateTime.now());
        task.setIsDeleted(false);

        // Set assignees if provided in DTO
        if (createDTO.getAssigneeIds() != null && !createDTO.getAssigneeIds().isEmpty()) {
            Set<User> assignees = new HashSet<>(userService.getUsersByIds(createDTO.getAssigneeIds()));
            task.setAssignees(assignees);
        }
        
        Task savedTask = taskRepository.save(task);
        
        return taskMapper.toResponseDTO(savedTask);
    }
    
// Update task
    public TaskResponseDTO updateTask(Long id, TaskUpdateDTO updateDTO) {
        Task task = taskRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Task not found"));
        
        taskMapper.updateEntity(updateDTO, task);
        task.setUpdatedAt(LocalDateTime.now());
        
        // Update assignees if provided
        if (updateDTO.getAssigneeIds() != null) {
            Set<User> assignees = new HashSet<>(userService.getUsersByIds(updateDTO.getAssigneeIds()));
            task.setAssignees(assignees);
        }
        
        return taskMapper.toResponseDTO(taskRepository.save(task));
    }
    
// Delete task
    public void deleteTask(Long id) {
        Task task = taskRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Task not found"));
        taskRepository.delete(task);
    }

// Update task status
    public TaskResponseDTO updateTaskStatus(Long id, String status) {
        Task task = taskRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Task not found"));
        task.setStatus(TaskStatus.valueOf(status));
        task.setUpdatedAt(LocalDateTime.now());
        return taskMapper.toResponseDTO(taskRepository.save(task));
    }

    public Task getTaskEntityById(Long id) {
        return taskRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Task not found"));
    }
}
