//package com.rechargeflow.controller;
//
//import org.springframework.beans.factory.annotation.Autowired;
//import org.springframework.http.ResponseEntity;
//import org.springframework.web.bind.annotation.*;
//
//import com.rechargeflow.model.RechargeHistory;
//import com.rechargeflow.repository.RechargeHistoryRepository;
//
//@RestController
//@RequestMapping("/api/recharge-history")
//@CrossOrigin(origins = "http://localhost:63342")
//public class RechargeHistoryController {
//
//    @Autowired
//    private RechargeHistoryRepository rechargeHistoryRepository;
//
//    @GetMapping("/latest")
//    public ResponseEntity<RechargeDTO> getLatestRecharge(@RequestParam String phone) {
//        RechargeHistory latest = rechargeHistoryRepository.findTopByUserPhoneNumberOrderByRechargeDateDesc(phone);
//        if (latest != null) {
//            return ResponseEntity.ok(new RechargeDTO(latest.getPlan().getPlanName(), latest.getExpiryDate().toString()));
//        }
//        return ResponseEntity.notFound().build();
//    }
//}
//
//class RechargeDTO {
//    private String planName;
//    private String expiryDate;
//
//    public RechargeDTO(String planName, String expiryDate) {
//        this.planName = planName;
//        this.expiryDate = expiryDate;
//    }
//
//    public String getPlanName() { return planName; }
//    public String getExpiryDate() { return expiryDate; }
//}
package com.rechargeflow.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.rechargeflow.model.RechargeHistory;
import com.rechargeflow.repository.RechargeHistoryRepository;
import org.springframework.format.annotation.DateTimeFormat;
import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/recharge-history")
@CrossOrigin(origins = "http://localhost:63342", allowCredentials = "true")
public class RechargeHistoryController {

    @Autowired
    private RechargeHistoryRepository rechargeHistoryRepository;

    @GetMapping("/latest")
    public ResponseEntity<RechargeDTO> getLatestRecharge(@RequestParam String phone) {
        RechargeHistory latest = rechargeHistoryRepository.findTopByUserPhoneNumberOrderByRechargeDateDesc(phone);
        if (latest != null) {
            return ResponseEntity.ok(new RechargeDTO(latest.getPlan().getPlanName(), latest.getExpiryDate().toString()));
        }
        return ResponseEntity.notFound().build();
    }

    @GetMapping
    public ResponseEntity<List<RechargeHistory>> getRechargeHistory(
            @RequestParam String phone,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate) {
        List<RechargeHistory> history;
        if (startDate != null && endDate != null) {
            history = rechargeHistoryRepository.findByUserPhoneNumberAndRechargeDateBetween(phone, startDate, endDate);
        } else {
            history = rechargeHistoryRepository.findByUserPhoneNumber(phone);
        }
        return ResponseEntity.ok(history);
    }
}

class RechargeDTO {
    private String planName;
    private String expiryDate;

    public RechargeDTO(String planName, String expiryDate) {
        this.planName = planName;
        this.expiryDate = expiryDate;
    }

    public String getPlanName() { return planName; }
    public String getExpiryDate() { return expiryDate; }
}