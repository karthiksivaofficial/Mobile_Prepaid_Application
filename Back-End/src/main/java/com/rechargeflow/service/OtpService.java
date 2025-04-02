package com.rechargeflow.service;


// OtpService.java

import org.springframework.stereotype.Service;
import java.time.Instant;
import java.util.HashMap;
import java.util.Map;

@Service
public class OtpService {
    private final Map<String, OtpEntry> otpStorage = new HashMap<>();

    public String generateOtp(String phoneNumber) {
        String otp = String.format("%06d", (int)(Math.random() * 1000000));
        otpStorage.put(phoneNumber, new OtpEntry(otp, Instant.now().plusSeconds(300))); // 5-minute expiry
        return otp;
    }

    public boolean validateOtp(String phoneNumber, String otp) {
        String formattedPhone = formatPhoneNumber(phoneNumber);
        OtpEntry entry = otpStorage.get(formattedPhone);
        if (entry != null && entry.otp.equals(otp) && Instant.now().isBefore(entry.expiryTime)) {
            otpStorage.remove(formattedPhone);
            return true;
        }
        return false;
    }

    public String formatPhoneNumber(String phoneNumber) {
        if (!phoneNumber.startsWith("+")) {
            return "+91" + phoneNumber;
        }
        return phoneNumber;
    }

    private static class OtpEntry {
        String otp;
        Instant expiryTime;

        OtpEntry(String otp, Instant expiryTime) {
            this.otp = otp;
            this.expiryTime = expiryTime;
        }
    }
}