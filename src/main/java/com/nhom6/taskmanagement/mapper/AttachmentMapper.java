package com.nhom6.taskmanagement.mapper;

import java.util.List;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

import com.nhom6.taskmanagement.dto.attachment.AttachmentCreateDTO;
import com.nhom6.taskmanagement.dto.attachment.AttachmentResponseDTO;
import com.nhom6.taskmanagement.model.Attachment;
import org.mapstruct.NullValuePropertyMappingStrategy;

@Mapper(
    componentModel = "spring", 
    uses = {UserMapper.class},
    nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE
)
public interface AttachmentMapper {
    
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "project", ignore = true)
    @Mapping(target = "task", ignore = true)
    @Mapping(target = "uploadedBy", ignore = true)
    @Mapping(target = "uploadedAt", expression = "java(java.time.LocalDateTime.now())")
    @Mapping(target = "storedFileName", source = "filePath")
    Attachment toEntity(AttachmentCreateDTO dto);
    
    @Mapping(source = "uploadedBy", target = "uploadedBy")
    AttachmentResponseDTO toResponseDTO(Attachment attachment);
    
    List<AttachmentResponseDTO> toResponseDTOs(List<Attachment> attachments);
} 