package com.nhom6.taskmanagement.service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.nhom6.taskmanagement.dto.ProjectDTO;
import com.nhom6.taskmanagement.dto.project.ProjectResponseDTO;
import com.nhom6.taskmanagement.dto.project.ProjectUpdateDTO;
import com.nhom6.taskmanagement.dto.task.TaskCreateAndUpdateDTO;
import com.nhom6.taskmanagement.dto.task.TaskDTO;
import com.nhom6.taskmanagement.exception.ResourceNotFoundException;
import com.nhom6.taskmanagement.mapper.ProjectMapper;
import com.nhom6.taskmanagement.model.Project;
import com.nhom6.taskmanagement.model.ProjectPriority;
import com.nhom6.taskmanagement.model.ProjectStatus;
import com.nhom6.taskmanagement.model.TagProject;
import com.nhom6.taskmanagement.model.Task;
import com.nhom6.taskmanagement.model.TaskStatus;
import com.nhom6.taskmanagement.model.User;
import com.nhom6.taskmanagement.repository.ProjectAnnouncementRepository;
import com.nhom6.taskmanagement.repository.ProjectRepository;
import com.nhom6.taskmanagement.repository.TaskRepository;
import com.nhom6.taskmanagement.repository.UserRepository;




@Service 
@Transactional(readOnly = true)
public class ProjectService {

    private static final Logger log = LoggerFactory.getLogger(ProjectService.class);

    @Autowired
    private ProjectRepository projectRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private TaskRepository taskRepository;

    @Autowired
    private TaskService taskService;

    @Autowired
    private UserService userService;
    @Autowired
    private ProjectAnnouncementRepository projectAnnouncementRepository;

    @Autowired
    private ProjectMapper projectMapper;

    public List<Project> getAllProjects() {
        return projectRepository.findAll();
    }

    public Optional<Project> getProjectById(Long id) {
        return projectRepository.findById(id);
    }

    public List<ProjectResponseDTO> getProjectsByUserId(Long userId) {
        return projectRepository.findByMembersContaining(userId)
            .stream()
            .map(projectMapper::toResponseDTO)
            .collect(Collectors.toList());
    }


    @Transactional
    public Project createProject(ProjectDTO projectDTO) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new RuntimeException("User not authenticated");
        }
        String username = authentication.getName();
        User user = userRepository.findByUsername(username)
            .orElseThrow(() -> new RuntimeException("User not found"));

        Project project = new Project();
        project.setName(projectDTO.getName());
        project.setDescription(projectDTO.getDescription());
        project.setStatus(ProjectStatus.valueOf(projectDTO.getStatus()));
        project.setStartDate(projectDTO.getStartDate());
        project.setDueDate(projectDTO.getDueDate());
        project.setPriority(ProjectPriority.valueOf(projectDTO.getPriority()));
        project.setTag(TagProject.valueOf(projectDTO.getTag()));
        project.setCreatedBy(user);
        project.setCreatedAt(LocalDateTime.now());
        project.setUpdatedAt(LocalDateTime.now());
        project.setIsDeleted(false);

        Set<User> members = new HashSet<>(userRepository.findAllById(projectDTO.getMemberIds()));
        members.add(user);
        project.setMembers(members);

        project = projectRepository.save(project);
        if(projectDTO.getTasks() == null){
            return project;
        }
        for (TaskDTO taskDTO : projectDTO.getTasks()) {
            Task task = new Task();
            task.setName(taskDTO.getName());
            task.setDescription(taskDTO.getDescription());
            task.setDueDate(taskDTO.getDueDate());
            task.setStartDate(taskDTO.getStartDate());
            task.setProject(project);
            task.setStatus(TaskStatus.TODO);
            task.setCreatedBy(user);
            task.setCreatedAt(LocalDateTime.now());
            task.setUpdatedAt(LocalDateTime.now());
            task.setIsDeleted(false);
            
            if (taskDTO.getAssigneeIds() != null && !taskDTO.getAssigneeIds().isEmpty()) {
                Set<User> assignees = new HashSet<>(userRepository.findAllById(taskDTO.getAssigneeIds()));
                task.setAssignees(assignees);
            }
            taskRepository.save(task);
        }

        return project;
    }

    @Transactional
    public ProjectResponseDTO updateProject(Long id, ProjectUpdateDTO projectUpdateDTO) {
        Project project = projectRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Project not found"));
        User currentUser = userService.getCurrentUser();
        Set<User> members = userRepository.findAllById(projectUpdateDTO.getMemberIds())
            .stream()
            .collect(Collectors.toSet());
        // Update project using mapper
        projectMapper.updateEntityFromDTO(projectUpdateDTO, project);
        project.setMembers(members);
        // Update tasks if provided
        if (projectUpdateDTO.getTasks() != null) {
            project.getTasks().clear();
            final Project finalProject = project;
            projectUpdateDTO.getTasks().forEach(taskDTO -> {
                Task task = createNewTask(taskDTO, finalProject);
                task.setCreatedBy(currentUser);
                task.setCreatedAt(LocalDateTime.now());
                finalProject.addTask(task);
            });
        }
        project = projectRepository.save(project);
        return projectMapper.toResponseDTO(project);
    }


    private Task createNewTask(TaskCreateAndUpdateDTO taskDTO, Project project) {
        Task task = new Task();
        task.setProject(project);
        task.setName(taskDTO.getName());
        task.setDescription(taskDTO.getDescription());
        task.setDueDate(taskDTO.getDueDate());
        task.setStartDate(taskDTO.getStartDate());
        task.setStatus(TaskStatus.valueOf(taskDTO.getStatus()));
        
        // Set assignees
        Set<User> assignees = userRepository.findAllById(taskDTO.getAssigneeIds())
            .stream()
            .collect(Collectors.toSet());
        task.setAssignees(assignees);
        
        return task;
    }

    @Transactional
    public void deleteProject(Long id) {
        try {
            Project project = projectRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Project not found"));
            
            log.info("Deleting project with ID: {}", id);
            
            // First delete all announcements
            projectAnnouncementRepository.deleteAllByProject(project);
            
            // Then delete all tasks
            for (Task task : new ArrayList<>(project.getTasks())) {
                task.setAssignees(new HashSet<>()); // Clear assignees first
                taskRepository.delete(task);
            }
            
            // Clear members
            project.getMembers().clear();
            
            // Finally delete the project
            projectRepository.delete(project);
            
            log.info("Successfully deleted project with ID: {}", id);
        } catch (Exception e) {
            log.error("Error deleting project with ID: {}", id, e);
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, 
                "Failed to delete project: " + e.getMessage());
        }
    }

    // Soft Delete Project
    @Transactional
    public void softDeleteProject(Long id) {
        Project project = projectRepository.findById(id)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Project not found"));
        project.setIsDeleted(true);
        project.setDeletedAt(LocalDateTime.now());
        project.setDeletedBy(userService.getCurrentUser().getId());
        projectRepository.save(project);
    }

    // Add member to project
    @Transactional
    public void addMemberToProject(Long projectId, Long userId) {
        Project project = projectRepository.findById(projectId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Project not found"));
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
        project.addMember(user);
        projectRepository.save(project);
    }

    @Transactional
    public void removeMemberFromProject(Long projectId, Long userId) {
        Project project = projectRepository.findById(projectId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Project not found"));
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
        
        // Xử lý các task đã gán cho thành viên
        List<Task> userTasks = taskRepository.findByProjectAndAssigneesContaining(project, user);
        for (Task task : userTasks) {
            task.getAssignees().remove(user); // Xóa user khỏi danh sách assignees
        }
        taskRepository.saveAll(userTasks);
        
        project.removeMember(user);
        projectRepository.save(project);
    }

    public Set<User> getProjectMembers(Long projectId) {
        Project project = projectRepository.findById(projectId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Project not found"));
        return project.getMembers();
    }

    // Get deleted projects
    public List<Project> getDeletedProjects() {
        return projectRepository.findByIsDeletedTrue();
    }

    // Restore project by Id
    @Transactional
    public void restoreProject(Long id) {
        Project project = projectRepository.findById(id)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Project not found"));
        project.setIsDeleted(false);
        projectRepository.save(project);
    }
}
