package com.nhom6.taskmanagement.mapper;

import java.util.List;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.NullValuePropertyMappingStrategy;
import org.springframework.beans.factory.annotation.Autowired;

import com.nhom6.taskmanagement.dto.task.TaskCreateDTO;
import com.nhom6.taskmanagement.dto.task.TaskResponseDTO;
import com.nhom6.taskmanagement.dto.task.TaskUpdateDTO;
import com.nhom6.taskmanagement.model.Task;
import com.nhom6.taskmanagement.model.Attachment;
import com.nhom6.taskmanagement.model.Comment;
import com.nhom6.taskmanagement.dto.comment.CommentResponseDTO;
import com.nhom6.taskmanagement.dto.attachment.AttachmentResponseDTO;

@Mapper(
    componentModel = "spring",
    uses = {UserMapper.class, AttachmentMapper.class, CommentMapper.class}
)
public interface TaskMapper {
    
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "status", constant = "TODO")
    @Mapping(target = "project", ignore = true)
    @Mapping(target = "tag", ignore = true)
    @Mapping(target = "assignees", ignore = true)
    @Mapping(target = "createdBy", ignore = true)
    @Mapping(target = "createdAt", expression = "java(java.time.LocalDateTime.now())")
    @Mapping(target = "updatedAt", expression = "java(java.time.LocalDateTime.now())")
    @Mapping(target = "isDeleted", constant = "false")
    @Mapping(target = "deletedAt", ignore = true)
    @Mapping(target = "deletedBy", ignore = true)
    Task toEntity(TaskCreateDTO dto);
    
    @Mapping(target = "projectId", source = "project.id")
    @Mapping(target = "projectName", source = "project.name")
    @Mapping(target = "assignees", source = "assignees")
    TaskResponseDTO toResponseDTO(Task task);

    List<TaskResponseDTO> toResponseDTOs(List<Task> tasks);
    
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "project", ignore = true)
    @Mapping(target = "tag", ignore = true)
    @Mapping(target = "assignees", ignore = true)
    @Mapping(target = "createdBy", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", expression = "java(java.time.LocalDateTime.now())")
    @Mapping(target = "isDeleted", ignore = true)
    @Mapping(target = "deletedAt", ignore = true)
    @Mapping(target = "deletedBy", ignore = true)
    void updateEntity(TaskUpdateDTO dto, @MappingTarget Task task);
    
}