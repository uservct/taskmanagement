package com.nhom6.taskmanagement.dto.user;

import lombok.Data;

@Data
public class UserSummaryDTO {
    private Long id;
    private String fullName;
    private String name;
    private String email;
    private String avatarUrl;
    private String position;
}
