# EduSpace 🎓

Edu-Space - một lớp học mini nơi sinh viên có thể tham gia để chat, gọi video và chia sẻ bài tập, công việc.

## 📋 Giới thiệu

EduSpace là một nền tảng học tập trực tuyến kết nối sinh viên và giáo viên trong một môi trường ảo. Hệ thống cho phép sinh viên tham gia vào các lớp học, giao tiếp trực tiếp thông qua chat, gọi video, và dễ dàng chia sẻ các tài liệu học tập, bài tập về nhà cũng như các công việc khác.

## ✨ Tính năng chính

- 💬 **Chat trực tuyến** - Giao tiếp thời gian thực với thành viên lớp học
- 📹 **Gọi video** - Tham gia các buổi học trực tiếp qua video call
- 📚 **Chia sẻ tài liệu** - Upload và chia sẻ bài tập, tài liệu học tập
- 📝 **Quản lý công việc** - Theo dõi các bài tập và công việc được giao
- 👥 **Quản lý lớp học** - Tạo và quản lý các lớp học riêng biệt
- 🔔 **Thông báo** - Nhận thông báo về các hoạt động lớp học mới

## 🛠️ Tech Stack

Dự án được xây dựng với công nghệ:

- **Frontend**: JavaScript (62.5%)
  - Xây dựng giao diện người dùng hiện đại
  - Quản lý trạng thái ứng dụng
  - Tích hợp WebRTC hoặc công nghệ video call

- **Backend**: Java (37%)
  - Xử lý logic ứng dụng phía máy chủ
  - Quản lý cơ sở dữ liệu
  - API endpoint cho các tính năng ứng dụng

- **Khác**: (0.5%)

## 🚀 Bắt đầu

### Yêu cầu

- Node.js (cho phần Frontend)
- Java JDK 8+ (cho phần Backend)
- npm hoặc yarn (quản lý gói cho JavaScript)
- Maven hoặc Gradle (quản lý gói cho Java)

### Cài đặt

1. **Clone repository**
   ```bash
   git clone https://github.com/hieudaykhongsau/EduSpace.git
   cd EduSpace
   ```

2. **Setup Frontend**
   ```bash
   cd frontend
   npm install
   npm start
   ```

3. **Setup Backend**
   ```bash
   cd backend
   # Với Maven
   mvn clean install
   mvn spring-boot:run
   
   # Hoặc với Gradle
   gradle build
   gradle bootRun
   ```

## 📖 Cách sử dụng

### Cho Giáo viên
1. Tạo một lớp học mới
2. Mời sinh viên tham gia
3. Gửi bài tập và tài liệu
4. Giám sát tiến độ sinh viên

### Cho Sinh viên
1. Tham gia lớp học bằng mã lớp
2. Giao tiếp với giáo viên và bạn cùng lớp
3. Nộp bài tập và tài liệu
4. Tham gia các buổi gọi video học tập

## 📂 Cấu trúc thư mục

```
EduSpace/
├── frontend/           # Mã Frontend (JavaScript)
│   ├── src/
│   ├── public/
│   └── package.json
├── backend/            # Mã Backend (Java)
│   ├── src/
│   ├── pom.xml        # Maven configuration
│   └── build.gradle   # Gradle configuration
├── docs/               # Tài liệu dự án
└── README.md
```

## 🤝 Đóng góp

Chúng tôi hoan nghênh những đóng góp từ cộng đồng!

1. Fork repository
2. Tạo branch feature (`git checkout -b feature/AmazingFeature`)
3. Commit thay đổi (`git commit -m 'Add some AmazingFeature'`)
4. Push tới branch (`git push origin feature/AmazingFeature`)
5. Mở Pull Request

## 📝 License

Dự án này được cấp phép dưới giấy phép [MIT](LICENSE) - xem file LICENSE để chi tiết.

## 📧 Liên hệ

- **Tác giả**: hieudaykhongsau
- **Email**: [Thêm email của bạn]
- **GitHub**: [@hieudaykhongsau](https://github.com/hieudaykhongsau)

## 🎯 Roadmap

- [ ] Cải thiện giao diện người dùng
- [ ] Thêm tính năng quản lý điểm số
- [ ] Tích hợp AI để gợi ý học tập
- [ ] Hỗ trợ đa ngôn ngữ
- [ ] Mobile app
- [ ] Tối ưu hóa hiệu suất

---

**Cảm ơn bạn đã sử dụng EduSpace!** 🚀
