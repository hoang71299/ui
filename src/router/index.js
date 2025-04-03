import { createRouter, createWebHistory } from "vue-router"; // cài vue-router: npm install vue-router@next --save

const routes = [
  {
    path: "/",
    component: () => import("../components/Dashboard/index.vue"),
    meta: { layout: "client" },
  },
  {
    path: "/dang-ki",
    component: () => import("../components/NhanVien/DangKi/DangKi.vue"),
    meta: { layout: "client" },
  },
  // Nhân viên
  {
    path: "/nhan-vien",
    component: () => import("../components/NhanVien/QuanLyNhanVien.vue"),
    meta: { layout: "client" },
  },
  // Phòng ban
  {
    path: "/phong-ban",
    component: () => import("../components/PhongBan/QuanLyPhongBan.vue"),
    meta: { layout: "client" },
  },
  // Ca làm
  {
    path: "/ca-lam",
    component: () => import("../components/CaLam/QuanLyCaLam.vue"),
    meta: { layout: "client" },
  },
  // Chấm công
  {
    path: "/cham-cong",
    component: () => import("../components/ChamCong/QuanLyChamCong.vue"),
    meta: { layout: "client" },
  },
  // Chức danh
  {
    path: "/chuc-danh",
    component: () => import("../components/ChucDanh/QuanLyChucDanh.vue"),
    meta: { layout: "client" },
  },
  // Lương
  {
    path: "/luong",
    component: () => import("../components/Luong/QuanLyLuong.vue"),
    meta: { layout: "client" },
  },
  // Bảng lương
  {
    path: "/bang-luong",
    component: () => import("../components/BangLuong/QuanLyBangLuong.vue"),
    meta: { layout: "client" },
  },
  // Tăng ca
  // Chi tiết tăng ca
  {
    path: "/chi-tiet-tang-ca",
    component: () => import("../components/ChiTietTangCa/ChiTietTangCa.vue"),
    meta: { layout: "client" },
  },
  // Bảo hiểm
  {
    path: "/bao-hiem",
    component: () => import("../components/BaoHiem/QuanLyBaoHiem.vue"),
    meta: { layout: "client" },
  },
  // Hợp đồng
  {
    path: "/hop-dong",
    component: () => import("../components/HopDong/QuanLyHopDong.vue"),
    meta: { layout: "client" },
  },
  // Đăng ký vắng
  {
    path: "/dang-ky-vang",
    component: () => import("../components/DangKyVang/QuanLyDangKyVang.vue"),
    meta: { layout: "client" },
  },
  // Loại vắng
  {
    path: "/loai-vang",
    component: () => import("../components/LoaiVang/QuanLyLoaiVang.vue"),
    meta: { layout: "client" },
  },
  // KPI
  {
    path: "/tieu-chi-kpi",
    component: () => import("../components/TieuChiKPI/QuanLyTieuChiKPI.vue"),
    meta: { layout: "client" },
  },
  {
    path: "/danh-gia-kpi",
    component: () => import("../components/DanhGiaKPI/QuanLyDanhGiaKPI.vue"),
    meta: { layout: "client" },
  },
  // NFC
  {
    path: "/the-nfc",
    component: () => import("../components/TheNFC/QuanLyTheNFC.vue"),
    meta: { layout: "client" },
  },
  {
    path: "/thiet-bi-nfc",
    component: () => import("../components/ThietBiNFC/QuanLyThietBiNFC.vue"),
    meta: { layout: "client" },
  },
  // Quản lý người dùng
  {
    path: "/nguoi-dung",
    component: () => import("../components/NguoiDung/QuanLyNguoiDung.vue"),
    meta: { layout: "client" },
  },
  {
    path: "/vai-tro",
    component: () => import("../components/VaiTro/QuanLyVaiTro.vue"),
    meta: { layout: "client" },
  },
  {
    path: "/quyen",
    component: () => import("../components/Quyen/QuanLyQuyen.vue"),
    meta: { layout: "client" },
  },
  {
    path: "/phan-quyen",
    component: () => import("../components/PhanQuyen/QuanLyPhanQuyen.vue"),
    meta: { layout: "client" },
  },
  // Báo cáo
  {
    path: "/bao-cao",
    component: () => import("../components/BaoCao/index.vue"),
    meta: { layout: "client" },
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes: routes,
});

export default router;
