package com.nhom6.taskmanagement.dto.user;

import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserResponseDTO {
    private Long id;
    private String username;
    private String fullName;
    private String email;
    private String avatarUrl;
    private String position;
    private String role;
    private String status;
    private String phoneNumber;
    private LocalDateTime createdAt;    
}

