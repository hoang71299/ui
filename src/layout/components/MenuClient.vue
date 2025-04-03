<template>
  <div class="nav-container primary-menu">
    <div class="mobile-topbar-header">
      <div>
        <img src="../../assets/images/logo-icon.png" class="logo-icon" alt="logo icon" />
      </div>
      <div>
        <h4 class="logo-text">Rukada</h4>
      </div>
      <div class="toggle-icon ms-auto"><i class="bx bx-arrow-to-left"></i></div>
    </div>
    <nav class="navbar navbar-expand-xl w-100">
      <ul class="navbar-nav justify-content-start flex-grow-1 gap-1">
        <!-- Trang chủ -->
        <li class="nav-item">
          <router-link to="/" class="nav-link">
            <div class="parent-icon">
              <i class="fa-solid fa-home"></i>
            </div>
            <div class="menu-title">Trang chủ</div>
          </router-link>
        </li>

        <!-- Quản lý nhân sự -->
        <li class="nav-item dropdown">
          <a class="nav-link dropdown-toggle" href="#" id="navbarDropdown1" role="button" data-bs-toggle="dropdown"
            aria-expanded="false">
            <div class="parent-icon">
              <i class="fa-solid fa-users"></i>
            </div>
            <div class="menu-title">Quản lý nhân sự</div>
          </a>
          <ul class="dropdown-menu" aria-labelledby="navbarDropdown1">
            <li>
              <router-link to="/nhan-vien" class="dropdown-item">
                <i class="fa-solid fa-user-tie me-2"></i>Nhân viên
              </router-link>
            </li>
            <li>
              <router-link to="/phong-ban" class="dropdown-item">
                <i class="fa-solid fa-building me-2"></i>Phòng ban
              </router-link>
            </li>
            <li>
              <router-link to="/chuc-danh" class="dropdown-item">
                <i class="fa-solid fa-id-badge me-2"></i>Chức danh
              </router-link>
            </li>
            <li>
              <router-link to="/hop-dong" class="dropdown-item">
                <i class="fa-solid fa-file-contract me-2"></i>Hợp đồng
              </router-link>
            </li>
          </ul>
        </li>

        <!-- Quản lý chấm công -->
        <li class="nav-item dropdown">
          <a class="nav-link dropdown-toggle" href="#" id="navbarDropdown2" role="button" data-bs-toggle="dropdown"
            aria-expanded="false">
            <div class="parent-icon">
              <i class="fa-solid fa-calendar-check"></i>
            </div>
            <div class="menu-title">Quản lý chấm công</div>
          </a>
          <ul class="dropdown-menu" aria-labelledby="navbarDropdown2">
            <li>
              <router-link to="/cham-cong" class="dropdown-item">
                <i class="fa-solid fa-clipboard-check me-2"></i>Chấm công
              </router-link>
            </li>
            <li>
              <router-link to="/ca-lam" class="dropdown-item">
                <i class="fa-solid fa-clock me-2"></i>Ca làm
              </router-link>
            </li>
            <li>
              <router-link to="/dang-ky-vang" class="dropdown-item">
                <i class="fa-solid fa-calendar-xmark me-2"></i>Đăng ký vắng
              </router-link>
            </li>
            <li>
              <router-link to="/loai-vang" class="dropdown-item">
                <i class="fa-solid fa-list-check me-2"></i>Loại vắng
              </router-link>
            </li>
            <li>
              <router-link to="/tang-ca" class="dropdown-item">
                <i class="fa-solid fa-business-time me-2"></i>Tăng ca
              </router-link>
            </li>
            <li>
              <router-link to="/chi-tiet-tang-ca" class="dropdown-item">
                <i class="fa-solid fa-clipboard-list me-2"></i>Chi tiết tăng ca
              </router-link>
            </li>
          </ul>
        </li>

        <!-- Quản lý lương -->
        <li class="nav-item dropdown">
          <a class="nav-link dropdown-toggle" href="#" id="navbarDropdown3" role="button" data-bs-toggle="dropdown"
            aria-expanded="false">
            <div class="parent-icon">
              <i class="fa-solid fa-money-bill-wave"></i>
            </div>
            <div class="menu-title">Quản lý lương</div>
          </a>
          <ul class="dropdown-menu" aria-labelledby="navbarDropdown3">
            <li>
              <router-link to="/luong" class="dropdown-item">
                <i class="fa-solid fa-dollar-sign me-2"></i>Lương
              </router-link>
            </li>
            <li>
              <router-link to="/bang-luong" class="dropdown-item">
                <i class="fa-solid fa-table me-2"></i>Bảng lương
              </router-link>
            </li>
            <li>
              <router-link to="/bao-hiem" class="dropdown-item">
                <i class="fa-solid fa-shield-alt me-2"></i>Bảo hiểm
              </router-link>
            </li>
          </ul>
        </li>

        <!-- Quản lý KPI -->
        <li class="nav-item dropdown">
          <a class="nav-link dropdown-toggle" href="#" id="navbarDropdown4" role="button" data-bs-toggle="dropdown"
            aria-expanded="false">
            <div class="parent-icon">
              <i class="fa-solid fa-chart-line"></i>
            </div>
            <div class="menu-title">Quản lý KPI</div>
          </a>
          <ul class="dropdown-menu" aria-labelledby="navbarDropdown4">
            <li>
              <router-link to="/tieu-chi-kpi" class="dropdown-item">
                <i class="fa-solid fa-list me-2"></i>Tiêu chí KPI
              </router-link>
            </li>
            <li>
              <router-link to="/danh-gia-kpi" class="dropdown-item">
                <i class="fa-solid fa-star me-2"></i>Đánh giá KPI
              </router-link>
            </li>
          </ul>
        </li>

        <!-- Quản lý NFC -->
        <li class="nav-item dropdown">
          <a class="nav-link dropdown-toggle" href="#" id="navbarDropdown5" role="button" data-bs-toggle="dropdown"
            aria-expanded="false">
            <div class="parent-icon">
              <i class="fa-solid fa-id-card"></i>
            </div>
            <div class="menu-title">Quản lý NFC</div>
          </a>
          <ul class="dropdown-menu" aria-labelledby="navbarDropdown5">
            <li>
              <router-link to="/the-nfc" class="dropdown-item">
                <i class="fa-solid fa-credit-card me-2"></i>Thẻ NFC
              </router-link>
            </li>
            <li>
              <router-link to="/thiet-bi-nfc" class="dropdown-item">
                <i class="fa-solid fa-tablet-alt me-2"></i>Thiết bị NFC
              </router-link>
            </li>
          </ul>
        </li>

        <!-- Quản lý người dùng -->
        <li class="nav-item dropdown">
          <a class="nav-link dropdown-toggle" href="#" id="navbarDropdown6" role="button" data-bs-toggle="dropdown"
            aria-expanded="false">
            <div class="parent-icon">
              <i class="fa-solid fa-user-cog"></i>
            </div>
            <div class="menu-title">Quản lý người dùng</div>
          </a>
          <ul class="dropdown-menu" aria-labelledby="navbarDropdown6">
            <li>
              <router-link to="/nguoi-dung" class="dropdown-item">
                <i class="fa-solid fa-user me-2"></i>Người dùng
              </router-link>
            </li>
            <li>
              <router-link to="/vai-tro" class="dropdown-item">
                <i class="fa-solid fa-user-tag me-2"></i>Vai trò
              </router-link>
            </li>
            <li>
              <router-link to="/quyen" class="dropdown-item">
                <i class="fa-solid fa-key me-2"></i>Quyền
              </router-link>
            </li>
            <li>
              <router-link to="/phan-quyen" class="dropdown-item">
                <i class="fa-solid fa-user-shield me-2"></i>Phân quyền
              </router-link>
            </li>
          </ul>
        </li>
      </ul>
    </nav>
  </div>
</template>
<script>
export default {
  name: 'MenuClient'
};
</script>
<style>
.nav-container {
  background: #fff;
  box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, .075);
}

.nav-link {
  color: #333;
  display: flex;
  align-items: center;
  padding: 10px 15px;
  transition: all 0.3s;
}

.nav-link:hover {
  background: #f8f9fa;
}

.parent-icon {
  margin-right: 10px;
  width: 20px;
  text-align: center;
}

.menu-title {
  font-size: 14px;
}

.dropdown-menu {
  border-radius: 0.25rem;
  box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, .15);
  padding: 0.5rem 0;
}

.dropdown-item {
  padding: 0.5rem 1.5rem;
  transition: all 0.2s;
}

.dropdown-item:hover {
  background-color: #f1f1f1;
}
</style>
