package com.tableorder.table.service;

import com.tableorder.common.exception.ResourceNotFoundException;
import com.tableorder.table.entity.TableSession;
import com.tableorder.table.repository.TableSessionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class TableSessionService {

    private final TableSessionRepository tableSessionRepository;

    @Transactional
    public TableSession getOrCreateSession(Long tableId, Long storeId) {
        return tableSessionRepository.findByTableIdAndStatus(tableId, TableSession.SessionStatus.ACTIVE)
                .orElseGet(() -> tableSessionRepository.save(
                        TableSession.builder()
                                .tableId(tableId)
                                .storeId(storeId)
                                .build()
                ));
    }

    @Transactional(readOnly = true)
    public Optional<TableSession> getCurrentSession(Long tableId) {
        return tableSessionRepository.findByTableIdAndStatus(tableId, TableSession.SessionStatus.ACTIVE);
    }

    @Transactional
    public TableSession completeSession(Long tableId) {
        TableSession session = tableSessionRepository.findByTableIdAndStatus(
                        tableId, TableSession.SessionStatus.ACTIVE)
                .orElseThrow(() -> new ResourceNotFoundException("해당 테이블에 활성 세션이 없습니다"));

        session.complete();
        return tableSessionRepository.save(session);
    }
}
