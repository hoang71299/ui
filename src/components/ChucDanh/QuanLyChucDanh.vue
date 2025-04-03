<template>
  <div class="container-fluid">
    <div class="row">
      <div class="col-12">
        <div class="card">
          <div class="card-header d-flex justify-content-between align-items-center">
            <h5 class="mb-0">Quản Lý Chức Danh</h5>
            <button class="btn btn-primary" @click="showAddModal">
              <i class="bx bx-plus me-1"></i> Thêm Chức Danh
            </button>
          </div>
          <div class="card-body">
            <!-- Bộ lọc -->
            <div class="row mb-3">
              <div class="col-md-4">
                <label class="form-label">Trạng Thái</label>
                <select class="form-select" v-model="filters.trangThai">
                  <option value="">Tất cả</option>
                  <option value="true">Đang sử dụng</option>
                  <option value="false">Không sử dụng</option>
                </select>
              </div>
              <div class="col-md-8">
                <label class="form-label">Tìm Kiếm</label>
                <input type="text" class="form-control" v-model="filters.search" placeholder="Tên chức danh...">
              </div>
            </div>

            <!-- Bảng danh sách chức danh -->
            <div class="table-responsive">
              <table class="table table-bordered table-hover">
                <thead class="table-light">
                  <tr>
                    <th>Mã CD</th>
                    <th>Tên Chức Danh</th>
                    <th>Mô Tả</th>
                    <th>Số Nhân Viên</th>
                    <th>Trạng Thái</th>
                    <th>Thao Tác</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="chucDanh in filteredChucDanhs" :key="chucDanh.id_chuc_danh">
                    <td>{{ chucDanh.id_chuc_danh }}</td>
                    <td>{{ chucDanh.ten_chuc_danh }}</td>
                    <td>{{ chucDanh.mo_ta }}</td>
                    <td>{{ chucDanh.so_nhan_vien || 0 }}</td>
                    <td>
                      <span :class="chucDanh.trang_thai ? 'badge bg-success' : 'badge bg-danger'">
                        {{ chucDanh.trang_thai ? 'Đang sử dụng' : 'Không sử dụng' }}
                      </span>
                    </td>
                    <td>
                      <div class="d-flex gap-2">
                        <button class="btn btn-sm btn-warning" @click="editChucDanh(chucDanh)">
                          <i class="bx bx-edit"></i>
                        </button>
                        <button class="btn btn-sm btn-danger" @click="deleteChucDanh(chucDanh)"
                          :disabled="chucDanh.so_nhan_vien > 0">
                          <i class="bx bx-trash"></i>
                        </button>
                        <button class="btn btn-sm btn-info" @click="viewMembers(chucDanh)">
                          <i class="bx bx-group"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                  <tr v-if="filteredChucDanhs.length === 0">
                    <td colspan="6" class="text-center">Không có dữ liệu</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- Phân trang -->
            <div class="d-flex justify-content-between align-items-center mt-3">
              <div>
                Hiển thị {{ filteredChucDanhs.length }} / {{ chucDanhs.length }} chức danh
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

    <!-- Modal Thêm/Sửa Chức Danh -->
    <div class="modal fade" id="chucDanhModal" tabindex="-1" aria-hidden="true" ref="chucDanhModal">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">{{ isEditing ? 'Cập Nhật Chức Danh' : 'Thêm Chức Danh Mới' }}</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="saveChucDanh">
              <div class="mb-3">
                <label class="form-label">Tên Chức Danh</label>
                <input type="text" class="form-control" v-model="formData.ten_chuc_danh" required>
              </div>
              <div class="mb-3">
                <label class="form-label">Mô Tả</label>
                <textarea class="form-control" v-model="formData.mo_ta" rows="3"></textarea>
              </div>
              <div class="form-check form-switch mb-3">
                <input class="form-check-input" type="checkbox" id="trangThai" v-model="formData.trang_thai">
                <label class="form-check-label" for="trangThai">
                  {{ formData.trang_thai ? 'Đang sử dụng' : 'Không sử dụng' }}
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
          <div class="modal-body" v-if="selectedChucDanh">
            <p>Bạn có chắc chắn muốn xóa chức danh <strong>{{ selectedChucDanh.ten_chuc_danh }}</strong>?</p>
            <p class="text-danger">Hành động này không thể hoàn tác!</p>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Hủy</button>
            <button type="button" class="btn btn-danger" @click="confirmDelete">Xóa</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal Danh Sách Nhân Viên -->
    <div class="modal fade" id="membersModal" tabindex="-1" aria-hidden="true" ref="membersModal">
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" v-if="selectedChucDanh">Nhân Viên Chức Danh: {{ selectedChucDanh.ten_chuc_danh }}
            </h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <div class="table-responsive">
              <table class="table table-bordered table-hover">
                <thead class="table-light">
                  <tr>
                    <th>Mã NV</th>
                    <th>Họ Tên</th>
                    <th>Email</th>
                    <th>Số Điện Thoại</th>
                    <th>Phòng Ban</th>
                    <th>Trạng Thái</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="nhanVien in chucDanhMembers" :key="nhanVien.id_nhan_vien">
                    <td>{{ nhanVien.id_nhan_vien }}</td>
                    <td>{{ nhanVien.ho_va_ten }}</td>
                    <td>{{ nhanVien.email }}</td>
                    <td>{{ nhanVien.so_dien_thoai }}</td>
                    <td>{{ getPhongBanName(nhanVien.id_phong_ban) }}</td>
                    <td>
                      <span :class="nhanVien.trang_thai ? 'badge bg-success' : 'badge bg-danger'">
                        {{ nhanVien.trang_thai ? 'Đang làm việc' : 'Đã nghỉ việc' }}
                      </span>
                    </td>
                  </tr>
                  <tr v-if="chucDanhMembers.length === 0">
                    <td colspan="6" class="text-center">Không có nhân viên nào có chức danh này</td>
                  </tr>
                </tbody>
              </table>
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
  name: 'QuanLyChucDanh',
  data() {
    return {
      chucDanhs: [],
      nhanViens: [],
      phongBans: [],
      selectedChucDanh: null,
      chucDanhMembers: [],
      isEditing: false,
      formData: {
        ten_chuc_danh: '',
        mo_ta: '',
        trang_thai: true
      },
      filters: {
        trangThai: '',
        search: ''
      },
      currentPage: 1,
      itemsPerPage: 10,
      chucDanhModal: null,
      deleteModal: null,
      membersModal: null
    };
  },
  computed: {
    filteredChucDanhs() {
      let filtered = [...this.chucDanhs];

      if (this.filters.trangThai !== '') {
        const status = this.filters.trangThai === 'true';
        filtered = filtered.filter(cd => cd.trang_thai === status);
      }

      if (this.filters.search) {
        const searchTerm = this.filters.search.toLowerCase();
        filtered = filtered.filter(cd =>
          cd.ten_chuc_danh.toLowerCase().includes(searchTerm) ||
          (cd.mo_ta && cd.mo_ta.toLowerCase().includes(searchTerm))
        );
      }

      // Phân trang
      const start = (this.currentPage - 1) * this.itemsPerPage;
      const end = start + this.itemsPerPage;
      return filtered.slice(start, end);
    },
    totalPages() {
      return Math.ceil(this.chucDanhs.length / this.itemsPerPage);
    }
  },
  mounted() {
    this.fetchData();
    this.initModals();
  },
  methods: {
    initModals() {
      this.chucDanhModal = new Modal(this.$refs.chucDanhModal);
      this.deleteModal = new Modal(this.$refs.deleteModal);
      this.membersModal = new Modal(this.$refs.membersModal);
    },
    async fetchData() {
      try {
        // Fetch chức danh
        const chucDanhResponse = await axios.get('http://127.0.0.1:8000/api/chuc-danh');
        this.chucDanhs = chucDanhResponse.data;

        // Fetch nhân viên
        const nhanVienResponse = await axios.get('http://127.0.0.1:8000/api/nhan-vien');
        this.nhanViens = nhanVienResponse.data;

        // Fetch phòng ban
        const phongBanResponse = await axios.get('http://127.0.0.1:8000/api/phong-ban');
        this.phongBans = phongBanResponse.data;

        // Cập nhật số nhân viên cho mỗi chức danh
        this.updateNhanVienCount();
      } catch (error) {
        console.error('Error fetching data:', error);

        // Dữ liệu mẫu nếu API không hoạt động
        this.chucDanhs = [
          { id_chuc_danh: 1, ten_chuc_danh: 'Giám đốc', mo_ta: 'Quản lý cấp cao nhất', trang_thai: true },
          { id_chuc_danh: 2, ten_chuc_danh: 'Trưởng phòng', mo_ta: 'Quản lý cấp trung', trang_thai: true },
          { id_chuc_danh: 3, ten_chuc_danh: 'Nhân viên', mo_ta: 'Nhân viên thông thường', trang_thai: true },
          { id_chuc_danh: 4, ten_chuc_danh: 'Thực tập sinh', mo_ta: 'Nhân viên thử việc', trang_thai: false }
        ];

        this.nhanViens = [
          {
            id_nhan_vien: 1,
            ho_va_ten: 'Nguyễn Văn A',
            email: 'nguyenvana@example.com',
            so_dien_thoai: '0123456789',
            id_phong_ban: 1,
            id_chuc_danh: 1,
            trang_thai: true
          },
          {
            id_nhan_vien: 2,
            ho_va_ten: 'Trần Thị B',
            email: 'tranthib@example.com',
            so_dien_thoai: '0987654321',
            id_phong_ban: 2,
            id_chuc_danh: 2,
            trang_thai: true
          },
          {
            id_nhan_vien: 3,
            ho_va_ten: 'Lê Văn C',
            email: 'levanc@example.com',
            so_dien_thoai: '0369852147',
            id_phong_ban: 2,
            id_chuc_danh: 3,
            trang_thai: true
          }
        ];

        this.phongBans = [
          { id_phong_ban: 1, ten_phong_ban: 'Phòng Nhân sự' },
          { id_phong_ban: 2, ten_phong_ban: 'Phòng Kế toán' },
          { id_phong_ban: 3, ten_phong_ban: 'Phòng IT' }
        ];

        this.updateNhanVienCount();
      }
    },
    updateNhanVienCount() {
      // Cập nhật số nhân viên cho mỗi chức danh
      this.chucDanhs.forEach(cd => {
        cd.so_nhan_vien = this.nhanViens.filter(nv => nv.id_chuc_danh === cd.id_chuc_danh).length;
      });
    },
    getPhongBanName(id) {
      const phongBan = this.phongBans.find(pb => pb.id_phong_ban === id);
      return phongBan ? phongBan.ten_phong_ban : 'Không xác định';
    },
    resetForm() {
      this.formData = {
        ten_chuc_danh: '',
        mo_ta: '',
        trang_thai: true
      };
    },
    showAddModal() {
      this.isEditing = false;
      this.resetForm();
      this.chucDanhModal.show();
    },
    editChucDanh(chucDanh) {
      this.isEditing = true;
      this.selectedChucDanh = chucDanh;
      this.formData = { ...chucDanh };
      this.chucDanhModal.show();
    },
    deleteChucDanh(chucDanh) {
      if (chucDanh.so_nhan_vien > 0) {
        alert('Không thể xóa chức danh đang có nhân viên!');
        return;
      }
      this.selectedChucDanh = chucDanh;
      this.deleteModal.show();
    },
    async viewMembers(chucDanh) {
      this.selectedChucDanh = chucDanh;

      try {
        // Lấy danh sách nhân viên của chức danh
        const response = await axios.get(`http://127.0.0.1:8000/api/chuc-danh/${chucDanh.id_chuc_danh}/nhan-vien`);
        this.chucDanhMembers = response.data;
      } catch (error) {
        console.error('Error fetching position members:', error);

        // Dữ liệu mẫu nếu API không hoạt động
        this.chucDanhMembers = this.nhanViens.filter(nv => nv.id_chuc_danh === chucDanh.id_chuc_danh);
      }

      this.membersModal.show();
    },
    async saveChucDanh() {
      try {
        if (this.isEditing) {
          // Cập nhật chức danh
          await axios.put(`http://127.0.0.1:8000/api/chuc-danh/${this.selectedChucDanh.id_chuc_danh}`, this.formData);

          // Cập nhật dữ liệu trong mảng
          const index = this.chucDanhs.findIndex(cd => cd.id_chuc_danh === this.selectedChucDanh.id_chuc_danh);
          if (index !== -1) {
            this.chucDanhs[index] = { ...this.chucDanhs[index], ...this.formData };
          }
        } else {
          // Thêm chức danh mới
          const response = await axios.post('http://127.0.0.1:8000/api/chuc-danh', this.formData);
          this.chucDanhs.push(response.data);
        }

        this.chucDanhModal.hide();
        this.resetForm();
      } catch (error) {
        console.error('Error saving position:', error);
        alert('Có lỗi xảy ra khi lưu thông tin chức danh!');
      }
    },
    async confirmDelete() {
      try {
        await axios.delete(`http://127.0.0.1:8000/api/chuc-danh/${this.selectedChucDanh.id_chuc_danh}`);

        // Xóa chức danh khỏi mảng
        this.chucDanhs = this.chucDanhs.filter(cd => cd.id_chuc_danh !== this.selectedChucDanh.id_chuc_danh);

        this.deleteModal.hide();
      } catch (error) {
        console.error('Error deleting position:', error);
        alert('Có lỗi xảy ra khi xóa chức danh!');
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