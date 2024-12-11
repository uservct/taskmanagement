package com.nhom6.taskmanagement.service;

import java.time.LocalDateTime;
import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.nhom6.taskmanagement.exception.FileStorageException;
import com.nhom6.taskmanagement.exception.ResourceNotFoundException;
import com.nhom6.taskmanagement.model.Attachment;
import com.nhom6.taskmanagement.model.Project;
import com.nhom6.taskmanagement.model.Task;
import com.nhom6.taskmanagement.repository.AttachmentRepository;
import com.nhom6.taskmanagement.repository.ProjectRepository;
import com.nhom6.taskmanagement.repository.TaskRepository;

import org.springframework.transaction.annotation.Transactional;
import com.nhom6.taskmanagement.dto.attachment.AttachmentCreateDTO;
import com.nhom6.taskmanagement.mapper.AttachmentMapper;

import lombok.Data;
import lombok.extern.slf4j.Slf4j;

@Data
@Service
@Slf4j
public class AttachmentService {
        
    @Autowired
    private AttachmentRepository attachmentRepository;
    
    @Autowired
    private ProjectRepository projectRepository;
    
    @Autowired
    private TaskRepository taskRepository;
    
    @Autowired
    private UserService userService;

    @Autowired
    private CloudinaryService cloudinaryService;

    @Autowired
    private AttachmentMapper attachmentMapper;

    @Transactional
    public Attachment createAttachment(AttachmentCreateDTO createDTO) {
        Attachment attachment = attachmentMapper.toEntity(createDTO);
        
        // Extract filename from filePath
        String storedFileName = extractFileNameFromUrl(createDTO.getFilePath());
        attachment.setStoredFileName(storedFileName);
        
        // Set project if projectId is provided
        if (createDTO.getProjectId() != null) {
            Project project = projectRepository.findById(createDTO.getProjectId())
                .orElseThrow(() -> new ResourceNotFoundException("Project not found"));
            attachment.setProject(project);
        }
        
        // Set task if taskId is provided
        if (createDTO.getTaskId() != null) {
            Task task = taskRepository.findById(createDTO.getTaskId())
                .orElseThrow(() -> new ResourceNotFoundException("Task not found"));
            attachment.setTask(task);
        }
        
        // Set current user as uploader
        attachment.setUploadedBy(userService.getCurrentUser());
        
        return attachmentRepository.save(attachment);
    }

    public Attachment saveAttachment(MultipartFile file, Project project) {
        try {
            String originalFilename = file.getOriginalFilename();
            String fileExtension = originalFilename != null ? 
                originalFilename.substring(originalFilename.lastIndexOf(".")) : "";
            
            // Upload file lên Cloudinary
            String fileUrl = cloudinaryService.uploadFile(file);
            
            // Tạo và lưu thông tin attachment
            Attachment attachment = new Attachment();
            attachment.setOriginalFileName(originalFilename);
            attachment.setStoredFileName(extractFileNameFromUrl(fileUrl));
            attachment.setContentType(file.getContentType());
            attachment.setFileSize(file.getSize());
            attachment.setProject(project);
            attachment.setUploadedBy(userService.getCurrentUser());
            attachment.setUploadedAt(LocalDateTime.now());
            attachment.setFilePath(fileUrl);
            
            return attachmentRepository.save(attachment);
            
        } catch (Exception e) {
            log.error("Failed to save attachment: {}", e.getMessage());
            throw new FileStorageException("Could not save attachment", e);
        }
    }

    public Attachment saveAttachment(MultipartFile file, Task task) {
        try {
            String originalFilename = file.getOriginalFilename();
            String fileExtension = originalFilename != null ? 
                originalFilename.substring(originalFilename.lastIndexOf(".")) : "";
            
            // Upload file lên Cloudinary
            String fileUrl = cloudinaryService.uploadFile(file);
            
            // Tạo và lưu thông tin attachment
            Attachment attachment = new Attachment();
            attachment.setOriginalFileName(originalFilename);
            attachment.setStoredFileName(extractFileNameFromUrl(fileUrl));
            attachment.setContentType(file.getContentType());
            attachment.setFileSize(file.getSize());
            attachment.setTask(task);
            attachment.setUploadedBy(userService.getCurrentUser());
            attachment.setUploadedAt(LocalDateTime.now());
            attachment.setFilePath(fileUrl);
            
            return attachmentRepository.save(attachment);
            
        } catch (Exception e) {
            log.error("Failed to save attachment: {}", e.getMessage());
            throw new FileStorageException("Could not save attachment", e);
        }
    }

    private String extractFileNameFromUrl(String fileUrl) {
        if (fileUrl == null) return null;
        String[] parts = fileUrl.split("/");
        String fileName = parts[parts.length - 1];
        if (fileName.contains("?")) {
            fileName = fileName.substring(0, fileName.indexOf("?"));
        }
        return fileName;
    }

    public void deleteAttachment(Long id) {
        Attachment attachment = attachmentRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Attachment not found"));
            
        // Xóa file từ Cloudinary
        cloudinaryService.deleteFile(attachment.getFilePath());
        
        // Xóa record từ database
        attachmentRepository.delete(attachment);
    }

    public Attachment getAttachment(Long id) {
        return attachmentRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Attachment not found"));
    }

    public List<Attachment> getAttachmentsByProjectId(Long projectId) {
        return attachmentRepository.findByProjectId(projectId);
    }

    public List<Attachment> getAttachmentsByTaskId(Long taskId) {
        return attachmentRepository.findByTaskId(taskId);
    }
} 