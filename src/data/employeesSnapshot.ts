import { UserEmployee } from '../types/auth';

/**
 * Danh sách tài khoản nhân viên mặc định (Snapshot từ sheet NHAN_VIEN)
 * Giúp ứng dụng đăng nhập ngay lập tức không bị gián đoạn khi mạng chậm.
 */
export const DEFAULT_EMPLOYEES_SNAPSHOT: UserEmployee[] = [
  {
    id: 'NV01',
    hoTen: 'Lê Minh Công',
    taiKhoan: 'admin',
    matKhau: '123456',
    anh: '',
    quyen: 'Tổng Giám Đốc',
  },
  {
    id: 'NV02',
    hoTen: 'Nguyễn Văn Quản Lý',
    taiKhoan: 'quanly',
    matKhau: '123456',
    anh: '',
    quyen: 'Quản lý kinh doanh',
  },
  {
    id: 'NV03',
    hoTen: 'Trần Thị Nhân Viên',
    taiKhoan: 'nhanvien',
    matKhau: '123456',
    anh: '',
    quyen: 'Nhân viên kinh doanh',
  },
];
