package com.nestly.backend.domain;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

public class StructureTemplate {

    private List<SectionConfig> activeSections = new ArrayList<>();

    public List<SectionConfig> getActiveSections() {
        return activeSections;
    }

    public void setActiveSections(List<SectionConfig> activeSections) {
        this.activeSections = activeSections;
    }

    public static class SectionConfig {
        private String type;
        private int order;
        private Map<String, Object> config = Map.of();

        public String getType() {
            return type;
        }

        public void setType(String type) {
            this.type = type;
        }

        public int getOrder() {
            return order;
        }

        public void setOrder(int order) {
            this.order = order;
        }

        public Map<String, Object> getConfig() {
            return config;
        }

        public void setConfig(Map<String, Object> config) {
            this.config = config;
        }
    }
}