package com.nhom6.taskmanagement.controller.api;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.nhom6.taskmanagement.dto.attachment.AttachmentCreateDTO;
import com.nhom6.taskmanagement.dto.attachment.AttachmentResponseDTO;
import com.nhom6.taskmanagement.exception.ResourceNotFoundException;
import com.nhom6.taskmanagement.mapper.AttachmentMapper;
import com.nhom6.taskmanagement.model.Attachment;
import com.nhom6.taskmanagement.service.AttachmentService;
import com.nhom6.taskmanagement.service.CloudinaryService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@RestController
@RequestMapping("/api/attachments")
@Slf4j
@RequiredArgsConstructor
public class AttachmentApiController {

    private final AttachmentService attachmentService;
    private final CloudinaryService cloudinaryService;
    private final AttachmentMapper attachmentMapper;

    @PostMapping("/upload")
    public ResponseEntity<AttachmentResponseDTO> uploadFile(
            @RequestParam("file") MultipartFile file,
            @RequestParam(required = false) Long projectId,
            @RequestParam(required = false) Long taskId) {
        try {
            log.info("Uploading file: {} for project: {} or task: {}", 
                file.getOriginalFilename(), projectId, taskId);
            
            // Upload file to Cloudinary
            String fileUrl = cloudinaryService.uploadFile(file);
            
            // Create DTO
            AttachmentCreateDTO createDTO = new AttachmentCreateDTO();
            createDTO.setProjectId(projectId);
            createDTO.setTaskId(taskId);
            createDTO.setFilePath(fileUrl);
            createDTO.setOriginalFileName(file.getOriginalFilename());
            createDTO.setContentType(file.getContentType());
            createDTO.setFileSize(file.getSize());
            
            // Save attachment
            Attachment savedAttachment = attachmentService.createAttachment(createDTO);
            return ResponseEntity.ok(attachmentMapper.toResponseDTO(savedAttachment));
            
        } catch (Exception e) {
            log.error("Error uploading file: ", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }

    @GetMapping("/project/{projectId}")
    public ResponseEntity<List<AttachmentResponseDTO>> getAttachmentsByProjectId(@PathVariable Long projectId) {
        List<Attachment> attachments = attachmentService.getAttachmentsByProjectId(projectId);
        return ResponseEntity.ok(attachmentMapper.toResponseDTOs(attachments));
    }

    @GetMapping("/task/{taskId}")
    public ResponseEntity<List<AttachmentResponseDTO>> getAttachmentsByTaskId(@PathVariable Long taskId) {
        List<Attachment> attachments = attachmentService.getAttachmentsByTaskId(taskId);
        return ResponseEntity.ok(attachmentMapper.toResponseDTOs(attachments));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteAttachment(@PathVariable Long id) {
        attachmentService.deleteAttachment(id);
        return ResponseEntity.noContent().build();
    }
}
