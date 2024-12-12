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

    @GetMapping("/dashboard")
    public String dashboard(@AuthenticationPrincipal UserDetails userDetails, Model model) {
        try {
            // Get current user's projects as DTOs
            List<ProjectResponseDTO> userProjects = projectService.getProjectsByUserId(userService.getCurrentUser().getId());
            
            // Active projects count (IN_PROGRESS)
            long activeProjects = userProjects.stream()
                .filter(p -> ProjectStatus.IN_PROGRESS.name().equals(p.getStatus().name()))
                .count();
            
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
