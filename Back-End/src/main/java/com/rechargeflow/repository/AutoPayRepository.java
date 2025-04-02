//package com.rechargeflow.repository;
//
//import com.rechargeflow.model.AutoPay;
//import org.springframework.data.jpa.repository.JpaRepository;
//
//public interface AutoPayRepository extends JpaRepository<AutoPay, Long> {
//}
package com.rechargeflow.repository;

import com.rechargeflow.model.AutoPay;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface AutoPayRepository extends JpaRepository<AutoPay, Long> {
    @Query("SELECT ap FROM AutoPay ap WHERE ap.user.phoneNumber = :phoneNumber")
    AutoPay findByUserPhoneNumber(String phoneNumber);
}