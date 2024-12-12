package com.nhom6.taskmanagement.dto.password;

import lombok.Data;

@Data
public class ChangePasswordDTO {
    private String email;

    private String currentPassword;
    
    private String newPassword;

    private String confirmPassword;
}