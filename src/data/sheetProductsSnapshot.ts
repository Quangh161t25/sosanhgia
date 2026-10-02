import { Product } from '../types/product';

/**
 * Bản sao lưu sản phẩm thực tế được lấy trực tiếp từ Google Sheet SO_SANH_GIA (73 sản phẩm).
 * Được sử dụng làm dữ liệu khởi tạo mặc định khi mở ứng dụng trên Vercel / Web
 * trong khi hệ thống đang đồng bộ ngầm phiên bản mới nhất từ Google Sheet.
 */
export const SHEET_PRODUCTS_SNAPSHOT: Product[] = [
  {
    "id": "sheet-lk-30nc",
    "sku": "LK-30NC",
    "name": "Nồi luộc gà Lock&King size 30",
    "brand": "LOCK&KING",
    "categoryGroup": "Điện gia dụng",
    "categoryType": "Sản phẩm",
    "thumbnail": "https://i.ibb.co/KcSH2pdx/f459a87d-9f72-44c6-aeb4-4410a8ec682b.png",
    "warrantyMonths": 12,
    "pricing": {
      "costPrice": 321000,
      "distributorPrice": 399000,
      "floorPrice": 975000,
      "retailPrice": 750000,
      "currency": "VND"
    },
    "specifications": [
      {
        "groupName": "Kích thước & Thiết kế",
        "items": [
          {
            "key": "Chất liệu",
            "value": "Inox cao cấp",
            "isHighlight": false
          },
          {
            "key": "Kích thước",
            "value": "30 cm",
            "isHighlight": true
          },
          {
            "key": "Khối lượng",
            "value": "3,1 kg",
            "isHighlight": true
          }
        ]
      },
      {
        "groupName": "Tiêu chuẩn & Bảo hành",
        "items": [
          {
            "key": "Bảo hành",
            "value": "12 tháng",
            "isHighlight": false
          }
        ]
      },
      {
        "groupName": "Thông số kỹ thuật khác",
        "items": [
          {
            "key": "Tay cầm",
            "value": "Quai đinh tán chắc chắn",
            "isHighlight": false
          },
          {
            "key": "Vung",
            "value": "Kính cường lực bền bỉ",
            "isHighlight": false
          },
          {
            "key": "Sử dụng",
            "value": "Bếp từ, bếp ga, bếp Halogen, bếp điện",
            "isHighlight": false
          }
        ]
      }
    ],
    "tags": [],
    "notes": "",
    "description": "Nồi luộc gà Inox cao cấp LOCK&KING LK-30NC  Chất liệu: Inox cao cấp  Tay cầm: Quai đinh tán chắc chắn  Vung: Kính cường lực bền bỉ  Kích thước: 30 cm  Khối lượng: 3,1 kg  Sử dụng: Bếp từ, bếp ga, bếp Halogen, bếp điện  Bảo hành: 12 tháng",
    "status": "active",
    "updatedAt": "2026-10-01"
  },
  {
    "id": "sheet-lk-32nc1",
    "sku": "LK-32NC1",
    "name": "Nồi luộc gà Lock&King size 32",
    "brand": "LOCK&KING",
    "categoryGroup": "Điện gia dụng",
    "categoryType": "Sản phẩm",
    "thumbnail": "https://i.ibb.co/GZggW5H/Chat-GPT-Image-10-46-05-15-thg-3-2026.png",
    "warrantyMonths": 12,
    "pricing": {
      "costPrice": 406600,
      "distributorPrice": 455000,
      "floorPrice": 1079000,
      "retailPrice": 830000,
      "currency": "VND"
    },
    "specifications": [
      {
        "groupName": "Kích thước & Thiết kế",
        "items": [
          {
            "key": "Chất liệu",
            "value": "Inox cao cấp",
            "isHighlight": false
          },
          {
            "key": "Kích thước",
            "value": "32 cm",
            "isHighlight": true
          },
          {
            "key": "Khối lượng",
            "value": "3,5 kg",
            "isHighlight": true
          }
        ]
      },
      {
        "groupName": "Tiêu chuẩn & Bảo hành",
        "items": [
          {
            "key": "Bảo hành",
            "value": "12 tháng",
            "isHighlight": false
          }
        ]
      },
      {
        "groupName": "Thông số kỹ thuật khác",
        "items": [
          {
            "key": "Tay cầm",
            "value": "Quai đinh tán chắc chắn",
            "isHighlight": false
          },
          {
            "key": "Vung",
            "value": "Kính cường lực bền bỉ",
            "isHighlight": false
          },
          {
            "key": "Sử dụng",
            "value": "Bếp từ, bếp ga, bếp Halogen, bếp điện",
            "isHighlight": false
          }
        ]
      }
    ],
    "tags": [],
    "notes": "",
    "description": "Nồi luộc gà Inox cao cấp LOCK&KING LK-32NC  Chất liệu: Inox cao cấp  Tay cầm: Quai đinh tán chắc chắn  Vung: Kính cường lực bền bỉ  Kích thước: 32 cm  Khối lượng: 3,5 kg  Sử dụng: Bếp từ, bếp ga, bếp Halogen, bếp điện  Bảo hành: 12 tháng",
    "status": "active",
    "updatedAt": "2026-10-01"
  },
  {
    "id": "sheet-lk-3386",
    "sku": "LK-3386",
    "name": "Bộ nồi 3 Lock&King ( 18,20,24 ) thân cao",
    "brand": "LOCK&KING",
    "categoryGroup": "Điện gia dụng",
    "categoryType": "Sản phẩm",
    "thumbnail": "https://i.ibb.co/4Z9dN99T/anh-bang-gia-lk-3386.png",
    "warrantyMonths": 12,
    "pricing": {
      "costPrice": 442267,
      "distributorPrice": 530000,
      "floorPrice": 1287000,
      "retailPrice": 990000,
      "currency": "VND"
    },
    "specifications": [
      {
        "groupName": "Kích thước & Thiết kế",
        "items": [
          {
            "key": "Trọng lượng",
            "value": "4 kg",
            "isHighlight": false
          },
          {
            "key": "Chất liệu",
            "value": "Inox Cao cấp",
            "isHighlight": false
          },
          {
            "key": "Kích thước",
            "value": "18 – 20 – 24 cm",
            "isHighlight": true
          },
          {
            "key": "Khối lượng",
            "value": "4 kg",
            "isHighlight": true
          }
        ]
      },
      {
        "groupName": "Công nghệ & Tính năng",
        "items": [
          {
            "key": "Công nghệ",
            "value": "Đáy 5 lớp chống phồng",
            "isHighlight": false
          }
        ]
      },
      {
        "groupName": "Thông số kỹ thuật khác",
        "items": [
          {
            "key": "Sử dụng",
            "value": "Bếp từ, bếp ga, bếp Halogen, bếp điện",
            "isHighlight": false
          },
          {
            "key": "Quai",
            "value": "Đinh tán chắc chắn",
            "isHighlight": false
          }
        ]
      }
    ],
    "tags": [],
    "notes": "",
    "description": "Bộ Nồi Inox 5 Đáy Cao Cấp Lock&King LK-3386   Chất liệu: Inox Cao cấp  Sử dụng: Bếp từ, bếp ga, bếp Halogen, bếp điện  Công nghệ: Đáy 5 lớp chống phồng  Quai: Đinh tán chắc chắn  Kích thước: 18 – 20 – 24 cm  Khối lượng: 4 kg",
    "status": "active",
    "updatedAt": "2026-10-01"
  },
  {
    "id": "sheet-lk-3568",
    "sku": "LK-3568",
    "name": "Bộ nồi 5 Lock&King ( 16,18,20,24,24 )",
    "brand": "LOCK&KING",
    "categoryGroup": "Điện gia dụng",
    "categoryType": "Sản phẩm",
    "thumbnail": "https://i.ibb.co/gFzbrtNc/anh-bang-gia-lk-3568.png",
    "warrantyMonths": 12,
    "pricing": {
      "costPrice": 760210,
      "distributorPrice": 940000,
      "floorPrice": 2028000,
      "retailPrice": 1690000,
      "currency": "VND"
    },
    "specifications": [
      {
        "groupName": "Kích thước & Thiết kế",
        "items": [
          {
            "key": "Trọng lượng",
            "value": "6kg",
            "isHighlight": false
          },
          {
            "key": "Chất liệu",
            "value": "Inox Cao cấp",
            "isHighlight": false
          },
          {
            "key": "Kích thước",
            "value": "16 – 18 – 20 – 24 – 24 cm",
            "isHighlight": true
          },
          {
            "key": "Khối lượng",
            "value": "6kg",
            "isHighlight": true
          }
        ]
      },
      {
        "groupName": "Công nghệ & Tính năng",
        "items": [
          {
            "key": "Công nghệ",
            "value": "Đáy 5 lớp chống phồng",
            "isHighlight": false
          }
        ]
      },
      {
        "groupName": "Thông số kỹ thuật khác",
        "items": [
          {
            "key": "Sử dụng",
            "value": "Bếp từ, bếp ga, bếp Halogen, bếp điện",
            "isHighlight": false
          },
          {
            "key": "Quai",
            "value": "Đinh tán chắc chắn",
            "isHighlight": false
          }
        ]
      }
    ],
    "tags": [],
    "notes": "",
    "description": "Bộ Nồi Inox 5 Đáy Cao Cấp Lock&King LK-3568   Chất liệu: Inox Cao cấp  Sử dụng: Bếp từ, bếp ga, bếp Halogen, bếp điện  Công nghệ: Đáy 5 lớp chống phồng  Quai: Đinh tán chắc chắn  Kích thước: 16 – 18 – 20 – 24 – 24 cm  Khối lượng: 6kg",
    "status": "active",
    "updatedAt": "2026-10-01"
  },
  {
    "id": "sheet-lk-336a",
    "sku": "LK-336A",
    "name": "Bộ nồi 3 Lock&King ( 18,20,24 )",
    "brand": "LOCK&KING",
    "categoryGroup": "Điện gia dụng",
    "categoryType": "Sản phẩm",
    "thumbnail": "https://i.ibb.co/Q3kN3Hkj/anh-bang-gia-lk-336a.png",
    "warrantyMonths": 12,
    "pricing": {
      "costPrice": 411695,
      "distributorPrice": 540000,
      "floorPrice": 1287000,
      "retailPrice": 990000,
      "currency": "VND"
    },
    "specifications": [
      {
        "groupName": "Kích thước & Thiết kế",
        "items": [
          {
            "key": "Trọng lượng",
            "value": "6kg",
            "isHighlight": false
          },
          {
            "key": "Chất liệu",
            "value": "Inox Cao cấp",
            "isHighlight": false
          },
          {
            "key": "Kích thước",
            "value": "18 – 20 – 24 cm",
            "isHighlight": true
          },
          {
            "key": "Khối lượng",
            "value": "6kg",
            "isHighlight": true
          }
        ]
      },
      {
        "groupName": "Công nghệ & Tính năng",
        "items": [
          {
            "key": "Công nghệ",
            "value": "Đáy 5 lớp chống phồng",
            "isHighlight": false
          }
        ]
      },
      {
        "groupName": "Thông số kỹ thuật khác",
        "items": [
          {
            "key": "Sử dụng",
            "value": "Bếp từ, bếp ga, bếp Halogen, bếp điện",
            "isHighlight": false
          },
          {
            "key": "Quai",
            "value": "Đinh tán chắc chắn",
            "isHighlight": false
          }
        ]
      }
    ],
    "tags": [],
    "notes": "",
    "description": "Bộ Nồi Inox 5 đáy Cao Cấp Lock&King LK-336A    Chất liệu: Inox Cao cấp  Sử dụng: Bếp từ, bếp ga, bếp Halogen, bếp điện  Công nghệ: Đáy 5 lớp chống phồng  Quai: Đinh tán chắc chắn  Kích thước: 18 – 20 – 24 cm  Khối lượng: 6kg",
    "status": "active",
    "updatedAt": "2026-10-01"
  },
  {
    "id": "sheet-lk-3018",
    "sku": "LK-3018",
    "name": "Nồi lẻ Lock&king 18",
    "brand": "LOCK&KING",
    "categoryGroup": "Điện gia dụng",
    "categoryType": "Sản phẩm",
    "thumbnail": "https://i.ibb.co/MyPbHphf/anh-bang-gia-lk-3018.png",
    "warrantyMonths": 12,
    "pricing": {
      "costPrice": 133495,
      "distributorPrice": 170000,
      "floorPrice": 383500,
      "retailPrice": 295000,
      "currency": "VND"
    },
    "specifications": [
      {
        "groupName": "Kích thước & Thiết kế",
        "items": [
          {
            "key": "Chất liệu",
            "value": "Inox cao cấp",
            "isHighlight": false
          },
          {
            "key": "Kích thước",
            "value": "18 cm",
            "isHighlight": true
          },
          {
            "key": "Khối lượng",
            "value": "1,65 kg",
            "isHighlight": true
          }
        ]
      },
      {
        "groupName": "Tiêu chuẩn & Bảo hành",
        "items": [
          {
            "key": "Bảo hành",
            "value": "12 tháng",
            "isHighlight": false
          }
        ]
      },
      {
        "groupName": "Thông số kỹ thuật khác",
        "items": [
          {
            "key": "Tay cầm",
            "value": "Quai đinh tán chắc chắn",
            "isHighlight": false
          },
          {
            "key": "Vung",
            "value": "Kính cường lực bền bỉ",
            "isHighlight": false
          },
          {
            "key": "Sử dụng",
            "value": "Bếp từ, bếp ga, bếp Halogen, bếp điện",
            "isHighlight": false
          }
        ]
      }
    ],
    "tags": [],
    "notes": "",
    "description": "Nồi Inox 5 Đáy Cao Cấp Lock&King LK-3018   Chất liệu: Inox cao cấp  Tay cầm: Quai đinh tán chắc chắn  Vung: Kính cường lực bền bỉ  Kích thước: 18 cm  Khối lượng: 1,65 kg  Sử dụng: Bếp từ, bếp ga, bếp Halogen, bếp điện  Bảo hành: 12 tháng",
    "status": "active",
    "updatedAt": "2026-10-01"
  },
  {
    "id": "sheet-lk-3020",
    "sku": "LK-3020",
    "name": "Nồi lẻ Lock&king 20",
    "brand": "LOCK&KING",
    "categoryGroup": "Điện gia dụng",
    "categoryType": "Sản phẩm",
    "thumbnail": "https://i.ibb.co/qLBqqg9S/anh-bang-gia-lk-3020.png",
    "warrantyMonths": 12,
    "pricing": {
      "costPrice": 149800,
      "distributorPrice": 185000,
      "floorPrice": 409500,
      "retailPrice": 315000,
      "currency": "VND"
    },
    "specifications": [
      {
        "groupName": "Kích thước & Thiết kế",
        "items": [
          {
            "key": "Trọng lượng",
            "value": "2 kg",
            "isHighlight": false
          },
          {
            "key": "Chất liệu",
            "value": "Inox cao cấp",
            "isHighlight": false
          },
          {
            "key": "Kích thước",
            "value": "20 cm",
            "isHighlight": true
          },
          {
            "key": "Khối lượng",
            "value": "2 kg",
            "isHighlight": true
          }
        ]
      },
      {
        "groupName": "Tiêu chuẩn & Bảo hành",
        "items": [
          {
            "key": "Bảo hành",
            "value": "12 tháng",
            "isHighlight": false
          }
        ]
      },
      {
        "groupName": "Thông số kỹ thuật khác",
        "items": [
          {
            "key": "Tay cầm",
            "value": "Quai đinh tán chắc chắn",
            "isHighlight": false
          },
          {
            "key": "Vung",
            "value": "Kính cường lực bền bỉ",
            "isHighlight": false
          },
          {
            "key": "Sử dụng",
            "value": "Bếp từ, bếp ga, bếp Halogen, bếp điện",
            "isHighlight": false
          }
        ]
      }
    ],
    "tags": [],
    "notes": "",
    "description": "Nồi Inox 5 Đáy Cao Cấp Lock&King LK-3020    Chất liệu: Inox cao cấp  Tay cầm: Quai đinh tán chắc chắn  Vung: Kính cường lực bền bỉ  Kích thước: 20 cm  Khối lượng: 2 kg  Sử dụng: Bếp từ, bếp ga, bếp Halogen, bếp điện  Bảo hành: 12 tháng",
    "status": "active",
    "updatedAt": "2026-10-01"
  },
  {
    "id": "sheet-lk-3024",
    "sku": "LK-3024",
    "name": "Nồi lẻ Lock&king 24",
    "brand": "LOCK&KING",
    "categoryGroup": "Điện gia dụng",
    "categoryType": "Sản phẩm",
    "thumbnail": "https://i.ibb.co/SDwjyFx1/anh-bang-gia-lk-3024.png",
    "warrantyMonths": 12,
    "pricing": {
      "costPrice": 187505,
      "distributorPrice": 230000,
      "floorPrice": 513500,
      "retailPrice": 395000,
      "currency": "VND"
    },
    "specifications": [
      {
        "groupName": "Kích thước & Thiết kế",
        "items": [
          {
            "key": "Trọng lượng",
            "value": "2 kg",
            "isHighlight": false
          },
          {
            "key": "Chất liệu",
            "value": "Inox cao cấp",
            "isHighlight": false
          },
          {
            "key": "Kích thước",
            "value": "20 cm",
            "isHighlight": true
          },
          {
            "key": "Khối lượng",
            "value": "2 kg",
            "isHighlight": true
          }
        ]
      },
      {
        "groupName": "Tiêu chuẩn & Bảo hành",
        "items": [
          {
            "key": "Bảo hành",
            "value": "12 tháng",
            "isHighlight": false
          }
        ]
      },
      {
        "groupName": "Thông số kỹ thuật khác",
        "items": [
          {
            "key": "Tay cầm",
            "value": "Quai đinh tán chắc chắn",
            "isHighlight": false
          },
          {
            "key": "Vung",
            "value": "Kính cường lực bền bỉ",
            "isHighlight": false
          },
          {
            "key": "Sử dụng",
            "value": "Bếp từ, bếp ga, bếp Halogen, bếp điện",
            "isHighlight": false
          }
        ]
      }
    ],
    "tags": [],
    "notes": "",
    "description": "Nồi Inox 5 Đáy Cao Cấp Lock&King LK-3024   Chất liệu: Inox cao cấp  Tay cầm: Quai đinh tán chắc chắn  Vung: Kính cường lực bền bỉ  Kích thước: 20 cm  Khối lượng: 2 kg  Sử dụng: Bếp từ, bếp ga, bếp Halogen, bếp điện  Bảo hành: 12 tháng",
    "status": "active",
    "updatedAt": "2026-10-01"
  },
  {
    "id": "sheet-lk-92",
    "sku": "LK-92",
    "name": "Nồi chiên không dầu Lock&king",
    "brand": "LOCK&KING",
    "categoryGroup": "Điện gia dụng",
    "categoryType": "Sản phẩm",
    "thumbnail": "https://i.ibb.co/ymKPMS55/anh-bang-gia-lk-92.png",
    "warrantyMonths": 12,
    "pricing": {
      "costPrice": 727600,
      "distributorPrice": 835000,
      "floorPrice": 1908000,
      "retailPrice": 1590000,
      "currency": "VND"
    },
    "specifications": [
      {
        "groupName": "Thông số vận hành",
        "items": [
          {
            "key": "Công suất",
            "value": "1800W",
            "isHighlight": true
          },
          {
            "key": "Điện áp",
            "value": "220v",
            "isHighlight": false
          },
          {
            "key": "Dung tích",
            "value": "9,2L",
            "isHighlight": true
          }
        ]
      },
      {
        "groupName": "Kích thước & Thiết kế",
        "items": [
          {
            "key": "Kích thước",
            "value": "704x410x413mm",
            "isHighlight": false
          }
        ]
      },
      {
        "groupName": "Thông số kỹ thuật khác",
        "items": [
          {
            "key": "Model",
            "value": "LK-92",
            "isHighlight": false
          }
        ]
      }
    ],
    "tags": [],
    "notes": "",
    "description": "Nồi chiên không dầu LOCK&KING  Model: LK-92  Dung tích: 9,2L  Công suất: 1800W  Điện áp: 220v/50Hz  Kích thước: 704x410x413mm  Trọng lượng 15,2 kg",
    "status": "active",
    "updatedAt": "2026-10-01"
  },
  {
    "id": "sheet-lk-9014",
    "sku": "LK-9014",
    "name": "Nồi chiên không dầu Lock&king",
    "brand": "LOCK&KING",
    "categoryGroup": "Điện gia dụng",
    "categoryType": "Sản phẩm",
    "thumbnail": "https://i.ibb.co/0RFZkW5p/anh-bang-gia-lk-9014.png",
    "warrantyMonths": 12,
    "pricing": {
      "costPrice": 936250,
      "distributorPrice": 1130000,
      "floorPrice": 2628000,
      "retailPrice": 2190000,
      "currency": "VND"
    },
    "specifications": [
      {
        "groupName": "Thông số vận hành",
        "items": [
          {
            "key": "Công suất",
            "value": "1800W",
            "isHighlight": true
          },
          {
            "key": "Dung tích",
            "value": "14L",
            "isHighlight": true
          },
          {
            "key": "Điện áp",
            "value": "220V",
            "isHighlight": false
          }
        ]
      },
      {
        "groupName": "Thông số kỹ thuật khác",
        "items": [
          {
            "key": "NỒI CHIÊN KHÔNG DẦU CHIÊN VẠN MÓN NGON -Nhãn hiệu",
            "value": "LOCK&KING, - Model: LK-9014 -Công suất: 1800W,",
            "isHighlight": false
          }
        ]
      }
    ],
    "tags": [],
    "notes": "",
    "description": "NỒI CHIÊN KHÔNG DẦU CHIÊN VẠN MÓN NGON -Nhãn hiệu: LOCK&KING, - Model: LK-9014 -Công suất: 1800W,  -Điện áp: 220V; 50Hz -Dung tích: 14L, - Điều khiển cơ. -Xuất xứ: TQ SX 2025,  - hàng mới 100%.\"",
    "status": "active",
    "updatedAt": "2026-10-01"
  },
  {
    "id": "sheet-lk-1068",
    "sku": "LK-1068",
    "name": "Ấm siêu tốc LK-1068",
    "brand": "LOCK&KING",
    "categoryGroup": "Điện gia dụng",
    "categoryType": "Sản phẩm",
    "thumbnail": "https://i.ibb.co/Y4znfDfx/anh-bang-gia-lk-1068.png",
    "warrantyMonths": 12,
    "pricing": {
      "costPrice": 256800,
      "distributorPrice": 340000,
      "floorPrice": 778700,
      "retailPrice": 599000,
      "currency": "VND"
    },
    "specifications": [
      {
        "groupName": "Kích thước & Thiết kế",
        "items": [
          {
            "key": "Chất liệu",
            "value": "inox 304 Điện áp: 220 -240V Dung tích: 1",
            "isHighlight": false
          }
        ]
      },
      {
        "groupName": "Tiêu chuẩn & Bảo hành",
        "items": [
          {
            "key": "Ấm siêu tốc An toàn cho sức khỏe Model",
            "value": "LK-1068 Chất liệu: inox 304 Điện áp: 220 -240V Dung tích: 1,7L Công suất: 1850 -2200W Tần suất: 50-60Hz Xuất xứ: Trung Quốc",
            "isHighlight": false
          }
        ]
      }
    ],
    "tags": [],
    "notes": "",
    "description": "Ấm siêu tốc An toàn cho sức khỏe Model: LK-1068 Chất liệu: inox 304 Điện áp: 220 -240V Dung tích: 1,7L Công suất: 1850 -2200W Tần suất: 50-60Hz Xuất xứ: Trung Quốc",
    "status": "active",
    "updatedAt": "2026-10-01"
  },
  {
    "id": "sheet-lk-1035",
    "sku": "LK-1035",
    "name": "Ấm đun nước LK-1035",
    "brand": "LOCK&KING",
    "categoryGroup": "Điện gia dụng",
    "categoryType": "Sản phẩm",
    "thumbnail": "https://i.ibb.co/r2qrZVyB/anh-bang-gia-lk-1035.png",
    "warrantyMonths": 12,
    "pricing": {
      "costPrice": 217057,
      "distributorPrice": 275000,
      "floorPrice": 713700,
      "retailPrice": 549000,
      "currency": "VND"
    },
    "specifications": [
      {
        "groupName": "Kích thước & Thiết kế",
        "items": [
          {
            "key": "Chất liệu",
            "value": "Inox 304 - Model: LK-1035 - Dung Tích: 3",
            "isHighlight": false
          },
          {
            "key": "Đường kính đáy",
            "value": "22cm - Chiều cao thành ấm: 15cm - Chiều cao có tay cầm: 25cm - Chiều dài (cả ấm và vòi): 25cm - Trọng lượng: 1,6kg - Xuất xứ: Trung Quốc",
            "isHighlight": false
          }
        ]
      }
    ],
    "tags": [],
    "notes": "",
    "description": "Ấm đun nước Còi báo hiệu sôi thông minh * Thông tin sản phẩm* - Chất liệu: Inox 304 - Model: LK-1035 - Dung Tích: 3,5L - Cấu tạo: 3 lớp - Đường kính miệng trên: 10cm  - Đường kính đáy: 22cm - Chiều cao thành ấm: 15cm - Chiều cao có tay cầm: 25cm - Chiều dài (cả ấm và vòi): 25cm - Trọng lượng: 1,6kg - Xuất xứ: Trung Quốc",
    "status": "active",
    "updatedAt": "2026-10-01"
  },
  {
    "id": "sheet-lk-1038",
    "sku": "LK-1038",
    "name": "Ấm đun nước LK-1038",
    "brand": "LOCK&KING",
    "categoryGroup": "Điện gia dụng",
    "categoryType": "Sản phẩm",
    "thumbnail": "https://i.ibb.co/r2NHyBCb/anh-bang-gia-lk-1038.png",
    "warrantyMonths": 12,
    "pricing": {
      "costPrice": 235094,
      "distributorPrice": 300000,
      "floorPrice": 682500,
      "retailPrice": 525000,
      "currency": "VND"
    },
    "specifications": [
      {
        "groupName": "Kích thước & Thiết kế",
        "items": [
          {
            "key": "Chất liệu",
            "value": "Inox 304 - Model: LK-1038 - Dung Tích: 3",
            "isHighlight": false
          },
          {
            "key": "Ấm đun nước * Thông tin sản phẩm* - Chất liệu",
            "value": "Inox 304 - Model: LK-1038 - Dung Tích: 3,8L - Cấu tạo: 3 lớp - Đường kính miệng trên: 10cm",
            "isHighlight": false
          },
          {
            "key": "Đường kính đáy",
            "value": "22cm - Chiều cao thành ấm: 15cm - Chiều cao có tay cầm: 25cm - Chiều dài (cả ấm và vòi): 25cm - Trọng lượng: 1,6kg - Xuất xứ: Trung Quốc",
            "isHighlight": false
          }
        ]
      }
    ],
    "tags": [],
    "notes": "",
    "description": "Ấm đun nước * Thông tin sản phẩm* - Chất liệu: Inox 304 - Model: LK-1038 - Dung Tích: 3,8L - Cấu tạo: 3 lớp - Đường kính miệng trên: 10cm  - Đường kính đáy: 22cm - Chiều cao thành ấm: 15cm - Chiều cao có tay cầm: 25cm - Chiều dài (cả ấm và vòi): 25cm - Trọng lượng: 1,6kg - Xuất xứ: Trung Quốc",
    "status": "active",
    "updatedAt": "2026-10-01"
  },
  {
    "id": "sheet-lk-2808sa",
    "sku": "LK-2808SA",
    "name": "Chảo sâu Titan vàng 28*9cm (2,3 mm) LK-2808SA",
    "brand": "LOCK&KING",
    "categoryGroup": "Điện gia dụng",
    "categoryType": "Sản phẩm",
    "thumbnail": "https://i.ibb.co/Zp8jRV7j/Chat-GPT-Image-23-06-51-15-thg-3-2026.png",
    "warrantyMonths": 12,
    "pricing": {
      "costPrice": 319135,
      "distributorPrice": 431000,
      "floorPrice": 988000,
      "retailPrice": 760000,
      "currency": "VND"
    },
    "specifications": [
      {
        "groupName": "Kích thước & Thiết kế",
        "items": [
          {
            "key": "Chất liệu",
            "value": "inox cao cấp Chất liệu inox 316 Kích thước 28*9cm",
            "isHighlight": false
          }
        ]
      }
    ],
    "tags": [],
    "notes": "",
    "description": "CHẢO SÂU TITANIUM Chất liệu inox cao cấp Chất liệu inox 316 Kích thước 28*9cm, dày 2.3mm Chống dính bằng titanium (tạo kháng khuẩn tự nhiên) Đúc liền khối 5 lớp Nắp đậy tiện dụng Tay cầm đinh tán chắc chắn",
    "status": "active",
    "updatedAt": "2026-10-01"
  },
  {
    "id": "sheet-lk-2808sa-kh-ng-n-p",
    "sku": "LK-2808SA KHÔNG NẮP",
    "name": "Chảo sâu Titan vàng 28*9cm (2,3 mm) LK-2808SA không nắp",
    "brand": "LOCK&KING",
    "categoryGroup": "Điện gia dụng",
    "categoryType": "Sản phẩm",
    "thumbnail": "https://i.ibb.co/GvvqQQRw/Chat-GPT-Image-23-09-14-15-thg-3-2026.png",
    "warrantyMonths": 12,
    "pricing": {
      "costPrice": 300792,
      "distributorPrice": 412000,
      "floorPrice": 962000,
      "retailPrice": 740000,
      "currency": "VND"
    },
    "specifications": [
      {
        "groupName": "Kích thước & Thiết kế",
        "items": [
          {
            "key": "Chất liệu",
            "value": "inox cao cấp Chất liệu inox 316 Kích thước 28*9cm",
            "isHighlight": false
          }
        ]
      }
    ],
    "tags": [],
    "notes": "",
    "description": "CHẢO SÂU TITANIUM Chất liệu inox cao cấp Chất liệu inox 316 Kích thước 28*9cm, dày 2.3mm Chống dính bằng titanium (tạo kháng khuẩn tự nhiên) Đúc liền khối 5 lớp Nắp đậy tiện dụng Tay cầm đinh tán chắc chắn",
    "status": "active",
    "updatedAt": "2026-10-01"
  },
  {
    "id": "sheet-lk-2202a",
    "sku": "LK-2202A",
    "name": "chảo cạn Titan vàng 22*5,5cm (2,2 mm) LK-2202A",
    "brand": "LOCK&KING",
    "categoryGroup": "Điện gia dụng",
    "categoryType": "Sản phẩm",
    "thumbnail": "https://i.ibb.co/MyyYrsqS/image-2.jpg",
    "warrantyMonths": 12,
    "pricing": {
      "costPrice": 193466,
      "distributorPrice": 260000,
      "floorPrice": 607048,
      "retailPrice": 466960,
      "currency": "VND"
    },
    "specifications": [
      {
        "groupName": "Kích thước & Thiết kế",
        "items": [
          {
            "key": "Chất liệu",
            "value": "inox cao cấp Chất liệu inox 316 Kích thước 22*5",
            "isHighlight": false
          }
        ]
      }
    ],
    "tags": [],
    "notes": "",
    "description": "CHẢO CẠN TITANIUM Chất liệu inox cao cấp Chất liệu inox 316 Kích thước 22*5.5cm, dày 2.2mm Chống dính bằng titanium (tạo kháng khuẩn tự nhiên) Đúc liền khối 5 lớp Tay cầm đinh tán chắc chắn",
    "status": "active",
    "updatedAt": "2026-10-01"
  },
  {
    "id": "sheet-lk-2606",
    "sku": "LK-2606",
    "name": "Chảo cạn Titan vàng 26*6,5cm (2,2 mm) LK-2606",
    "brand": "LOCK&KING",
    "categoryGroup": "Điện gia dụng",
    "categoryType": "Sản phẩm",
    "thumbnail": "https://i.ibb.co/21kcSv89/anh-bang-gia-lk-2606.png",
    "warrantyMonths": 12,
    "pricing": {
      "costPrice": 216272,
      "distributorPrice": 310000,
      "floorPrice": 767000,
      "retailPrice": 590000,
      "currency": "VND"
    },
    "specifications": [
      {
        "groupName": "Kích thước & Thiết kế",
        "items": [
          {
            "key": "Chất liệu",
            "value": "inox cao cấp Chất liệu inox 316 Kích thước 26*6",
            "isHighlight": false
          }
        ]
      }
    ],
    "tags": [],
    "notes": "",
    "description": "CHẢO CẠN TITANIUM Chất liệu inox cao cấp Chất liệu inox 316 Kích thước 26*6.5cm, dày 2.2mm Chống dính bằng titanium (tạo kháng khuẩn tự nhiên) Đúc liền khối 5 lớp Tay cầm đinh tán chắc chắn",
    "status": "active",
    "updatedAt": "2026-10-01"
  },
  {
    "id": "sheet-lk-2404s",
    "sku": "LK-2404S",
    "name": "Chảo sâu Titan vàng 24*8,5cm (2,3 mm) LK-2404S",
    "brand": "LOCK&KING",
    "categoryGroup": "Điện gia dụng",
    "categoryType": "Sản phẩm",
    "thumbnail": "https://i.ibb.co/gFBv1Ndw/anh-bang-gia-lk-2404s.png",
    "warrantyMonths": 12,
    "pricing": {
      "costPrice": 251705,
      "distributorPrice": 360000,
      "floorPrice": 843700,
      "retailPrice": 649000,
      "currency": "VND"
    },
    "specifications": [
      {
        "groupName": "Kích thước & Thiết kế",
        "items": [
          {
            "key": "Chất liệu",
            "value": "inox cao cấp Chất liệu inox 316 Kích thước 24*28",
            "isHighlight": false
          }
        ]
      }
    ],
    "tags": [],
    "notes": "",
    "description": "CHẢO SÂU TITANIUM Chất liệu inox cao cấp Chất liệu inox 316 Kích thước 24*28,5cm, dày 2.3mm Chống dính bằng titanium (tạo kháng khuẩn tự nhiên) Đúc liền khối 5 lớp Nắp đậy tiện dụng Tay cầm đinh tán chắc chắn",
    "status": "active",
    "updatedAt": "2026-10-01"
  },
  {
    "id": "sheet-lk-2808",
    "sku": "LK-2808",
    "name": "Chảo cạn Titan vàng 28*7cm (2,3 mm)",
    "brand": "LOCK&KING",
    "categoryGroup": "Điện gia dụng",
    "categoryType": "Sản phẩm",
    "thumbnail": "https://i.ibb.co/mV3Dvxvv/image-3.jpg",
    "warrantyMonths": 12,
    "pricing": {
      "costPrice": 254000,
      "distributorPrice": 341000,
      "floorPrice": 819000,
      "retailPrice": 630000,
      "currency": "VND"
    },
    "specifications": [
      {
        "groupName": "Kích thước & Thiết kế",
        "items": [
          {
            "key": "Chất liệu",
            "value": "inox cao cấp Chất liệu inox 316 Model: LK-2808 Chất liệu inox 316 Cao cấp Kích thước 28*7cm",
            "isHighlight": false
          }
        ]
      }
    ],
    "tags": [],
    "notes": "",
    "description": "CHẢO CẠN TITANIUM Chất liệu inox cao cấp Chất liệu inox 316 Model: LK-2808 Chất liệu inox 316 Cao cấp Kích thước 28*7cm, dày 2.2mm Chống dính bằng titanium (tạo kháng khuẩn tự nhiên) Đúc liền khối 5 lớp Tay cầm đinh tán chắc chắn\"",
    "status": "active",
    "updatedAt": "2026-10-01"
  },
  {
    "id": "sheet-lk-3212",
    "sku": "LK-3212",
    "name": "Chảo xào lớn",
    "brand": "LOCK&KING",
    "categoryGroup": "Điện gia dụng",
    "categoryType": "Sản phẩm",
    "thumbnail": "https://i.ibb.co/LzjzP8tZ/z7666139889720-993f6712793d8e86ce49f8b68ad05ad8.jpg",
    "warrantyMonths": 12,
    "pricing": {
      "costPrice": 476000,
      "distributorPrice": 645000,
      "floorPrice": 1548000,
      "retailPrice": 1290000,
      "currency": "VND"
    },
    "specifications": [
      {
        "groupName": "Kích thước & Thiết kế",
        "items": [
          {
            "key": "Chất liệu",
            "value": "Inox 316 Đóng gói: 4 chiếc/ thùng",
            "isHighlight": false
          }
        ]
      },
      {
        "groupName": "Thông số kỹ thuật khác",
        "items": [
          {
            "key": "Tên sản phẩm",
            "value": "Chảo xào lớn Model: LK-3212 Chất liệu: Inox 316 Đóng gói: 4 chiếc/ thùng",
            "isHighlight": false
          }
        ]
      }
    ],
    "tags": [],
    "notes": "",
    "description": "Tên sản phẩm: Chảo xào lớn Model: LK-3212 Chất liệu: Inox 316 Đóng gói: 4 chiếc/ thùng",
    "status": "active",
    "updatedAt": "2026-10-01"
  },
  {
    "id": "sheet-lk-1003",
    "sku": "LK-1003",
    "name": "Bộ đèn sưởi 3 bóng Lock&King",
    "brand": "LOCK&KING",
    "categoryGroup": "Điện gia dụng",
    "categoryType": "Sản phẩm",
    "thumbnail": "https://i.ibb.co/PzMdGv3N/anh-bang-gia-lk-1003.png",
    "warrantyMonths": 12,
    "pricing": {
      "costPrice": 167990,
      "distributorPrice": 197000,
      "floorPrice": 460200,
      "retailPrice": 354000,
      "currency": "VND"
    },
    "specifications": [
      {
        "groupName": "Thông số vận hành",
        "items": [
          {
            "key": "Công suất",
            "value": "825w",
            "isHighlight": true
          }
        ]
      },
      {
        "groupName": "Thông số kỹ thuật khác",
        "items": [
          {
            "key": "Tên sản phẩm",
            "value": "Đèn sưới nhà tắm 3 bóng cao cấp Lock&King -Model: LK-1003 -Điện áp: 230/50Hz -Công suất: 825w -Kích thước sản phẩm: 25x24x48 cm -Kích thước bao bì: 25.5x25.5x51 cm -Loại Bóng: Bóng vàng -Năm sản xuất: Ghi trên tem bảo hành -Sản xuất tại: Việt Nam",
            "isHighlight": false
          }
        ]
      }
    ],
    "tags": [],
    "notes": "",
    "description": "-Tên sản phẩm: Đèn sưới nhà tắm 3 bóng cao cấp Lock&King -Model: LK-1003 -Điện áp: 230/50Hz -Công suất: 825w -Kích thước sản phẩm: 25x24x48 cm -Kích thước bao bì: 25.5x25.5x51 cm -Loại Bóng: Bóng vàng -Năm sản xuất: Ghi trên tem bảo hành -Sản xuất tại: Việt Nam",
    "status": "active",
    "updatedAt": "2026-10-01"
  },
  {
    "id": "sheet-lk-1033",
    "sku": "LK-1033",
    "name": "Bộ đèn sưởi 3 bóng Lock&King",
    "brand": "LOCK&KING",
    "categoryGroup": "Điện gia dụng",
    "categoryType": "Sản phẩm",
    "thumbnail": "https://i.ibb.co/CpVLSF3z/anh-bang-gia-lk-1033.png",
    "warrantyMonths": 12,
    "pricing": {
      "costPrice": 306020,
      "distributorPrice": 372000,
      "floorPrice": 870480,
      "retailPrice": 669600,
      "currency": "VND"
    },
    "specifications": [
      {
        "groupName": "Thông số vận hành",
        "items": [
          {
            "key": "Công suất",
            "value": "825w",
            "isHighlight": true
          }
        ]
      },
      {
        "groupName": "Thông số kỹ thuật khác",
        "items": [
          {
            "key": "Tên sản phẩm",
            "value": "Đèn sưới nhà tắm 3 bóng cao cấp Lock&King -Model: LK-1033 -Điện áp: 230/50Hz -Công suất: 825w -Kích thước sản phẩm: 51.8x23.5x21.4 cm -Kích thước bao bì: 57x26x26 cm -Loại Bóng: Bóng mờ -Năm sản xuất: Ghi trên tem bảo hành -Sản xuất tại: Việt Nam",
            "isHighlight": false
          }
        ]
      }
    ],
    "tags": [],
    "notes": "",
    "description": "-Tên sản phẩm: Đèn sưới nhà tắm 3 bóng cao cấp Lock&King -Model: LK-1033 -Điện áp: 230/50Hz -Công suất: 825w -Kích thước sản phẩm: 51.8x23.5x21.4 cm -Kích thước bao bì: 57x26x26 cm -Loại Bóng: Bóng mờ -Năm sản xuất: Ghi trên tem bảo hành -Sản xuất tại: Việt Nam",
    "status": "active",
    "updatedAt": "2026-10-01"
  },
  {
    "id": "sheet-lk-588",
    "sku": "LK-588",
    "name": "Sưởi gốm thân cao",
    "brand": "LOCK&KING",
    "categoryGroup": "Điện gia dụng",
    "categoryType": "Sản phẩm",
    "thumbnail": "https://i.ibb.co/6cy2BVWx/anh-bang-gia-lk-588.png",
    "warrantyMonths": 12,
    "pricing": {
      "costPrice": 468762,
      "distributorPrice": 585000,
      "floorPrice": 1260000,
      "retailPrice": 1050000,
      "currency": "VND"
    },
    "specifications": [
      {
        "groupName": "Thông số vận hành",
        "items": [
          {
            "key": "Công suất",
            "value": "2000W",
            "isHighlight": true
          },
          {
            "key": "Điện áp",
            "value": "220v",
            "isHighlight": false
          }
        ]
      },
      {
        "groupName": "Kích thước & Thiết kế",
        "items": [
          {
            "key": "Chất liệu",
            "value": "Nhựa PP",
            "isHighlight": false
          },
          {
            "key": "gốm Kích thước",
            "value": "93x24cm",
            "isHighlight": true
          }
        ]
      },
      {
        "groupName": "Thông số kỹ thuật khác",
        "items": [
          {
            "key": "Model",
            "value": "LK-588",
            "isHighlight": false
          }
        ]
      }
    ],
    "tags": [],
    "notes": "",
    "description": "Máy Sưởi Gốm Lock&King   Model: LK-588   Công suất: 2000W  Điện áp: 220v/50Hz   Chất liệu: Nhựa PP,   gốm Kích thước: 93x24cm",
    "status": "active",
    "updatedAt": "2026-10-01"
  },
  {
    "id": "sheet-lk-586",
    "sku": "LK-586",
    "name": "Sưởi gốm thấp",
    "brand": "LOCK&KING",
    "categoryGroup": "Điện gia dụng",
    "categoryType": "Sản phẩm",
    "thumbnail": "https://i.ibb.co/NgNMyZv4/image-1.jpg",
    "warrantyMonths": 12,
    "pricing": {
      "costPrice": 366857,
      "distributorPrice": 430000,
      "floorPrice": 968500,
      "retailPrice": 745000,
      "currency": "VND"
    },
    "specifications": [
      {
        "groupName": "Thông số vận hành",
        "items": [
          {
            "key": "Công suất",
            "value": "2000W",
            "isHighlight": true
          },
          {
            "key": "Điện áp",
            "value": "220v",
            "isHighlight": false
          }
        ]
      },
      {
        "groupName": "Kích thước & Thiết kế",
        "items": [
          {
            "key": "Chất liệu",
            "value": "Nhựa PP",
            "isHighlight": false
          },
          {
            "key": "Kích thước",
            "value": "65*27cm",
            "isHighlight": true
          }
        ]
      },
      {
        "groupName": "Thông số kỹ thuật khác",
        "items": [
          {
            "key": "Model",
            "value": "LK-586",
            "isHighlight": false
          }
        ]
      }
    ],
    "tags": [],
    "notes": "",
    "description": "Máy Sưởi Gốm Lock&King  Model: LK-586  Công suất: 2000W  Điện áp: 220v/50Hz  Chất liệu: Nhựa PP, gốm  Kích thước: 65*27cm",
    "status": "active",
    "updatedAt": "2026-10-01"
  },
  {
    "id": "sheet-lk-5301",
    "sku": "LK-5301",
    "name": "Sưởi để bàn",
    "brand": "LOCK&KING",
    "categoryGroup": "Điện gia dụng",
    "categoryType": "Sản phẩm",
    "thumbnail": "https://i.ibb.co/nN9Xnmf7/image.jpg",
    "warrantyMonths": 12,
    "pricing": {
      "costPrice": 468762,
      "distributorPrice": 600000,
      "floorPrice": 1428000,
      "retailPrice": 1190000,
      "currency": "VND"
    },
    "specifications": [
      {
        "groupName": "Thông số vận hành",
        "items": [
          {
            "key": "Công suất",
            "value": "1500W",
            "isHighlight": true
          },
          {
            "key": "Điện áp",
            "value": "220V",
            "isHighlight": false
          }
        ]
      },
      {
        "groupName": "Kích thước & Thiết kế",
        "items": [
          {
            "key": "Chất liệu",
            "value": "lõi sưởi: gốm cao cấp - tránh làm khô da • Vỏ: nhựa PP cứng cáp",
            "isHighlight": false
          }
        ]
      },
      {
        "groupName": "Thông số kỹ thuật khác",
        "items": [
          {
            "key": "\"Quạt Sưởi Để Bàn Lock&King LK-5301 • Model",
            "value": "LK-5301 • Điện áp: 220V/50Hz",
            "isHighlight": false
          },
          {
            "key": "Chức năng",
            "value": "Sưởi ấm cho gia đình",
            "isHighlight": false
          },
          {
            "key": "Quạt đèn - Ấm 1+đèn - Ấm 2+đèn -Quy cách",
            "value": "4 chiếc/1 kiện \"",
            "isHighlight": false
          }
        ]
      },
      {
        "groupName": "Công nghệ & Tính năng",
        "items": [
          {
            "key": "6 chế độ",
            "value": "Quạt - Ấm 1 - Ấm 2,",
            "isHighlight": false
          }
        ]
      }
    ],
    "tags": [],
    "notes": "",
    "description": "\"Quạt Sưởi Để Bàn Lock&King LK-5301 • Model: LK-5301 • Điện áp: 220V/50Hz  • Công suất: 1500W – siêu tiết kiệm điện. • Kích thước: 260x290mm • Chất liệu lõi sưởi: gốm cao cấp - tránh làm khô da • Vỏ: nhựa PP cứng cáp, an toàn cho sức khỏe người sử dụng  • Chức năng: Sưởi ấm cho gia đình  • 6 chế độ: Quạt - Ấm 1 - Ấm 2,   Quạt đèn - Ấm 1+đèn - Ấm 2+đèn -Quy cách: 4 chiếc/1 kiện \"",
    "status": "active",
    "updatedAt": "2026-10-01"
  },
  {
    "id": "sheet-lk-4208a",
    "sku": "LK-4208A",
    "name": "Nồi Nấu Chậm Lock&King LK-4208A",
    "brand": "LOCK&KING",
    "categoryGroup": "Điện gia dụng",
    "categoryType": "Sản phẩm",
    "thumbnail": "https://i.ibb.co/Q3LctPCv/anh-bang-gia-4208a.png",
    "warrantyMonths": 12,
    "pricing": {
      "costPrice": 405581,
      "distributorPrice": 510000,
      "floorPrice": 1235000,
      "retailPrice": 950000,
      "currency": "VND"
    },
    "specifications": [
      {
        "groupName": "Thông số vận hành",
        "items": [
          {
            "key": "Công suất",
            "value": "170W",
            "isHighlight": true
          },
          {
            "key": "Dung tích",
            "value": "4.2L",
            "isHighlight": true
          },
          {
            "key": "Điện áp",
            "value": "220V",
            "isHighlight": false
          }
        ]
      },
      {
        "groupName": "Kích thước & Thiết kế",
        "items": [
          {
            "key": "Chất liệu",
            "value": "gốm Ceramic cao cấp giữ nhiệt tốt",
            "isHighlight": false
          },
          {
            "key": "Chất liệu lòng nồi",
            "value": "gốm Ceramic cao cấp giữ nhiệt tốt.",
            "isHighlight": false
          },
          {
            "key": "Vỏ nồi",
            "value": "nhựa PP an toàn cho sức khỏe người sử dụng",
            "isHighlight": false
          }
        ]
      },
      {
        "groupName": "Thông số kỹ thuật khác",
        "items": [
          {
            "key": "Nồi Nấu Chậm Nấu triệu món ngon • Model",
            "value": "LK-4208A • Điện áp: 220V/50Hz",
            "isHighlight": false
          },
          {
            "key": "Chức năng",
            "value": "nấu cháo, hầm xương, kho cá, nấu chè, nấu thức ăn cho bé…",
            "isHighlight": false
          }
        ]
      },
      {
        "groupName": "Công nghệ & Tính năng",
        "items": [
          {
            "key": "3 chế độ",
            "value": "Low – High – Warm -Quy cách: 2 chiếc/1 kiện",
            "isHighlight": false
          }
        ]
      }
    ],
    "tags": [],
    "notes": "",
    "description": "Nồi Nấu Chậm Nấu triệu món ngon • Model: LK-4208A • Điện áp: 220V/50Hz  • Công suất: 170W – siêu tiết kiệm điện.  • Dung tích: 4.2L – nấu được lượng lớn thức ăn.  • Chất liệu lòng nồi: gốm Ceramic cao cấp giữ nhiệt tốt.  • Vỏ nồi: nhựa PP an toàn cho sức khỏe người sử dụng  • Chức năng: nấu cháo, hầm xương, kho cá, nấu chè, nấu thức ăn cho bé…  • 3 chế độ: Low – High – Warm -Quy cách: 2 chiếc/1 kiện",
    "status": "active",
    "updatedAt": "2026-10-01"
  },
  {
    "id": "sheet-lk-4026a",
    "sku": "LK-4026A",
    "name": "Nồi Nấu Chậm Lock&King LK-4026A",
    "brand": "LOCK&KING",
    "categoryGroup": "Điện gia dụng",
    "categoryType": "Sản phẩm",
    "thumbnail": "https://i.ibb.co/6RSSskMn/anh-bang-gia-lk-4026a.jpg",
    "warrantyMonths": 12,
    "pricing": {
      "costPrice": 356667,
      "distributorPrice": 440000,
      "floorPrice": 1105000,
      "retailPrice": 850000,
      "currency": "VND"
    },
    "specifications": [
      {
        "groupName": "Thông số vận hành",
        "items": [
          {
            "key": "Công suất",
            "value": "170W",
            "isHighlight": true
          },
          {
            "key": "Dung tích",
            "value": "4.0L",
            "isHighlight": true
          },
          {
            "key": "Điện áp",
            "value": "220V",
            "isHighlight": false
          }
        ]
      },
      {
        "groupName": "Kích thước & Thiết kế",
        "items": [
          {
            "key": "Chất liệu",
            "value": "gốm Ceramic cao cấp giữ nhiệt tốt",
            "isHighlight": false
          },
          {
            "key": "Chất liệu lòng nồi",
            "value": "gốm Ceramic cao cấp giữ nhiệt tốt.",
            "isHighlight": false
          },
          {
            "key": "Vỏ nồi",
            "value": "nhựa PP an toàn cho sức khỏe người sử dụng",
            "isHighlight": false
          }
        ]
      },
      {
        "groupName": "Thông số kỹ thuật khác",
        "items": [
          {
            "key": "Nồi Nấu Chậm Nấu triệu món ngon • Model",
            "value": "LK-4026",
            "isHighlight": false
          },
          {
            "key": "Chức năng",
            "value": "nấu cháo, hầm xương, kho cá, nấu chè, nấu thức ăn cho bé…",
            "isHighlight": false
          }
        ]
      },
      {
        "groupName": "Công nghệ & Tính năng",
        "items": [
          {
            "key": "3 chế độ",
            "value": "Low – High – Warm -Quy cách: 2 chiếc/1 kiện",
            "isHighlight": false
          }
        ]
      }
    ],
    "tags": [],
    "notes": "",
    "description": "Nồi Nấu Chậm Nấu triệu món ngon • Model: LK-4026  • Điện áp: 220V/50Hz  • Công suất: 170W – siêu tiết kiệm điện.  • Dung tích: 4.0L – nấu được lượng lớn thức ăn.  • Chất liệu lòng nồi: gốm Ceramic cao cấp giữ nhiệt tốt.  • Vỏ nồi: nhựa PP an toàn cho sức khỏe người sử dụng  • Chức năng: nấu cháo, hầm xương, kho cá, nấu chè, nấu thức ăn cho bé…  • 3 chế độ: Low – High – Warm -Quy cách: 2 chiếc/1 kiện",
    "status": "active",
    "updatedAt": "2026-10-01"
  },
  {
    "id": "sheet-lk-4209",
    "sku": "LK-4209",
    "name": "Nồi Nấu Chậm Lock&King LK-4209",
    "brand": "LOCK&KING",
    "categoryGroup": "Điện gia dụng",
    "categoryType": "Sản phẩm",
    "thumbnail": "https://i.ibb.co/LDZFZFnm/Chat-GPT-Image-23-28-09-15-thg-3-2026.png",
    "warrantyMonths": 12,
    "pricing": {
      "costPrice": 387583,
      "distributorPrice": 510000,
      "floorPrice": 1235000,
      "retailPrice": 950000,
      "currency": "VND"
    },
    "specifications": [
      {
        "groupName": "Thông số vận hành",
        "items": [
          {
            "key": "Công suất",
            "value": "170W",
            "isHighlight": true
          },
          {
            "key": "Dung tích",
            "value": "4.2L",
            "isHighlight": true
          },
          {
            "key": "Điện áp",
            "value": "220V",
            "isHighlight": false
          }
        ]
      },
      {
        "groupName": "Kích thước & Thiết kế",
        "items": [
          {
            "key": "Chất liệu",
            "value": "gốm Ceramic cao cấp giữ nhiệt tốt",
            "isHighlight": false
          },
          {
            "key": "Chất liệu lòng nồi",
            "value": "gốm Ceramic cao cấp giữ nhiệt tốt.",
            "isHighlight": false
          },
          {
            "key": "Vỏ nồi",
            "value": "nhựa PP an toàn cho sức khỏe người sử dụng",
            "isHighlight": false
          }
        ]
      },
      {
        "groupName": "Thông số kỹ thuật khác",
        "items": [
          {
            "key": "Nồi Nấu Chậm Nấu triệu món ngon • Model",
            "value": "LK-4209 • Điện áp: 220V/50Hz",
            "isHighlight": false
          },
          {
            "key": "Chức năng",
            "value": "nấu cháo, hầm xương, kho cá, nấu chè, nấu thức ăn cho bé…",
            "isHighlight": false
          }
        ]
      },
      {
        "groupName": "Công nghệ & Tính năng",
        "items": [
          {
            "key": "3 chế độ",
            "value": "Low – High – Warm -Quy cách: 2 chiếc/1 kiện",
            "isHighlight": false
          }
        ]
      }
    ],
    "tags": [],
    "notes": "",
    "description": "Nồi Nấu Chậm Nấu triệu món ngon • Model: LK-4209 • Điện áp: 220V/50Hz  • Công suất: 170W – siêu tiết kiệm điện.  • Dung tích: 4.2L – nấu được lượng lớn thức ăn.  • Chất liệu lòng nồi: gốm Ceramic cao cấp giữ nhiệt tốt.  • Vỏ nồi: nhựa PP an toàn cho sức khỏe người sử dụng  • Chức năng: nấu cháo, hầm xương, kho cá, nấu chè, nấu thức ăn cho bé…  • 3 chế độ: Low – High – Warm -Quy cách: 2 chiếc/1 kiện",
    "status": "active",
    "updatedAt": "2026-10-01"
  },
  {
    "id": "sheet-lk688",
    "sku": "LK688",
    "name": "Tủ sấy quần áo cao cấp Lock&king 2400W",
    "brand": "LOCK&KING",
    "categoryGroup": "Điện gia dụng",
    "categoryType": "Sản phẩm",
    "thumbnail": "https://i.ibb.co/dw7gpXFs/anh-bang-gia-lk-688.png",
    "warrantyMonths": 12,
    "pricing": {
      "costPrice": 727600,
      "distributorPrice": 850000,
      "floorPrice": 2028000,
      "retailPrice": 1690000,
      "currency": "VND"
    },
    "specifications": [
      {
        "groupName": "Thông số vận hành",
        "items": [
          {
            "key": "Công suất",
            "value": "2400W",
            "isHighlight": true
          },
          {
            "key": "Điện áp",
            "value": "220V- 50Hz",
            "isHighlight": false
          },
          {
            "key": "TỦ SẤY QUẦN ÁO CAO CẤP LOCK&KING 2400W -Công suất",
            "value": "2400W - Điện áp: 220V- 50Hz - Trọng lượng sấy tối đa: 50kg - Hẹn giờ thông minh: 30-180 (phút) - Bảng điều khiển: Núm vặn",
            "isHighlight": true
          }
        ]
      },
      {
        "groupName": "Kích thước & Thiết kế",
        "items": [
          {
            "key": "Kích thước",
            "value": "180*100*48cm",
            "isHighlight": false
          },
          {
            "key": "Chất liệu",
            "value": "inox 201 - Nhựa: Nguyên sinh - Có bánh xe",
            "isHighlight": false
          }
        ]
      },
      {
        "groupName": "Công nghệ & Tính năng",
        "items": [
          {
            "key": "Công nghệ",
            "value": "sấy: Cộng hưởng nhiệt PTC làm khô tĩnh học - Kích thước: 180*100*48cm - inox: 16 thanh phi 25",
            "isHighlight": false
          },
          {
            "key": "Bảng điều khiển",
            "value": "Núm vặn",
            "isHighlight": false
          },
          {
            "key": "Công nghệ sấy",
            "value": "Cộng hưởng nhiệt PTC làm khô tĩnh học - Kích thước: 180*100*48cm - inox: 16 thanh phi 25,5 độ dày 0.4, chất liệu inox 201 - Nhựa: Nguyên sinh - Có bánh xe, thuận tiện di chuyển",
            "isHighlight": false
          }
        ]
      }
    ],
    "tags": [],
    "notes": "",
    "description": "TỦ SẤY QUẦN ÁO CAO CẤP LOCK&KING 2400W -Công suất: 2400W - Điện áp: 220V- 50Hz - Trọng lượng sấy tối đa: 50kg - Hẹn giờ thông minh: 30-180 (phút) - Bảng điều khiển: Núm vặn  - Công nghệ sấy: Cộng hưởng nhiệt PTC làm khô tĩnh học - Kích thước: 180*100*48cm - inox: 16 thanh phi 25,5 độ dày 0.4, chất liệu inox 201 - Nhựa: Nguyên sinh - Có bánh xe, thuận tiện di chuyển",
    "status": "active",
    "updatedAt": "2026-10-01"
  },
  {
    "id": "sheet-lk-668",
    "sku": "LK 668",
    "name": "Tủ sấy quần áo cao cấp Lock&king 1500W",
    "brand": "LOCK&KING",
    "categoryGroup": "Điện gia dụng",
    "categoryType": "Sản phẩm",
    "thumbnail": "https://i.ibb.co/VYXGsv0x/anh-bang-gia-lk-668.png",
    "warrantyMonths": 12,
    "pricing": {
      "costPrice": 395900,
      "distributorPrice": 460000,
      "floorPrice": 1196000,
      "retailPrice": 920000,
      "currency": "VND"
    },
    "specifications": [
      {
        "groupName": "Thông số vận hành",
        "items": [
          {
            "key": "Công suất",
            "value": "1500W",
            "isHighlight": true
          },
          {
            "key": "Điện áp",
            "value": "220V- 50Hz",
            "isHighlight": false
          },
          {
            "key": "TỦ SẤY QUẦN ÁO CAO CẤP LOCK&KING 1500W -Công suất",
            "value": "1500W - Điện áp: 220V- 50Hz - Trọng lượng sấy tối đa: 20kg - Hẹn giờ thông minh: 30-180 (phút) - Bảng điều khiển: Núm vặn",
            "isHighlight": true
          }
        ]
      },
      {
        "groupName": "Kích thước & Thiết kế",
        "items": [
          {
            "key": "Kích thước",
            "value": "160*90*46cm",
            "isHighlight": false
          }
        ]
      },
      {
        "groupName": "Công nghệ & Tính năng",
        "items": [
          {
            "key": "Công nghệ",
            "value": "sấy: Cộng hưởng nhiệt PTC làm khô tĩnh học - Kích thước: 160*90*46cm - inox: 16 thanh phi 19 - Nhựa: Nguyên sinh - Có bánh xe",
            "isHighlight": false
          },
          {
            "key": "Bảng điều khiển",
            "value": "Núm vặn",
            "isHighlight": false
          },
          {
            "key": "Công nghệ sấy",
            "value": "Cộng hưởng nhiệt PTC làm khô tĩnh học - Kích thước: 160*90*46cm - inox: 16 thanh phi 19 - Nhựa: Nguyên sinh - Có bánh xe, thuận tiện di chuyển",
            "isHighlight": false
          }
        ]
      }
    ],
    "tags": [],
    "notes": "",
    "description": "TỦ SẤY QUẦN ÁO CAO CẤP LOCK&KING 1500W -Công suất: 1500W - Điện áp: 220V- 50Hz - Trọng lượng sấy tối đa: 20kg - Hẹn giờ thông minh: 30-180 (phút) - Bảng điều khiển: Núm vặn  - Công nghệ sấy: Cộng hưởng nhiệt PTC làm khô tĩnh học - Kích thước: 160*90*46cm - inox: 16 thanh phi 19 - Nhựa: Nguyên sinh - Có bánh xe, thuận tiện di chuyển",
    "status": "active",
    "updatedAt": "2026-10-01"
  },
  {
    "id": "sheet-lk-3116",
    "sku": "LK-3116",
    "name": "16*9CM Quánh liền khối titan (2.2mm) LK-3116",
    "brand": "LOCK&KING",
    "categoryGroup": "Điện gia dụng",
    "categoryType": "Sản phẩm",
    "thumbnail": "https://i.ibb.co/3yLZ6nkR/anh-bang-gia-lk-3116.png",
    "warrantyMonths": 12,
    "pricing": {
      "costPrice": 242533,
      "distributorPrice": 325000,
      "floorPrice": 895700,
      "retailPrice": 689000,
      "currency": "VND"
    },
    "specifications": [
      {
        "groupName": "Kích thước & Thiết kế",
        "items": [
          {
            "key": "Chất liệu",
            "value": "Inox 316",
            "isHighlight": false
          }
        ]
      },
      {
        "groupName": "Tiêu chuẩn & Bảo hành",
        "items": [
          {
            "key": "Quánh Titanium Cao Cấp Thương hiệu",
            "value": "Lock&King Model: LK-3116 Màu sắc: Nâu bạc Chất liệu: Inox 316, Titanium Đúc liền khối 5 lớp Thể tích: 1.8 Lít Trọng lượng: 1.3 Kg Phù hợp mọi loại bếp. Bắt nhiệt nhanh, tiết kiệm thời gian An toàn cho sức khỏe",
            "isHighlight": false
          }
        ]
      }
    ],
    "tags": [],
    "notes": "",
    "description": "Quánh Titanium Cao Cấp Thương hiệu: Lock&King Model: LK-3116 Màu sắc: Nâu bạc Chất liệu: Inox 316, Titanium Đúc liền khối 5 lớp Thể tích: 1.8 Lít Trọng lượng: 1.3 Kg Phù hợp mọi loại bếp. Bắt nhiệt nhanh, tiết kiệm thời gian An toàn cho sức khỏe",
    "status": "active",
    "updatedAt": "2026-10-01"
  },
  {
    "id": "sheet-lk-3338",
    "sku": "LK-3338",
    "name": "18+20+24CM Bộ nồi 3 liền khối kèm nắp (2.3mm) LK-3338",
    "brand": "LOCK&KING",
    "categoryGroup": "Điện gia dụng",
    "categoryType": "Sản phẩm",
    "thumbnail": "https://i.ibb.co/TqFvQbhR/anh-bang-gia-lk-3338.jpg",
    "warrantyMonths": 12,
    "pricing": {
      "costPrice": 923257,
      "distributorPrice": 1240000,
      "floorPrice": 3118800,
      "retailPrice": 2599000,
      "currency": "VND"
    },
    "specifications": [
      {
        "groupName": "Kích thước & Thiết kế",
        "items": [
          {
            "key": "Chất liệu",
            "value": "Inox 316",
            "isHighlight": false
          }
        ]
      },
      {
        "groupName": "Thông số kỹ thuật khác",
        "items": [
          {
            "key": "Tên sản phẩm",
            "value": "Bộ Nồi 3 Món Titanium Cao Cấp Thương hiệu: Lock&King Model: LK-3338 Màu sắc: Nâu bạc Chất liệu: Inox 316, Titanium Đúc liền khối 5 lớp Thể tích: 2.5 - 3.6 - 6.3 Lít Kích thước: 18 - 20 - 24 cm Trọng lượng: 5.9Kg Phù hợp mọi loại bếp. Bắt nhiệt nhanh, tiết kiệm thời gian An toàn cho sức khỏe",
            "isHighlight": false
          }
        ]
      }
    ],
    "tags": [],
    "notes": "",
    "description": "Tên sản phẩm: Bộ Nồi 3 Món Titanium Cao Cấp Thương hiệu: Lock&King Model: LK-3338 Màu sắc: Nâu bạc Chất liệu: Inox 316, Titanium Đúc liền khối 5 lớp Thể tích: 2.5 - 3.6 - 6.3 Lít Kích thước: 18 - 20 - 24 cm Trọng lượng: 5.9Kg Phù hợp mọi loại bếp. Bắt nhiệt nhanh, tiết kiệm thời gian An toàn cho sức khỏe",
    "status": "active",
    "updatedAt": "2026-10-01"
  },
  {
    "id": "sheet-lk--3118",
    "sku": "LK- 3118",
    "name": "18*10CM Nồi lẻ kèm nắp (2.3mm) LK-3118",
    "brand": "LOCK&KING",
    "categoryGroup": "Điện gia dụng",
    "categoryType": "Sản phẩm",
    "thumbnail": "https://i.ibb.co/xtFvTvZ7/anh-bang-gia-lk-3118.jpg",
    "warrantyMonths": 12,
    "pricing": {
      "costPrice": 277181,
      "distributorPrice": 372000,
      "floorPrice": 1012700,
      "retailPrice": 779000,
      "currency": "VND"
    },
    "specifications": [
      {
        "groupName": "Kích thước & Thiết kế",
        "items": [
          {
            "key": "Chất liệu",
            "value": "Inox 316",
            "isHighlight": false
          }
        ]
      },
      {
        "groupName": "Thông số kỹ thuật khác",
        "items": [
          {
            "key": "Tên sản phẩm",
            "value": "Nồi Titanium Cao Cấp Thương hiệu: Lock&King Model: LK- 3118 Màu sắc: Nâu bạc Chất liệu: Inox 316, Titanium Đúc liền khối 5 lớp Thể tích: 2.5 Lít Trọng lượng: 1.3Kg Phù hợp mọi loại bếp. Bắt nhiệt nhanh, tiết kiệm thời gian An toàn cho sức khỏe",
            "isHighlight": false
          }
        ]
      }
    ],
    "tags": [],
    "notes": "",
    "description": "Tên sản phẩm: Nồi Titanium Cao Cấp Thương hiệu: Lock&King Model: LK- 3118 Màu sắc: Nâu bạc Chất liệu: Inox 316, Titanium Đúc liền khối 5 lớp Thể tích: 2.5 Lít Trọng lượng: 1.3Kg Phù hợp mọi loại bếp. Bắt nhiệt nhanh, tiết kiệm thời gian An toàn cho sức khỏe",
    "status": "active",
    "updatedAt": "2026-10-01"
  },
  {
    "id": "sheet-lk--3120",
    "sku": "LK- 3120",
    "name": "20*12CM Nồi lẻ kèm nắp (2.3mm) LK-3120",
    "brand": "LOCK&KING",
    "categoryGroup": "Điện gia dụng",
    "categoryType": "Sản phẩm",
    "thumbnail": "https://i.ibb.co/h1HmBWQs/anh-bang-gia-lk-3120.jpg",
    "warrantyMonths": 12,
    "pricing": {
      "costPrice": 310810,
      "distributorPrice": 420000,
      "floorPrice": 1155700,
      "retailPrice": 889000,
      "currency": "VND"
    },
    "specifications": [
      {
        "groupName": "Kích thước & Thiết kế",
        "items": [
          {
            "key": "Chất liệu",
            "value": "Inox 316",
            "isHighlight": false
          }
        ]
      },
      {
        "groupName": "Thông số kỹ thuật khác",
        "items": [
          {
            "key": "Tên sản phẩm",
            "value": "Nồi Titanium Cao Cấp Thương hiệu: Lock&King Model: LK- 3120 Màu sắc: Nâu bạc Chất liệu: Inox 316, Titanium Đúc liền khối 5 lớp Thể tích: 3.6 Lít Trọng lượng: 1.7Kg Phù hợp mọi loại bếp. Bắt nhiệt nhanh, tiết kiệm thời gian An toàn cho sức khỏe",
            "isHighlight": false
          }
        ]
      }
    ],
    "tags": [],
    "notes": "",
    "description": "Tên sản phẩm: Nồi Titanium Cao Cấp Thương hiệu: Lock&King Model: LK- 3120 Màu sắc: Nâu bạc Chất liệu: Inox 316, Titanium Đúc liền khối 5 lớp Thể tích: 3.6 Lít Trọng lượng: 1.7Kg Phù hợp mọi loại bếp. Bắt nhiệt nhanh, tiết kiệm thời gian An toàn cho sức khỏe",
    "status": "active",
    "updatedAt": "2026-10-01"
  },
  {
    "id": "sheet-lk--3124",
    "sku": "LK- 3124",
    "name": "24*14CM Nồi lẻ kèm nắp (2.3mm) LK-3124",
    "brand": "LOCK&KING",
    "categoryGroup": "Điện gia dụng",
    "categoryType": "Sản phẩm",
    "thumbnail": "https://i.ibb.co/bgLy3YYJ/anh-bang-gia-lk-3124.jpg",
    "warrantyMonths": 12,
    "pricing": {
      "costPrice": 371952,
      "distributorPrice": 500000,
      "floorPrice": 1258800,
      "retailPrice": 1049000,
      "currency": "VND"
    },
    "specifications": [
      {
        "groupName": "Kích thước & Thiết kế",
        "items": [
          {
            "key": "Chất liệu",
            "value": "Inox 316",
            "isHighlight": false
          }
        ]
      },
      {
        "groupName": "Tiêu chuẩn & Bảo hành",
        "items": [
          {
            "key": "Nồi Titanium Cao Cấp Thương hiệu",
            "value": "Lock&King Model: LK- 3124 Màu sắc: Nâu bạc Chất liệu: Inox 316, Titanium Đúc liền khối 5 lớp Thể tích: 6.3 Lít Trọng lượng: 2.3Kg Phù hợp mọi loại bếp. Bắt nhiệt nhanh, tiết kiệm thời gian An toàn cho sức khỏe",
            "isHighlight": false
          }
        ]
      }
    ],
    "tags": [],
    "notes": "",
    "description": "Nồi Titanium Cao Cấp Thương hiệu: Lock&King Model: LK- 3124 Màu sắc: Nâu bạc Chất liệu: Inox 316, Titanium Đúc liền khối 5 lớp Thể tích: 6.3 Lít Trọng lượng: 2.3Kg Phù hợp mọi loại bếp. Bắt nhiệt nhanh, tiết kiệm thời gian An toàn cho sức khỏe",
    "status": "active",
    "updatedAt": "2026-10-01"
  },
  {
    "id": "sheet-lk-3126",
    "sku": "LK-3126",
    "name": "26*14CM Nồi áp suất kèm xửng hấp đa năng (1.8mm) LK-3126",
    "brand": "LOCK&KING",
    "categoryGroup": "Điện gia dụng",
    "categoryType": "Sản phẩm",
    "thumbnail": "https://i.ibb.co/7N20vdL9/anh-bang-gia-LK-3126.jpg",
    "warrantyMonths": 12,
    "pricing": {
      "costPrice": 406600,
      "distributorPrice": 525000,
      "floorPrice": 1287000,
      "retailPrice": 990000,
      "currency": "VND"
    },
    "specifications": [
      {
        "groupName": "Kích thước & Thiết kế",
        "items": [
          {
            "key": "Chất liệu",
            "value": "Inox 316 Đúc liền khối 5 lớp Trọng lượng: 3",
            "isHighlight": false
          }
        ]
      },
      {
        "groupName": "Tiêu chuẩn & Bảo hành",
        "items": [
          {
            "key": "Nồi tăng áp Đa Năng Cao Cấp Thương hiệu",
            "value": "Lock&King Model: LK-3126 Màu sắc: Bạc xanh Chất liệu: Inox 316 Đúc liền khối 5 lớp Trọng lượng: 3.3 Kg Phù hợp mọi loại bếp. Bắt nhiệt nhanh, tiết kiệm thời gian An toàn cho sức khỏe",
            "isHighlight": false
          }
        ]
      }
    ],
    "tags": [],
    "notes": "",
    "description": "Nồi tăng áp Đa Năng Cao Cấp Thương hiệu: Lock&King Model: LK-3126 Màu sắc: Bạc xanh Chất liệu: Inox 316 Đúc liền khối 5 lớp Trọng lượng: 3.3 Kg Phù hợp mọi loại bếp. Bắt nhiệt nhanh, tiết kiệm thời gian An toàn cho sức khỏe",
    "status": "active",
    "updatedAt": "2026-10-01"
  },
  {
    "id": "sheet-lk-3122",
    "sku": "LK-3122",
    "name": "22*13.5CM Nồi áp suất kèm xửng hấp đa năng (1.8mm) LK-3122",
    "brand": "LOCK&KING",
    "categoryGroup": "Điện gia dụng",
    "categoryType": "Sản phẩm",
    "thumbnail": "https://i.ibb.co/8gQfSmsN/Chat-GPT-Image-22-54-10-15-thg-3-2026.png",
    "warrantyMonths": 12,
    "pricing": {
      "costPrice": 368000,
      "distributorPrice": 460000,
      "floorPrice": 1066000,
      "retailPrice": 820000,
      "currency": "VND"
    },
    "specifications": [
      {
        "groupName": "Kích thước & Thiết kế",
        "items": [
          {
            "key": "Chất liệu",
            "value": "Inox 316 Đúc liền khối 5 lớp Trọng lượng: 3",
            "isHighlight": false
          }
        ]
      },
      {
        "groupName": "Tiêu chuẩn & Bảo hành",
        "items": [
          {
            "key": "Nồi tăng áp Đa Năng Cao Cấp Thương hiệu",
            "value": "Lock&King Model: LK-3122 Màu sắc: Bạc xanh Chất liệu: Inox 316 Đúc liền khối 5 lớp Trọng lượng: 3.3 Kg Phù hợp mọi loại bếp. Bắt nhiệt nhanh, tiết kiệm thời gian An toàn cho sức khỏe",
            "isHighlight": false
          }
        ]
      }
    ],
    "tags": [],
    "notes": "",
    "description": "Nồi tăng áp Đa Năng Cao Cấp Thương hiệu: Lock&King Model: LK-3122 Màu sắc: Bạc xanh Chất liệu: Inox 316 Đúc liền khối 5 lớp Trọng lượng: 3.3 Kg Phù hợp mọi loại bếp. Bắt nhiệt nhanh, tiết kiệm thời gian An toàn cho sức khỏe",
    "status": "active",
    "updatedAt": "2026-10-01"
  },
  {
    "id": "sheet-lk-6201",
    "sku": "LK-6201",
    "name": "Nồi nấu lẩu đi kèm xửng hấp",
    "brand": "LOCK&KING",
    "categoryGroup": "Điện gia dụng",
    "categoryType": "Sản phẩm",
    "thumbnail": "https://i.ibb.co/2m620rs/anh-bang-gia-lk-6201.jpg",
    "warrantyMonths": 12,
    "pricing": {
      "costPrice": 536019,
      "distributorPrice": 685000,
      "floorPrice": 1548000,
      "retailPrice": 1290000,
      "currency": "VND"
    },
    "specifications": [
      {
        "groupName": "Thông số vận hành",
        "items": [
          {
            "key": "Công suất",
            "value": "1500W",
            "isHighlight": true
          },
          {
            "key": "Dung tích",
            "value": "6.2L",
            "isHighlight": true
          },
          {
            "key": "Điện áp",
            "value": "220V",
            "isHighlight": false
          }
        ]
      },
      {
        "groupName": "Thông số kỹ thuật khác",
        "items": [
          {
            "key": "Hiệu",
            "value": "LOCK&KING,",
            "isHighlight": false
          },
          {
            "key": "Model",
            "value": "LK-6201;",
            "isHighlight": false
          }
        ]
      }
    ],
    "tags": [],
    "notes": "",
    "description": "Nồi nấu lẩu đi kèm xửng hấp, không có chức năng nấu cơm và nướng.  Hiệu: LOCK&KING,  Model: LK-6201;  Công suất 1500W,  Điện áp: 220V/50Hz;  Dung tích: 6.2L; hàng mới 100%",
    "status": "active",
    "updatedAt": "2026-10-01"
  },
  {
    "id": "sheet-lk-4160",
    "sku": "LK-4160",
    "name": "Nồi áp suất điện Lock&King LK-4160",
    "brand": "LOCK&KING",
    "categoryGroup": "Điện gia dụng",
    "categoryType": "Sản phẩm",
    "thumbnail": "https://i.ibb.co/bg2phyqk/anh-bang-gia-lk-4160.png",
    "warrantyMonths": 12,
    "pricing": {
      "costPrice": 828486,
      "distributorPrice": 1080000,
      "floorPrice": 2820000,
      "retailPrice": 2350000,
      "currency": "VND"
    },
    "specifications": [
      {
        "groupName": "Thông số vận hành",
        "items": [
          {
            "key": "Công suất",
            "value": "1000W",
            "isHighlight": true
          },
          {
            "key": "Dung tích",
            "value": "6L",
            "isHighlight": true
          },
          {
            "key": "Điện áp",
            "value": "220V 50Hz",
            "isHighlight": false
          },
          {
            "key": "Nồi áp suất điện Lock&King LK-4160 Tên sản phẩm",
            "value": "Nồi áp suất điện Model: LK-4160 Thương hiệu: Lock&King Điện áp: 220V 50Hz Công suất: 1000W Dung tích: 6L Công dụng: Sử dụng trong gia đình Quy chuẩn áp dụng: QCVN 4:2009/BKHCN và sửa đổi 1:2016 QCVN 4:2009/BKHCN Khối lượng tịnh: 4,7 kg Năm sản xuất: 2025",
            "isHighlight": false
          }
        ]
      }
    ],
    "tags": [],
    "notes": "",
    "description": "Nồi áp suất điện Lock&King LK-4160 Tên sản phẩm: Nồi áp suất điện Model: LK-4160 Thương hiệu: Lock&King Điện áp: 220V 50Hz Công suất: 1000W Dung tích: 6L Công dụng: Sử dụng trong gia đình Quy chuẩn áp dụng: QCVN 4:2009/BKHCN và sửa đổi 1:2016 QCVN 4:2009/BKHCN Khối lượng tịnh: 4,7 kg Năm sản xuất: 2025",
    "status": "active",
    "updatedAt": "2026-10-01"
  },
  {
    "id": "sheet-lk-4161",
    "sku": "LK-4161",
    "name": "Nồi áp suất điện Lock&King LK-4161",
    "brand": "LOCK&KING",
    "categoryGroup": "Điện gia dụng",
    "categoryType": "Sản phẩm",
    "thumbnail": "https://i.ibb.co/Jw54PFPP/Chat-GPT-Image-23-31-11-15-thg-3-2026.png",
    "warrantyMonths": 12,
    "pricing": {
      "costPrice": 672571,
      "distributorPrice": 850000,
      "floorPrice": 1980000,
      "retailPrice": 1650000,
      "currency": "VND"
    },
    "specifications": [
      {
        "groupName": "Thông số vận hành",
        "items": [
          {
            "key": "Công suất",
            "value": "1000W",
            "isHighlight": true
          },
          {
            "key": "Dung tích",
            "value": "6L",
            "isHighlight": true
          },
          {
            "key": "Điện áp",
            "value": "220V 50Hz",
            "isHighlight": false
          },
          {
            "key": "Nồi áp suất điện Lock&King LK-4161 Tên sản phẩm",
            "value": "Nồi áp suất điện Lock&King LK-4161 Tên sản phẩm: Nồi áp suất điện Model: LK-4161 Điện áp: 220V 50Hz Công suất: 1000W Dung tích: 6L Công dụng: Sử dụng trong gia đình Quy chuẩn áp dụng: QCVN 4:2009/BKHCN và sửa đổi 1:2016 QCVN 4:2009/BKHCN Khối lượng tịnh: 4,5 kg Năm sản xuất: 2025 Quy cách đóng gói: 1 chiếc / 1 hộp, 2 hộp / thùng carton",
            "isHighlight": false
          }
        ]
      }
    ],
    "tags": [],
    "notes": "",
    "description": "Nồi áp suất điện Lock&King LK-4161 Tên sản phẩm: Nồi áp suất điện Lock&King LK-4161 Tên sản phẩm: Nồi áp suất điện Model: LK-4161 Điện áp: 220V 50Hz Công suất: 1000W Dung tích: 6L Công dụng: Sử dụng trong gia đình Quy chuẩn áp dụng: QCVN 4:2009/BKHCN và sửa đổi 1:2016 QCVN 4:2009/BKHCN Khối lượng tịnh: 4,5 kg Năm sản xuất: 2025 Quy cách đóng gói: 1 chiếc / 1 hộp, 2 hộp / thùng carton",
    "status": "active",
    "updatedAt": "2026-10-01"
  },
  {
    "id": "sheet-lk-1050",
    "sku": "LK-1050",
    "name": "Bình Thủy Điện Lock&King LK-1050",
    "brand": "LOCK&KING",
    "categoryGroup": "Điện gia dụng",
    "categoryType": "Sản phẩm",
    "thumbnail": "https://i.ibb.co/cc9L9JzX/Chat-GPT-Image-22-42-26-15-thg-3-2026.png",
    "warrantyMonths": 12,
    "pricing": {
      "costPrice": 659323,
      "distributorPrice": 890000,
      "floorPrice": 2148000,
      "retailPrice": 1790000,
      "currency": "VND"
    },
    "specifications": [
      {
        "groupName": "Thông số vận hành",
        "items": [
          {
            "key": "Công suất",
            "value": "1200W",
            "isHighlight": true
          },
          {
            "key": "Dung tích",
            "value": "5 l",
            "isHighlight": true
          }
        ]
      },
      {
        "groupName": "Kích thước & Thiết kế",
        "items": [
          {
            "key": "Chất liệu",
            "value": "Nhựa PP",
            "isHighlight": false
          }
        ]
      },
      {
        "groupName": "Thông số kỹ thuật khác",
        "items": [
          {
            "key": "Tên sản phẩm",
            "value": "Bình Thủy Điện Thương hiệu: Lock&King Model: LK-1050 Chức năng: Đun – giữ ấm nước Màu sắc: Màu be Chất liệu: Nhựa PP, Thủy tinh, Inox 304 Công suất: 1200W Dung tích: 5 lít Trọng lượng: 2,8 kg Tính năng nổi bật: Có chế độ khóa thông minh Giữ ấm lên đến 48h Lấy nước tự động Tiết kiệm thời gian Khử Clo – an toàn cho sức khỏe",
            "isHighlight": false
          }
        ]
      }
    ],
    "tags": [],
    "notes": "",
    "description": "Tên sản phẩm: Bình Thủy Điện Thương hiệu: Lock&King Model: LK-1050 Chức năng: Đun – giữ ấm nước Màu sắc: Màu be Chất liệu: Nhựa PP, Thủy tinh, Inox 304 Công suất: 1200W Dung tích: 5 lít Trọng lượng: 2,8 kg Tính năng nổi bật: Có chế độ khóa thông minh Giữ ấm lên đến 48h Lấy nước tự động Tiết kiệm thời gian Khử Clo – an toàn cho sức khỏe",
    "status": "active",
    "updatedAt": "2026-10-01"
  },
  {
    "id": "sheet-lk-6015",
    "sku": "LK-6015",
    "name": "Nồi Nấu Đa Năng Lock&King",
    "brand": "LOCK&KING",
    "categoryGroup": "Điện gia dụng",
    "categoryType": "Sản phẩm",
    "thumbnail": "https://i.ibb.co/Y4MwLBz6/anh-bang-gia-lk-6015.jpg",
    "warrantyMonths": 12,
    "pricing": {
      "costPrice": 200752,
      "distributorPrice": 260000,
      "floorPrice": 637000,
      "retailPrice": 490000,
      "currency": "VND"
    },
    "specifications": [
      {
        "groupName": "Thông số vận hành",
        "items": [
          {
            "key": "Công suất",
            "value": "1600W",
            "isHighlight": true
          }
        ]
      },
      {
        "groupName": "Kích thước & Thiết kế",
        "items": [
          {
            "key": "Chất liệu",
            "value": "Nhựa PP",
            "isHighlight": false
          }
        ]
      },
      {
        "groupName": "Thông số kỹ thuật khác",
        "items": [
          {
            "key": "Tên sản phẩm",
            "value": "Nồi Nấu Đa Năng",
            "isHighlight": false
          }
        ]
      },
      {
        "groupName": "Tiêu chuẩn & Bảo hành",
        "items": [
          {
            "key": "Thương hiệu",
            "value": "Lock&King • Model: LK-6015 • Chức năng: Nấu ăn trong gia đình • Màu sắc: Xanh lá nhạt • Chất liệu: Nhựa PP, Inox 304 • Công suất: 1600W • Dung tích: 1,5 lít • Trọng lượng: 1,1 kg • Tính năng nổi bật: • Làm nóng nhanh • Có thể nấu và hấp • Nấu nhiều món cùng lúc • Tiết kiệm thời gian • An toàn cho sức khỏe",
            "isHighlight": false
          }
        ]
      }
    ],
    "tags": [],
    "notes": "",
    "description": "Tên sản phẩm: Nồi Nấu Đa Năng  • Thương hiệu: Lock&King • Model: LK-6015 • Chức năng: Nấu ăn trong gia đình • Màu sắc: Xanh lá nhạt • Chất liệu: Nhựa PP, Inox 304 • Công suất: 1600W • Dung tích: 1,5 lít • Trọng lượng: 1,1 kg • Tính năng nổi bật: • Làm nóng nhanh • Có thể nấu và hấp • Nấu nhiều món cùng lúc • Tiết kiệm thời gian • An toàn cho sức khỏe",
    "status": "active",
    "updatedAt": "2026-10-01"
  },
  {
    "id": "sheet-lk-7812",
    "sku": "LK-7812",
    "name": "Máy làm sữa hạt Lock&King",
    "brand": "LOCK&KING",
    "categoryGroup": "Điện gia dụng",
    "categoryType": "Sản phẩm",
    "thumbnail": "https://i.ibb.co/fYWCZpWJ/Chat-GPT-Image-23-19-35-15-thg-3-2026.png",
    "warrantyMonths": 12,
    "pricing": {
      "costPrice": 540095,
      "distributorPrice": 710000,
      "floorPrice": 1620000,
      "retailPrice": 1350000,
      "currency": "VND"
    },
    "specifications": [
      {
        "groupName": "Thông số kỹ thuật khác",
        "items": [
          {
            "key": "Tên sản phẩm",
            "value": "Máy làm sữa hạt Thương hiệu: Lock&King Model: LK-7812 Điện áp định mức: 220V Tần số: 50Hz Công suất nấu: 800W Công suất xay: 200W Các chức năng chính: - Sữa đậu nành - Cháo - Súp - Sinh tố - Đun nước - Giữ ấm",
            "isHighlight": false
          }
        ]
      }
    ],
    "tags": [],
    "notes": "",
    "description": "Tên sản phẩm: Máy làm sữa hạt Thương hiệu: Lock&King Model: LK-7812 Điện áp định mức: 220V Tần số: 50Hz Công suất nấu: 800W Công suất xay: 200W Các chức năng chính: - Sữa đậu nành - Cháo - Súp - Sinh tố - Đun nước - Giữ ấm",
    "status": "active",
    "updatedAt": "2026-10-01"
  },
  {
    "id": "sheet-tk-036",
    "sku": "TK-036",
    "name": "Bộ nồi Takin 3 món 5 đáy inox cao cấp",
    "brand": "TAKIN",
    "categoryGroup": "Điện gia dụng",
    "categoryType": "Sản phẩm",
    "thumbnail": "https://i.ibb.co/rqkd3Dw/anh-bang-gia-tk-036.png",
    "warrantyMonths": 12,
    "pricing": {
      "costPrice": 440229,
      "distributorPrice": 495000,
      "floorPrice": 1158300,
      "retailPrice": 891000,
      "currency": "VND"
    },
    "specifications": [
      {
        "groupName": "Kích thước & Thiết kế",
        "items": [
          {
            "key": "Chất liệu",
            "value": "Inox 304 cao cấp",
            "isHighlight": false
          },
          {
            "key": "Kích thước đường kính",
            "value": "18-20-24cm",
            "isHighlight": true
          }
        ]
      },
      {
        "groupName": "Thông số kỹ thuật khác",
        "items": [
          {
            "key": "Model",
            "value": "TK-036",
            "isHighlight": false
          },
          {
            "key": "Số món",
            "value": "3 món",
            "isHighlight": false
          }
        ]
      },
      {
        "groupName": "Tiêu chuẩn & Bảo hành",
        "items": [
          {
            "key": "Xuất xứ",
            "value": "Trung Quốc Quy cách: 4 bộ/1 thùng",
            "isHighlight": false
          }
        ]
      }
    ],
    "tags": [],
    "notes": "",
    "description": "BỘ NỒI 3 MÓN 5 LỚP INOX CAO CẤP TAKIN  Model: TK-036  Số món: 3 món  Chất liệu: Inox 304 cao cấp  Đáy nồi cấu tạo 5 lớp  Kích thước đường kính: 18-20-24cm  Xuất xứ: Trung Quốc Quy cách: 4 bộ/1 thùng",
    "status": "active",
    "updatedAt": "2026-10-01"
  },
  {
    "id": "sheet-tk-0348",
    "sku": "TK-0348",
    "name": "Bộ nồi Táo Takin 3 món inox cao cấp",
    "brand": "TAKIN",
    "categoryGroup": "Điện gia dụng",
    "categoryType": "Sản phẩm",
    "thumbnail": "https://i.ibb.co/6JXLNwP4/anh-bang-gia-tk-0348.jpg",
    "warrantyMonths": 12,
    "pricing": {
      "costPrice": 474876,
      "distributorPrice": 580000,
      "floorPrice": 1252800,
      "retailPrice": 1044000,
      "currency": "VND"
    },
    "specifications": [
      {
        "groupName": "Kích thước & Thiết kế",
        "items": [
          {
            "key": "Chất liệu",
            "value": "Inox 304 cao cấp",
            "isHighlight": false
          },
          {
            "key": "Kích thước đường kính",
            "value": "18-20-24cm Quy cách: 4 bộ/1 thùng",
            "isHighlight": true
          }
        ]
      },
      {
        "groupName": "Thông số kỹ thuật khác",
        "items": [
          {
            "key": "Model",
            "value": "TK-0348",
            "isHighlight": false
          },
          {
            "key": "Số món",
            "value": "3 món",
            "isHighlight": false
          }
        ]
      }
    ],
    "tags": [],
    "notes": "",
    "description": "BỘ NỒI TÁO 3 MÓN TAKIN CAO CẤP  Model: TK-0348  Số món: 3 món  Chất liệu: Inox 304 cao cấp  Đáy nồi cấu tạo 5 lớp  Kích thước đường kính: 18-20-24cm Quy cách: 4 bộ/1 thùng",
    "status": "active",
    "updatedAt": "2026-10-01"
  },
  {
    "id": "sheet-tk-0318",
    "sku": "TK-0318",
    "name": "Nồi táo inox cao cấp size18",
    "brand": "TAKIN",
    "categoryGroup": "Điện gia dụng",
    "categoryType": "Sản phẩm",
    "thumbnail": "https://i.ibb.co/rgb5chX/anh-bang-gia-tk-0318.jpg",
    "warrantyMonths": 12,
    "pricing": {
      "costPrice": 134514,
      "distributorPrice": 185000,
      "floorPrice": 432900,
      "retailPrice": 333000,
      "currency": "VND"
    },
    "specifications": [
      {
        "groupName": "Kích thước & Thiết kế",
        "items": [
          {
            "key": "Chất liệu",
            "value": "Inox",
            "isHighlight": false
          }
        ]
      },
      {
        "groupName": "Thông số kỹ thuật khác",
        "items": [
          {
            "key": "Model",
            "value": "TK-0318",
            "isHighlight": false
          },
          {
            "key": "Size",
            "value": "18cm",
            "isHighlight": false
          }
        ]
      },
      {
        "groupName": "Tiêu chuẩn & Bảo hành",
        "items": [
          {
            "key": "Xuất xứ",
            "value": "Trung Quốc Quy cách: 8 chiếc/1 thùng",
            "isHighlight": false
          }
        ]
      }
    ],
    "tags": [],
    "notes": "",
    "description": "NỒI TÁO LẺ SIZE 18 TAKIN CAO CẤP  Chất liệu: Inox  Model: TK-0318  Size: 18cm  Xuất xứ: Trung Quốc Quy cách: 8 chiếc/1 thùng",
    "status": "active",
    "updatedAt": "2026-10-01"
  },
  {
    "id": "sheet-tk-0320",
    "sku": "TK-0320",
    "name": "Nồi táo inox cao cấp size20",
    "brand": "TAKIN",
    "categoryGroup": "Điện gia dụng",
    "categoryType": "Sản phẩm",
    "thumbnail": "https://i.ibb.co/VnmsrKy/anh-bang-gia-tk-0320.jpg",
    "warrantyMonths": 12,
    "pricing": {
      "costPrice": 149800,
      "distributorPrice": 205000,
      "floorPrice": 479700,
      "retailPrice": 369000,
      "currency": "VND"
    },
    "specifications": [
      {
        "groupName": "Kích thước & Thiết kế",
        "items": [
          {
            "key": "Chất liệu",
            "value": "Inox",
            "isHighlight": false
          }
        ]
      },
      {
        "groupName": "Thông số kỹ thuật khác",
        "items": [
          {
            "key": "Model",
            "value": "TK-0320",
            "isHighlight": false
          },
          {
            "key": "Size",
            "value": "18cm",
            "isHighlight": false
          }
        ]
      },
      {
        "groupName": "Tiêu chuẩn & Bảo hành",
        "items": [
          {
            "key": "Xuất xứ",
            "value": "Trung Quốc Quy cách: 8 chiếc/1 thùng",
            "isHighlight": false
          }
        ]
      }
    ],
    "tags": [],
    "notes": "",
    "description": "NỒI TÁO LẺ SIZE 20 TAKIN CAO CẤP  Chất liệu: Inox  Model: TK-0320  Size: 18cm  Xuất xứ: Trung Quốc Quy cách: 8 chiếc/1 thùng",
    "status": "active",
    "updatedAt": "2026-10-01"
  },
  {
    "id": "sheet-tk-0324",
    "sku": "TK-0324",
    "name": "Nồi táo inox cao cấp size24",
    "brand": "TAKIN",
    "categoryGroup": "Điện gia dụng",
    "categoryType": "Sản phẩm",
    "thumbnail": "https://i.ibb.co/6Rj2MjpF/anh-bang-gia-tk-0324.jpg",
    "warrantyMonths": 12,
    "pricing": {
      "costPrice": 188524,
      "distributorPrice": 245000,
      "floorPrice": 573300,
      "retailPrice": 441000,
      "currency": "VND"
    },
    "specifications": [
      {
        "groupName": "Kích thước & Thiết kế",
        "items": [
          {
            "key": "Chất liệu",
            "value": "Inox",
            "isHighlight": false
          }
        ]
      },
      {
        "groupName": "Thông số kỹ thuật khác",
        "items": [
          {
            "key": "Model",
            "value": "TK-0324",
            "isHighlight": false
          },
          {
            "key": "Size",
            "value": "24cm",
            "isHighlight": false
          }
        ]
      },
      {
        "groupName": "Tiêu chuẩn & Bảo hành",
        "items": [
          {
            "key": "Xuất xứ",
            "value": "Trung Quốc Quy cách: 8 chiếc/1 thùng",
            "isHighlight": false
          }
        ]
      }
    ],
    "tags": [],
    "notes": "",
    "description": "NỒI TÁO LẺ SIZE 24 TAKIN CAO CẤP  Chất liệu: Inox  Model: TK-0324  Size: 24cm  Xuất xứ: Trung Quốc Quy cách: 8 chiếc/1 thùng",
    "status": "active",
    "updatedAt": "2026-10-01"
  },
  {
    "id": "sheet-tk-0369",
    "sku": "TK-0369",
    "name": "Bộ nồi Takin 3 món 5 đáy inox cao cấp",
    "brand": "TAKIN",
    "categoryGroup": "Điện gia dụng",
    "categoryType": "Sản phẩm",
    "thumbnail": "https://i.ibb.co/pBFtJK2J/anh-bang-gia-tk-0369.png",
    "warrantyMonths": 12,
    "pricing": {
      "costPrice": 419848,
      "distributorPrice": 535000,
      "floorPrice": 1259700,
      "retailPrice": 969000,
      "currency": "VND"
    },
    "specifications": [
      {
        "groupName": "Kích thước & Thiết kế",
        "items": [
          {
            "key": "Chất liệu",
            "value": "inox 304 bền đẹp",
            "isHighlight": false
          }
        ]
      },
      {
        "groupName": "Thông số kỹ thuật khác",
        "items": [
          {
            "key": "Nồi dùng được trên mọi loại bếp",
            "value": "bếp gas, bếp hồng ngoại và bếp từ.",
            "isHighlight": false
          }
        ]
      }
    ],
    "tags": [],
    "notes": "",
    "description": "Bộ nồi inox 5 đáy cao cấp Takin TK-0369     – Bộ 3 nồi 5 đáy chất liệu inox 304 bền đẹp, dễ vệ sinh    – Dùng để nấu ăn trong gia đình    – Đường kính 18cm/2L, 20cm/3L và 24cm/7L.    – Tay cầm quai tán chắc chắn chịu lực tốt lên đến 50kg; nắp kính trong suốt dễ quan sát.    – Nồi dùng được trên mọi loại bếp: bếp gas, bếp hồng ngoại và bếp từ.",
    "status": "active",
    "updatedAt": "2026-10-01"
  },
  {
    "id": "sheet-tk-0488",
    "sku": "TK-0488",
    "name": "Bộ nồi Takin 4 món 5 đáy inox cao cấp",
    "brand": "TAKIN",
    "categoryGroup": "Điện gia dụng",
    "categoryType": "Sản phẩm",
    "thumbnail": "https://i.ibb.co/Zz49Nr7s/TK-0488-B-4-N-I-01.jpg",
    "warrantyMonths": 12,
    "pricing": {
      "costPrice": 672571,
      "distributorPrice": 810000,
      "floorPrice": 1762800,
      "retailPrice": 1469000,
      "currency": "VND"
    },
    "specifications": [
      {
        "groupName": "Kích thước & Thiết kế",
        "items": [
          {
            "key": "Chất liệu",
            "value": "Inox 304 cao cấp",
            "isHighlight": false
          },
          {
            "key": "Đáy nồi cấu tạo 5 lớp Kích thước đường kính",
            "value": "18x20x24x24cm",
            "isHighlight": true
          }
        ]
      },
      {
        "groupName": "Thông số kỹ thuật khác",
        "items": [
          {
            "key": "Bộ nồi Takin 4 món 5 đáy inox cao cấp Model",
            "value": "TK-0488",
            "isHighlight": false
          },
          {
            "key": "Số món",
            "value": "4 món",
            "isHighlight": false
          }
        ]
      },
      {
        "groupName": "Tiêu chuẩn & Bảo hành",
        "items": [
          {
            "key": "Xuất xứ",
            "value": "Trung Quốc",
            "isHighlight": false
          }
        ]
      }
    ],
    "tags": [],
    "notes": "",
    "description": "Bộ nồi Takin 4 món 5 đáy inox cao cấp Model: TK-0488  Số món: 4 món  Chất liệu: Inox 304 cao cấp  Đáy nồi cấu tạo 5 lớp Kích thước đường kính: 18x20x24x24cm  Xuất xứ: Trung Quốc",
    "status": "active",
    "updatedAt": "2026-10-01"
  },
  {
    "id": "sheet-tk-2882c",
    "sku": "TK-2882C",
    "name": "Chảo cạn Titan vàng 28*7cm (2,3 mm)",
    "brand": "TAKIN",
    "categoryGroup": "Điện gia dụng",
    "categoryType": "Sản phẩm",
    "thumbnail": "https://i.ibb.co/xKrjm14h/anh-bang-gia-tk-2882c.jpg",
    "warrantyMonths": 12,
    "pricing": {
      "costPrice": 260876,
      "distributorPrice": 341000,
      "floorPrice": 871000,
      "retailPrice": 670000,
      "currency": "VND"
    },
    "specifications": [
      {
        "groupName": "Kích thước & Thiết kế",
        "items": [
          {
            "key": "Chất liệu",
            "value": "inox 316 Cao cấp",
            "isHighlight": false
          }
        ]
      },
      {
        "groupName": "Thông số kỹ thuật khác",
        "items": [
          {
            "key": "Model",
            "value": "TK-2882C",
            "isHighlight": false
          }
        ]
      }
    ],
    "tags": [],
    "notes": "",
    "description": "Chảo chiên Titanium Pro size 28  Model: TK-2882C  Chất liệu inox 316 Cao cấp  Kích thước 28*7cm, dày 2.2mm  Chống dính bằng titanium (tạo kháng khuẩn tự nhiên)  Đúc liền khối 5 lớp  Tay cầm đinh tán chắc chắn",
    "status": "active",
    "updatedAt": "2026-10-01"
  },
  {
    "id": "sheet-tk-3030c",
    "sku": "TK-3030C",
    "name": "Chảo cạn Titan vàng 30*7cm (2,3 mm)",
    "brand": "TAKIN",
    "categoryGroup": "Điện gia dụng",
    "categoryType": "Sản phẩm",
    "thumbnail": "https://i.ibb.co/KpP7m9sg/anh-bang-gia-tk-3030c.png",
    "warrantyMonths": 12,
    "pricing": {
      "costPrice": 281257,
      "distributorPrice": 360000,
      "floorPrice": 975000,
      "retailPrice": 750000,
      "currency": "VND"
    },
    "specifications": [
      {
        "groupName": "Kích thước & Thiết kế",
        "items": [
          {
            "key": "Chất liệu",
            "value": "inox 316 Cao cấp",
            "isHighlight": false
          }
        ]
      },
      {
        "groupName": "Thông số kỹ thuật khác",
        "items": [
          {
            "key": "Model",
            "value": "TK-3030C",
            "isHighlight": false
          }
        ]
      }
    ],
    "tags": [],
    "notes": "",
    "description": "Chảo chiên Titanium Pro size 30  Model: TK-3030C  Chất liệu inox 316 Cao cấp  Kích thước 30*7.5cm, dày 2.2mm  Chống dính bằng titanium (tạo kháng khuẩn tự nhiên)  Đúc liền khối 5 lớp  Tay cầm đinh tán chắc chắn",
    "status": "active",
    "updatedAt": "2026-10-01"
  },
  {
    "id": "sheet-tk-2662",
    "sku": "TK-2662",
    "name": "26*6.5CM Chảo cạn titan-TK-2662 (2.2mm)",
    "brand": "TAKIN",
    "categoryGroup": "Điện gia dụng",
    "categoryType": "Sản phẩm",
    "thumbnail": "https://i.ibb.co/nMWBp5sV/anh-dai-dien-chao-chien-titanium-pro-takin-tk-2662.jpg",
    "warrantyMonths": 12,
    "pricing": {
      "costPrice": 224425,
      "distributorPrice": 310000,
      "floorPrice": 767000,
      "retailPrice": 590000,
      "currency": "VND"
    },
    "specifications": [
      {
        "groupName": "Kích thước & Thiết kế",
        "items": [
          {
            "key": "Chất liệu",
            "value": "inox 316 Cao cấp Kích thước 26*6",
            "isHighlight": false
          }
        ]
      }
    ],
    "tags": [],
    "notes": "",
    "description": "CHẢO CẠN TITAN VÀNG TAKIN SIZE 26 VÂN SAO BIỂN Model: TK-2662 Chất liệu inox 316 Cao cấp Kích thước 26*6.5cm, dày 2.2mm Chống dính bằng titanium (tạo kháng khuẩn tự nhiên) Đúc liền khối 5 lớp Tay cầm đinh tán chắc chắn Quy cách: 1 chiếc/ hộp",
    "status": "active",
    "updatedAt": "2026-10-01"
  },
  {
    "id": "sheet-tk-0126",
    "sku": "TK 0126",
    "name": "26*14CM Nồi áp suất kèm xửng hấp đa năng (1.8mm) TK 0126",
    "brand": "TAKIN",
    "categoryGroup": "Điện gia dụng",
    "categoryType": "Sản phẩm",
    "thumbnail": "https://i.ibb.co/PBfpF4x/anh-dai-dien-noi-ap-suat-da-nang-cao-cap-takin-tk-0126.jpg",
    "warrantyMonths": 12,
    "pricing": {
      "costPrice": 417810,
      "distributorPrice": 560000,
      "floorPrice": 1414800,
      "retailPrice": 1179000,
      "currency": "VND"
    },
    "specifications": [
      {
        "groupName": "Kích thước & Thiết kế",
        "items": [
          {
            "key": "Chất liệu",
            "value": "Inox 316 Trọng lượng: 3",
            "isHighlight": false
          }
        ]
      },
      {
        "groupName": "Tiêu chuẩn & Bảo hành",
        "items": [
          {
            "key": "NỒI TĂNG ÁP ĐIỆN ĐA NĂNG Thương hiệu",
            "value": "Takin Model: TK 0126 Màu sắc: Bạc xanh Chất liệu: Inox 316 Trọng lượng: 3.3 Kg Phù hợp mọi loại bếp. Bắt nhiệt nhanh, tiết kiệm thời gian An toàn cho sức khỏe",
            "isHighlight": false
          }
        ]
      }
    ],
    "tags": [],
    "notes": "",
    "description": "NỒI TĂNG ÁP ĐIỆN ĐA NĂNG Thương hiệu: Takin Model: TK 0126 Màu sắc: Bạc xanh Chất liệu: Inox 316 Trọng lượng: 3.3 Kg Phù hợp mọi loại bếp. Bắt nhiệt nhanh, tiết kiệm thời gian An toàn cho sức khỏe",
    "status": "active",
    "updatedAt": "2026-10-01"
  },
  {
    "id": "sheet-tk-2201",
    "sku": "TK-2201",
    "name": "chảo cạn Titan vàng 22*5,5cm (2,2 mm) TK-2201",
    "brand": "TAKIN",
    "categoryGroup": "Điện gia dụng",
    "categoryType": "Sản phẩm",
    "thumbnail": "https://i.ibb.co/HpDpjVn6/anh-dai-dien-chao-chien-titanium-pro-takin-tk-2201.jpg",
    "warrantyMonths": 12,
    "pricing": {
      "costPrice": 193466,
      "distributorPrice": 260000,
      "floorPrice": 585000,
      "retailPrice": 450000,
      "currency": "VND"
    },
    "specifications": [
      {
        "groupName": "Kích thước & Thiết kế",
        "items": [
          {
            "key": "Chất liệu",
            "value": "inox 316 Cao cấp Kích thước 22*5",
            "isHighlight": false
          }
        ]
      }
    ],
    "tags": [],
    "notes": "",
    "description": "Chảo cạn Lock&King Chất liệu inox 316 Cao cấp Kích thước 22*5.5cm, dày 2.2mm Chống dính bằng titanium (tạo kháng khuẩn tự nhiên) Đúc liền khối 5 lớp Tay cầm đinh tán chắc chắn",
    "status": "active",
    "updatedAt": "2026-10-01"
  },
  {
    "id": "sheet-tk-1002",
    "sku": "TK-1002",
    "name": "Bộ đèn sưởi 2 bóng Takin",
    "brand": "TAKIN",
    "categoryGroup": "Điện gia dụng",
    "categoryType": "Sản phẩm",
    "thumbnail": "https://i.ibb.co/jkT35Dhf/n-s-i-06.jpg",
    "warrantyMonths": 12,
    "pricing": {
      "costPrice": 128400,
      "distributorPrice": 158000,
      "floorPrice": 351000,
      "retailPrice": 270000,
      "currency": "VND"
    },
    "specifications": [
      {
        "groupName": "Thông số vận hành",
        "items": [
          {
            "key": "Công suất",
            "value": "825W",
            "isHighlight": true
          },
          {
            "key": "Điện áp",
            "value": "230V",
            "isHighlight": false
          }
        ]
      },
      {
        "groupName": "Thông số kỹ thuật khác",
        "items": [
          {
            "key": "ĐÈN SƯỞI 2 BÓNG VÀNG TAKIN CAO CẤP -Nhãn hiệu",
            "value": "TAKIN -Model: TK-1002 -Điện áp: 230V / 50Hz -Công suất: 825W -Kích thước sản phẩm: 48 × 25 × 23 cm -Kích thước bao bì: 50 × 25,5 × 24 cm -Năm sản xuất: Ghi trên tem bảo hành -Sản xuất tại: Việt Nam\" Quy cách: 1 chiếc/1 thùng",
            "isHighlight": false
          }
        ]
      }
    ],
    "tags": [],
    "notes": "",
    "description": "ĐÈN SƯỞI 2 BÓNG VÀNG TAKIN CAO CẤP -Nhãn hiệu: TAKIN -Model: TK-1002 -Điện áp: 230V / 50Hz -Công suất: 825W -Kích thước sản phẩm: 48 × 25 × 23 cm -Kích thước bao bì: 50 × 25,5 × 24 cm -Năm sản xuất: Ghi trên tem bảo hành -Sản xuất tại: Việt Nam\" Quy cách: 1 chiếc/1 thùng",
    "status": "active",
    "updatedAt": "2026-10-01"
  },
  {
    "id": "sheet-tk-1003",
    "sku": "TK-1003",
    "name": "Bộ đèn sưởi 3 bóng Takin",
    "brand": "TAKIN",
    "categoryGroup": "Điện gia dụng",
    "categoryType": "Sản phẩm",
    "thumbnail": "https://i.ibb.co/zhdx9bFZ/n-s-i-01.jpg",
    "warrantyMonths": 12,
    "pricing": {
      "costPrice": 157290,
      "distributorPrice": 194000,
      "floorPrice": 429000,
      "retailPrice": 330000,
      "currency": "VND"
    },
    "specifications": [
      {
        "groupName": "Thông số vận hành",
        "items": [
          {
            "key": "Công suất",
            "value": "825W",
            "isHighlight": true
          },
          {
            "key": "Điện áp",
            "value": "230V",
            "isHighlight": false
          }
        ]
      },
      {
        "groupName": "Thông số kỹ thuật khác",
        "items": [
          {
            "key": "ĐÈN SƯỞI 3 BÓNG VÀNG TAKIN CAO CẤP -Nhãn hiệu",
            "value": "TAKIN -Model: TK-1003 -Điện áp: 230V / 50Hz -Công suất: 825W -Kích thước sản phẩm: 48 × 25 × 23 cm -Kích thước bao bì: 50 × 25,5 × 24 cm -Năm sản xuất: Ghi trên tem bảo hành -Sản xuất tại: Việt Nam Quy cách: 1 chiếc/1 thùng",
            "isHighlight": false
          }
        ]
      }
    ],
    "tags": [],
    "notes": "",
    "description": "ĐÈN SƯỞI 3 BÓNG VÀNG TAKIN CAO CẤP -Nhãn hiệu: TAKIN -Model: TK-1003 -Điện áp: 230V / 50Hz -Công suất: 825W -Kích thước sản phẩm: 48 × 25 × 23 cm -Kích thước bao bì: 50 × 25,5 × 24 cm -Năm sản xuất: Ghi trên tem bảo hành -Sản xuất tại: Việt Nam Quy cách: 1 chiếc/1 thùng",
    "status": "active",
    "updatedAt": "2026-10-01"
  },
  {
    "id": "sheet-tk-469",
    "sku": "TK-469",
    "name": "Sưởi gốm thân cao",
    "brand": "TAKIN",
    "categoryGroup": "Điện gia dụng",
    "categoryType": "Sản phẩm",
    "thumbnail": "https://i.ibb.co/b51hKbB6/TK-469-1.png",
    "warrantyMonths": 12,
    "pricing": {
      "costPrice": 468762,
      "distributorPrice": 615000,
      "floorPrice": 1260000,
      "retailPrice": 1050000,
      "currency": "VND"
    },
    "specifications": [
      {
        "groupName": "Thông số vận hành",
        "items": [
          {
            "key": "Công suất",
            "value": "2000W",
            "isHighlight": true
          },
          {
            "key": "Điện áp",
            "value": "220v",
            "isHighlight": false
          }
        ]
      },
      {
        "groupName": "Kích thước & Thiết kế",
        "items": [
          {
            "key": "Chất liệu",
            "value": "Nhựa PP",
            "isHighlight": false
          }
        ]
      },
      {
        "groupName": "Thông số kỹ thuật khác",
        "items": [
          {
            "key": "MÁY SƯỞI GỐM THÂN CAO TAKIN CAO CẤP Model",
            "value": "TK-469 Công suất: 2000W Điện áp: 220v/50Hz Chất liệu: Nhựa PP, gốm Kích thước: 93x24cm Quy cách: 4 chiếc/1 thùng",
            "isHighlight": false
          }
        ]
      }
    ],
    "tags": [],
    "notes": "",
    "description": "MÁY SƯỞI GỐM THÂN CAO TAKIN CAO CẤP Model: TK-469 Công suất: 2000W Điện áp: 220v/50Hz Chất liệu: Nhựa PP, gốm Kích thước: 93x24cm Quy cách: 4 chiếc/1 thùng",
    "status": "active",
    "updatedAt": "2026-10-01"
  },
  {
    "id": "sheet-tk-468",
    "sku": "TK-468",
    "name": "Sưởi gốm thấp",
    "brand": "TAKIN",
    "categoryGroup": "Điện gia dụng",
    "categoryType": "Sản phẩm",
    "thumbnail": "https://i.ibb.co/LD1CCJGW/TK-468-2.jpg",
    "warrantyMonths": 12,
    "pricing": {
      "costPrice": 366857,
      "distributorPrice": 452000,
      "floorPrice": 1170000,
      "retailPrice": 900000,
      "currency": "VND"
    },
    "specifications": [
      {
        "groupName": "Thông số vận hành",
        "items": [
          {
            "key": "Công suất",
            "value": "2000W",
            "isHighlight": true
          },
          {
            "key": "Điện áp",
            "value": "220v",
            "isHighlight": false
          }
        ]
      },
      {
        "groupName": "Kích thước & Thiết kế",
        "items": [
          {
            "key": "Chất liệu",
            "value": "Nhựa PP",
            "isHighlight": false
          },
          {
            "key": "gốm Kích thước",
            "value": "65*27cm Quy cách: 4 chiếc/1 thùng",
            "isHighlight": true
          }
        ]
      },
      {
        "groupName": "Thông số kỹ thuật khác",
        "items": [
          {
            "key": "MÁY SƯỞI GỐM THÂN THẤP TAKIN CAO CẤP Model",
            "value": "TK-468",
            "isHighlight": false
          }
        ]
      }
    ],
    "tags": [],
    "notes": "",
    "description": "MÁY SƯỞI GỐM THÂN THẤP TAKIN CAO CẤP Model: TK-468  Công suất: 2000W  Điện áp: 220v/50Hz  Chất liệu: Nhựa PP,  gốm Kích thước: 65*27cm Quy cách: 4 chiếc/1 thùng",
    "status": "active",
    "updatedAt": "2026-10-01"
  },
  {
    "id": "sheet-tk-32nc",
    "sku": "TK-32NC",
    "name": "Sản phẩm 60",
    "brand": "TAKIN",
    "categoryGroup": "Điện gia dụng",
    "categoryType": "Sản phẩm",
    "thumbnail": "https://i.ibb.co/ycvQjrTK/TK-32NC.png",
    "warrantyMonths": 12,
    "pricing": {
      "costPrice": 0,
      "distributorPrice": 0,
      "floorPrice": 1044000,
      "retailPrice": 0,
      "currency": "VND"
    },
    "specifications": [
      {
        "groupName": "Thông số vận hành",
        "items": [
          {
            "key": "Dung tích",
            "value": "16.5 l",
            "isHighlight": true
          }
        ]
      },
      {
        "groupName": "Kích thước & Thiết kế",
        "items": [
          {
            "key": "Trọng lượng",
            "value": "3.5 kg",
            "isHighlight": false
          },
          {
            "key": "Chất liệu",
            "value": "inox 304 cao cấp",
            "isHighlight": false
          }
        ]
      }
    ],
    "tags": [],
    "notes": "",
    "description": "Nồi luộc gà Inox 5 Đáy Takin TK-32NC chất liệu inox 304 cao cấp, tay cầm quai inox tán đinh chắc chắn, nắp kính cường lực trong suốt. Kích thước 32 cm, dung tích 16.5 lít, khối lượng 3.5 kg. Cấu tạo đáy 5 lớp truyền nhiệt đều, chống cháy dính đáy, hỗ trợ giữ nhiệt tốt và tiết kiệm năng lượng. Sử dụng phù hợp cho bếp từ, bếp hồng ngoại và bếp gas. Nồi có khả năng chống ăn mòn, hạn chế bám mùi, phù hợp gia đình 4–6 người hoặc luộc gà nguyên con khoảng 2 kg. Kích thước tổng thể 345 × 345 × 260 mm. Bảo hành 12 thán",
    "status": "active",
    "updatedAt": "2026-10-01"
  },
  {
    "id": "sheet-tk-0348a",
    "sku": "TK-0348A",
    "name": "Bộ nồi Táo inox Takin 5 lớp Tk0348A",
    "brand": "TAKIN",
    "categoryGroup": "Điện gia dụng",
    "categoryType": "Sản phẩm",
    "thumbnail": "https://i.ibb.co/WCTJJZp/Capture.png",
    "warrantyMonths": 12,
    "pricing": {
      "costPrice": 474916,
      "distributorPrice": 580000,
      "floorPrice": 1252400,
      "retailPrice": 1044000,
      "currency": "VND"
    },
    "specifications": [
      {
        "groupName": "Kích thước & Thiết kế",
        "items": [
          {
            "key": "Chất liệu",
            "value": "Inox cao cấp chống gỉ sét",
            "isHighlight": false
          },
          {
            "key": "Kích thước",
            "value": "Gồm 3 nồi với đường kính lần lượt là 18cm, 20cm và 24cm, phù hợp cho nhiều nhu cầu nấu nướng",
            "isHighlight": true
          }
        ]
      },
      {
        "groupName": "Thông số kỹ thuật khác",
        "items": [
          {
            "key": "Tên sản phẩm",
            "value": "Bộ Nồi Inox 5 Đáy Cao Cấp Takin",
            "isHighlight": false
          },
          {
            "key": "Model",
            "value": "TK-0348",
            "isHighlight": false
          },
          {
            "key": "Cấu tạo đáy",
            "value": "Đáy 5 lớp truyền nhiệt đa tầng giúp bắt nhiệt nhanh, tỏa nhiệt đều và hạn chế cháy khét",
            "isHighlight": false
          },
          {
            "key": "Loại bếp tương thích",
            "value": "Dùng tốt trên mọi loại bếp, bao gồm bếp từ, bếp gas và bếp hồng ngoại",
            "isHighlight": false
          }
        ]
      }
    ],
    "tags": [],
    "notes": "",
    "description": "Thông số kỹ thuật bộ nồi Takin TK-0348  Tên sản phẩm: Bộ Nồi Inox 5 Đáy Cao Cấp Takin  Model: TK-0348  Chất liệu: Inox cao cấp chống gỉ sét, đảm bảo an toàn vệ sinh thực phẩm và dễ vệ sinh  Kích thước: Gồm 3 nồi với đường kính lần lượt là 18cm, 20cm và 24cm, phù hợp cho nhiều nhu cầu nấu nướng  Cấu tạo đáy: Đáy 5 lớp truyền nhiệt đa tầng giúp bắt nhiệt nhanh, tỏa nhiệt đều và hạn chế cháy khét  Loại bếp tương thích: Dùng tốt trên mọi loại bếp, bao gồm bếp từ, bếp gas và bếp hồng ngoại",
    "status": "active",
    "updatedAt": "2026-10-01"
  },
  {
    "id": "sheet-lk-2633",
    "sku": "LK-2633",
    "name": "Chảo Belly Lock&King Titanium 26cm",
    "brand": "LOCK&KING",
    "categoryGroup": "Điện gia dụng",
    "categoryType": "Sản phẩm",
    "thumbnail": "https://i.ibb.co/mF9TH07F/Capture.png",
    "warrantyMonths": 12,
    "pricing": {
      "costPrice": 349728,
      "distributorPrice": 470000,
      "floorPrice": 1169000,
      "retailPrice": 890000,
      "currency": "VND"
    },
    "specifications": [
      {
        "groupName": "Kích thước & Thiết kế",
        "items": [
          {
            "key": "Trọng lượng",
            "value": "2 kg",
            "isHighlight": false
          },
          {
            "key": "Chất liệu",
            "value": "Inox kết hợp Titanium cao cấp",
            "isHighlight": false
          },
          {
            "key": "Kích thước",
            "value": "Đường kính 26 cm, lòng chảo sâu tiện lợi cho nhiều món chiên, xào",
            "isHighlight": true
          },
          {
            "key": "Khối lượng",
            "value": "2 kg, cầm đầm tay và chắc chắn",
            "isHighlight": true
          }
        ]
      },
      {
        "groupName": "Thông số kỹ thuật khác",
        "items": [
          {
            "key": "Tên sản phẩm",
            "value": "Chảo Belly Lock&King",
            "isHighlight": false
          },
          {
            "key": "Mã sản phẩm",
            "value": "LK-2633",
            "isHighlight": false
          },
          {
            "key": "Cấu tạo thân chảo",
            "value": "5 lớp liền khối giúp truyền nhiệt nhanh, tỏa nhiệt đều và giữ nhiệt lâu",
            "isHighlight": false
          },
          {
            "key": "Loại bếp tương thích",
            "value": "Sử dụng tốt trên mọi loại bếp (bếp từ, bếp gas, bếp halogen, bếp điện)",
            "isHighlight": false
          }
        ]
      },
      {
        "groupName": "Công nghệ & Tính năng",
        "items": [
          {
            "key": "Lớp chống dính",
            "value": "Phủ Titanium bền bỉ, hạn chế trầy xước và an toàn cho sức khỏe",
            "isHighlight": false
          }
        ]
      },
      {
        "groupName": "Tiêu chuẩn & Bảo hành",
        "items": [
          {
            "key": "Bảo hành",
            "value": "Chính hãng 12 tháng",
            "isHighlight": true
          }
        ]
      }
    ],
    "tags": [],
    "notes": "",
    "description": "Thông số kỹ thuật chảo Belly Lock&King LK-2633  Tên sản phẩm: Chảo Belly Lock&King  Mã sản phẩm: LK-2633  Chất liệu: Inox kết hợp Titanium cao cấp, chịu nhiệt và chống ăn mòn tốt  Lớp chống dính: Phủ Titanium bền bỉ, hạn chế trầy xước và an toàn cho sức khỏe  Cấu tạo thân chảo: 5 lớp liền khối giúp truyền nhiệt nhanh, tỏa nhiệt đều và giữ nhiệt lâu  Kích thước: Đường kính 26 cm, lòng chảo sâu tiện lợi cho nhiều món chiên, xào  Khối lượng: 2 kg, cầm đầm tay và chắc chắn  Loại bếp tương thích: Sử dụng tốt trên mọi loại bếp (bếp từ, bếp gas, bếp halogen, bếp điện)  Bảo hành: Chính hãng 12 tháng",
    "status": "active",
    "updatedAt": "2026-10-01"
  },
  {
    "id": "sheet-lm-tk-036a",
    "sku": "LM-TK-036A",
    "name": "Bộ nồi inox 5 đáy cao cấp",
    "brand": "TAKIN",
    "categoryGroup": "Điện gia dụng",
    "categoryType": "Sản phẩm",
    "thumbnail": "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80",
    "warrantyMonths": 12,
    "pricing": {
      "costPrice": 433985,
      "distributorPrice": 515000,
      "floorPrice": 0,
      "retailPrice": 990000,
      "currency": "VND"
    },
    "specifications": [],
    "tags": [],
    "notes": "",
    "description": "",
    "status": "active",
    "updatedAt": "2026-10-02"
  },
  {
    "id": "sheet-lk-3018a",
    "sku": "LK-3018A",
    "name": "Nồi táo Inox 5 đáy cao cấp Lock&King 18cm",
    "brand": "LOCK&KING",
    "categoryGroup": "Điện gia dụng",
    "categoryType": "Sản phẩm",
    "thumbnail": "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80",
    "warrantyMonths": 12,
    "pricing": {
      "costPrice": 134773,
      "distributorPrice": 170000,
      "floorPrice": 0,
      "retailPrice": 0,
      "currency": "VND"
    },
    "specifications": [],
    "tags": [],
    "notes": "",
    "description": "",
    "status": "active",
    "updatedAt": "2026-10-02"
  },
  {
    "id": "sheet-lm-lk-3020a",
    "sku": "LM-LK-3020A",
    "name": "Nồi táo Inox 5 đáy cao cấp Lock&King 20cm",
    "brand": "LOCK&KING",
    "categoryGroup": "Điện gia dụng",
    "categoryType": "Sản phẩm",
    "thumbnail": "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80",
    "warrantyMonths": 12,
    "pricing": {
      "costPrice": 148885,
      "distributorPrice": 185000,
      "floorPrice": 0,
      "retailPrice": 0,
      "currency": "VND"
    },
    "specifications": [],
    "tags": [],
    "notes": "",
    "description": "",
    "status": "active",
    "updatedAt": "2026-10-02"
  },
  {
    "id": "sheet-lk-2606a",
    "sku": "LK-2606A",
    "name": "Chảo cạn Titanium Lock&king 26cm",
    "brand": "LOCK&KING",
    "categoryGroup": "Điện gia dụng",
    "categoryType": "Sản phẩm",
    "thumbnail": "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80",
    "warrantyMonths": 12,
    "pricing": {
      "costPrice": 242251,
      "distributorPrice": 310000,
      "floorPrice": 0,
      "retailPrice": 0,
      "currency": "VND"
    },
    "specifications": [],
    "tags": [],
    "notes": "",
    "description": "",
    "status": "active",
    "updatedAt": "2026-10-02"
  },
  {
    "id": "sheet-lk-2808s-vk-",
    "sku": "LK-2808S(VK)",
    "name": "Chảo sâu vung kính Titanium Lock&king 28cm",
    "brand": "LOCK&KING",
    "categoryGroup": "Điện gia dụng",
    "categoryType": "Sản phẩm",
    "thumbnail": "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80",
    "warrantyMonths": 12,
    "pricing": {
      "costPrice": 320736,
      "distributorPrice": 370000,
      "floorPrice": 0,
      "retailPrice": 0,
      "currency": "VND"
    },
    "specifications": [],
    "tags": [],
    "notes": "",
    "description": "",
    "status": "active",
    "updatedAt": "2026-10-02"
  },
  {
    "id": "sheet-lk-3386a",
    "sku": "LK-3386A",
    "name": "Bộ nồi 3 Inox 5 đáy Lock&king (18.20.24) (1t/4c)",
    "brand": "LOCK&KING",
    "categoryGroup": "Điện gia dụng",
    "categoryType": "Sản phẩm",
    "thumbnail": "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80",
    "warrantyMonths": 12,
    "pricing": {
      "costPrice": 459339,
      "distributorPrice": 530000,
      "floorPrice": 0,
      "retailPrice": 0,
      "currency": "VND"
    },
    "specifications": [],
    "tags": [],
    "notes": "",
    "description": "",
    "status": "active",
    "updatedAt": "2026-10-02"
  },
  {
    "id": "sheet-lk-3568a",
    "sku": "LK-3568A",
    "name": "Bộ nồi 5 Inox 5 đáy Lock&king (Q16.18.20.24.C24) (1t/2c)",
    "brand": "LOCK&KING",
    "categoryGroup": "Điện gia dụng",
    "categoryType": "Sản phẩm",
    "thumbnail": "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80",
    "warrantyMonths": 12,
    "pricing": {
      "costPrice": 827064,
      "distributorPrice": 940000,
      "floorPrice": 0,
      "retailPrice": 0,
      "currency": "VND"
    },
    "specifications": [],
    "tags": [],
    "notes": "",
    "description": "",
    "status": "active",
    "updatedAt": "2026-10-02"
  },
  {
    "id": "sheet-lk-2466s",
    "sku": "LK-2466S",
    "name": "Chảo Titanium  ELITE Lock&King",
    "brand": "LOCK&KING",
    "categoryGroup": "Điện gia dụng",
    "categoryType": "Sản phẩm",
    "thumbnail": "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80",
    "warrantyMonths": 12,
    "pricing": {
      "costPrice": 288664,
      "distributorPrice": 390000,
      "floorPrice": 990000,
      "retailPrice": 690000,
      "currency": "VND"
    },
    "specifications": [],
    "tags": [],
    "notes": "",
    "description": "",
    "status": "active",
    "updatedAt": "2026-10-02"
  },
  {
    "id": "sheet-lk-3003",
    "sku": "LK-3003",
    "name": "Chảo cạn titanium Lock&King 30cm",
    "brand": "LOCK&KING",
    "categoryGroup": "Điện gia dụng",
    "categoryType": "Sản phẩm",
    "thumbnail": "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80",
    "warrantyMonths": 12,
    "pricing": {
      "costPrice": 290620,
      "distributorPrice": 360000,
      "floorPrice": 825000,
      "retailPrice": 750000,
      "currency": "VND"
    },
    "specifications": [],
    "tags": [],
    "notes": "",
    "description": "",
    "status": "active",
    "updatedAt": "2026-10-02"
  },
  {
    "id": "sheet-lk-2433",
    "sku": "LK-2433",
    "name": "Chảo Belly Lock&King",
    "brand": "LOCK&KING",
    "categoryGroup": "Điện gia dụng",
    "categoryType": "Sản phẩm",
    "thumbnail": "https://i.ibb.co/1Ytm6VyJ/ch-o.jpg",
    "warrantyMonths": 12,
    "pricing": {
      "costPrice": 298559,
      "distributorPrice": 410000,
      "floorPrice": 0,
      "retailPrice": 790000,
      "currency": "VND"
    },
    "specifications": [
      {
        "groupName": "Kích thước & Thiết kế",
        "items": [
          {
            "key": "Trọng lượng",
            "value": "2 Kg",
            "isHighlight": false
          },
          {
            "key": "Chất liệu",
            "value": "Inox",
            "isHighlight": false
          },
          {
            "key": "Chảo Belly Lock&King Chất liệu",
            "value": "Inox, Titanium",
            "isHighlight": false
          },
          {
            "key": "Khối lượng",
            "value": "2 Kg",
            "isHighlight": true
          },
          {
            "key": "Kích thước",
            "value": "24 Cm",
            "isHighlight": true
          }
        ]
      },
      {
        "groupName": "Tiêu chuẩn & Bảo hành",
        "items": [
          {
            "key": "Bảo hành",
            "value": "12 Tháng",
            "isHighlight": false
          }
        ]
      },
      {
        "groupName": "Công nghệ & Tính năng",
        "items": [
          {
            "key": "Chống dính",
            "value": "Titanium bền bỉ",
            "isHighlight": false
          }
        ]
      },
      {
        "groupName": "Thông số kỹ thuật khác",
        "items": [
          {
            "key": "Chảo",
            "value": "5 lớp liền khối",
            "isHighlight": false
          },
          {
            "key": "Phù hợp",
            "value": "Bếp từ, bếp gas, bếp halogen, bếp điện",
            "isHighlight": false
          }
        ]
      }
    ],
    "tags": [],
    "notes": "",
    "description": "Chảo Belly Lock&King Chất liệu: Inox, Titanium  Khối lượng: 2 Kg  Kích thước: 24 Cm  Chống dính: Titanium bền bỉ  Chảo: 5 lớp liền khối  Phù hợp: Bếp từ, bếp gas, bếp halogen, bếp điện  Bảo hành: 12 Tháng.",
    "status": "active",
    "updatedAt": "2026-10-01"
  },
  {
    "id": "sheet-lk-1030",
    "sku": "LK-1030",
    "name": "Bình thủy điện 3L Lock&King (4c/t)",
    "brand": "LOCK&KING",
    "categoryGroup": "Điện gia dụng",
    "categoryType": "Sản phẩm",
    "thumbnail": "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80",
    "warrantyMonths": 12,
    "pricing": {
      "costPrice": 785427,
      "distributorPrice": 1020000,
      "floorPrice": 0,
      "retailPrice": 0,
      "currency": "VND"
    },
    "specifications": [],
    "tags": [],
    "notes": "",
    "description": "",
    "status": "active",
    "updatedAt": "2026-10-02"
  }
];
