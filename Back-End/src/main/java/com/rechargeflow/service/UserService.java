package com.rechargeflow.service;

import com.rechargeflow.dto.UserDetailsDTO;
import com.rechargeflow.model.UserRegister;
import com.rechargeflow.model.User;
import com.rechargeflow.repository.UserRegisterRepo;
import com.rechargeflow.repository.UserRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class UserService {
    @Autowired
    private UserRepo userRepo;

    private BCryptPasswordEncoder encoder = new BCryptPasswordEncoder(10);
    @Autowired
    private UserRegisterRepo userRegisterRepo;


    public List<UserDetailsDTO> getUser() {
        return userRepo.findUserRechargeDetails();
    }

    public void updateStatus(String status, String number) {
        userRepo.findById(number).ifPresentOrElse(user -> {
            try {
                User.UserStatus status1 = User.UserStatus.valueOf(status.toUpperCase());
                user.setStatus(status1);
                userRepo.save(user);
            } catch (IllegalArgumentException e) {
                throw new RuntimeException("Invalid status: " + status);
            }
        }, () -> {
            throw new RuntimeException("User not found with number: " + number);
        });
    }

    public User findByPhoneNumber(String phoneNumber) {
        return userRepo.findById(phoneNumber).orElse(null);
    }

    public User registerUser(User user) {
        user.setPassword(encoder.encode(user.getPassword()));
        return userRepo.save(user);
    }
}