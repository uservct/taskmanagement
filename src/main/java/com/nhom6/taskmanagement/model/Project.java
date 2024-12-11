package com.nhom6.taskmanagement.model;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.JoinTable;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import lombok.Data;
import java.time.temporal.ChronoUnit;
import jakarta.persistence.Index;
import jakarta.persistence.FetchType;

@Data
@Entity
@Table(name = "projects", indexes = {
    @Index(name = "idx_project_status", columnList = "status"),
    @Index(name = "idx_project_created_by", columnList = "created_by")
})
public class Project {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(name = "description")
    private String description;

    @Enumerated(EnumType.STRING)
    private ProjectStatus status;

    @Column(name = "start_date")
    private LocalDate startDate;

    @Column(name = "due_date")
    private LocalDate dueDate;

    @Column(name = "end_date")
    private LocalDate endDate;

    @ManyToOne
    @JoinColumn(name  = "created_by", nullable = false)
    private User createdBy;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Column(name = "is_deleted")
    private Boolean isDeleted;

    @Column(name = "deleted_at")
    private LocalDateTime deletedAt;

    @Column(name = "deleted_by")
    private Long deletedBy;

    @OneToMany(
        mappedBy = "project",
        cascade = CascadeType.ALL,
        orphanRemoval = true,
        fetch = FetchType.EAGER
    )
    private Set<Task> tasks = new HashSet<>();

    @OneToMany(mappedBy = "project", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<ProjectAnnouncement> announcements = new HashSet<>();

    @Enumerated(EnumType.STRING)
    @Column(name = "priority")
    private ProjectPriority priority;

    @Enumerated(EnumType.STRING)
    @Column(name = "tag")
    private TagProject tag;

    @ManyToMany(fetch = FetchType.EAGER)
    @JoinTable(
        name = "project_members",
        joinColumns = @JoinColumn(name = "project_id"),
        inverseJoinColumns = @JoinColumn(name = "user_id")
    )
    private Set<User> members = new HashSet<>();

    @OneToMany(mappedBy = "project", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<Attachment> attachments = new HashSet<>();

    @OneToMany(mappedBy = "project", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<Comment> comments = new HashSet<>();

    public void addMember(User user) {
        members.add(user);
        user.getProjects().add(this);
    }

    public void removeMember(User user) {
        members.remove(user);
        user.getProjects().remove(this);
    }

    public Set<Task> getTasks() {
        return tasks;
    }

    public Set<ProjectAnnouncement> getAnnouncements() {
        return announcements;
    }

    public Set<User> getMembers() {
        return members;
    }

    // Get tasks count
    public long getTasksCount() {
        return tasks.size();
    }

    // Get completed tasks count
    public long getCompletedTasksCount() {
        return tasks.stream()
                .filter(task -> TaskStatus.DONE.equals(task.getStatus()))
                .count();
    }

    // Get in progress tasks count
    public long getInProgressTasksCount() {
        return tasks.stream()
                .filter(task -> TaskStatus.IN_PROGRESS.equals(task.getStatus()))
                .count();
    }

    // Get progress
    public double getProgress() {
        if (tasks == null || tasks.isEmpty()) {
            return 0.0; // Return 0% progress if there are no tasks
        }
        
        long completedTasks = tasks.stream()
            .filter(task -> TaskStatus.DONE.equals(task.getStatus()))
            .count();
            
        return ((double) completedTasks / tasks.size()) * 100;
    }

    // Get days left
    public long getDaysLeft() {
        return ChronoUnit.DAYS.between(LocalDate.now(), dueDate);
    }

    // Get hours left
    public long getHoursLeft() {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime due = dueDate.atTime(23, 59, 59);
        return ChronoUnit.HOURS.between(now, due) - getDaysLeft() * 24;
    }

    // Get minutes left
    public long getMinutesLeft() {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime due = dueDate.atTime(23, 59, 59);
        return ChronoUnit.MINUTES.between(now, due) - getDaysLeft() * 24 * 60 - getHoursLeft() * 60;
    }

    // Get not started tasks count
    public long getNotStartedTasksCount() {
        return tasks.stream()
                .filter(task -> TaskStatus.TODO.equals(task.getStatus()))
                .count();
    }

    // Get on hold tasks count
    public long getOnHoldTasksCount() {
        return tasks.stream()
                .filter(task -> TaskStatus.REVIEW.equals(task.getStatus()))
                .count();
    }

    // Get announcements count
    public long getAnnouncementsCount() {
        return announcements.size();
    }

    // Add helper methods to maintain bidirectional relationship
    public void addTask(Task task) {
        tasks.add(task);
        task.setProject(this);
    }

    public void removeTask(Task task) {
        tasks.remove(task);
        task.setProject(null);
    }

    public void addAttachment(Attachment attachment) {
        attachments.add(attachment);
        attachment.setProject(this);
    }

    public void removeAttachment(Attachment attachment) {
        attachments.remove(attachment);
        attachment.setProject(null);
    }

    public void addComment(Comment comment) {
        comments.add(comment);
        comment.setProject(this);
    }

    public void removeComment(Comment comment) {
        comments.remove(comment);
        comment.setProject(null);
    }
}
