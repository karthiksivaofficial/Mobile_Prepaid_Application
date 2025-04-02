package com.rechargeflow.repository;

import com.rechargeflow.dto.SupportTicketDTO;
import com.rechargeflow.model.SupportTicket;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SupportRepo extends JpaRepository<SupportTicket, Long> {
    @Query("SELECT NEW com.rechargeflow.dto.SupportTicketDTO(" +
            "st.ticketId, " +
            "u.name, " +
            "u.email, " +
            "u.phoneNumber, " +
            "st.issueType, " +
            "st.description, " +
            "st.priority, " +
            "st.status, " +
            "st.createdAt) " +
            "FROM SupportTicket st " +
            "LEFT JOIN st.user u")
    List<SupportTicketDTO> getSupportTicketDetails();
}