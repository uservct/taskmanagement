package com.nhom6.taskmanagement.service;

import java.io.IOException;
import java.util.Arrays;
import java.util.HashMap;
import java.util.Map;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.cloudinary.Cloudinary;
import com.nhom6.taskmanagement.exception.FileUploadException;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class CloudinaryService {
    
    private final Cloudinary cloudinary;
    
    public String uploadImage(MultipartFile file) {
        try {
            Map<String, Object> params = new HashMap<>();
            params.put("folder", "avatars");
            params.put("width", 300);
            params.put("height", 300);
            params.put("crop", "fill");
            
            Map result = cloudinary.uploader().upload(file.getBytes(), params);
            return result.get("secure_url").toString();
        } catch (IOException e) {
            log.error("Failed to upload image to Cloudinary: {}", e.getMessage());
            throw new FileUploadException("Could not upload image", e);
        }
    }
    
    public String uploadFile(MultipartFile file) {
        try {
            String originalFilename = file.getOriginalFilename();
            String fileExtension = originalFilename != null ? 
                originalFilename.substring(originalFilename.lastIndexOf(".")) : "";
                
            Map<String, Object> params = new HashMap<>();
            params.put("folder", "attachments");
            params.put("resource_type", "auto");
            params.put("public_id", "file_" + System.currentTimeMillis() + fileExtension);
            
            Map result = cloudinary.uploader().upload(file.getBytes(), params);
            String url = result.get("secure_url").toString();
            
            if (!url.endsWith(fileExtension)) {
                url += fileExtension;
            }
            
            return url;
        } catch (IOException e) {
            log.error("Failed to upload file to Cloudinary: {}", e.getMessage());
            throw new FileUploadException("Could not upload file", e);
        }
    }
    
    public void deleteImage(String imageUrl) {
        try {
            String[] urlParts = imageUrl.split("/");
            int uploadIndex = Arrays.asList(urlParts).indexOf("upload");
            if (uploadIndex >= 0 && urlParts.length > uploadIndex + 2) {
                String publicId = String.join("/", Arrays.copyOfRange(urlParts, uploadIndex + 2, urlParts.length));
                publicId = publicId.substring(0, publicId.lastIndexOf('.'));
                cloudinary.uploader().destroy(publicId, Map.of());
            }
        } catch (IOException e) {
            log.error("Failed to delete image from Cloudinary: {}", imageUrl, e);
        }
    }
    
    public void deleteFile(String fileUrl) {
        try {
            String[] urlParts = fileUrl.split("/");
            int uploadIndex = Arrays.asList(urlParts).indexOf("upload");
            if (uploadIndex >= 0 && urlParts.length > uploadIndex + 2) {
                String publicId = String.join("/", Arrays.copyOfRange(urlParts, uploadIndex + 2, urlParts.length));
                if (publicId.contains("?")) {
                    publicId = publicId.substring(0, publicId.indexOf("?"));
                }
                cloudinary.uploader().destroy(publicId, Map.of("resource_type", "raw"));
            }
        } catch (IOException e) {
            log.error("Failed to delete file from Cloudinary: {}", fileUrl, e);
        }
    }
} 