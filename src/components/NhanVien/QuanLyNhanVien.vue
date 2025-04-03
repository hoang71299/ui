<template>
  <div class="container-fluid">
    <div class="row">
      <div class="col-12">
        <div class="card">
          <div class="card-header d-flex justify-content-between align-items-center">
            <h5 class="mb-0">Quản Lý Nhân Viên</h5>
            <button class="btn btn-primary" @click="showAddModal">
              <i class="bx bx-plus me-1"></i> Thêm Nhân Viên
            </button>
          </div>
          <div class="card-body">
            <!-- Bộ lọc -->
            <div class="row mb-3">
              <div class="col-md-3">
                <label class="form-label">Phòng Ban</label>
                <select class="form-select" v-model="filters.phongBan">
                  <option value="">Tất cả</option>
                  <option v-for="pb in phongBans" :key="pb.id_phong_ban" :value="pb.id_phong_ban">
                    {{ pb.ten_phong_ban }}
                  </option>
                </select>
              </div>
              <div class="col-md-3">
                <label class="form-label">Trạng Thái</label>
                <select class="form-select" v-model="filters.trangThai">
                  <option value="">Tất cả</option>
                  <option value="true">Đang làm việc</option>
                  <option value="false">Đã nghỉ việc</option>
                </select>
              </div>
              <div class="col-md-6">
                <label class="form-label">Tìm Kiếm</label>
                <input type="text" class="form-control" v-model="filters.search"
                  placeholder="Tên, email, số điện thoại...">
              </div>
            </div>

            <!-- Bảng danh sách nhân viên -->
            <div class="table-responsive">
              <table class="table table-bordered table-hover">
                <thead class="table-light">
                  <tr>
                    <th>Mã NV</th>
                    <th>Họ Tên</th>
                    <th>Email</th>
                    <th>Số Điện Thoại</th>
                    <th>Phòng Ban</th>
                    <th>Chức Vụ</th>
                    <th>Trạng Thái</th>
                    <th>Thao Tác</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="nhanVien in filteredNhanViens" :key="nhanVien.id_nhan_vien">
                    <td>{{ nhanVien.id_nhan_vien }}</td>
                    <td>{{ nhanVien.ho_va_ten }}</td>
                    <td>{{ nhanVien.email }}</td>
                    <td>{{ nhanVien.so_dien_thoai }}</td>
                    <td>{{ getPhongBanName(nhanVien.id_phong_ban) }}</td>
                    <td>{{ nhanVien.chuc_vu }}</td>
                    <td>
                      <span :class="nhanVien.trang_thai ? 'badge bg-success' : 'badge bg-danger'">
                        {{ nhanVien.trang_thai ? 'Đang làm việc' : 'Đã nghỉ việc' }}
                      </span>
                    </td>
                    <td>
                      <div class="d-flex gap-2">
                        <button class="btn btn-sm btn-warning" @click="editNhanVien(nhanVien)">
                          <i class="bx bx-edit"></i>
                        </button>
                        <button class="btn btn-sm btn-danger" @click="deleteNhanVien(nhanVien)">
                          <i class="bx bx-trash"></i>
                        </button>
                        <button class="btn btn-sm btn-info" @click="viewDetails(nhanVien)">
                          <i class="bx bx-detail"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                  <tr v-if="filteredNhanViens.length === 0">
                    <td colspan="8" class="text-center">Không có dữ liệu</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- Phân trang -->
            <div class="d-flex justify-content-between align-items-center mt-3">
              <div>
                Hiển thị {{ filteredNhanViens.length }} / {{ nhanViens.length }} nhân viên
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

    <!-- Modal Thêm/Sửa Nhân Viên -->
    <div class="modal fade" id="nhanVienModal" tabindex="-1" aria-hidden="true" ref="nhanVienModal">
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">{{ isEditing ? 'Cập Nhật Nhân Viên' : 'Thêm Nhân Viên Mới' }}</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="saveNhanVien">
              <div class="row">
                <div class="col-md-6 mb-3">
                  <label class="form-label">Họ Tên</label>
                  <input type="text" class="form-control" v-model="formData.ho_va_ten" required>
                </div>
                <div class="col-md-6 mb-3">
                  <label class="form-label">Email</label>
                  <input type="email" class="form-control" v-model="formData.email" required>
                </div>
              </div>
              <div class="row">
                <div class="col-md-6 mb-3">
                  <label class="form-label">Số Điện Thoại</label>
                  <input type="text" class="form-control" v-model="formData.so_dien_thoai">
                </div>
                <div class="col-md-6 mb-3">
                  <label class="form-label">Ngày Sinh</label>
                  <input type="date" class="form-control" v-model="formData.ngay_sinh">
                </div>
              </div>
              <div class="row">
                <div class="col-md-6 mb-3">
                  <label class="form-label">Phòng Ban</label>
                  <select class="form-select" v-model="formData.id_phong_ban">
                    <option value="">Chọn phòng ban</option>
                    <option v-for="pb in phongBans" :key="pb.id_phong_ban" :value="pb.id_phong_ban">
                      {{ pb.ten_phong_ban }}
                    </option>
                  </select>
                </div>
                <div class="col-md-6 mb-3">
                  <label class="form-label">Chức Vụ</label>
                  <input type="text" class="form-control" v-model="formData.chuc_vu">
                </div>
              </div>
              <div class="row">
                <div class="col-md-6 mb-3">
                  <label class="form-label">Địa Chỉ</label>
                  <textarea class="form-control" v-model="formData.dia_chi" rows="2"></textarea>
                </div>
                <div class="col-md-6 mb-3">
                  <label class="form-label">Ngày Vào Làm</label>
                  <input type="date" class="form-control" v-model="formData.ngay_vao_lam">
                </div>
              </div>
              <div class="form-check form-switch mb-3">
                <input class="form-check-input" type="checkbox" id="trangThai" v-model="formData.trang_thai">
                <label class="form-check-label" for="trangThai">
                  {{ formData.trang_thai ? 'Đang làm việc' : 'Đã nghỉ việc' }}
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
          <div class="modal-body" v-if="selectedNhanVien">
            <p>Bạn có chắc chắn muốn xóa nhân viên <strong>{{ selectedNhanVien.ho_va_ten }}</strong>?</p>
            <p class="text-danger">Hành động này không thể hoàn tác!</p>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Hủy</button>
            <button type="button" class="btn btn-danger" @click="confirmDelete">Xóa</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal Xem Chi Tiết -->
    <div class="modal fade" id="detailsModal" tabindex="-1" aria-hidden="true" ref="detailsModal">
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" v-if="selectedNhanVien">Chi Tiết Nhân Viên - {{ selectedNhanVien.ho_va_ten }}</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body" v-if="selectedNhanVien">
            <div class="row">
              <div class="col-md-6">
                <div class="card">
                  <div class="card-body">
                    <h6 class="card-title">Thông Tin Cá Nhân</h6>
                    <table class="table table-borderless">
                      <tbody>
                        <tr>
                          <td class="fw-bold">Họ Tên:</td>
                          <td>{{ selectedNhanVien.ho_va_ten }}</td>
                        </tr>
                        <tr>
                          <td class="fw-bold">Email:</td>
                          <td>{{ selectedNhanVien.email }}</td>
                        </tr>
                        <tr>
                          <td class="fw-bold">Số Điện Thoại:</td>
                          <td>{{ selectedNhanVien.so_dien_thoai }}</td>
                        </tr>
                        <tr>
                          <td class="fw-bold">Ngày Sinh:</td>
                          <td>{{ formatDate(selectedNhanVien.ngay_sinh) }}</td>
                        </tr>
                        <tr>
                          <td class="fw-bold">Địa Chỉ:</td>
                          <td>{{ selectedNhanVien.dia_chi }}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
              <div class="col-md-6">
                <div class="card">
                  <div class="card-body">
                    <h6 class="card-title">Thông Tin Công Việc</h6>
                    <table class="table table-borderless">
                      <tbody>
                        <tr>
                          <td class="fw-bold">Mã Nhân Viên:</td>
                          <td>{{ selectedNhanVien.id_nhan_vien }}</td>
                        </tr>
                        <tr>
                          <td class="fw-bold">Phòng Ban:</td>
                          <td>{{ getPhongBanName(selectedNhanVien.id_phong_ban) }}</td>
                        </tr>
                        <tr>
                          <td class="fw-bold">Chức Vụ:</td>
                          <td>{{ selectedNhanVien.chuc_vu }}</td>
                        </tr>
                        <tr>
                          <td class="fw-bold">Ngày Vào Làm:</td>
                          <td>{{ formatDate(selectedNhanVien.ngay_vao_lam) }}</td>
                        </tr>
                        <tr>
                          <td class="fw-bold">Trạng Thái:</td>
                          <td>
                            <span :class="selectedNhanVien.trang_thai ? 'badge bg-success' : 'badge bg-danger'">
                              {{ selectedNhanVien.trang_thai ? 'Đang làm việc' : 'Đã nghỉ việc' }}
                            </span>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Đóng</button>
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
  name: 'QuanLyNhanVien',
  data() {
    return {
      nhanViens: [],
      phongBans: [],
      selectedNhanVien: null,
      isEditing: false,
      formData: {
        ho_va_ten: '',
        email: '',
        so_dien_thoai: '',
        ngay_sinh: '',
        dia_chi: '',
        id_phong_ban: '',
        chuc_vu: '',
        ngay_vao_lam: '',
        trang_thai: true
      },
      filters: {
        phongBan: '',
        trangThai: '',
        search: ''
      },
      currentPage: 1,
      itemsPerPage: 10,
      nhanVienModal: null,
      deleteModal: null,
      detailsModal: null
    };
  },
  computed: {
    filteredNhanViens() {
      let filtered = [...this.nhanViens];

      if (this.filters.phongBan) {
        filtered = filtered.filter(nv => nv.id_phong_ban === this.filters.phongBan);
      }

      if (this.filters.trangThai !== '') {
        const status = this.filters.trangThai === 'true';
        filtered = filtered.filter(nv => nv.trang_thai === status);
      }

      if (this.filters.search) {
        const searchTerm = this.filters.search.toLowerCase();
        filtered = filtered.filter(nv =>
          nv.ho_va_ten.toLowerCase().includes(searchTerm) ||
          (nv.email && nv.email.toLowerCase().includes(searchTerm)) ||
          (nv.so_dien_thoai && nv.so_dien_thoai.includes(searchTerm))
        );
      }

      // Phân trang
      const start = (this.currentPage - 1) * this.itemsPerPage;
      const end = start + this.itemsPerPage;
      return filtered.slice(start, end);
    },
    totalPages() {
      return Math.ceil(this.nhanViens.length / this.itemsPerPage);
    }
  },
  mounted() {
    this.fetchData();
    this.initModals();
  },
  methods: {
    initModals() {
      this.nhanVienModal = new Modal(this.$refs.nhanVienModal);
      this.deleteModal = new Modal(this.$refs.deleteModal);
      this.detailsModal = new Modal(this.$refs.detailsModal);
    },
    async fetchData() {
      try {
        // Fetch nhân viên
        const nhanVienResponse = await axios.get('http://127.0.0.1:8000/api/nhan-vien');
        this.nhanViens = nhanVienResponse.data;

        // Fetch phòng ban
        const phongBanResponse = await axios.get('http://127.0.0.1:8000/api/phong-ban');
        this.phongBans = phongBanResponse.data;
      } catch (error) {
        console.error('Error fetching data:', error);

        // Dữ liệu mẫu nếu API không hoạt động
        this.phongBans = [
          { id_phong_ban: 1, ten_phong_ban: 'Phòng Nhân sự' },
          { id_phong_ban: 2, ten_phong_ban: 'Phòng Kế toán' },
          { id_phong_ban: 3, ten_phong_ban: 'Phòng IT' }
        ];

        this.nhanViens = [
          {
            id_nhan_vien: 1,
            ho_va_ten: 'Nguyễn Văn A',
            email: 'nguyenvana@example.com',
            so_dien_thoai: '0123456789',
            ngay_sinh: '1990-01-15',
            dia_chi: 'Hà Nội',
            id_phong_ban: 1,
            chuc_vu: 'Trưởng phòng',
            ngay_vao_lam: '2020-01-01',
            trang_thai: true
          },
          {
            id_nhan_vien: 2,
            ho_va_ten: 'Trần Thị B',
            email: 'tranthib@example.com',
            so_dien_thoai: '0987654321',
            ngay_sinh: '1992-05-20',
            dia_chi: 'Hồ Chí Minh',
            id_phong_ban: 2,
            chuc_vu: 'Nhân viên',
            ngay_vao_lam: '2021-03-15',
            trang_thai: true
          },
          {
            id_nhan_vien: 3,
            ho_va_ten: 'Lê Văn C',
            email: 'levanc@example.com',
            so_dien_thoai: '0369852147',
            ngay_sinh: '1988-11-10',
            dia_chi: 'Đà Nẵng',
            id_phong_ban: 2,
            chuc_vu: 'Trưởng phòng',
            ngay_vao_lam: '2019-06-01',
            trang_thai: true
          },
          {
            id_nhan_vien: 4,
            ho_va_ten: 'Phạm Thị D',
            email: 'phamthid@example.com',
            so_dien_thoai: '0321654987',
            ngay_sinh: '1995-08-25',
            dia_chi: 'Hải Phòng',
            id_phong_ban: 1,
            chuc_vu: 'Nhân viên',
            ngay_vao_lam: '2022-01-10',
            trang_thai: false
          }
        ];
      }
    },
    getPhongBanName(id) {
      if (!id) return 'Chưa phân công';
      const phongBan = this.phongBans.find(pb => pb.id_phong_ban === id);
      return phongBan ? phongBan.ten_phong_ban : 'Không xác định';
    },
    formatDate(dateString) {
      if (!dateString) return 'N/A';
      const date = new Date(dateString);
      return date.toLocaleDateString('vi-VN');
    },
    resetForm() {
      this.formData = {
        ho_va_ten: '',
        email: '',
        so_dien_thoai: '',
        ngay_sinh: '',
        dia_chi: '',
        id_phong_ban: '',
        chuc_vu: '',
        ngay_vao_lam: '',
        trang_thai: true
      };
    },
    showAddModal() {
      this.isEditing = false;
      this.resetForm();
      this.nhanVienModal.show();
    },
    editNhanVien(nhanVien) {
      this.isEditing = true;
      this.selectedNhanVien = nhanVien;
      this.formData = { ...nhanVien };
      this.nhanVienModal.show();
    },
    deleteNhanVien(nhanVien) {
      this.selectedNhanVien = nhanVien;
      this.deleteModal.show();
    },
    viewDetails(nhanVien) {
      this.selectedNhanVien = nhanVien;
      this.detailsModal.show();
    },
    async saveNhanVien() {
      try {
        if (this.isEditing) {
          // Cập nhật nhân viên
          await axios.put(`http://127.0.0.1:8000/api/nhan-vien/${this.selectedNhanVien.id_nhan_vien}`, this.formData);

          // Cập nhật dữ liệu trong mảng
          const index = this.nhanViens.findIndex(nv => nv.id_nhan_vien === this.selectedNhanVien.id_nhan_vien);
          if (index !== -1) {
            this.nhanViens[index] = { ...this.nhanViens[index], ...this.formData };
          }
        } else {
          // Thêm nhân viên mới
          const response = await axios.post('http://127.0.0.1:8000/api/nhan-vien', this.formData);
          this.nhanViens.push(response.data);
        }

        this.nhanVienModal.hide();
        this.resetForm();
      } catch (error) {
        console.error('Error saving employee:', error);
        alert('Có lỗi xảy ra khi lưu thông tin nhân viên!');
      }
    },
    async confirmDelete() {
      try {
        await axios.delete(`http://127.0.0.1:8000/api/nhan-vien/${this.selectedNhanVien.id_nhan_vien}`);

        // Xóa nhân viên khỏi mảng
        this.nhanViens = this.nhanViens.filter(nv => nv.id_nhan_vien !== this.selectedNhanVien.id_nhan_vien);

        this.deleteModal.hide();
      } catch (error) {
        console.error('Error deleting employee:', error);
        alert('Có lỗi xảy ra khi xóa nhân viên!');
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