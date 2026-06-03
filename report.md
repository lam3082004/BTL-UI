# Báo cáo tổng quan dự án NumSense

## 1. Giới thiệu dự án

NumSense là một ứng dụng web học toán dành cho trẻ em, đặc biệt hướng tới nhóm trẻ gặp khó khăn với số học hoặc có biểu hiện rối loạn tính toán. Dự án được xây dựng theo mô hình full-stack, gồm frontend React/Vite dạng Progressive Web App và backend NestJS kết nối cơ sở dữ liệu PostgreSQL.

Thay vì trình bày bài toán theo cách khô khan, NumSense chuyển các phép tính thành hoạt động trực quan như kéo, chạm, đếm vật phẩm và thả vào giỏ. Cách tiếp cận này giúp trẻ tiếp nhận khái niệm số lượng, phép cộng, phép trừ, phép nhân và phép chia thông qua hình ảnh, thao tác tay, phản hồi tức thì và phần thưởng sau mỗi bài học.

## 2. Mục tiêu và ý nghĩa

Mục tiêu chính của NumSense là tạo ra một môi trường học toán thân thiện, dễ tiếp cận và ít gây áp lực cho trẻ nhỏ. Dự án không chỉ tập trung vào việc kiểm tra đáp án đúng hoặc sai, mà còn hỗ trợ trẻ hiểu toán qua trực quan hóa số lượng.

Ý nghĩa của dự án gồm:

- Hỗ trợ trẻ luyện nhận thức số lượng bằng thao tác trực quan.
- Giảm cảm giác căng thẳng khi học toán thông qua giao diện vui nhộn, màu sắc nhẹ và phần thưởng.
- Cho phép phụ huynh theo dõi tiến độ học tập của từng trẻ.
- Cá nhân hóa độ khó theo từng trẻ bằng phạm vi số và dạng bài được bật.
- Lưu lại kết quả học tập để phân tích tỷ lệ đúng, sai và thời gian phản hồi.
- Có khả năng hoạt động như PWA, phù hợp với thiết bị cảm ứng và trải nghiệm học ngắn hằng ngày.

## 3. Đối tượng sử dụng

Dự án phục vụ hai nhóm người dùng chính:

### Trẻ em

Trẻ sử dụng ứng dụng để chọn hồ sơ cá nhân, chọn bài học, làm bài thông qua thao tác kéo hoặc chạm vật phẩm, nhận phản hồi đúng/sai và xem phần thưởng sau khi hoàn thành.

### Phụ huynh

Phụ huynh sử dụng bảng điều khiển để quản lý hồ sơ trẻ, cấu hình bài học, xem báo cáo tiến độ và đăng nhập bằng Google để đồng bộ dữ liệu.

## 4. Luồng sử dụng chính

### Luồng học của trẻ

1. Trẻ vào màn hình chính và chọn chế độ dành cho bé.
2. Trẻ chọn hồ sơ cá nhân.
3. Trẻ vào trang chính của mình, chọn bài học hoặc xem thành tích.
4. Trẻ chọn dạng bài: học đếm, phép cộng, phép trừ, phép nhân hoặc phép chia.
5. Trong bài học, trẻ kéo hoặc chạm các vật phẩm để đưa vào giỏ theo yêu cầu.
6. Ứng dụng kiểm tra số lượng trẻ chọn, hiển thị phản hồi đúng hoặc sai.
7. Sau khi hoàn thành số câu quy định, trẻ được chuyển đến trang kết quả và phần thưởng.

### Luồng quản lý của phụ huynh

1. Phụ huynh vào trang đăng nhập hoặc bảng điều khiển.
2. Có thể dùng chế độ demo/local hoặc đăng nhập Google.
3. Phụ huynh xem danh sách hồ sơ trẻ.
4. Với mỗi trẻ, phụ huynh có thể xem báo cáo tiến độ hoặc chỉnh cấu hình bài học.
5. Phụ huynh có thể thiết lập phạm vi số, dạng bài được bật, số câu mỗi bài, âm thanh và hiệu ứng.

## 5. Các tính năng chính

### 5.1. Màn hình khởi động và điều hướng

Ứng dụng có màn hình khởi động đóng vai trò phân luồng giữa trẻ và phụ huynh. Hệ thống định tuyến frontend được tổ chức rõ ràng qua React Router, gồm các trang chọn trẻ, trang chủ của trẻ, chọn bài học, làm bài, phần thưởng, kho thành tích, đăng nhập phụ huynh, bảng điều khiển, báo cáo và cấu hình.

### 5.2. Quản lý hồ sơ trẻ

Ứng dụng hỗ trợ danh sách hồ sơ trẻ với tên, avatar, cấu hình phạm vi số và các dạng bài được phép học. Backend lưu hồ sơ trẻ trong bảng `children`, liên kết với tài khoản phụ huynh. Frontend cũng có cơ chế lưu cục bộ để ứng dụng vẫn có thể hoạt động khi chưa đăng nhập hoặc khi backend không khả dụng.

### 5.3. Chọn và cấu hình bài học

NumSense hỗ trợ các dạng bài:

- Học đếm.
- Phép cộng.
- Phép trừ.
- Phép nhân.
- Phép chia.

Phụ huynh có thể bật hoặc tắt từng dạng bài cho mỗi trẻ. Phạm vi số được giới hạn và chuẩn hóa để phù hợp với giao diện trực quan, tối đa là 12 vật phẩm. Điều này giúp bài học không vượt quá khả năng hiển thị và tránh gây quá tải cho trẻ.

### 5.4. Bài học tương tác kéo thả

Đây là tính năng trung tâm của dự án. Trang bài học dùng `@dnd-kit` để hỗ trợ kéo thả trên thiết bị cảm ứng. Mỗi câu hỏi được chuyển thành yêu cầu trực quan, ví dụ kéo đúng số quả táo, ngôi sao, cá, kẹo hoặc bóng vào giỏ/hộp.

Ngoài kéo thả, trẻ cũng có thể chạm vào vật phẩm để thêm nhanh vào giỏ. Đây là chi tiết quan trọng vì trẻ nhỏ hoặc người dùng thiết bị cảm ứng có thể chưa thao tác kéo chính xác.

Ứng dụng ghi nhận:

- Câu hỏi hiện tại.
- Đáp án đúng.
- Số lượng trẻ đã chọn.
- Đúng hoặc sai.
- Thời gian phản hồi.
- Lịch sử các câu đã làm trong phiên học.

### 5.5. Sinh câu hỏi toán học

Backend có service sinh câu hỏi theo cấu hình min/max và phép toán được phép. Các phép toán được sinh sao cho kết quả phù hợp với giới hạn trực quan:

- Phép cộng không vượt quá giới hạn hiển thị.
- Phép trừ tránh kết quả âm.
- Phép nhân dùng toán hạng nhỏ để kết quả không quá lớn.
- Phép chia tạo phép chia hết, giúp đáp án là số nguyên.
- Học đếm dùng một số đơn lẻ làm mục tiêu số lượng.

Frontend cũng có cơ chế fallback để tự sinh câu hỏi khi backend lỗi hoặc khi dùng chế độ local. Điều này làm ứng dụng bền hơn trong môi trường demo hoặc khi mất kết nối.

### 5.6. Lưu phiên học và kết quả

Mỗi lần học được lưu thành một `lesson_session`. Mỗi câu trả lời được lưu thành một `question_result`, gồm biểu thức, kết quả đúng/sai và thời gian phản hồi. Khi hoàn thành bài học, phiên học được đánh dấu hoàn tất.

Mô hình này giúp hệ thống không chỉ biết trẻ trả lời đúng bao nhiêu câu, mà còn có dữ liệu để phân tích tốc độ phản hồi và sự tiến bộ theo thời gian.

### 5.7. Trang kết quả và phần thưởng

Sau mỗi bài học, trẻ được chuyển đến trang kết quả. Trang này hiển thị số câu đúng, số câu sai và thông điệp hoàn thành bài học. Nếu không lấy được thống kê từ backend, frontend dùng dữ liệu kết quả vừa làm để tính toán thay thế.

Dự án còn có trang kho thành tích với huy hiệu, cấp độ và tiến trình sao. Đây là yếu tố gamification giúp trẻ có thêm động lực quay lại học.

### 5.8. Bảng điều khiển phụ huynh

Bảng điều khiển phụ huynh hiển thị danh sách trẻ và cho phép mở rộng từng hồ sơ để xem báo cáo hoặc cấu hình. Khi chưa đăng nhập, ứng dụng có thể lấy dữ liệu demo hoặc dữ liệu local. Khi đã đăng nhập, ứng dụng lấy dữ liệu từ backend theo tài khoản phụ huynh.

### 5.9. Báo cáo tiến độ

Trang báo cáo tiến độ tổng hợp dữ liệu học tập của trẻ trong một khoảng thời gian. Backend tính:

- Tổng số phiên học.
- Tổng số câu hỏi.
- Số câu đúng.
- Số câu sai.
- Tỷ lệ đúng.
- Thời gian phản hồi trung bình.
- Dữ liệu biểu đồ thời gian phản hồi.
- Dữ liệu biểu đồ tròn đúng/sai.

Frontend trình bày báo cáo bằng biểu đồ cột và biểu đồ donut, giúp phụ huynh dễ quan sát khả năng hiện tại của trẻ.

### 5.10. Đăng nhập Google và xác thực JWT

Backend dùng Google OAuth để xác thực phụ huynh. Sau khi đăng nhập, hệ thống tạo hoặc cập nhật tài khoản phụ huynh, sau đó phát JWT. JWT được dùng để bảo vệ các API quản lý trẻ và báo cáo.

Các API có kiểm tra quyền sở hữu, ví dụ phụ huynh chỉ được xem báo cáo hoặc cập nhật cấu hình của trẻ thuộc tài khoản của mình.

### 5.11. Cài đặt trải nghiệm học

Phụ huynh có thể cấu hình trải nghiệm học ở frontend, gồm:

- Bật/tắt âm thanh phản hồi.
- Bật/tắt hiệu ứng minh họa.
- Chọn số câu trong mỗi bài, từ 3 đến 8 câu.

Các cài đặt này được lưu trong `localStorage`, giúp giữ lại lựa chọn trên cùng thiết bị.

### 5.12. Hỗ trợ PWA

Frontend sử dụng `vite-plugin-pwa` và có các icon PWA. Điều này cho phép ứng dụng tiến tới trải nghiệm giống ứng dụng cài đặt trên thiết bị, phù hợp với việc học trên tablet hoặc điện thoại.

## 6. Kiến trúc hệ thống

Dự án gồm ba phần chính:

### Frontend

Frontend được xây dựng bằng React 18, Vite và TypeScript. Giao diện dùng Tailwind CSS, animation dùng Framer Motion, kéo thả dùng `@dnd-kit`, biểu đồ dùng Recharts và quản lý request dùng Axios/React Query.

Các nhóm mã chính:

- `pages`: các màn hình chính của ứng dụng.
- `components`: thành phần giao diện tái sử dụng như trạng thái PWA, vật phẩm kéo thả, giỏ.
- `hooks`: logic dùng lại như xác thực và bài học.
- `api`: cấu hình client gọi backend.
- `utils`: xử lý dữ liệu trẻ, fallback local và cấu hình trực quan.

### Backend

Backend được xây dựng bằng NestJS và TypeScript. Các module chính:

- `auth`: Google OAuth, JWT, profile phụ huynh.
- `children`: tạo, lấy, cập nhật, xóa và seed dữ liệu trẻ demo.
- `lessons`: tạo phiên học, sinh câu hỏi, lưu kết quả, hoàn thành phiên.
- `reports`: tổng hợp thống kê học tập.
- `entities`: định nghĩa bảng dữ liệu TypeORM.

### Database

Cơ sở dữ liệu PostgreSQL lưu các thực thể chính:

- `parents`: thông tin phụ huynh đăng nhập Google.
- `children`: hồ sơ trẻ và cấu hình học.
- `lesson_sessions`: phiên học của trẻ.
- `question_results`: kết quả từng câu hỏi.

Các quan hệ được thiết kế theo hướng phụ huynh có nhiều trẻ, trẻ có nhiều phiên học, mỗi phiên học có nhiều kết quả câu hỏi.

## 7. API chính

Các nhóm API chính gồm:

- `GET /health`: kiểm tra backend.
- `GET /auth/google`: bắt đầu đăng nhập Google.
- `GET /auth/google/callback`: nhận callback OAuth và trả JWT về frontend.
- `GET /auth/profile`: lấy thông tin phụ huynh hiện tại.
- `POST /children`: tạo hồ sơ trẻ.
- `GET /children`: lấy danh sách trẻ của phụ huynh.
- `GET /children/demo`: lấy dữ liệu demo.
- `GET /children/:id`: lấy chi tiết trẻ.
- `PUT /children/:id/config`: cập nhật cấu hình học.
- `DELETE /children/:id`: xóa hồ sơ trẻ.
- `POST /lessons/session`: tạo phiên học.
- `POST /lessons/generate-question`: sinh câu hỏi.
- `POST /lessons/result`: lưu kết quả câu hỏi.
- `POST /lessons/session/:id/complete`: hoàn thành phiên học.
- `GET /reports/:childId`: lấy báo cáo tiến độ.
- `GET /reports/session/:sessionId/stats`: lấy thống kê một phiên học.

## 8. Công nghệ sử dụng

Frontend:

- React 18.
- Vite.
- TypeScript.
- Tailwind CSS.
- React Router.
- Axios.
- TanStack React Query.
- Framer Motion.
- @dnd-kit.
- Recharts.
- vite-plugin-pwa.

Backend:

- NestJS.
- TypeScript.
- TypeORM.
- PostgreSQL.
- Passport.js.
- Google OAuth 2.0.
- JWT.

Triển khai và môi trường:

- Docker.
- Docker Compose.
- Render/Vercel configuration.

## 9. Điểm nổi bật của dự án

- Có định hướng xã hội rõ ràng: hỗ trợ trẻ khó khăn với toán học, không chỉ là ứng dụng luyện phép tính thông thường.
- Thiết kế lấy trẻ em làm trung tâm, ưu tiên hình ảnh, thao tác chạm/kéo và phản hồi tức thì.
- Có luồng phụ huynh riêng để theo dõi và cá nhân hóa việc học.
- Có cơ chế fallback local/demo, giúp sản phẩm dễ chạy thử và ít phụ thuộc tuyệt đối vào backend.
- Backend có phân quyền theo phụ huynh, giúp bảo vệ dữ liệu học tập của từng trẻ.
- Mô hình dữ liệu đủ để phát triển tiếp các tính năng phân tích tiến bộ, gợi ý bài học và hệ thống phần thưởng sâu hơn.
- Cấu trúc frontend/backend rõ ràng, dễ mở rộng.

## 10. Hạn chế và hướng phát triển

Dự án hiện đã có nền tảng chức năng tốt, nhưng vẫn có thể phát triển thêm:

- Đồng bộ đầy đủ hồ sơ trẻ được tạo local lên tài khoản sau khi phụ huynh đăng nhập.
- Gắn hệ thống huy hiệu với dữ liệu thật thay vì danh sách minh họa cố định.
- Thêm âm thanh đọc câu hỏi hoặc hướng dẫn bằng giọng nói cho trẻ.
- Thêm bài học theo cấp độ và lộ trình học cá nhân hóa.
- Bổ sung kiểm thử unit/e2e cho backend và frontend.
- Cải thiện dashboard phụ huynh với biểu đồ theo tuần/tháng và so sánh tiến bộ.
- Lưu cấu hình âm thanh/hiệu ứng lên backend để đồng bộ nhiều thiết bị.
- Thêm khả năng giáo viên/chuyên gia xem nhiều học sinh nếu mở rộng thành sản phẩm giáo dục.

## 11. Kết luận

NumSense là một dự án có ý nghĩa thực tiễn cao trong lĩnh vực công nghệ giáo dục. Dự án kết hợp học toán, trò chơi hóa, tương tác trực quan và theo dõi tiến độ để tạo ra trải nghiệm phù hợp hơn cho trẻ nhỏ, đặc biệt là trẻ gặp khó khăn với số học.

Về kỹ thuật, dự án có kiến trúc full-stack tương đối hoàn chỉnh, gồm frontend PWA, backend API, xác thực Google OAuth/JWT, cơ sở dữ liệu PostgreSQL và hệ thống báo cáo. Về sản phẩm, NumSense thể hiện rõ tư duy lấy người học làm trung tâm: trẻ học bằng thao tác và hình ảnh, còn phụ huynh có công cụ theo dõi và điều chỉnh độ khó phù hợp.

Nhìn tổng thể, NumSense không chỉ là một ứng dụng luyện toán, mà là một nền tảng hỗ trợ học toán cá nhân hóa, có khả năng mở rộng thành công cụ giáo dục dành cho gia đình, nhà trường hoặc chuyên gia hỗ trợ trẻ có khó khăn học tập.
