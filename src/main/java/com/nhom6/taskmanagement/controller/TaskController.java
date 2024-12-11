package com.nhom6.taskmanagement.controller;

import java.util.List;

import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;

import com.nhom6.taskmanagement.dto.task.TaskResponseDTO;
import com.nhom6.taskmanagement.service.TaskService;

@Controller
public class TaskController {

    private final TaskService taskService;

    public TaskController(TaskService taskService) {
        this.taskService = taskService;
    }

    @GetMapping("/tasks")
    public String tasks(Model model) {
        model.addAttribute("currentUrl", "/tasks");
        List<TaskResponseDTO> tasks = taskService.getTasksOfUser();
        model.addAttribute("tasks", tasks);
        return "tasks/index";
    }
}
