package com.nhom6.taskmanagement.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import com.nhom6.taskmanagement.model.Comment;
import java.util.List;

@Repository
public interface CommentRepository extends JpaRepository<Comment, Long> {
    List<Comment> findByProjectIdOrderByCreatedAtDesc(Long projectId);
    List<Comment> findByTaskIdOrderByCreatedAtDesc(Long taskId);
}
