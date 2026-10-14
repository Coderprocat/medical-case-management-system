# AWS Production Hosting Blueprint

**Project:** Jajal Medical Case Management  
**Infrastructure Target:** Amazon Web Services (AWS)  
**Date:** October 8, 2026  
**Document Ref:** DOC-OPS-001  

---

### Architecture Overview
The application is deployed across a Virtual Private Cloud (VPC) spanning two Availability Zones (AZs) for high availability and fault tolerance, divided into public and private subnets.

```text
[ Internet Users ]
       | (HTTPS :443)
       v
[ AWS Application Load Balancer (ALB) ]  <-- TLS termination via ACM Certificate
       |
       +---> [ Public Subnet / NAT Gateway ]
                   |
                   v (HTTP :80 / :3000)
       +---------------------------------------------+
       | Private App Subnet (Multi-AZ)               |
       |  [ EC2 Instance AZ-1 ] [ EC2 Instance AZ-2 ]|  <-- Node.js / Laravel App
       +---------------------------------------------+
                   |
                   v (MySQL :3306)
       +---------------------------------------------+
       | Private DB Subnet (Multi-AZ)                |
       |  [ Amazon RDS MySQL Primary ]               |
       |        | (Sync Replication)                 |
       |  [ Amazon RDS MySQL Standby ]               |
       +---------------------------------------------+
                   |
                   +---> [ Amazon S3 Encrypted Bucket ] (CAD files / DICOM)
                   |
                   +---> [ AWS Secrets Manager ] (.env configuration)
```

---

### 1. Compute Tier (Amazon EC2 & ALB)
- **Instances:** 2x `t4g.small` instances (AWS Graviton2 processors) managed by an Auto Scaling Group (min 2, max 4).
- **Web Server:** Nginx reverse proxy passing traffic to Node.js / Express process managed by `pm2` on `http://127.0.0.1:3000`.
- **Load Balancer:** AWS Application Load Balancer (ALB) distributing traffic across both instances with active health checks to `/api/cases` or a dedicated `/health` endpoint.

### 2. Managed Database (Amazon RDS MySQL)
- **Engine:** MySQL 8.0 with InnoDB engine.
- **High Availability:** Multi-AZ deployment enabled, providing automated synchronous standby replication and near-zero downtime failover.
- **Backups:** Automated daily snapshots retained for 30 days, plus point-in-time recovery enabled.
- **Placement:** Isolated within private database subnets with no public IPv4 routing.

### 3. File & Artifact Storage (Amazon S3)
- **Bucket:** Dedicated private S3 bucket (`jajal-medical-implant-cases-prod`) with Server-Side Encryption (`SSE-KMS`) and bucket versioning enabled.
- **Assets:** Stores CAD stereolithography (`.stl`) files, patient DICOM imaging attachments, and automated database dumps.
- **Access:** Direct IAM role attached to the EC2 instances via instance profile (no hardcoded AWS credentials).

### 4. Network Security Groups & Firewalls
- **ALB Security Group:** Inbound allowed ONLY on port `443` (HTTPS) and port `80` (redirected immediately to 443) from `0.0.0.0/0`.
- **EC2 App Security Group:** Inbound allowed ONLY from the ALB Security Group on port `3000` (or `80`). SSH port `22` restricted to AWS Systems Manager (SSM) Session Manager (no open public bastion).
- **RDS Database Security Group:** Inbound allowed ONLY on port `3306` from the EC2 App Security Group. Direct external access is strictly blocked.

### 5. Secrets Management & Environment Configuration
- **AWS Secrets Manager:** Production `.env` secrets (`DB_PASSWORD`, `APP_KEY`, `SANCTUM_SECRET`, `NAGER_DATE_API_URL`) are stored in AWS Secrets Manager.
- **Deployment Hook:** During CodeDeploy / container startup, secrets are retrieved securely via AWS CLI / SDK into environment memory without committing credentials to Git.

### 6. SSL/TLS HTTPS & DNS
- **Certificates:** Provisioned free of charge via AWS Certificate Manager (ACM) with automated DNS validation.
- **DNS:** Route 53 alias records point the corporate domain (`implant.jajalmedical.com`) to the ALB.
- **Security Headers:** HSTS (`max-age=31536000; includeSubDomains`), `X-Frame-Options: SAMEORIGIN`, and `X-Content-Type-Options: nosniff` enforced at the load balancer.
