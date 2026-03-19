---
name: 📋 Danh sách Thiết kế Test Case
about: Tạo một danh sách nhiều test case cho một tính năng hoặc service cụ thể.
title: "[Test Plan] <Service>: <Tóm tắt chức năng>"
labels: [ "test-plan" ]
assignees: [ ]
---

## 📌 Tổng quan

- **Microservice:** [Ví dụ: Content-Service]
- **Release:** [ ] R1 | [ ] R2 | [ ] R3 | [ ] R4 | [ ] R5 | [ ] R6
- **Tính năng đặc tả:** [Mô tả ngắn gọn chức năng cần kiểm thử]
- **Tài liệu tham chiếu:** [Link Specs/Swagger/Figma]

## 📝 Danh sách chi tiết Test Cases

> [!NOTE]
> - **Mã test case:** `<ServiceAbbr>-<FeatureAbbr>-<Num>`, _ví dụ:_ `CONT-ASS-001` (Content service, Assignments, 001),
    `IDT-AUTH-002` (Identity service, Auth, 002)
> - **Tên test case:** `Kiểm tra <hành động> khi <điều kiện>`, _ví dụ:_ `Kiểm tra đăng nhập khi mật khẩu sai`,
    `Kiểm tra tạo bài học khi nội dung đầy đủ`

|      ID      | Kịch bản kiểm thử                         | Điều kiện tiên quyết | Các bước & Dữ liệu               | Kết quả mong đợi |
|:------------:|:------------------------------------------|----------------------|:---------------------------------|:----------------:|
| IDT-AUTH-001 | Kiểm tra đăng nhập khi nhập đúng mật khẩu | User đã đăng ký      | 1. Điền `username` và `password` |    User info     | 
