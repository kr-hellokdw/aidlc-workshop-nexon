package com.tableorder.table.entity;

import com.tableorder.common.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "table_session")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class TableSession extends BaseEntity {

    @Column(name = "table_id", nullable = false)
    private Long tableId;

    @Column(name = "store_id", nullable = false)
    private Long storeId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private SessionStatus status;

    @Column(name = "started_at", nullable = false)
    private LocalDateTime startedAt;

    @Column(name = "completed_at")
    private LocalDateTime completedAt;

    @Builder
    public TableSession(Long tableId, Long storeId) {
        this.tableId = tableId;
        this.storeId = storeId;
        this.status = SessionStatus.ACTIVE;
        this.startedAt = LocalDateTime.now();
    }

    public void complete() {
        this.status = SessionStatus.COMPLETED;
        this.completedAt = LocalDateTime.now();
    }

    public boolean isActive() {
        return this.status == SessionStatus.ACTIVE;
    }

    public enum SessionStatus {
        ACTIVE, COMPLETED
    }
}
