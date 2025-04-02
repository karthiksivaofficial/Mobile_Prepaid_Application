//package com.rechargeflow.controller;
//
//import com.rechargeflow.repository.PlanRepo;
//import com.rechargeflow.repository.UserRepo;
//import com.rechargeflow.service.UserService;
//import org.springframework.beans.factory.annotation.Autowired;
//import org.springframework.http.ResponseEntity;
//import org.springframework.web.bind.annotation.*;
//
//import com.rechargeflow.model.AutoPay;
//import com.rechargeflow.model.RechargePlan;
//import com.rechargeflow.model.User;
//import com.rechargeflow.repository.AutoPayRepository;
//import com.rechargeflow.repository.PlanRepo;
//import com.rechargeflow.repository.UserRepo;
//
//import java.time.LocalDateTime;
//
//@RestController
//@RequestMapping("/api/autopay")
//@CrossOrigin(origins = "http://localhost:63342")
//public class AutoPayController {
//
//    @Autowired
//    private AutoPayRepository autoPayRepository;
//
//    @Autowired
//    private UserRepo userRepository;
//
//    @Autowired
//    private PlanRepo rechargePlanRepository;
//
//    @Autowired
//    private UserService userService;
//
//    @PostMapping("/enable")
//    public ResponseEntity<Void> enableAutoPay(@RequestBody AutoPayDTO autopayData) {
//        User user = userService.findByPhoneNumber(autopayData.getPhoneNumber());
//        RechargePlan plan = rechargePlanRepository.findById((long) autopayData.getPlanId()).orElse(null);
//        if (user != null && plan != null) {
//            AutoPay autoPay = new AutoPay();
//            autoPay.setUser(user);
//            autoPay.setPlan(plan);
//            autoPay.setPaymentMethod(AutoPay.PaymentMethod.valueOf(autopayData.getPaymentMethod()));
//            autoPay.setStatus(AutoPay.AutoPayStatus.valueOf(autopayData.getStatus()));
//            autoPay.setNextRechargeDate(LocalDateTime.now().plusDays(plan.getValidity()));
//            autoPay.setFailureCount(0);
//            autoPayRepository.save(autoPay);
//            return ResponseEntity.ok().build();
//        }
//        return ResponseEntity.badRequest().build();
//    }
//}
//
//class AutoPayDTO {
//    private String phoneNumber;
//    private int planId;
//    private String paymentMethod;
//    private String status;
//
//    public String getPhoneNumber() { return phoneNumber; }
//    public void setPhoneNumber(String phoneNumber) { this.phoneNumber = phoneNumber; }
//    public int getPlanId() { return planId; }
//    public void setPlanId(int planId) { this.planId = planId; }
//    public String getPaymentMethod() { return paymentMethod; }
//    public void setPaymentMethod(String paymentMethod) { this.paymentMethod = paymentMethod; }
//    public String getStatus() { return status; }
//    public void setStatus(String status) { this.status = status; }
//}
package com.rechargeflow.controller;

import com.rechargeflow.repository.PlanRepo;
import com.rechargeflow.repository.UserRepo;
import com.rechargeflow.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.rechargeflow.model.AutoPay;
import com.rechargeflow.model.RechargePlan;
import com.rechargeflow.model.User;
import com.rechargeflow.repository.AutoPayRepository;
import java.time.LocalDateTime;

@RestController
@RequestMapping("/api/autopay")
@CrossOrigin(origins = "http://localhost:63342", allowCredentials = "true")
public class AutoPayController {

    @Autowired
    private AutoPayRepository autoPayRepository;

    @Autowired
    private UserRepo userRepository;

    @Autowired
    private PlanRepo rechargePlanRepository;

    @Autowired
    private UserService userService;

    @PostMapping("/enable")
    public ResponseEntity<Void> enableAutoPay(@RequestBody AutoPayDTO autopayData) {
        User user = userService.findByPhoneNumber(autopayData.getPhoneNumber());
        RechargePlan plan = rechargePlanRepository.findById((long) autopayData.getPlanId()).orElse(null);
        if (user != null && plan != null) {
            AutoPay existingAutoPay = autoPayRepository.findByUserPhoneNumber(autopayData.getPhoneNumber());
            AutoPay autoPay;
            if (existingAutoPay != null) {
                autoPay = existingAutoPay;
                autoPay.setPlan(plan);
                autoPay.setCardNumber(autopayData.getCardNumber());
                autoPay.setPaymentMethod(AutoPay.PaymentMethod.valueOf(autopayData.getPaymentMethod()));
                autoPay.setStatus(AutoPay.AutoPayStatus.valueOf(autopayData.getStatus()));
            } else {
                autoPay = new AutoPay();
                autoPay.setUser(user);
                autoPay.setPlan(plan);
                autoPay.setCardNumber(autopayData.getCardNumber());
                autoPay.setPaymentMethod(AutoPay.PaymentMethod.valueOf(autopayData.getPaymentMethod()));
                autoPay.setStatus(AutoPay.AutoPayStatus.valueOf(autopayData.getStatus()));
                autoPay.setNextRechargeDate(LocalDateTime.now().plusDays(plan.getValidity()));
                autoPay.setFailureCount(0);
            }
            autoPayRepository.save(autoPay);
            return ResponseEntity.ok().build();
        }
        return ResponseEntity.badRequest().build();
    }

    @GetMapping
    public ResponseEntity<AutoPay> getAutoPayDetails(@RequestParam String phone) {
        AutoPay autoPay = autoPayRepository.findByUserPhoneNumber(phone);
        if (autoPay != null) {
            return ResponseEntity.ok(autoPay);
        }
        return ResponseEntity.notFound().build();
    }

    @PutMapping("/update-card")
    public ResponseEntity<Void> updateCard(@RequestParam String phone, @RequestBody CardUpdateDTO cardUpdate) {
        AutoPay autoPay = autoPayRepository.findByUserPhoneNumber(phone);
        if (autoPay != null) {
            autoPay.setCardNumber(cardUpdate.getCardNumber());
            autoPayRepository.save(autoPay);
            return ResponseEntity.ok().build();
        }
        return ResponseEntity.notFound().build();
    }

    @PutMapping("/disable")
    public ResponseEntity<Void> disableAutoPay(@RequestParam String phone) {
        AutoPay autoPay = autoPayRepository.findByUserPhoneNumber(phone);
        if (autoPay != null) {
            autoPay.setStatus(AutoPay.AutoPayStatus.INACTIVE);
            autoPayRepository.save(autoPay);
            return ResponseEntity.ok().build();
        }
        return ResponseEntity.notFound().build();
    }
}

class AutoPayDTO {
    private String phoneNumber;
    private int planId;
    private String paymentMethod;
    private String status;
    private String cardNumber;

    public String getPhoneNumber() { return phoneNumber; }
    public void setPhoneNumber(String phoneNumber) { this.phoneNumber = phoneNumber; }
    public int getPlanId() { return planId; }
    public void setPlanId(int planId) { this.planId = planId; }
    public String getPaymentMethod() { return paymentMethod; }
    public void setPaymentMethod(String paymentMethod) { this.paymentMethod = paymentMethod; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getCardNumber() { return cardNumber; }
    public void setCardNumber(String cardNumber) { this.cardNumber = cardNumber; }
}

class CardUpdateDTO {
    private String cardNumber;
    public String getCardNumber() { return cardNumber; }
    public void setCardNumber(String cardNumber) { this.cardNumber = cardNumber; }
}