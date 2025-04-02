//package com.rechargeflow.repository;
//
//import org.springframework.data.jpa.repository.JpaRepository;
//import com.rechargeflow.model.RechargeHistory;
//
//public interface RechargeHistoryRepository extends JpaRepository<RechargeHistory, Long> {
//    RechargeHistory findTopByUserPhoneNumberOrderByRechargeDateDesc(String phoneNumber);
//}

package com.rechargeflow.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import com.rechargeflow.model.RechargeHistory;
import java.time.LocalDateTime;
import java.util.List;

public interface RechargeHistoryRepository extends JpaRepository<RechargeHistory, Long> {
    RechargeHistory findTopByUserPhoneNumberOrderByRechargeDateDesc(String phoneNumber);

    @Query("SELECT rh FROM RechargeHistory rh WHERE rh.user.phoneNumber = :phoneNumber")
    List<RechargeHistory> findByUserPhoneNumber(String phoneNumber);

    @Query("SELECT rh FROM RechargeHistory rh WHERE rh.user.phoneNumber = :phoneNumber AND rh.rechargeDate BETWEEN :startDate AND :endDate")
    List<RechargeHistory> findByUserPhoneNumberAndRechargeDateBetween(String phoneNumber, LocalDateTime startDate, LocalDateTime endDate);
}