package com.rechargeflow.controller;

import com.rechargeflow.dto.*;
import com.rechargeflow.model.Category;
import com.rechargeflow.model.RechargePlan;
import com.rechargeflow.model.User;
import com.rechargeflow.model.UserRegister;
import com.rechargeflow.repository.PlanRepo;
import com.rechargeflow.repository.UserRepo;
import com.rechargeflow.service.CategoryService; // New import
import com.rechargeflow.service.PlanService;
import com.rechargeflow.service.SupportService;
import com.rechargeflow.service.TransactionService;
import com.rechargeflow.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "http://localhost:63342", allowCredentials = "true")
public class UserController {
    @Autowired
    private UserService userService;
    @Autowired
    private PlanService planService;
    @Autowired
    private TransactionService transactionService;
    @Autowired
    private SupportService supportService;
    @Autowired
    private CategoryService categoryService; // New autowired service
    @Autowired
    private UserRepo userRepo;
    @Autowired
    private PlanRepo planRepo;

    // Existing endpoints unchanged until here...

    @GetMapping("/getPage")
    public String getPage() {
        return "redirect:http://localhost:63342/Mobile%20Prepaid/User/Html_files/index.html";
    }

    @GetMapping("/user")
    public ResponseEntity<List<UserDetailsDTO>> getUserDetails() {
        List<UserDetailsDTO> details = userService.getUser();
        return ResponseEntity.ok(details);
    }

    @PutMapping("/user")
    public ResponseEntity<String> updateUser(@RequestBody statusUpdateDTO statusUpdateDTO) {
        try {
            userService.updateStatus(statusUpdateDTO.getStatus(), statusUpdateDTO.getNumber());
            return ResponseEntity.ok("Status updated successfully.");
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/getuser")
    public ResponseEntity<User> getUser(@RequestParam("phone") String phoneNumber) {
        User user = userService.findByPhoneNumber(phoneNumber);
        if (user != null) {
            return ResponseEntity.ok(user);
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/getAdmin")
    public ResponseEntity<User> getAdmin(@RequestParam("phone") String phoneNumber) {
        User user = userService.findByPhoneNumber(phoneNumber);
        if (user != null && user.getRole() == User.Role.ADMIN) {
            return ResponseEntity.ok(user);
        }
        return ResponseEntity.notFound().build();
    }

    @PutMapping("/update")
    public ResponseEntity<String> updateUser(@RequestBody User user) {
        User existingUser = userService.findByPhoneNumber(user.getPhoneNumber());
        if (existingUser == null) {
            return ResponseEntity.status(404).body("User not found");
        }
        if (!user.getEmail().matches("^[A-Za-z0-9+_.-]+@(.+)$")) {
            return ResponseEntity.badRequest().body("Invalid email format");
        }
        existingUser.setEmail(user.getEmail());
        userRepo.save(existingUser);
        return ResponseEntity.ok("User updated successfully");
    }

    @GetMapping("/plans")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<PlanDetailsDTO>> getPlanDetails() {
        List<PlanDetailsDTO> planDetails = planService.getPlans();
        return ResponseEntity.ok(planDetails);
    }

    @PutMapping("/plans")
    public ResponseEntity<String> updatePlan(@RequestBody PlanDetailsDTO planDetailsDTO) {
        try {
            planService.updatePlan(planDetailsDTO);
            return ResponseEntity.ok("Plan updated successfully.");
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/plans")
    public ResponseEntity<String> addPlan(@RequestBody RechargePlan rechargePlan) {
        try {
            planService.addPlan(rechargePlan);
            return ResponseEntity.ok("Plan added successfully.");
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @DeleteMapping("/plans")
    public ResponseEntity<String> deletePlan(@RequestBody Map<String, Long> request) {
        Long planId = request.get("planId");
        planService.deletePlan(planId);
        return ResponseEntity.ok("Plan deleted successfully.");
    }

    @GetMapping("plans/all")
    public ResponseEntity<List<RechargePlan>> getAllPlans() {
        List<RechargePlan> plans = planRepo.findAll();
        return ResponseEntity.ok(plans);
    }

    @GetMapping("/transactions")
    public ResponseEntity<List<TransactionDetailsDTO>> getTransactionDetails() {
        List<TransactionDetailsDTO> transaction = transactionService.getTransactionDetails();
        return ResponseEntity.ok(transaction);
    }

    @GetMapping("/support")
    public ResponseEntity<List<SupportTicketDTO>> getSupportDetails() {
        return ResponseEntity.ok(supportService.getSupportDetails());
    }

    @GetMapping("/getusers")
    public ResponseEntity<UserDTO> getUsers(@RequestParam String phone) {
        User user = userService.findByPhoneNumber(phone);
        if (user != null) {
            return ResponseEntity.ok(new UserDTO(user.getName(), user.getEmail(), user.getPhoneNumber()));
        }
        return ResponseEntity.notFound().build();
    }

    // New Category Endpoints
    @GetMapping("/categories")
    @PreAuthorize("hasRole('ADMIN')") // Restrict to admins
    public ResponseEntity<List<Category>> getCategories() {
        List<Category> categories = categoryService.getAllCategories();
        return ResponseEntity.ok(categories);
    }

    @PostMapping("/categories")
    @PreAuthorize("hasRole('ADMIN')") // Restrict to admins
    public ResponseEntity<String> addCategory(@RequestBody Category category) {
        try {
            categoryService.addCategory(category);
            return ResponseEntity.ok("Category added successfully.");
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping("/categories")
    @PreAuthorize("hasRole('ADMIN')") // Restrict to admins
    public ResponseEntity<String> updateCategory(@RequestBody CategoryUpdateDTO categoryUpdateDTO) {
        try {
            categoryService.updateCategory(categoryUpdateDTO.getName(), categoryUpdateDTO.getStatus());
            return ResponseEntity.ok("Category status updated successfully.");
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // Inner DTO classes unchanged...
    class UserDTO {
        private String name;
        private String email;
        private String phoneNumber;

        public UserDTO(String name, String email, String phoneNumber) {
            this.name = name;
            this.email = email;
            this.phoneNumber = phoneNumber;
        }

        public String getName() { return name; }
        public String getEmail() { return email; }
        public String getPhoneNumber() { return phoneNumber; }
        public void setEmail(String email) { this.email = email; }
    }

    // New DTO for category update
    static class CategoryUpdateDTO {
        private String name;
        private Category.CategoryStatus status;

        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        public Category.CategoryStatus getStatus() { return status; }
        public void setStatus(Category.CategoryStatus status) { this.status = status; }
    }
}