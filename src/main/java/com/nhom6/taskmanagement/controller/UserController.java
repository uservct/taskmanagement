package com.nhom6.taskmanagement.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Controller;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.client.ResourceAccessException;

import com.nhom6.taskmanagement.dto.user.UserCreateDTO;
import com.nhom6.taskmanagement.model.User;
import com.nhom6.taskmanagement.service.ProjectService;
import com.nhom6.taskmanagement.service.TaskService;
import com.nhom6.taskmanagement.service.UserService;

@Controller
@RequestMapping("/users")
public class UserController {
    
    @Autowired
    private UserService userService;

    @Autowired
    private ProjectService projectService;

    @Autowired
    private TaskService taskService;

    //trả về các user
    @GetMapping
    public String users(Model model){
        model.addAttribute("currentUrl", "/users");
        model.addAttribute("users", userService.getAllUsers());
        return "users/index";
    }

    //tạo user mới
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    @PostMapping("/create")
    public String createUser(@ModelAttribute UserCreateDTO userRequestDTO, Model model){
        userService.createUser(userRequestDTO);
        return "redirect:/users";
    }

    //hiện thông tin profile của user hiệntại
    @GetMapping("/profile")
    @Transactional(readOnly = true)
    public String profile(Model model){
        model.addAttribute("currentUrl", "/users/profile");
        User user =userService.getCurrentUser();
        model.addAttribute("user", user);
        model.addAttribute("projects", projectService.getProjectsByUserId(user.getId()));
        model.addAttribute("tasks", taskService.getTasksOfUser());
        return "users/profile";
    }
    //xem profile user
    @PreAuthorize("hasRole('ROLE_ADMIN') or #id == authentication.id.principal.id")
    @GetMapping("/profile/{id}")
    @Transactional(readOnly = true)
    public String viewProfile(@PathVariable Long id, Model model){
        model.addAttribute("currentUrl", "/users/profile");
        User user = userService.getUserById(id).orElseThrow(() -> new ResourceAccessException("User not found"));
        model.addAttribute("user", user);
        model.addAttribute("projects", projectService.getProjectsByUserId(user.getId()));
        model.addAttribute("tasks", taskService.getTasksOfUser());
        return "users/profile";
    }

}
