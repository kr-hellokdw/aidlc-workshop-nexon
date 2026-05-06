package com.tableorder.sse.service;

import com.tableorder.sse.SseEventType;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Async;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CopyOnWriteArrayList;

@Slf4j
@Service
public class SseService {

    private final Map<Long, CopyOnWriteArrayList<SseEmitter>> emitterMap = new ConcurrentHashMap<>();
    private final long timeout;

    public SseService(@Value("${sse.timeout}") long timeout) {
        this.timeout = timeout;
    }

    public SseEmitter subscribe(Long storeId) {
        SseEmitter emitter = new SseEmitter(timeout);

        emitterMap.computeIfAbsent(storeId, k -> new CopyOnWriteArrayList<>()).add(emitter);

        emitter.onCompletion(() -> removeEmitter(storeId, emitter));
        emitter.onTimeout(() -> removeEmitter(storeId, emitter));
        emitter.onError(e -> removeEmitter(storeId, emitter));

        // 초기 연결 확인 이벤트
        try {
            emitter.send(SseEmitter.event()
                    .name("CONNECTED")
                    .data(Map.of("message", "SSE connected", "timestamp", LocalDateTime.now().toString())));
        } catch (IOException e) {
            removeEmitter(storeId, emitter);
        }

        return emitter;
    }

    @Async
    public void publishEvent(Long storeId, SseEventType type, Object data) {
        CopyOnWriteArrayList<SseEmitter> emitters = emitterMap.get(storeId);
        if (emitters == null || emitters.isEmpty()) return;

        SseEmitter.SseEventBuilder event = SseEmitter.event()
                .name(type.name())
                .data(data);

        List<SseEmitter> deadEmitters = new java.util.ArrayList<>();

        for (SseEmitter emitter : emitters) {
            try {
                emitter.send(event);
            } catch (Exception e) {
                deadEmitters.add(emitter);
            }
        }

        emitters.removeAll(deadEmitters);
    }

    @Scheduled(fixedRateString = "${sse.heartbeat-interval}")
    public void sendHeartbeat() {
        Map<String, String> heartbeatData = Map.of("timestamp", LocalDateTime.now().toString());

        emitterMap.forEach((storeId, emitters) -> {
            List<SseEmitter> deadEmitters = new java.util.ArrayList<>();

            for (SseEmitter emitter : emitters) {
                try {
                    emitter.send(SseEmitter.event()
                            .name(SseEventType.HEARTBEAT.name())
                            .data(heartbeatData));
                } catch (Exception e) {
                    deadEmitters.add(emitter);
                }
            }

            emitters.removeAll(deadEmitters);
        });
    }

    private void removeEmitter(Long storeId, SseEmitter emitter) {
        CopyOnWriteArrayList<SseEmitter> emitters = emitterMap.get(storeId);
        if (emitters != null) {
            emitters.remove(emitter);
            if (emitters.isEmpty()) {
                emitterMap.remove(storeId);
            }
        }
    }
}
