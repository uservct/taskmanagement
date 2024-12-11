package com.nhom6.taskmanagement.repository;

import com.nhom6.taskmanagement.model.ProjectAnnouncement;
import com.nhom6.taskmanagement.model.Project;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProjectAnnouncementRepository extends JpaRepository<ProjectAnnouncement, Long> {
    List<ProjectAnnouncement> findByProjectAndIsDeletedFalseOrderByCreatedAtDesc(Project project);
    void deleteAllByProject(Project project);
}