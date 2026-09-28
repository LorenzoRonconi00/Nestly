package com.nestly.backend.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.util.Map;
import java.util.UUID;

@Entity
@Table(name = "sections")
public class Section {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "page_id", nullable = false)
    private UUID pageId;

    @Column(nullable = false)
    private SectionType type;

    @Column(name = "section_order", nullable = false)
    private int order;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(nullable = false)
    private Map<String, Object> data;

    protected Section() {
    }

    public Section(UUID pageId, SectionType type, int order, Map<String, Object> data) {
        this.pageId = pageId;
        this.type = type;
        this.order = order;
        this.data = data;
    }

    public void setData(Map<String, Object> data) {
        this.data = data;
    }

    public UUID getId() {
        return id;
    }

    public UUID getPageId() {
        return pageId;
    }

    public SectionType getType() {
        return type;
    }

    public int getOrder() {
        return order;
    }

    public Map<String, Object> getData() {
        return data;
    }
}