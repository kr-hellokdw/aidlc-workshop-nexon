package com.tableorder.auth.service;

import com.tableorder.auth.dto.AdminLoginRequest;
import com.tableorder.auth.dto.TableLoginRequest;
import com.tableorder.auth.dto.TokenResponse;
import com.tableorder.auth.entity.Admin;
import com.tableorder.auth.repository.AdminRepository;
import com.tableorder.auth.security.JwtTokenProvider;
import com.tableorder.common.dto.UserPrincipal;
import com.tableorder.table.entity.RestaurantTable;
import com.tableorder.table.repository.TableRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.LockedException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final AdminRepository adminRepository;
    private final TableRepository tableRepository;
    private final JwtTokenProvider jwtTokenProvider;
    private final PasswordEncoder passwordEncoder;
    private final LoginAttemptService loginAttemptService;

    public TokenResponse authenticateAdmin(AdminLoginRequest request) {
        String attemptKey = request.getStoreId() + ":" + request.getUsername();

        if (loginAttemptService.isBlocked(attemptKey)) {
            throw new LockedException("로그인 시도 횟수를 초과했습니다. 15분 후 다시 시도해주세요.");
        }

        Admin admin = adminRepository.findByStoreIdAndUsername(request.getStoreId(), request.getUsername())
                .orElseThrow(() -> {
                    loginAttemptService.recordFailedAttempt(attemptKey);
                    return new BadCredentialsException("잘못된 인증 정보입니다");
                });

        if (!passwordEncoder.matches(request.getPassword(), admin.getPassword())) {
            loginAttemptService.recordFailedAttempt(attemptKey);
            throw new BadCredentialsException("잘못된 인증 정보입니다");
        }

        loginAttemptService.resetAttempts(attemptKey);

        UserPrincipal principal = UserPrincipal.builder()
                .id(admin.getId())
                .storeId(admin.getStoreId())
                .role("ADMIN")
                .build();

        return TokenResponse.builder()
                .accessToken(jwtTokenProvider.generateAccessToken(principal))
                .refreshToken(jwtTokenProvider.generateRefreshToken(principal))
                .role("ADMIN")
                .storeId(admin.getStoreId())
                .build();
    }

    public TokenResponse authenticateTable(TableLoginRequest request) {
        String attemptKey = request.getStoreId() + ":table:" + request.getTableNumber();

        if (loginAttemptService.isBlocked(attemptKey)) {
            throw new LockedException("로그인 시도 횟수를 초과했습니다. 15분 후 다시 시도해주세요.");
        }

        RestaurantTable table = tableRepository.findByStoreIdAndTableNumber(
                        request.getStoreId(), request.getTableNumber())
                .orElseThrow(() -> {
                    loginAttemptService.recordFailedAttempt(attemptKey);
                    return new BadCredentialsException("잘못된 인증 정보입니다");
                });

        if (!passwordEncoder.matches(request.getPassword(), table.getPassword())) {
            loginAttemptService.recordFailedAttempt(attemptKey);
            throw new BadCredentialsException("잘못된 인증 정보입니다");
        }

        loginAttemptService.resetAttempts(attemptKey);

        UserPrincipal principal = UserPrincipal.builder()
                .id(table.getId())
                .storeId(table.getStoreId())
                .role("TABLE")
                .tableNumber(table.getTableNumber())
                .build();

        return TokenResponse.builder()
                .accessToken(jwtTokenProvider.generateAccessToken(principal))
                .refreshToken(jwtTokenProvider.generateRefreshToken(principal))
                .role("TABLE")
                .storeId(table.getStoreId())
                .build();
    }
}
