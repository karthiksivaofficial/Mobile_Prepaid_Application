package com.rechargeflow.dto;

import com.rechargeflow.model.SupportTicket;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class SupportTicketDTO {
    private Long ticketId;
    private String customerName;
    private String customerEmail;
    private String customerPhone;
    private SupportTicket.IssueType issueType;
    private String description;
    private SupportTicket.Priority priority;
    private SupportTicket.TicketStatus status;
    private LocalDateTime createdDate;
}
