package com.nhom6.taskmanagement.controller;

import java.time.LocalDate;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;

import com.nhom6.taskmanagement.dto.project.ProjectResponseDTO;    
import com.nhom6.taskmanagement.dto.task.TaskResponseDTO;
import com.nhom6.taskmanagement.model.ProjectStatus;
import com.nhom6.taskmanagement.model.TaskStatus;
import com.nhom6.taskmanagement.service.ProjectService;
import com.nhom6.taskmanagement.service.TaskService;
import com.nhom6.taskmanagement.service.UserService;

import lombok.extern.slf4j.Slf4j;

@Controller
@Slf4j
public class HomeController {
    
    @Autowired
    private ProjectService projectService;

    @Autowired
    private UserService userService;
    
    @Autowired
    private TaskService taskService;

    @GetMapping("/dashboard")
    public String dashboard(@AuthenticationPrincipal UserDetails userDetails, Model model) {
        try {
            // Get current user's projects as DTOs
            List<ProjectResponseDTO> userProjects = projectService.getProjectsByUserId(userService.getCurrentUser().getId());
            
            // Active projects count (IN_PROGRESS)
            long activeProjects = userProjects.stream()
                .filter(p -> ProjectStatus.IN_PROGRESS.name().equals(p.getStatus().name()))
                .count();


            // Get user's tasks
            List<TaskResponseDTO> userTasks = taskService.getTasksOfUser();
            
            // Pending tasks count (TODO + IN_PROGRESS)
            long pendingTasks = userTasks.stream()
                .filter(t -> TaskStatus.TODO.name().equals(t.getStatus().name()) || 
                           TaskStatus.IN_PROGRESS.name().equals(t.getStatus().name()))
                .count();
            
            
            // Projects with upcoming deadlines (due within 7 days)
            LocalDate sevenDaysFromNow = LocalDate.now().plusDays(7);
            long upcomingDeadlines = userProjects.stream()
                .filter(p -> !ProjectStatus.COMPLETED.name().equals(p.getStatus().name()) &&
                           p.getDueDate() != null &&
                           p.getDueDate().isBefore(sevenDaysFromNow))
                .count();
            
            // Recent projects (last 5)
            List<ProjectResponseDTO> recentProjects = userProjects.stream()
                .sorted((p1, p2) -> p2.getCreatedAt().compareTo(p1.getCreatedAt()))
                .limit(5)
                .toList();
            
            // Recent tasks (last 5)
            List<TaskResponseDTO> recentTasks = userTasks.stream()
                .sorted((t1, t2) -> t2.getCreatedAt().compareTo(t1.getCreatedAt()))
                .limit(5)
                .toList();
            
            // Add all data to model
            model.addAttribute("currentUrl", "/dashboard");
            model.addAttribute("activeProjects", activeProjects);
            model.addAttribute("pendingTasks", pendingTasks);
            model.addAttribute("upcomingDeadlines", upcomingDeadlines);
            model.addAttribute("recentProjects", recentProjects);
            model.addAttribute("recentTasks", recentTasks);
            
            log.info("Dashboard loaded successfully for user: {}", userDetails.getUsername());
            return "home/index";
        } catch (Exception e) {
            log.error("Error loading dashboard for user: {}", userDetails.getUsername(), e);
            return "error";
        }
    }

    // Keep existing methods
    @GetMapping("/")
    public String home() {
        return "redirect:/dashboard";
    }

    @GetMapping("/login")
    public String login(Model model, String error, String logout) {
        if (error != null)
            model.addAttribute("error", "Tên đăng nhập hoặc mật khẩu không đúng.");
        if (logout != null)
            model.addAttribute("message", "Bạn đã đăng xuất thành công.");
        return "users/login";
    }

    @GetMapping("/error")
    public String handleError() {
        return "error";
    }
}
