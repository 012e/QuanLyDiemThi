# Ứng dụng quản lý điểm thi

## Các công nghệ

### Frontend

- Framework: Angular
- Component library: PrimeNG
- CSS: Tailwind

### Backend

- Framework: Django rest framework
- Authentication: JWT Authentication

## Hướng dẫn cách cài đặt phát triển

### Frontend

Chỉ cần chạy lệnh sau trong thư mục frontend
```sh
npm install
```

Để hot reload 
```sh
ng serve
```

### Backend

#### Chạy lần đầu

Chạy tất cả các lệnh sau trong thư mục backend

1. Tạo virutal environemnt
```sh
python -m venv .venv
```

2. Activate môi trường ảo đó
```sh
.\.venv\Scripts\activate
```

3. Cài đặt các dependency
```sh
pip install -r requirements.txt
```

4. Bắt đầu chạy django
```sh
python manage.py runserver
```

#### Các lần chạy sau

Chạy tất cả các lệnh sau trong thư mục backend
1. Activate môi trường ảo đó
```sh
.\.venv\Scripts\activate
```

2. Bắt đầu chạy django
```sh
python manage.py runserver
```

#### Cách thêm dependency vào backend

Các lệnh sau đều được chạy sau khi activate môi trường ảo.

1. Giả sử cần cài đặt thư viện bất kỳ
```sh
pip install thu-vien-vip-pro
```

2. Sau khi `pip install` chạy thành công, chạy lệnh sau để cập nhật mới các dependency của backend
```sh
pip freeze > requirements.txt
```

#### Test api của backend

Back end có để sẵn endpoint cho giao diện của swagger: http://localhost:8000/api/schema/swagger/. Có thể vào trang này để chạy và test cái api của backend.

**Lưu ý:** Cần phải đăng nhập mới có thể sử dụng các api của backend. Các bước đăng nhập như sau:
1. Vào trang http://localhost:8000/api/schema/swagger/
2. Sử dụng api /auth/login ![image](https://github.com/user-attachments/assets/37a69e3b-73ec-4f2a-89a1-81133ee5a726)
3. Nhập username và password sau đó chạy ![image](https://github.com/user-attachments/assets/24ff40b7-8248-4109-85c4-e299bfe85b61)
4. Nếu username và password đúng thì máy chủ sẽ trả về response 200 kèm với `access`: ... ![image](https://github.com/user-attachments/assets/95f41213-65dd-4446-a634-36e98a7ece0e). Copy `access` đó, để chuẩn bị sử dụng.
5. Kéo lên đầu trang, ta có nút authorize, nhấn vào authorize, paste nội dung access vào `jwtHeaderAuth`, và cuối cùng nhấn `Authorize`. ![image](https://github.com/user-attachments/assets/6acbdc9e-a735-4e21-aafb-07670baa42e3)
6. Sau đó có thể test api, ví dụ như lấy danh sách các độ khó: ![image](https://github.com/user-attachments/assets/1bdf6c65-dab7-49ae-885a-c105b0b8183c)

## Cách chạy dự án bằng Docker

### Chạy frontend

Chạy lệnh sau, sau đó có thể truy cập bằng trình duyệt web ở http://localhost:8080.

```sh
docker compose -f ./docker-compose.frontend.yaml up --build
```

### Chạy backend

Chạy lệnh sau và backend sẽ được chạy ở http://localhost:8000.

```sh
docker compose -f ./docker-compose.backend.yaml up --build
```

### Chạy cả frontend, backend cùng lúc

```sh
docker compose up --build
```

Sau đó có thể truy cập http://localhost:8080 để sử dụng frontend kết hợp backend.

## Hướng dẫn đăng code

Khi thực hiện một tính năng nào thì cần thực hiện các bước sau:
1. Tạo branch với tên là tính năng đang thực hiện: ví dụ `git branch tinh-nang`.
2. Bắt đầu viết code và tạo các commit trong branch này, sau khi hoàn thành thì push các thay đổi này lên branch này ở remote `git push --set-upstream origin tinh-nang`
3. Vào github và tạo pull request
4. Nhờ ai đó kiểm tra lại code (chống code qua tệ thôi), và sau đó squash and merge (chú ý: nó khác với mới merge!!)
5. Ăn mừng

