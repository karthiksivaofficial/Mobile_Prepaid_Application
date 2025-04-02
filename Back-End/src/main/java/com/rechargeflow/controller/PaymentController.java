package com.rechargeflow.controller;

import com.rechargeflow.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.rechargeflow.model.Payment;
import com.rechargeflow.model.RechargeHistory;
import com.rechargeflow.model.User;
import com.rechargeflow.model.RechargePlan;
import com.rechargeflow.repository.PaymentRepository;
import com.rechargeflow.repository.RechargeHistoryRepository;
import com.rechargeflow.repository.UserRepo;
import com.rechargeflow.repository.PlanRepo;
import com.stripe.Stripe;
import com.stripe.model.PaymentIntent;
import com.stripe.param.PaymentIntentCreateParams;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/payments")
@CrossOrigin(origins = "http://localhost:63342", allowCredentials = "true")
public class PaymentController {

    @Autowired
    private PaymentRepository paymentRepository;

    @Autowired
    private RechargeHistoryRepository rechargeHistoryRepository;

    @Autowired
    private UserRepo userRepository;

    @Autowired
    private PlanRepo rechargePlanRepository;

    @Autowired
    private UserService userService;

    @PostMapping("/process")
    public ResponseEntity<String> processPayment(@RequestBody PaymentRequest paymentRequest) {
        try {
            User user = userService.findByPhoneNumber(paymentRequest.getPhoneNumber());
            if (user == null) {
                return ResponseEntity.badRequest().body("User not found");
            }

            RechargePlan plan = rechargePlanRepository.findById(paymentRequest.getPlanId()).orElse(null);
            if (plan == null) {
                return ResponseEntity.badRequest().body("Plan not found");
            }

            Payment payment = new Payment();
            payment.setUser(user);
            payment.setPlan(plan);
            payment.setAmount(paymentRequest.getAmount());
            payment.setDiscountAmount(paymentRequest.getDiscountAmount());
            payment.setPaymentMethod(Payment.PaymentMethod.valueOf(paymentRequest.getPaymentMethod()));
            payment.setTransactionStatus(Payment.TransactionStatus.SUCCESS);
            payment.setPaymentReference(paymentRequest.getPaymentReference());
            payment.setGatewayTransactionId(paymentRequest.getGatewayTransactionId());
            payment.setTransactionDate(LocalDateTime.now());
            paymentRepository.save(payment);

            RechargeHistory rechargeHistory = new RechargeHistory();
            rechargeHistory.setUser(user);
            rechargeHistory.setPlan(plan);
            rechargeHistory.setRechargeDate(LocalDateTime.now());
            rechargeHistory.setExpiryDate(LocalDateTime.now().plusDays(plan.getValidity()));
            rechargeHistoryRepository.save(rechargeHistory);

            return ResponseEntity.ok("Payment processed successfully");
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error processing payment: " + e.getMessage());
        }
    }

    @PostMapping("/create-payment-intent")
    public ResponseEntity<String> createPaymentIntent(@RequestBody PaymentRequest paymentRequest) {
        try {
            Stripe.apiKey = "sk_test_51R4yf8Dw8ZEpskb5FilUF3TMqI0bTnBMdxLR7YtulQLuPp37wECgGFqUkCb93xGj1EIJUypKSEY0tAPm1UtIyUaL00LP4U8XlA"; // Replace with your actual secret key

            User user = userService.findByPhoneNumber(paymentRequest.getPhoneNumber());
            if (user == null) {
                return ResponseEntity.badRequest().body("{\"error\":\"User not found\"}");
            }

            RechargePlan plan = rechargePlanRepository.findById(paymentRequest.getPlanId()).orElse(null);
            if (plan == null) {
                return ResponseEntity.badRequest().body("{\"error\":\"Plan not found\"}");
            }

            double finalAmount = paymentRequest.getAmount() - paymentRequest.getDiscountAmount();
            if (finalAmount <= 0) {
                return ResponseEntity.badRequest().body("{\"error\":\"Amount must be greater than zero\"}");
            }
            long amountInPaise = (long) (finalAmount * 100);
            if (amountInPaise < 50) { // Stripe minimum amount in INR
                return ResponseEntity.badRequest().body("{\"error\":\"Amount must be at least ₹0.50\"}");
            }

            Map<String, String> metadata = new HashMap<>();
            metadata.put("planId", paymentRequest.getPlanId().toString());
            metadata.put("phoneNumber", paymentRequest.getPhoneNumber());

            PaymentIntentCreateParams params = PaymentIntentCreateParams.builder()
                    .setAmount(amountInPaise)
                    .setCurrency("inr")
                    .setDescription("Recharge Plan: " + (plan.getPlanName() != null ? plan.getPlanName() : "Unnamed Plan"))
                    .addPaymentMethodType("card") // Only card is supported by Stripe India
                    .putAllMetadata(metadata)
                    .build();

            PaymentIntent paymentIntent = PaymentIntent.create(params);

            return ResponseEntity.ok("{\"clientSecret\":\"" + paymentIntent.getClientSecret() + "\"}");
        } catch (Exception e) {
            return ResponseEntity.status(500).body("{\"error\":\"Error creating payment intent: " + e.getMessage() + "\"}");
        }
    }

    @PostMapping("/confirm-payment")
    public ResponseEntity<String> confirmPayment(@RequestBody PaymentConfirmationRequest confirmationRequest) {
        try {
            User user = userService.findByPhoneNumber(confirmationRequest.getPhoneNumber());
            RechargePlan plan = rechargePlanRepository.findById(confirmationRequest.getPlanId()).orElse(null);

            Payment payment = new Payment();
            payment.setUser(user);
            payment.setPlan(plan);
            payment.setAmount(confirmationRequest.getAmount());
            payment.setDiscountAmount(confirmationRequest.getDiscountAmount());
            payment.setPaymentMethod(Payment.PaymentMethod.valueOf(confirmationRequest.getPaymentMethod()));
            payment.setTransactionStatus(Payment.TransactionStatus.SUCCESS);
            payment.setPaymentReference(confirmationRequest.getPaymentReference());
            payment.setGatewayTransactionId(confirmationRequest.getGatewayTransactionId());
            payment.setTransactionDate(LocalDateTime.now());
            paymentRepository.save(payment);

            RechargeHistory rechargeHistory = new RechargeHistory();
            rechargeHistory.setUser(user);
            rechargeHistory.setPlan(plan);
            rechargeHistory.setRechargeDate(LocalDateTime.now());
            rechargeHistory.setExpiryDate(LocalDateTime.now().plusDays(plan.getValidity()));
            rechargeHistoryRepository.save(rechargeHistory);

            return ResponseEntity.ok("{\"status\":\"Payment confirmed successfully\"}");
        } catch (Exception e) {
            return ResponseEntity.status(500).body("{\"error\":\"Error confirming payment: " + e.getMessage() + "\"}");
        }
    }
}

class PaymentRequest {
    private String phoneNumber;
    private Long planId;
    private Double amount;
    private Double discountAmount;
    private String paymentMethod;
    private String paymentReference;
    private String gatewayTransactionId;

    public String getPhoneNumber() { return phoneNumber; }
    public void setPhoneNumber(String phoneNumber) { this.phoneNumber = phoneNumber; }
    public Long getPlanId() { return planId; }
    public void setPlanId(Long planId) { this.planId = planId; }
    public Double getAmount() { return amount; }
    public void setAmount(Double amount) { this.amount = amount; }
    public Double getDiscountAmount() { return discountAmount; }
    public void setDiscountAmount(Double discountAmount) { this.discountAmount = discountAmount; }
    public String getPaymentMethod() { return paymentMethod; }
    public void setPaymentMethod(String paymentMethod) { this.paymentMethod = paymentMethod; }
    public String getPaymentReference() { return paymentReference; }
    public void setPaymentReference(String paymentReference) { this.paymentReference = paymentReference; }
    public String getGatewayTransactionId() { return gatewayTransactionId; }
    public void setGatewayTransactionId(String gatewayTransactionId) { this.gatewayTransactionId = gatewayTransactionId; }
}

class PaymentConfirmationRequest {
    private String phoneNumber;
    private Long planId;
    private Double amount;
    private Double discountAmount;
    private String paymentMethod;
    private String paymentReference;
    private String gatewayTransactionId;

    public String getPhoneNumber() { return phoneNumber; }
    public void setPhoneNumber(String phoneNumber) { this.phoneNumber = phoneNumber; }
    public Long getPlanId() { return planId; }
    public void setPlanId(Long planId) { this.planId = planId; }
    public Double getAmount() { return amount; }
    public void setAmount(Double amount) { this.amount = amount; }
    public Double getDiscountAmount() { return discountAmount; }
    public void setDiscountAmount(Double discountAmount) { this.discountAmount = discountAmount; }
    public String getPaymentMethod() { return paymentMethod; }
    public void setPaymentMethod(String paymentMethod) { this.paymentMethod = paymentMethod; }
    public String getPaymentReference() { return paymentReference; }
    public void setPaymentReference(String paymentReference) { this.paymentReference = paymentReference; }
    public String getGatewayTransactionId() { return gatewayTransactionId; }
    public void setGatewayTransactionId(String gatewayTransactionId) { this.gatewayTransactionId = gatewayTransactionId; }
}