package com.nhom6.taskmanagement.controller;

import java.util.List;
import java.util.Map;
import java.util.Comparator;
import java.util.ArrayList;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

import com.nhom6.taskmanagement.dto.ProjectDTO;
import com.nhom6.taskmanagement.exception.ResourceNotFoundException;
import com.nhom6.taskmanagement.model.Project;
import com.nhom6.taskmanagement.model.ProjectAnnouncement;
import com.nhom6.taskmanagement.model.Task;
import com.nhom6.taskmanagement.model.User;
import com.nhom6.taskmanagement.service.ProjectAnnouncementService;
import com.nhom6.taskmanagement.service.ProjectService;
import com.nhom6.taskmanagement.service.TaskService;
import com.nhom6.taskmanagement.service.UserService;
import com.nhom6.taskmanagement.dto.project.ProjectResponseDTO;

import jakarta.validation.Valid;
import lombok.extern.slf4j.Slf4j;
@Controller
@RequestMapping("/projects")
@Slf4j
public class ProjectController {

    private final ProjectService projectService;
    private final UserService userService;
    private final TaskService taskService;
    private final ProjectAnnouncementService announcementService;
    
    public ProjectController(ProjectService projectService, UserService userService, TaskService taskService, ProjectAnnouncementService announcementService) {
        this.projectService = projectService;
        this.userService = userService;
        this.taskService = taskService;
        this.announcementService = announcementService;
    }

    // Show list projects
    @GetMapping
    public String listProjects(Model model) {
        if (userService.isAdmin()) {
            model.addAttribute("currentUrl", "/projects");
            List<Project> projects = projectService.getAllProjects();
            model.addAttribute("projects", projects);
        } else {
            model.addAttribute("currentUrl", "/projects");
            List<ProjectResponseDTO> projects = projectService.getProjectsByUserId(userService.getCurrentUser().getId());
            model.addAttribute("projects", projects);
        }
        return "projects/index"; 
    }

    // Show create project form
    @GetMapping("/create")
    public String showCreateProjectForm(Model model) {
        log.info("Show create project form");
        model.addAttribute("users", userService.getAllUsers());
        model.addAttribute("project", new Project());
        return "projects/project-create";
    }

    // Process create new project
    @PostMapping("/create")
    public String createProject(@Valid @ModelAttribute("project") ProjectDTO projectDTO, 
                                BindingResult result, 
                                RedirectAttributes redirectAttributes) {
        log.info("Process create new project: {}", projectDTO);
        if (result.hasErrors()) {
            return "projects/project-create";
        }
        try {
            Project createdProject = projectService.createProject(projectDTO);
            redirectAttributes.addFlashAttribute("showToast", true);
            redirectAttributes.addFlashAttribute("toastType", "success");
            redirectAttributes.addFlashAttribute("toastMessage", "Project created successfully");
            return "redirect:/projects/" + createdProject.getId();
        } catch (IllegalArgumentException e) {
            log.error("Error when create project", e);
            redirectAttributes.addFlashAttribute("showToast", true);
            redirectAttributes.addFlashAttribute("toastType", "error");
            redirectAttributes.addFlashAttribute("toastMessage", e.getMessage());
            return "redirect:/projects/create";
        }
    }

    // Show edit project form
    @GetMapping("/{id}/edit")
    public String showEditProjectForm(@PathVariable Long id, Model model) {
        log.info("Show edit project form with ID: {}", id);
        Project project = projectService.getProjectById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Project not found with ID: " + id));
        model.addAttribute("project", project);
        model.addAttribute("users", userService.getAllUsers());
        return "projects/project-edit";
    }

    // Show project details
    @GetMapping("/{id}")
    public String showProjectDetails(@PathVariable Long id, Model model) {
        try {
            Project project = projectService.getProjectById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found with ID: " + id));
            
            List<Task> tasks = new ArrayList<>(project.getTasks());
            tasks.sort(Comparator.comparing(Task::getStartDate));

            List<User> members = userService.getUsersByProjectId(id);

            List<ProjectAnnouncement> announcements = 
            announcementService.getAnnouncementsByProject(project);
            
            model.addAttribute("project", project);
            model.addAttribute("tasks", tasks);
            model.addAttribute("members", members);
            model.addAttribute("announcements", announcements);
            return "projects/project-details";
        } catch (Exception e) {
            log.error("Error when show project details", e);
            model.addAttribute("errorMessage", e.getMessage());
            return "error";
        }
    }

    // Process create announcement
    @PostMapping("/{id}/announcements")
        public String createAnnouncement(@PathVariable Long id,
                                    @RequestParam String content,
                                    @RequestParam String title,
                                    @AuthenticationPrincipal UserDetails userDetails,
                                    RedirectAttributes redirectAttributes) {
            try {
                Project project = projectService.getProjectById(id)
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy dự án"));
                
                User currentUser = userService.findByUsername(userDetails.getUsername())
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng"));

                announcementService.createAnnouncement(project, currentUser, title, content);
                redirectAttributes.addFlashAttribute("successMessage", "Đã tạo thông báo thành công!");
            } catch (Exception e) {
                redirectAttributes.addFlashAttribute("errorMessage", "Có lỗi xảy ra khi tạo thông báo: " + e.getMessage());
            }
            
            return "redirect:/projects/" + id;
        }
    
    // Show trash project
    @GetMapping("/trash")
    public String showTrash(Model model) {
        log.info("Showing trash page");
        List<Project> deletedProjects = projectService.getDeletedProjects();
        model.addAttribute("projects", deletedProjects);
        model.addAttribute("currentUrl", "/projects/trash");
        return "projects/trash";
    }

    // Restore project
    @PatchMapping("/{id}/restore")
    public ResponseEntity<?> restoreProject(@PathVariable Long id) {
        try {
            projectService.restoreProject(id);
            return ResponseEntity.ok("Project restored successfully");
        } catch (Exception e) {
            log.error("Error restoring project", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error restoring project: " + e.getMessage());
        }
    }

    // Soft Delete project
    @PatchMapping("/{id}/delete")
    public ResponseEntity<Void> softDeleteProject(@PathVariable Long id) {
        projectService.softDeleteProject(id);
        return ResponseEntity.noContent().build();
    }

    // Delete project
    @DeleteMapping("/{id}/delete")
    public ResponseEntity<Void> deleteProject(@PathVariable Long id) {
        projectService.deleteProject(id);
        return ResponseEntity.noContent().build();
    }
}
