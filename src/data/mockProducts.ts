import { Product } from '../types/product';

/**
 * Danh sách sản phẩm khởi tạo:
 * Toàn bộ dữ liệu được tải và đồng bộ trực tiếp từ Google Sheet thực tế (SO_SANH_GIA).
 * Không lưu trữ dữ liệu tĩnh (mock catalog) trong mã nguồn dự án.
 */
export const INITIAL_PRODUCTS: Product[] = [];
