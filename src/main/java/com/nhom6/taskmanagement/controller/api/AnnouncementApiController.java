package com.nhom6.taskmanagement.controller.api;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.nhom6.taskmanagement.service.ProjectAnnouncementService;

@RestController
@RequestMapping("/api/announcements")
public class AnnouncementApiController {

    private final ProjectAnnouncementService announcementService;

    public AnnouncementApiController(ProjectAnnouncementService announcementService) {
        this.announcementService = announcementService;
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteAnnouncement(@PathVariable Long id) {
        announcementService.deleteProjectAnnouncement(id);
        return ResponseEntity.noContent().build();
    }
    
}
