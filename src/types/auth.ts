export interface UserEmployee {
  id: string; // Mã nhân viên (ví dụ NV01)
  hoTen: string; // Họ và tên
  taiKhoan: string; // Tên đăng nhập
  matKhau: string; // Mật khẩu
  anh?: string; // Link ảnh đại diện (avatar)
  quyen: string; // Quyền hạn: Tổng Giám Đốc, Quản lý kinh doanh, Nhân viên...
}
