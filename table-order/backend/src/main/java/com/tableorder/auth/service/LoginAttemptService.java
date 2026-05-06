package com.tableorder.auth.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class LoginAttemptService {

    private final ConcurrentHashMap<String, AttemptInfo> attempts = new ConcurrentHashMap<>();
    private final int maxAttempts;
    private final int blockDurationMinutes;

    public LoginAttemptService(
            @Value("${login.max-attempts}") int maxAttempts,
            @Value("${login.block-duration-minutes}") int blockDurationMinutes) {
        this.maxAttempts = maxAttempts;
        this.blockDurationMinutes = blockDurationMinutes;
    }

    public boolean isBlocked(String key) {
        AttemptInfo info = attempts.get(key);
        if (info == null) return false;

        if (info.count >= maxAttempts) {
            if (LocalDateTime.now().isBefore(info.blockedUntil)) {
                return true;
            }
            // 차단 시간 경과 → 리셋
            attempts.remove(key);
            return false;
        }
        return false;
    }

    public void recordFailedAttempt(String key) {
        attempts.compute(key, (k, info) -> {
            if (info == null) {
                info = new AttemptInfo();
            }
            info.count++;
            info.lastAttempt = LocalDateTime.now();
            if (info.count >= maxAttempts) {
                info.blockedUntil = LocalDateTime.now().plusMinutes(blockDurationMinutes);
            }
            return info;
        });
    }

    public void resetAttempts(String key) {
        attempts.remove(key);
    }

    private static class AttemptInfo {
        int count = 0;
        LocalDateTime lastAttempt;
        LocalDateTime blockedUntil;
    }
}
