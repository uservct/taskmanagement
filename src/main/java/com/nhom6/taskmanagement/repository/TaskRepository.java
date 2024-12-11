package com.nhom6.taskmanagement.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.nhom6.taskmanagement.model.Project;
import com.nhom6.taskmanagement.model.Task;
import com.nhom6.taskmanagement.model.User;

@Repository
public interface TaskRepository extends JpaRepository<Task, Long> {
    List<Task> findByProjectAndAssigneesContaining(Project project, User user);
    
    @Query("SELECT t FROM Task t WHERE t.dueDate < CURRENT_DATE AND t.status != 'COMPLETED'")
    List<Task> findOverdueTasks();

    List<Task> findByProjectId(Long projectId);

    @Query("SELECT DISTINCT t FROM Task t " +
           "LEFT JOIN FETCH t.project " +
           "LEFT JOIN FETCH t.assignees " +
           "WHERE :user MEMBER OF t.assignees")
    List<Task> findByAssigneesContaining(@Param("user") User user);
}
