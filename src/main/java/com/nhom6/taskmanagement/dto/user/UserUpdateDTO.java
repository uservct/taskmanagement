package com.nhom6.taskmanagement.dto.user;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserUpdateDTO {
    private String username;
    private String fullName;
    private String phoneNumber;
    private String position;
    private String email;
    private String role;
    private String status;
}
