<template>
  <div class="container-fluid">
    <div class="row">
      <div class="col-12">
        <div class="card">
          <div class="card-header d-flex justify-content-between align-items-center">
            <h5 class="mb-0">Quản Lý Phòng Ban</h5>
            <button class="btn btn-primary" @click="showAddModal">
              <i class="bx bx-plus me-1"></i> Thêm Phòng Ban
            </button>
          </div>
          <div class="card-body">
            <!-- Bộ lọc -->
            <div class="row mb-3">
              <div class="col-md-4">
                <label class="form-label">Trạng Thái</label>
                <select class="form-select" v-model="filters.trangThai">
                  <option value="">Tất cả</option>
                  <option value="true">Hoạt động</option>
                  <option value="false">Không hoạt động</option>
                </select>
              </div>
              <div class="col-md-8">
                <label class="form-label">Tìm Kiếm</label>
                <input type="text" class="form-control" v-model="filters.search" placeholder="Tên phòng ban...">
              </div>
            </div>

            <!-- Bảng danh sách phòng ban -->
            <div class="table-responsive">
              <table class="table table-bordered table-hover">
                <thead class="table-light">
                  <tr>
                    <th>Mã Phòng Ban</th>
                    <th>Tên Phòng Ban</th>
                    <th>Trưởng Phòng</th>
                    <th>Số Điện Thoại</th>
                    <th>Số Nhân Viên</th>
                    <th>Trạng Thái</th>
                    <th>Thao Tác</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="phongBan in filteredPhongBans" :key="phongBan.id_phong_ban">
                    <td>{{ phongBan.id_phong_ban }}</td>
                    <td>{{ phongBan.ten_phong_ban }}</td>
                    <td>{{ getTruongPhongName(phongBan.id_truong_phong) }}</td>
                    <td>{{ phongBan.so_dien_thoai }}</td>
                    <td>{{ phongBan.so_nhan_vien || 0 }}</td>
                    <td>
                      <span :class="phongBan.trang_thai ? 'badge bg-success' : 'badge bg-danger'">
                        {{ phongBan.trang_thai ? 'Hoạt động' : 'Không hoạt động' }}
                      </span>
                    </td>
                    <td>
                      <div class="d-flex gap-2">
                        <button class="btn btn-sm btn-warning" @click="editPhongBan(phongBan)">
                          <i class="bx bx-edit"></i>
                        </button>
                        <button class="btn btn-sm btn-danger" @click="deletePhongBan(phongBan)">
                          <i class="bx bx-trash"></i>
                        </button>
                        <button class="btn btn-sm btn-info" @click="viewMembers(phongBan)">
                          <i class="bx bx-group"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                  <tr v-if="filteredPhongBans.length === 0">
                    <td colspan="7" class="text-center">Không có dữ liệu</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- Phân trang -->
            <div class="d-flex justify-content-between align-items-center mt-3">
              <div>
                Hiển thị {{ filteredPhongBans.length }} / {{ phongBans.length }} phòng ban
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

    <!-- Modal Thêm/Sửa Phòng Ban -->
    <div class="modal fade" id="phongBanModal" tabindex="-1" aria-hidden="true" ref="phongBanModal">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">{{ isEditing ? 'Cập Nhật Phòng Ban' : 'Thêm Phòng Ban Mới' }}</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="savePhongBan">
              <div class="mb-3">
                <label class="form-label">Tên Phòng Ban</label>
                <input type="text" class="form-control" v-model="formData.ten_phong_ban" required>
              </div>
              <div class="mb-3">
                <label class="form-label">Trưởng Phòng</label>
                <select class="form-select" v-model="formData.id_truong_phong">
                  <option value="">Chọn trưởng phòng</option>
                  <option v-for="nhanVien in nhanViens" :key="nhanVien.id_nhan_vien" :value="nhanVien.id_nhan_vien">
                    {{ nhanVien.ho_va_ten }}
                  </option>
                </select>
              </div>
              <div class="mb-3">
                <label class="form-label">Số Điện Thoại</label>
                <input type="text" class="form-control" v-model="formData.so_dien_thoai">
              </div>
              <div class="mb-3">
                <label class="form-label">Mô Tả</label>
                <textarea class="form-control" v-model="formData.mo_ta" rows="3"></textarea>
              </div>
              <div class="form-check form-switch mb-3">
                <input class="form-check-input" type="checkbox" id="trangThai" v-model="formData.trang_thai">
                <label class="form-check-label" for="trangThai">
                  {{ formData.trang_thai ? 'Hoạt động' : 'Không hoạt động' }}
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
          <div class="modal-body" v-if="selectedPhongBan">
            <p>Bạn có chắc chắn muốn xóa phòng ban <strong>{{ selectedPhongBan.ten_phong_ban }}</strong>?</p>
            <p class="text-danger">Hành động này không thể hoàn tác!</p>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Hủy</button>
            <button type="button" class="btn btn-danger" @click="confirmDelete">Xóa</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal Xem Thành Viên -->
    <div class="modal fade" id="membersModal" tabindex="-1" aria-hidden="true" ref="membersModal">
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" v-if="selectedPhongBan">Thành Viên Phòng Ban - {{ selectedPhongBan.ten_phong_ban }}
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
                    <th>Chức Vụ</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="nhanVien in phongBanMembers" :key="nhanVien.id_nhan_vien">
                    <td>{{ nhanVien.id_nhan_vien }}</td>
                    <td>{{ nhanVien.ho_va_ten }}</td>
                    <td>{{ nhanVien.email }}</td>
                    <td>{{ nhanVien.so_dien_thoai }}</td>
                    <td>{{ nhanVien.chuc_vu }}</td>
                  </tr>
                  <tr v-if="phongBanMembers.length === 0">
                    <td colspan="5" class="text-center">Không có thành viên nào trong phòng ban này</td>
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
  name: 'QuanLyPhongBan',
  data() {
    return {
      phongBans: [],
      nhanViens: [],
      phongBanMembers: [],
      selectedPhongBan: null,
      isEditing: false,
      formData: {
        ten_phong_ban: '',
        id_truong_phong: '',
        so_dien_thoai: '',
        mo_ta: '',
        trang_thai: true
      },
      filters: {
        trangThai: '',
        search: ''
      },
      currentPage: 1,
      itemsPerPage: 10,
      phongBanModal: null,
      deleteModal: null,
      membersModal: null
    };
  },
  computed: {
    filteredPhongBans() {
      let filtered = [...this.phongBans];

      if (this.filters.trangThai !== '') {
        const status = this.filters.trangThai === 'true';
        filtered = filtered.filter(pb => pb.trang_thai === status);
      }

      if (this.filters.search) {
        const searchTerm = this.filters.search.toLowerCase();
        filtered = filtered.filter(pb =>
          pb.ten_phong_ban.toLowerCase().includes(searchTerm) ||
          (pb.mo_ta && pb.mo_ta.toLowerCase().includes(searchTerm))
        );
      }

      // Phân trang
      const start = (this.currentPage - 1) * this.itemsPerPage;
      const end = start + this.itemsPerPage;
      return filtered.slice(start, end);
    },
    totalPages() {
      return Math.ceil(this.phongBans.length / this.itemsPerPage);
    }
  },
  mounted() {
    this.fetchData();
    this.initModals();
  },
  methods: {
    initModals() {
      this.phongBanModal = new Modal(this.$refs.phongBanModal);
      this.deleteModal = new Modal(this.$refs.deleteModal);
      this.membersModal = new Modal(this.$refs.membersModal);
    },
    async fetchData() {
      try {
        // Fetch phòng ban
        const phongBanResponse = await axios.get('http://127.0.0.1:8000/api/phong-ban');
        this.phongBans = phongBanResponse.data;

        // Fetch nhân viên
        const nhanVienResponse = await axios.get('http://127.0.0.1:8000/api/nhan-vien');
        this.nhanViens = nhanVienResponse.data;
      } catch (error) {
        console.error('Error fetching data:', error);

        // Dữ liệu mẫu nếu API không hoạt động
        this.nhanViens = [
          { id_nhan_vien: 1, ho_va_ten: 'Nguyễn Văn A', email: 'nguyenvana@example.com', so_dien_thoai: '0123456789', chuc_vu: 'Trưởng phòng' },
          { id_nhan_vien: 2, ho_va_ten: 'Trần Thị B', email: 'tranthib@example.com', so_dien_thoai: '0987654321', chuc_vu: 'Nhân viên' },
          { id_nhan_vien: 3, ho_va_ten: 'Lê Văn C', email: 'levanc@example.com', so_dien_thoai: '0369852147', chuc_vu: 'Trưởng phòng' }
        ];

        this.phongBans = [
          {
            id_phong_ban: 1,
            ten_phong_ban: 'Phòng Nhân sự',
            id_truong_phong: 1,
            so_dien_thoai: '0123456789',
            mo_ta: 'Phòng quản lý nhân sự công ty',
            trang_thai: true,
            so_nhan_vien: 5
          },
          {
            id_phong_ban: 2,
            ten_phong_ban: 'Phòng Kế toán',
            id_truong_phong: 3,
            so_dien_thoai: '0369852147',
            mo_ta: 'Phòng quản lý tài chính kế toán',
            trang_thai: true,
            so_nhan_vien: 3
          },
          {
            id_phong_ban: 3,
            ten_phong_ban: 'Phòng IT',
            id_truong_phong: null,
            so_dien_thoai: '0123789456',
            mo_ta: 'Phòng công nghệ thông tin',
            trang_thai: false,
            so_nhan_vien: 0
          }
        ];
      }
    },
    getTruongPhongName(id) {
      if (!id) return 'Chưa có trưởng phòng';
      const nhanVien = this.nhanViens.find(nv => nv.id_nhan_vien === id);
      return nhanVien ? nhanVien.ho_va_ten : 'Không xác định';
    },
    resetForm() {
      this.formData = {
        ten_phong_ban: '',
        id_truong_phong: '',
        so_dien_thoai: '',
        mo_ta: '',
        trang_thai: true
      };
    },
    showAddModal() {
      this.isEditing = false;
      this.resetForm();
      this.phongBanModal.show();
    },
    editPhongBan(phongBan) {
      this.isEditing = true;
      this.selectedPhongBan = phongBan;
      this.formData = { ...phongBan };
      this.phongBanModal.show();
    },
    deletePhongBan(phongBan) {
      this.selectedPhongBan = phongBan;
      this.deleteModal.show();
    },
    async viewMembers(phongBan) {
      this.selectedPhongBan = phongBan;

      try {
        // Lấy danh sách nhân viên của phòng ban
        const response = await axios.get(`http://127.0.0.1:8000/api/phong-ban/${phongBan.id_phong_ban}/nhan-vien`);
        this.phongBanMembers = response.data;
      } catch (error) {
        console.error('Error fetching department members:', error);

        // Dữ liệu mẫu nếu API không hoạt động
        if (phongBan.id_phong_ban === 1) {
          this.phongBanMembers = [
            { id_nhan_vien: 1, ho_va_ten: 'Nguyễn Văn A', email: 'nguyenvana@example.com', so_dien_thoai: '0123456789', chuc_vu: 'Trưởng phòng' },
            { id_nhan_vien: 4, ho_va_ten: 'Phạm Thị D', email: 'phamthid@example.com', so_dien_thoai: '0321654987', chuc_vu: 'Nhân viên' },
            { id_nhan_vien: 5, ho_va_ten: 'Hoàng Văn E', email: 'hoangvane@example.com', so_dien_thoai: '0789456123', chuc_vu: 'Nhân viên' }
          ];
        } else if (phongBan.id_phong_ban === 2) {
          this.phongBanMembers = [
            { id_nhan_vien: 3, ho_va_ten: 'Lê Văn C', email: 'levanc@example.com', so_dien_thoai: '0369852147', chuc_vu: 'Trưởng phòng' },
            { id_nhan_vien: 2, ho_va_ten: 'Trần Thị B', email: 'tranthib@example.com', so_dien_thoai: '0987654321', chuc_vu: 'Nhân viên' }
          ];
        } else {
          this.phongBanMembers = [];
        }
      }

      this.membersModal.show();
    },
    async savePhongBan() {
      try {
        if (this.isEditing) {
          // Cập nhật phòng ban
          await axios.put(`http://127.0.0.1:8000/api/phong-ban/${this.selectedPhongBan.id_phong_ban}`, this.formData);

          // Cập nhật dữ liệu trong mảng
          const index = this.phongBans.findIndex(pb => pb.id_phong_ban === this.selectedPhongBan.id_phong_ban);
          if (index !== -1) {
            this.phongBans[index] = { ...this.phongBans[index], ...this.formData };
          }
        } else {
          // Thêm phòng ban mới
          const response = await axios.post('http://127.0.0.1:8000/api/phong-ban', this.formData);
          this.phongBans.push(response.data);
        }

        this.phongBanModal.hide();
        this.resetForm();
      } catch (error) {
        console.error('Error saving department:', error);
        alert('Có lỗi xảy ra khi lưu thông tin phòng ban!');
      }
    },
    async confirmDelete() {
      try {
        await axios.delete(`http://127.0.0.1:8000/api/phong-ban/${this.selectedPhongBan.id_phong_ban}`);

        // Xóa phòng ban khỏi mảng
        this.phongBans = this.phongBans.filter(pb => pb.id_phong_ban !== this.selectedPhongBan.id_phong_ban);

        this.deleteModal.hide();
      } catch (error) {
        console.error('Error deleting department:', error);
        alert('Có lỗi xảy ra khi xóa phòng ban!');
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