package com.nhom6.taskmanagement.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.nhom6.taskmanagement.model.Attachment;

@Repository
public interface AttachmentRepository extends JpaRepository<Attachment, Long> {
    List<Attachment> findByProjectId(Long projectId);
    List<Attachment> findByTaskId(Long taskId);
}
