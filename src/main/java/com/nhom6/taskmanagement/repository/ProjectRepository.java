package com.nhom6.taskmanagement.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.nhom6.taskmanagement.model.Project;

@Repository
public interface ProjectRepository extends JpaRepository<Project, Long> {
    
    @Query("SELECT DISTINCT p FROM Project p " +
           "LEFT JOIN FETCH p.members " +
           "LEFT JOIN FETCH p.tasks t " +
           "LEFT JOIN FETCH t.assignees " +
           "LEFT JOIN FETCH t.createdBy " +
           "LEFT JOIN FETCH p.announcements " +
           "WHERE p.id = :id")
    Optional<Project> findById(@Param("id") Long id);
    
    @Query("SELECT DISTINCT p FROM Project p " +
           "LEFT JOIN FETCH p.members " +
           "LEFT JOIN FETCH p.tasks t " +
           "LEFT JOIN FETCH t.assignees " +
           "LEFT JOIN FETCH t.createdBy " +
           "LEFT JOIN FETCH p.announcements " +
           "WHERE p.isDeleted = false")
    List<Project> findAll();

    @Query("SELECT DISTINCT p FROM Project p " +
           "LEFT JOIN p.members m " +
           "WHERE m.id = :userId AND p.isDeleted = false")
    List<Project> findByMembersContaining(@Param("userId") Long userId);

    List<Project> findByIsDeletedTrue();
}
