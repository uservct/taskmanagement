package com.nhom6.taskmanagement.repository;

import java.util.List;
import java.util.Optional;
import com.nhom6.taskmanagement.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByUsername(String username);
    
    @Query("SELECT u FROM User u LEFT JOIN FETCH u.projects WHERE u.username = :username")
    Optional<User> findByUsernameWithProjects(@Param("username") String username);

    List<User> findByProjects_Id(Long id);

    Optional<User> findByEmail(String email);

}