package com.nhom6.taskmanagement.service;

import java.util.List;
import java.util.Optional;

import org.apache.commons.lang3.RandomStringUtils;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import com.nhom6.taskmanagement.dto.password.ChangePasswordDTO;
import com.nhom6.taskmanagement.dto.user.UserCreateDTO;
import com.nhom6.taskmanagement.dto.user.UserResponseDTO;
import com.nhom6.taskmanagement.dto.user.UserUpdateDTO;
import com.nhom6.taskmanagement.exception.FileUploadException;
import com.nhom6.taskmanagement.exception.InvalidFileException;
import com.nhom6.taskmanagement.exception.InvalidPasswordException;
import com.nhom6.taskmanagement.exception.ResourceNotFoundException;
import com.nhom6.taskmanagement.exception.UnauthorizedException;
import com.nhom6.taskmanagement.mapper.UserMapper;
import com.nhom6.taskmanagement.model.User;
import com.nhom6.taskmanagement.model.UserRole;
import com.nhom6.taskmanagement.repository.UserRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@Transactional
@RequiredArgsConstructor
@Slf4j
public class UserService {

    private final UserRepository userRepository;
    private final UserMapper userMapper;
    private final PasswordEncoder passwordEncoder;
    private final CloudinaryService cloudinaryService;

    // Get user by id
    public Optional<User> getUserById(Long id) {
        return userRepository.findById(id);
    }

    // Get users by ids
    public List<User> getUsersByIds(List<Long> ids) {
        return userRepository.findAllById(ids);
    }

    // Get users by project id
    public List<User> getUsersByProjectId(Long projectId) {
        return userRepository.findByProjects_Id(projectId);
    }

    // Get user by username
    public Optional<User> findByUsername(String username) {
        return userRepository.findByUsername(username);
    }

    // Get current user
    @Transactional(readOnly = true)
    public User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new UnauthorizedException("No authenticated user found");
        }
        
        return userRepository.findByUsername(authentication.getName())
            .orElseThrow(() -> new UnauthorizedException("User not found"));
    }

    // Get all users
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    // Get user dto
    public UserResponseDTO getUserDTO(Long id) {
        return userMapper.toResponseDTO(getUserById(id).orElseThrow(() -> new ResourceNotFoundException("User not found")));
    }

    // Get all users dto
    public List<UserResponseDTO> getAllUsersDTO() {
        return userMapper.toResponseDTOs(getAllUsers());
    }

    // Create user
    public void createUser (UserCreateDTO userCreateDTO) {
        User user = userMapper.toEntity(userCreateDTO);
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        userRepository.save(user);
    }

    // Update user
    public UserResponseDTO updateUser(Long id, UserUpdateDTO userUpdateDTO) {
        User user = userRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        userMapper.updateEntity(userUpdateDTO, user);
        userRepository.save(user);
        return userMapper.toResponseDTO(user);
    }

    // Reset password
    public String resetPassword(Long id) {
        User user = userRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("User not found"));
            String newPassword = RandomStringUtils.randomAlphanumeric(5);
            user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
        return newPassword;
    }

    // Delete user
    public String deleteUser(Long id) {
        userRepository.deleteById(id);
        return "User deleted successfully";
    }

    // Đổi pass sau khi xác nhận đúng pass hiện tại
    public void changePassword(ChangePasswordDTO request) {
        // Kiểm tra mật khẩu mới và xác nhận mật khẩu có khớp
        if (!request.getNewPassword().equals(request.getConfirmPassword())) {
            throw new InvalidPasswordException("New password and confirmation do not match");
        }
    
        // Lấy người dùng qua email
        User user = userRepository.findByEmail(request.getEmail())
            .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    
        // Kiểm tra mật khẩu hiện tại có đúng không
        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
            throw new InvalidPasswordException("Current password is incorrect");
        }
    
        // Kiểm tra mật khẩu mới không trùng mật khẩu hiện tại
        if (passwordEncoder.matches(request.getNewPassword(), user.getPassword())) {
            throw new InvalidPasswordException("New password cannot be the same as the current password");
        }
    
        // Cập nhật mật khẩu mới
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
    
        log.info("Password changed successfully for user: {}", user.getUsername());
    }
    

    public UserResponseDTO updateAvatar(Long userId, MultipartFile file) {
        // Validate file
        if (file.isEmpty()) {
            throw new InvalidFileException("Vui lòng chọn một ảnh");
        }
        
        // Validate file type
        String contentType = file.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            throw new InvalidFileException("Chỉ chấp nhận file ảnh");
        }
        
        // Get user
        User user = getUserById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy người dùng"));
            
        try {
            // Delete old avatar if exists
            if (user.getAvatarUrl() != null) {
                cloudinaryService.deleteImage(user.getAvatarUrl());
            }
            
            // Upload new avatar
            String avatarUrl = cloudinaryService.uploadImage(file);
            
            // Update user
            user.setAvatarUrl(avatarUrl);
            userRepository.save(user);
            
            return userMapper.toResponseDTO(user);
            
        } catch (Exception e) {
            throw new FileUploadException("Không thể tải lên ảnh. Vui lòng thử lại", e);
        }
    }

    public boolean isAdmin() {
        return getCurrentUser().getRole().equals(UserRole.ADMIN);
    }

}
