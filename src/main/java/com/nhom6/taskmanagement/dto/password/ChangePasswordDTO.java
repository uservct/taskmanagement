package com.nhom6.taskmanagement.dto.password;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.Data;

@Data
public class ChangePasswordDTO {
    private String email;

    private String newPassword;

    private String confirmPassword;
}