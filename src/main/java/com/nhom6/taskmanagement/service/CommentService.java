package com.nhom6.taskmanagement.service;

import com.nhom6.taskmanagement.dto.comment.CommentCreateDTO;
import com.nhom6.taskmanagement.dto.comment.CommentResponseDTO;
import com.nhom6.taskmanagement.mapper.CommentMapper;
import com.nhom6.taskmanagement.model.Comment;
import com.nhom6.taskmanagement.model.Project;
import com.nhom6.taskmanagement.model.Task;
import com.nhom6.taskmanagement.model.User;
import com.nhom6.taskmanagement.repository.CommentRepository;
import com.nhom6.taskmanagement.repository.ProjectRepository;
import com.nhom6.taskmanagement.repository.TaskRepository;
import com.nhom6.taskmanagement.exception.ResourceNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class CommentService {

    @Autowired
    private CommentRepository commentRepository;

    @Autowired
    private TaskRepository taskRepository;

    @Autowired
    private ProjectRepository projectRepository;

    @Autowired
    private UserService userService;

    @Autowired
    private CommentMapper commentMapper;

    @Transactional
    public CommentResponseDTO createComment(CommentCreateDTO commentDTO) {
        Comment comment = commentMapper.toEntity(commentDTO);
        comment.setCreatedAt(LocalDateTime.now());
        
        // Set project if projectId is provided
        if (commentDTO.getProjectId() != null) {
            Project project = projectRepository.findById(commentDTO.getProjectId())
                .orElseThrow(() -> new ResourceNotFoundException("Project not found"));
            comment.setProject(project);
        }
        
        // Set task if taskId is provided
        if (commentDTO.getTaskId() != null) {
            Task task = taskRepository.findById(commentDTO.getTaskId())
                .orElseThrow(() -> new ResourceNotFoundException("Task not found"));
            comment.setTask(task);
        }
        
        // Explicitly set the current user
        User currentUser = userService.getCurrentUser();
        comment.setCreatedBy(currentUser);
        
        Comment savedComment = commentRepository.save(comment);
        return commentMapper.toResponseDTO(savedComment);
    }

    public List<CommentResponseDTO> getCommentsByTaskId(Long taskId) {
        List<Comment> comments = commentRepository.findByTaskIdOrderByCreatedAtDesc(taskId);
        return commentMapper.toResponseDTOs(comments);
    }

    public List<CommentResponseDTO> getCommentsByProjectId(Long projectId) {
        List<Comment> comments = commentRepository.findByProjectIdOrderByCreatedAtDesc(projectId);
        return commentMapper.toResponseDTOs(comments);
    }

    @Transactional
    public CommentResponseDTO updateComment(Long commentId, CommentCreateDTO commentDTO) {
        Comment comment = commentRepository.findById(commentId)
            .orElseThrow(() -> new ResourceNotFoundException("Comment not found"));

        // Check if the current user is the owner of the comment
        User currentUser = userService.getCurrentUser();
        if (!comment.getCreatedBy().getId().equals(currentUser.getId())) {
            throw new IllegalStateException("User is not authorized to update this comment");
        }

        commentMapper.updateEntity(commentDTO, comment);
        Comment updatedComment = commentRepository.save(comment);
        return commentMapper.toResponseDTO(updatedComment);
    }

    @Transactional
    public void deleteComment(Long commentId) {
        Comment comment = commentRepository.findById(commentId)
            .orElseThrow(() -> new ResourceNotFoundException("Comment not found"));

        // Check if the current user is the owner of the comment
        User currentUser = userService.getCurrentUser();
        if (!comment.getCreatedBy().getId().equals(currentUser.getId())) {
            throw new IllegalStateException("User is not authorized to delete this comment");
        }

        commentRepository.delete(comment);
    }
}
