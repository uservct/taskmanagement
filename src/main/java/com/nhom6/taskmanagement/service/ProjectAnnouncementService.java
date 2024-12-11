package com.nhom6.taskmanagement.service;

import com.nhom6.taskmanagement.model.Project;
import com.nhom6.taskmanagement.model.ProjectAnnouncement;
import com.nhom6.taskmanagement.model.User;
import com.nhom6.taskmanagement.repository.ProjectAnnouncementRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class ProjectAnnouncementService {

    @Autowired
    private ProjectAnnouncementRepository projectAnnouncementRepository;

    public List<ProjectAnnouncement> getAllProjectAnnouncements() {
        return projectAnnouncementRepository.findAll();
    }

    public Optional<ProjectAnnouncement> getProjectAnnouncementById(Long id) {
        return projectAnnouncementRepository.findById(id);
    }

    public ProjectAnnouncement createProjectAnnouncement(ProjectAnnouncement announcement) {
        return projectAnnouncementRepository.save(announcement);
    }

    public ProjectAnnouncement updateProjectAnnouncement(ProjectAnnouncement announcement) {
        return projectAnnouncementRepository.save(announcement);
    }

    public void deleteProjectAnnouncement(Long id) {
        projectAnnouncementRepository.deleteById(id);
    }

    public ProjectAnnouncement createAnnouncement(Project project, User creator, String title, String content) {
        ProjectAnnouncement announcement = new ProjectAnnouncement();
        announcement.setProject(project);
        announcement.setCreatedBy(creator);
        announcement.setTitle(title);
        announcement.setContent(content);
        announcement.setCreatedAt(LocalDateTime.now());
        announcement.setIsDeleted(false);
        return projectAnnouncementRepository.save(announcement);
    }

    public List<ProjectAnnouncement> getAnnouncementsByProject(Project project) {
        return projectAnnouncementRepository.findByProjectAndIsDeletedFalseOrderByCreatedAtDesc(project);
    }

}