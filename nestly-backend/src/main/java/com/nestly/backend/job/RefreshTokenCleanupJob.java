package com.nestly.backend.job;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import com.nestly.backend.service.RefreshTokenService;

@Component
public class RefreshTokenCleanupJob {

    private static final Logger log = LoggerFactory.getLogger(RefreshTokenCleanupJob.class);

    private final RefreshTokenService refreshTokenService;

    public RefreshTokenCleanupJob(RefreshTokenService refreshTokenService) {
        this.refreshTokenService = refreshTokenService;
    }

    @Scheduled(cron = "${nestly.refresh-token.cleanup-cron}")
    public void purgeExpiredTokens() {
        int removed = refreshTokenService.purgeExpired();
        log.info("Purged {} expired refresh tokens", removed);
    }
}
