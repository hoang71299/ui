<template>
  <div class="container-fluid">
    <div class="row">
      <div class="col-12">
        <div class="card">
          <div class="card-header d-flex justify-content-between align-items-center">
            <h5 class="mb-0">Quản Lý Người Dùng</h5>
            <button class="btn btn-primary" @click="showAddModal">
              <i class="bx bx-plus me-1"></i> Thêm Người Dùng
            </button>
          </div>
          <div class="card-body">
            <!-- Bộ lọc -->
            <div class="row mb-3">
              <div class="col-md-3">
                <label class="form-label">Vai Trò</label>
                <select class="form-select" v-model="filters.vaiTro">
                  <option value="">Tất cả</option>
                  <option v-for="vaiTro in vaiTros" :key="vaiTro.id_vai_tro" :value="vaiTro.id_vai_tro">
                    {{ vaiTro.ten_vai_tro }}
                  </option>
                </select>
              </div>
              <div class="col-md-3">
                <label class="form-label">Trạng Thái</label>
                <select class="form-select" v-model="filters.trangThai">
                  <option value="">Tất cả</option>
                  <option value="true">Hoạt động</option>
                  <option value="false">Bị khóa</option>
                </select>
              </div>
              <div class="col-md-6">
                <label class="form-label">Tìm Kiếm</label>
                <input type="text" class="form-control" v-model="filters.search"
                  placeholder="Tên, email, tên đăng nhập...">
              </div>
            </div>

            <!-- Bảng danh sách người dùng -->
            <div class="table-responsive">
              <table class="table table-bordered table-hover">
                <thead class="table-light">
                  <tr>
                    <th>ID</th>
                    <th>Tên Đăng Nhập</th>
                    <th>Họ Tên</th>
                    <th>Email</th>
                    <th>Vai Trò</th>
                    <th>Trạng Thái</th>
                    <th>Thao Tác</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="nguoiDung in filteredNguoiDungs" :key="nguoiDung.id_nguoi_dung">
                    <td>{{ nguoiDung.id_nguoi_dung }}</td>
                    <td>{{ nguoiDung.ten_dang_nhap }}</td>
                    <td>{{ nguoiDung.ho_va_ten }}</td>
                    <td>{{ nguoiDung.email }}</td>
                    <td>{{ getVaiTroName(nguoiDung.id_vai_tro) }}</td>
                    <td>
                      <span :class="nguoiDung.trang_thai ? 'badge bg-success' : 'badge bg-danger'">
                        {{ nguoiDung.trang_thai ? 'Hoạt động' : 'Bị khóa' }}
                      </span>
                    </td>
                    <td>
                      <div class="d-flex gap-2">
                        <button class="btn btn-sm btn-warning" @click="editNguoiDung(nguoiDung)">
                          <i class="bx bx-edit"></i>
                        </button>
                        <button class="btn btn-sm btn-danger" @click="deleteNguoiDung(nguoiDung)">
                          <i class="bx bx-trash"></i>
                        </button>
                        <button class="btn btn-sm btn-info" @click="resetPassword(nguoiDung)">
                          <i class="bx bx-key"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                  <tr v-if="filteredNguoiDungs.length === 0">
                    <td colspan="7" class="text-center">Không có dữ liệu</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- Phân trang -->
            <div class="d-flex justify-content-between align-items-center mt-3">
              <div>
                Hiển thị {{ filteredNguoiDungs.length }} / {{ nguoiDungs.length }} người dùng
              </div>
              <nav>
                <ul class="pagination mb-0">
                  <li class="page-item" :class="{ disabled: currentPage === 1 }">
                    <a class="page-link" href="#" @click.prevent="currentPage--">Trước</a>
                  </li>
                  <li v-for="page in totalPages" :key="page" class="page-item"
                    :class="{ active: page === currentPage }">
                    <a class="page-link" href="#" @click.prevent="currentPage = page">{{ page }}</a>
                  </li>
                  <li class="page-item" :class="{ disabled: currentPage === totalPages }">
                    <a class="page-link" href="#" @click.prevent="currentPage++">Sau</a>
                  </li>
                </ul>
              </nav>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal Thêm/Sửa Người Dùng -->
    <div class="modal fade" id="nguoiDungModal" tabindex="-1" aria-hidden="true" ref="nguoiDungModal">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">{{ isEditing ? 'Cập Nhật Người Dùng' : 'Thêm Người Dùng Mới' }}</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="saveNguoiDung">
              <div class="mb-3">
                <label class="form-label">Tên Đăng Nhập</label>
                <input type="text" class="form-control" v-model="formData.ten_dang_nhap" required :disabled="isEditing">
                <div class="form-text" v-if="isEditing">Không thể thay đổi tên đăng nhập</div>
              </div>
              <div class="mb-3">
                <label class="form-label">Họ Tên</label>
                <input type="text" class="form-control" v-model="formData.ho_va_ten" required>
              </div>
              <div class="mb-3">
                <label class="form-label">Email</label>
                <input type="email" class="form-control" v-model="formData.email" required>
              </div>
              <div class="mb-3" v-if="!isEditing">
                <label class="form-label">Mật Khẩu</label>
                <input type="password" class="form-control" v-model="formData.mat_khau" required>
              </div>
              <div class="mb-3">
                <label class="form-label">Vai Trò</label>
                <select class="form-select" v-model="formData.id_vai_tro" required>
                  <option value="">Chọn vai trò</option>
                  <option v-for="vaiTro in vaiTros" :key="vaiTro.id_vai_tro" :value="vaiTro.id_vai_tro">
                    {{ vaiTro.ten_vai_tro }}
                  </option>
                </select>
              </div>
              <div class="form-check form-switch mb-3">
                <input class="form-check-input" type="checkbox" id="trangThai" v-model="formData.trang_thai">
                <label class="form-check-label" for="trangThai">
                  {{ formData.trang_thai ? 'Hoạt động' : 'Bị khóa' }}
                </label>
              </div>
              <div class="text-end">
                <button type="button" class="btn btn-secondary me-2" data-bs-dismiss="modal">Hủy</button>
                <button type="submit" class="btn btn-primary">Lưu</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal Xác Nhận Xóa -->
    <div class="modal fade" id="deleteModal" tabindex="-1" aria-hidden="true" ref="deleteModal">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Xác Nhận Xóa</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body" v-if="selectedNguoiDung">
            <p>Bạn có chắc chắn muốn xóa người dùng <strong>{{ selectedNguoiDung.ho_va_ten }}</strong>?</p>
            <p class="text-danger">Hành động này không thể hoàn tác!</p>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Hủy</button>
            <button type="button" class="btn btn-danger" @click="confirmDelete">Xóa</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal Đặt Lại Mật Khẩu -->
    <div class="modal fade" id="resetPasswordModal" tabindex="-1" aria-hidden="true" ref="resetPasswordModal">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Đặt Lại Mật Khẩu</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body" v-if="selectedNguoiDung">
            <form @submit.prevent="confirmResetPassword">
              <p>Đặt lại mật khẩu cho người dùng <strong>{{ selectedNguoiDung.ho_va_ten }}</strong></p>
              <div class="mb-3">
                <label class="form-label">Mật Khẩu Mới</label>
                <input type="password" class="form-control" v-model="newPassword" required>
              </div>
              <div class="mb-3">
                <label class="form-label">Xác Nhận Mật Khẩu</label>
                <input type="password" class="form-control" v-model="confirmPassword" required>
                <div class="form-text text-danger" v-if="passwordMismatch">
                  Mật khẩu xác nhận không khớp
                </div>
              </div>
              <div class="text-end">
                <button type="button" class="btn btn-secondary me-2" data-bs-dismiss="modal">Hủy</button>
                <button type="submit" class="btn btn-primary">Đặt Lại Mật Khẩu</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
import { Modal } from 'bootstrap';

export default {
  name: 'QuanLyNguoiDung',
  data() {
    return {
      nguoiDungs: [],
      vaiTros: [],
      selectedNguoiDung: null,
      isEditing: false,
      formData: {
        ten_dang_nhap: '',
        ho_va_ten: '',
        email: '',
        mat_khau: '',
        id_vai_tro: '',
        trang_thai: true
      },
      newPassword: '',
      confirmPassword: '',
      filters: {
        vaiTro: '',
        trangThai: '',
        search: ''
      },
      currentPage: 1,
      itemsPerPage: 10,
      nguoiDungModal: null,
      deleteModal: null,
      resetPasswordModal: null
    };
  },
  computed: {
    filteredNguoiDungs() {
      let filtered = [...this.nguoiDungs];

      if (this.filters.vaiTro) {
        filtered = filtered.filter(nd => nd.id_vai_tro === this.filters.vaiTro);
      }

      if (this.filters.trangThai !== '') {
        const status = this.filters.trangThai === 'true';
        filtered = filtered.filter(nd => nd.trang_thai === status);
      }

      if (this.filters.search) {
        const searchTerm = this.filters.search.toLowerCase();
        filtered = filtered.filter(nd =>
          nd.ho_va_ten.toLowerCase().includes(searchTerm) ||
          (nd.email && nd.email.toLowerCase().includes(searchTerm)) ||
          (nd.ten_dang_nhap && nd.ten_dang_nhap.toLowerCase().includes(searchTerm))
        );
      }

      // Phân trang
      const start = (this.currentPage - 1) * this.itemsPerPage;
      const end = start + this.itemsPerPage;
      return filtered.slice(start, end);
    },
    totalPages() {
      return Math.ceil(this.nguoiDungs.length / this.itemsPerPage);
    },
    passwordMismatch() {
      return this.newPassword !== this.confirmPassword && this.confirmPassword !== '';
    }
  },
  mounted() {
    this.fetchData();
    this.initModals();
  },
  methods: {
    initModals() {
      this.nguoiDungModal = new Modal(this.$refs.nguoiDungModal);
      this.deleteModal = new Modal(this.$refs.deleteModal);
      this.resetPasswordModal = new Modal(this.$refs.resetPasswordModal);
    },
    async fetchData() {
      try {
        // Fetch người dùng
        const nguoiDungResponse = await axios.get('http://127.0.0.1:8000/api/nguoi-dung');
        this.nguoiDungs = nguoiDungResponse.data;

        // Fetch vai trò
        const vaiTroResponse = await axios.get('http://127.0.0.1:8000/api/vai-tro');
        this.vaiTros = vaiTroResponse.data;
      } catch (error) {
        console.error('Error fetching data:', error);

        // Dữ liệu mẫu nếu API không hoạt động
        this.vaiTros = [
          { id_vai_tro: 1, ten_vai_tro: 'Admin' },
          { id_vai_tro: 2, ten_vai_tro: 'Quản lý' },
          { id_vai_tro: 3, ten_vai_tro: 'Nhân viên' }
        ];

        this.nguoiDungs = [
          {
            id_nguoi_dung: 1,
            ten_dang_nhap: 'admin',
            ho_va_ten: 'Administrator',
            email: 'admin@example.com',
            id_vai_tro: 1,
            trang_thai: true
          },
          {
            id_nguoi_dung: 2,
            ten_dang_nhap: 'manager',
            ho_va_ten: 'Nguyễn Văn A',
            email: 'manager@example.com',
            id_vai_tro: 2,
            trang_thai: true
          },
          {
            id_nguoi_dung: 3,
            ten_dang_nhap: 'staff1',
            ho_va_ten: 'Trần Thị B',
            email: 'staff1@example.com',
            id_vai_tro: 3,
            trang_thai: true
          },
          {
            id_nguoi_dung: 4,
            ten_dang_nhap: 'staff2',
            ho_va_ten: 'Lê Văn C',
            email: 'staff2@example.com',
            id_vai_tro: 3,
            trang_thai: false
          }
        ];
      }
    },
    getVaiTroName(id) {
      if (!id) return 'Chưa phân quyền';
      const vaiTro = this.vaiTros.find(vt => vt.id_vai_tro === id);
      return vaiTro ? vaiTro.ten_vai_tro : 'Không xác định';
    },
    resetForm() {
      this.formData = {
        ten_dang_nhap: '',
        ho_va_ten: '',
        email: '',
        mat_khau: '',
        id_vai_tro: '',
        trang_thai: true
      };
    },
    showAddModal() {
      this.isEditing = false;
      this.resetForm();
      this.nguoiDungModal.show();
    },
    editNguoiDung(nguoiDung) {
      this.isEditing = true;
      this.selectedNguoiDung = nguoiDung;
      this.formData = { ...nguoiDung };
      delete this.formData.mat_khau; // Không hiển thị mật khẩu khi sửa
      this.nguoiDungModal.show();
    },
    deleteNguoiDung(nguoiDung) {
      this.selectedNguoiDung = nguoiDung;
      this.deleteModal.show();
    },
    resetPassword(nguoiDung) {
      this.selectedNguoiDung = nguoiDung;
      this.newPassword = '';
      this.confirmPassword = '';
      this.resetPasswordModal.show();
    },
    async saveNguoiDung() {
      try {
        if (this.isEditing) {
          // Cập nhật người dùng
          await axios.put(`http://127.0.0.1:8000/api/nguoi-dung/${this.selectedNguoiDung.id_nguoi_dung}`, this.formData);

          // Cập nhật dữ liệu trong mảng
          const index = this.nguoiDungs.findIndex(nd => nd.id_nguoi_dung === this.selectedNguoiDung.id_nguoi_dung);
          if (index !== -1) {
            this.nguoiDungs[index] = { ...this.nguoiDungs[index], ...this.formData };
          }
        } else {
          // Thêm người dùng mới
          const response = await axios.post('http://127.0.0.1:8000/api/nguoi-dung', this.formData);
          this.nguoiDungs.push(response.data);
        }

        this.nguoiDungModal.hide();
        this.resetForm();
      } catch (error) {
        console.error('Error saving user:', error);
        alert('Có lỗi xảy ra khi lưu thông tin người dùng!');
      }
    },
    async confirmDelete() {
      try {
        await axios.delete(`http://127.0.0.1:8000/api/nguoi-dung/${this.selectedNguoiDung.id_nguoi_dung}`);

        // Xóa người dùng khỏi mảng
        this.nguoiDungs = this.nguoiDungs.filter(nd => nd.id_nguoi_dung !== this.selectedNguoiDung.id_nguoi_dung);

        this.deleteModal.hide();
      } catch (error) {
        console.error('Error deleting user:', error);
        alert('Có lỗi xảy ra khi xóa người dùng!');
      }
    },
    async confirmResetPassword() {
      if (this.newPassword !== this.confirmPassword) {
        return; // Không thực hiện nếu mật khẩu không khớp
      }

      try {
        await axios.post(`http://127.0.0.1:8000/api/nguoi-dung/${this.selectedNguoiDung.id_nguoi_dung}/reset-password`, {
          mat_khau: this.newPassword
        });

        this.resetPasswordModal.hide();
        alert('Đặt lại mật khẩu thành công!');
      } catch (error) {
        console.error('Error resetting password:', error);
        alert('Có lỗi xảy ra khi đặt lại mật khẩu!');
      }
    }
  }
};
</script>

<style scoped>
.card {
  margin-bottom: 20px;
  box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);
}

.table th {
  font-weight: 500;
  background-color: #f8f9fa;
}

.badge {
  font-weight: 500;
}
</style>