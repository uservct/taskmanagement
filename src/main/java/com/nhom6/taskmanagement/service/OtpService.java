package com.nhom6.taskmanagement.service;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

import org.apache.commons.lang3.RandomStringUtils;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import com.nhom6.taskmanagement.exception.InvalidOtpException;
import lombok.Data;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class OtpService {
    
    private final Map<String, OtpData> otpStorage = new ConcurrentHashMap<>();
    
    @Value("${app.otp.expiry-minutes:5}")
    private int otpExpiryMinutes;
    
    @Data
    private static class OtpData {
        private final String otp;
        private final LocalDateTime expiryTime;
        private int attempts;
    }
    
    public String generateOtp(String email) {
        String otp = RandomStringUtils.randomNumeric(6);
        otpStorage.put(email, new OtpData(otp, 
            LocalDateTime.now().plusMinutes(otpExpiryMinutes)));
        return otp;
    }
    
    public void verifyOtp(String email, String otp) {
        OtpData otpData = otpStorage.get(email);
        if (otpData == null) {
            throw new InvalidOtpException("OTP has expired or not generated");
        }
        
        // Check attempts
        if (otpData.getAttempts() >= 3) {
            otpStorage.remove(email);
            throw new InvalidOtpException("Too many invalid attempts. Please request a new OTP");
        }
        
        // Check expiry
        if (LocalDateTime.now().isAfter(otpData.getExpiryTime())) {
            otpStorage.remove(email);
            throw new InvalidOtpException("OTP has expired");
        }
        
        // Verify OTP
        if (!otpData.getOtp().equals(otp)) {
            otpData.setAttempts(otpData.getAttempts() + 1);
            throw new InvalidOtpException("Invalid OTP");
        }
        
        // Remove OTP after successful verification
        otpStorage.remove(email);
    }
}