---
title: 技术文档索引
version: v1.0.0
last_updated: 2025-11-16
status: active
category: technical
---

# 🔧 技术文档索引

> **版本**：v1.0.0
> **更新日期**：2025-11-16
> **适用范围**：技术文档导航
> **关键词**：技术文档, 系统架构, API, 数据库

---

## 📖 概述

### 技术栈概览

- **后端**：Spring Boot、Java 17、MySQL、Redis
- **前端**：Vue.js 3、Vite、TypeScript
- **部署**：Docker、Nginx、GitHub Actions

### 文档统计

| 分类 | 文档数量 | 占比 | 状态 |
|------|----------|------|------|
| 架构文档 | 2 | - | ✅ |
| API 文档 | 3 | - | ✅ |
| 数据库文档 | 2 | - | ✅ |
| 部署文档 | 19 | - | ✅ |
| **总计** | **54** | **100%** | |

---

## 🏗️ 架构文档

| 文档 | 状态 | 更新日期 | 说明 |
|------|------|----------|------|
| [CLOUD NATIVE](technical/architecture/CLOUD_NATIVE.md) | ✅ | 2025-11-16 | 本文档详细介绍健身房综合管理系统的云原生架构设计，包括微服务架构、容器编排、服务网格、API网关、数据管理、安全架构等核心组件，为构建可扩展、高可用、易维护的现代化应用系统提供指导。 |
| [ARCHITECTURE](technical/architecture/ARCHITECTURE.md) | ✅ | 2025-11-16 | - |

## 🔌 API 文档

| 文档 | 状态 | 更新日期 | 说明 |
|------|------|----------|------|
| [API SECURITY](technical/api/API_SECURITY.md) | ✅ | 2025-11-16 | - |
| [API REFERENCE](technical/api/API_REFERENCE.md) | ✅ | 2025-11-16 | 健身房综合管理系统提供 RESTful API 接口，支持前端应用、移动端以及第三方系统集成。所有接口遵循统一的响应格式和错误处理规范。 |
| [API](technical/api/API.md) | ✅ | 2025-11-16 | - |

## 🗄️ 数据库文档

| 文档 | 状态 | 更新日期 | 说明 |
|------|------|----------|------|
| [DATABASE SCHEMA](technical/database/DATABASE_SCHEMA.md) | ✅ | 2025-11-16 | - |
| [DATABASE](technical/database/DATABASE.md) | ✅ | 2025-11-16 | - |

## 🚀 部署文档

| 文档 | 状态 | 更新日期 | 说明 |
|------|------|----------|------|
| [VMWARE](technical/deployment/VMWARE.md) | ✅ | 2025-11-16 | 本文档详细介绍如何在VMware vSphere环境中部署健身房综合管理系统，包括环境准备、虚拟机模板创建、资源池配置、高可用设置、存储和网络配置等完整的虚拟化部署方案。 |
| [TROUBLESHOOTING](technical/deployment/TROUBLESHOOTING.md) | ✅ | 2025-11-16 | 本文档提供健身房综合管理系统常见问题的诊断和解决方法，包括故障排查流程、紧急处理预案、问题分类和解决方案。遵循系统化的故障排查方法可以快速定位和解决问题，减少系统 downtime。 |
| [SCRIPTS REFERENCE](technical/deployment/SCRIPTS_REFERENCE.md) | ✅ | 2025-11-16 | 本文档提供健身房综合管理系统所有运维脚本的完整参考，包括功能说明、使用示例、参数说明和注意事项。这些脚本涵盖了部署、测试、数据库管理、监控等各个方面，帮助运维人员高效执行日常任务。 |
| [文档标题](technical/deployment/README.md) | ✅ | 2025-11-16 | - |
| [PERFORMANCE TUNING](technical/deployment/PERFORMANCE_TUNING.md) | ✅ | 2025-11-16 | 本文档介绍健身房综合管理系统的性能调优策略，包括JVM参数优化、数据库连接池调优、数据库查询优化、缓存策略配置以及性能测试方法。通过系统性的性能调优，可以显著提升系统响应速度、吞吐量和资源利用率。 |
| [MONITORING SETUP](technical/deployment/MONITORING_SETUP.md) | ✅ | 2025-11-16 | 本指南详细介绍健身房管理系统监控系统的完整设置过程，包括 Prometheus、Grafana、Alertmanager 以及相关监控脚本的配置和部署。 |
| [MONITORING](technical/deployment/MONITORING.md) | ✅ | 2025-11-16 | 本文档介绍健身房综合管理系统的监控策略，包括监控指标定义、健康检查配置、资源监控、数据库监控、应用性能监控以及告警配置。完善的监控体系是保障系统稳定运行的关键。 |
| [LOGGING](technical/deployment/LOGGING.md) | ✅ | 2025-11-16 | 本文档介绍健身房综合管理系统的日志管理策略，包括日志文件位置、日志级别配置、日志轮转策略、日志查看和分析方法，以及基于日志的错误排查指南。 |
| [KVM](technical/deployment/KVM.md) | ✅ | 2025-11-16 | 本文档详细介绍如何在KVM (Kernel-based Virtual Machine) 环境中部署健身房综合管理系统，包括环境搭建、虚拟机管理、网络和存储配置、性能优化等完整的KVM虚拟化部署方案。 |
| [KUBERNETES](technical/deployment/KUBERNETES.md) | ✅ | 2025-11-16 | 本文档详细介绍如何在Kubernetes集群中部署健身房综合管理系统，包括集群搭建、资源配置、存储管理、监控告警等完整的生产环境部署方案。 |
| [HYPERV](technical/deployment/HYPERV.md) | ✅ | 2025-11-16 | 本文档详细介绍如何在Microsoft Hyper-V环境中部署健身房综合管理系统，包括Hyper-V角色安装、虚拟机创建和管理、虚拟网络配置、存储空间管理、PowerShell自动化脚本编写，以及故障转移集群的配置。 |
| [HELM](technical/deployment/HELM.md) | ✅ | 2025-11-16 | 本文档详细介绍如何使用Helm包管理器来部署和管理健身房综合管理系统，包括Chart结构设计、配置管理、多环境部署、版本控制等完整的工作流程。 |
| [GITOPS](technical/deployment/GITOPS.md) | ✅ | 2025-11-16 | 本文档详细介绍GitOps在健身房综合管理系统中的实践，包括ArgoCD的安装配置、多环境管理、自动同步策略、回滚机制等，实现基础设施和应用的声明式持续部署。 |
| [DOCKER](technical/deployment/DOCKER.md) | ✅ | 2025-11-16 | - |
| [DEPLOYMENT](technical/deployment/DEPLOYMENT.md) | ✅ | 2025-11-16 | 生产环境部署指南，包含环境要求和配置步骤 |
| [DOCKER BUILD OPTIMIZATION](technical/deployment/DOCKER_BUILD_OPTIMIZATION.md) | ✅ | 2025-11-15 | Docker构建优化说明 |
| [DOCKER SETUP COMPLETE](technical/deployment/DOCKER_SETUP_COMPLETE.md) | ✅ | 2025-11-15 | Docker工程配置完成总结 |
| [DOCKER QUICK START](technical/deployment/DOCKER_QUICK_START.md) | ✅ | 2025-11-15 | Docker快速启动指南 |
| [DEPLOYMENT OPERATIONS](technical/deployment/DEPLOYMENT_OPERATIONS.md) | ✅ | 2025-11-16 | 本文档介绍健身房综合管理系统在生产环境中的日常运维操作，包括服务管理、健康检查、日志查看、性能监控等核心运维内容。 |
| [DEPLOYMENT DECISION MATRIX](technical/deployment/DEPLOYMENT_DECISION_MATRIX.md) | ✅ | 2025-11-16 | 本文档提供健身房综合管理系统各种部署方案的详细对比分析，包括Docker Compose、Kubernetes、VMware vSphere、KVM、Hyper-V以及各大云平台，帮助技术团队根据业务需求、成本预算、技术能力等因素选择最合适的部署方案。 |
| [CLOUD PLATFORMS](technical/deployment/CLOUD_PLATFORMS.md) | ✅ | 2025-11-16 | 本文档详细介绍健身房综合管理系统在各大云平台上的部署方案，包括AWS、Azure、阿里云、腾讯云等主流云平台的容器服务、数据库服务、存储服务等组件的配置和使用。 |
| [BACKUP RECOVERY](technical/deployment/BACKUP_RECOVERY.md) | ✅ | 2025-11-16 | 本文档介绍健身房综合管理系统的备份和恢复策略，包括数据库备份、文件备份、配置备份以及灾难恢复预案。确保数据安全是运维工作的重要组成部分。 |
| [AUTOMATION](technical/deployment/AUTOMATION.md) | ✅ | 2025-11-16 | 本指南涵盖健身房管理系统的自动化运维体系，包括CI/CD流水线、监控告警、备份恢复、部署自动化等核心组件，为系统提供7×24小时稳定运行保障。 |

---

## 📝 更新记录

| 日期 | 版本 | 更新日期 | 更新内容 | 更新人 |
|------|------|----------|--------|
| 2025-11-16 | v1.0.0 | 初始版本，建立技术文档索引 | 文档工程团队 |

---

*本文档由自动化工具生成和维护，最后更新时间：2025-11-16T16:51:35.972Z*
