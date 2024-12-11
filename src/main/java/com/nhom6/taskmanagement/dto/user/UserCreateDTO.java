package com.nhom6.taskmanagement.dto.user;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@AllArgsConstructor
@NoArgsConstructor
@Data
public class UserCreateDTO {
    private String username;
    private String fullName;
    private String phoneNumber;
    private String email;
    private String password;
    private String role;
    private String status;
    private String position;
}
