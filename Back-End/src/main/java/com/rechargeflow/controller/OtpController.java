package com.rechargeflow.controller;


import com.rechargeflow.service.OtpService;
import com.rechargeflow.service.TwilioService;
import com.rechargeflow.repository.UserRepo;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import java.util.*;

@RestController
@RequestMapping("/api/otp")
@CrossOrigin(origins = "http://localhost:63342", allowCredentials = "true")
public class OtpController {
    private final OtpService otpService;
    private final TwilioService twilioService;
    private final UserRepo userRepo;
    private static final String SECRET_KEY = "mysecretkey1234567890abcdefghijklmnopqrstuvwxyz123456";
    private static final Logger logger = LoggerFactory.getLogger(OtpController.class);
    private static final Set<String> tokenBlacklist = new HashSet<>();
    private static final Map<String, String> refreshTokenStore = new HashMap<>(); // In-memory store for demo

    public OtpController(OtpService otpService, TwilioService twilioService, UserRepo userRepo) {
        this.otpService = otpService;
        this.twilioService = twilioService;
        this.userRepo = userRepo;
        logger.info("OtpController initialized");
    }

    @PostMapping("/send")
    public ResponseEntity<Map<String, String>> sendOtp(@RequestBody Map<String, String> request) {
        logger.info("Received /send request: {}", request);
        logger.warn("phone number: {}", request.get("phoneNumber"));
        String phoneNumber = request.get("phoneNumber");
        if (phoneNumber == null || phoneNumber.trim().isEmpty()) {
            logger.warn("Phone number is null or empty");
            return ResponseEntity.badRequest().body(Map.of("error", "Phone number is required"));
        }
        String formattedPhone = otpService.formatPhoneNumber(phoneNumber);
        try {
            String otp = otpService.generateOtp(formattedPhone);
            twilioService.sendSMS(formattedPhone, "Your OTP is: " + otp);
            logger.info("OTP sent successfully to {}", formattedPhone);
            return ResponseEntity.ok(Map.of("message", "OTP sent successfully"));
        } catch (Exception e) {
            logger.error("Failed to send OTP", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to send OTP: " + e.getMessage()));
        }
    }

    @PostMapping("/verify")
    public ResponseEntity<Map<String, String>> verifyOtp(@RequestBody Map<String, String> request) {
        logger.info("Received /verify request: {}", request);
        String phoneNumber = request.get("phoneNumber");
        String otp = request.get("otp");
        if (phoneNumber == null || otp == null) {
            logger.warn("Phone number or OTP is null");
            return ResponseEntity.badRequest().body(Map.of("error", "Phone number and OTP are required"));
        }
        try {
            boolean isValid = otpService.validateOtp(phoneNumber, otp);
            logger.info("OTP validation result: {}", isValid);
            if (isValid) {
                String uniqueSalt = UUID.randomUUID().toString();
                String accessToken = Jwts.builder()
                        .setSubject(phoneNumber)
                        .setIssuedAt(new Date())
                        .setExpiration(new Date(System.currentTimeMillis() + 15 * 60 * 1000)) // 15 minutes
                        .claim("salt", uniqueSalt)
                        .signWith(SignatureAlgorithm.HS256, SECRET_KEY)
                        .compact();

                String refreshToken = UUID.randomUUID().toString();
                refreshTokenStore.put(refreshToken, phoneNumber); // Store refresh token

                logger.info("Access Token generated: {}", accessToken);
                logger.info("Refresh Token generated: {}", refreshToken);
                return ResponseEntity.ok(Map.of(
                        "message", "OTP verified successfully",
                        "accessToken", accessToken,
                        "refreshToken", refreshToken
                ));
            }
            logger.warn("Invalid or expired OTP for phone: {}", phoneNumber);
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Invalid or expired OTP"));
        } catch (Exception e) {
            logger.error("Error in verifyOtp", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Internal server error: " + e.getMessage()));
        }
    }

    @PostMapping("/refresh")
    public ResponseEntity<Map<String, String>> refreshToken(@RequestBody Map<String, String> request) {
        String refreshToken = request.get("refreshToken");
        logger.info("Received /refresh request with refreshToken: {}", refreshToken);

        if (refreshToken == null || !refreshTokenStore.containsKey(refreshToken)) {
            logger.warn("Invalid or unknown refresh token");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Invalid refresh token"));
        }

        String phoneNumber = refreshTokenStore.get(refreshToken);
        String uniqueSalt = UUID.randomUUID().toString();
        String newAccessToken = Jwts.builder()
                .setSubject(phoneNumber)
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + 15 * 60 * 1000)) // 15 minutes
                .claim("salt", uniqueSalt)
                .signWith(SignatureAlgorithm.HS256, SECRET_KEY)
                .compact();

        logger.info("New Access Token generated: {}", newAccessToken);
        return ResponseEntity.ok(Map.of(
                "message", "Token refreshed successfully",
                "accessToken", newAccessToken,
                "refreshToken", refreshToken // Return same refresh token
        ));
    }

    @GetMapping("/check-token")
    public ResponseEntity<Map<String, String>> checkToken(@RequestHeader(value = "Authorization", required = false) String authHeader) {
        logger.info("Received /check-token request with header: {}", authHeader);
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            logger.warn("No valid Bearer token provided");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "No valid token provided"));
        }

        String token = authHeader.substring(7);
        if (tokenBlacklist.contains(token)) {
            logger.warn("Token is blacklisted: {}", token);
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Token has been revoked"));
        }

        try {
            Jwts.parser().setSigningKey(SECRET_KEY).parseClaimsJws(token);
            logger.info("Token validated successfully");
            return ResponseEntity.ok(Map.of("message", "Token valid"));
        } catch (Exception e) {
            logger.error("Token validation failed", e);
            tokenBlacklist.add(token);
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Invalid or expired token"));
        }
    }

    @PostMapping("/logout")
    public ResponseEntity<Map<String, String>> logout(@RequestHeader(value = "Authorization", required = false) String authHeader,
                                                      @RequestBody Map<String, String> request) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            logger.warn("No valid Bearer token provided for logout");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", "No valid token provided"));
        }

        String token = authHeader.substring(7);
        String refreshToken = request.get("refreshToken");
        tokenBlacklist.add(token);
        if (refreshToken != null) {
            refreshTokenStore.remove(refreshToken);
        }
        logger.info("Token revoked successfully: {}", token);
        return ResponseEntity.ok(Map.of("message", "Logged out successfully"));
    }
}