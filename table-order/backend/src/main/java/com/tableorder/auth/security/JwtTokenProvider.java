package com.tableorder.auth.security;

import com.tableorder.common.dto.UserPrincipal;
import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;

@Component
public class JwtTokenProvider {

    private final SecretKey key;
    private final long accessExpiration;
    private final long refreshExpiration;

    public JwtTokenProvider(
            @Value("${jwt.secret}") String secret,
            @Value("${jwt.access-expiration}") long accessExpiration,
            @Value("${jwt.refresh-expiration}") long refreshExpiration) {
        this.key = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
        this.accessExpiration = accessExpiration;
        this.refreshExpiration = refreshExpiration;
    }

    public String generateAccessToken(UserPrincipal principal) {
        Date now = new Date();
        Date expiry = new Date(now.getTime() + accessExpiration);

        JwtBuilder builder = Jwts.builder()
                .subject(String.valueOf(principal.getId()))
                .claim("storeId", principal.getStoreId())
                .claim("role", principal.getRole())
                .issuedAt(now)
                .expiration(expiry)
                .signWith(key);

        if (principal.getTableNumber() != null) {
            builder.claim("tableNumber", principal.getTableNumber());
        }

        return builder.compact();
    }

    public String generateRefreshToken(UserPrincipal principal) {
        Date now = new Date();
        Date expiry = new Date(now.getTime() + refreshExpiration);

        return Jwts.builder()
                .subject(String.valueOf(principal.getId()))
                .issuedAt(now)
                .expiration(expiry)
                .signWith(key)
                .compact();
    }

    public boolean validateToken(String token) {
        try {
            Jwts.parser().verifyWith(key).build().parseSignedClaims(token);
            return true;
        } catch (JwtException | IllegalArgumentException e) {
            return false;
        }
    }

    public UserPrincipal getUserPrincipal(String token) {
        Claims claims = Jwts.parser().verifyWith(key).build()
                .parseSignedClaims(token).getPayload();

        Integer tableNumber = claims.get("tableNumber", Integer.class);

        return UserPrincipal.builder()
                .id(Long.parseLong(claims.getSubject()))
                .storeId(claims.get("storeId", Long.class))
                .role(claims.get("role", String.class))
                .tableNumber(tableNumber)
                .build();
    }
}
