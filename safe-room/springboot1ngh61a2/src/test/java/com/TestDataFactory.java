package com;

import com.entity.UserEntity;

/**
 * Test data factory for creating test entities with fluent API
 */
public class TestDataFactory {

    public static UserBuilder user() {
        return new UserBuilder();
    }

    public static class UserBuilder {
        private String testClass;
        private String username;
        private String password;
        private String passwordHash;
        private String role;
        private Integer status;
        private String email;
        private String phone;
        private String name;

        public UserBuilder testClass(String testClass) {
            this.testClass = testClass;
            return this;
        }

        public UserBuilder username(String username) {
            this.username = username;
            return this;
        }

        public UserBuilder password(String password) {
            this.password = password;
            return this;
        }

        public UserBuilder passwordHash(String passwordHash) {
            this.passwordHash = passwordHash;
            return this;
        }

        public UserBuilder role(String role) {
            this.role = role;
            return this;
        }

        public UserBuilder status(Integer status) {
            this.status = status;
            return this;
        }

        public UserBuilder email(String email) {
            this.email = email;
            return this;
        }

        public UserBuilder phone(String phone) {
            this.phone = phone;
            return this;
        }

        public UserBuilder name(String name) {
            this.name = name;
            return this;
        }

        public UserEntity build() {
            UserEntity user = new UserEntity();
            user.setUsername(username);
            user.setPassword(passwordHash);
            user.setRole(role);
            user.setStatus(status != null ? status : 0);
            return user;
        }
    }
}
