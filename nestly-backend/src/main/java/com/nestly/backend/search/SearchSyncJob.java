package com.nestly.backend.search;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
public class SearchSyncJob {

    private static final Logger log = LoggerFactory.getLogger(SearchSyncJob.class);

    private final SearchIndexer indexer;

    public SearchSyncJob(SearchIndexer indexer) {
        this.indexer = indexer;
    }

    @Scheduled(
            initialDelayString = "${nestly.search.sync-interval-ms}",
            fixedDelayString = "${nestly.search.sync-interval-ms}")
    public void sync() {
        try {
            indexer.ensureIndex();
            int processed;
            do {
                processed = indexer.processBatch();
            } while (processed == SearchIndexer.BATCH_SIZE);
        } catch (RuntimeException ex) {
            // The queue is untouched when a batch fails, so the next run retries it
            log.warn("Search synchronization failed, will retry: {}", ex.toString());
        }
    }
}
