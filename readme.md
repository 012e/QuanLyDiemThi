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
.\venv\Scripts\activate
```

3. Cài đặt các dependency
```sh
python install -r requirements.txt
```

4. Bắt đầu chạy django
```sh
pythom manage.py runserver
```

### Các lần chạy sau

Chạy tất cả các lệnh sau trong thư mục backend
1. Activate môi trường ảo đó
```sh
.\venv\Scripts\activate
```

2. Bắt đầu chạy django
```sh
pythom manage.py runserver
```

### Cách thêm dependency vào backend

Các lệnh sau đều được chạy sau khi activate môi trường ảo.

1. Giả sử cần cài đặt thư viện bất kỳ
```sh
pip install thu-vien-vip-pro
```

2. Sau khi `pip install` chạy thành công, chạy lệnh sau để cập nhật mới các dependency của backend
```sh
pip freeze > requirements.txt
```
