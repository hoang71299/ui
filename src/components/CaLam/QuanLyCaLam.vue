<template>
  <div class="container-fluid">
    <div class="row">
      <div class="col-12">
        <div class="card">
          <div class="card-header d-flex justify-content-between align-items-center">
            <h5 class="mb-0">Quản Lý Ca Làm</h5>
            <button class="btn btn-primary" @click="showAddModal">
              <i class="bx bx-plus me-1"></i> Thêm Ca Làm
            </button>
          </div>
          <div class="card-body">
            <!-- Bộ lọc -->
            <div class="row mb-3">
              <div class="col-md-6">
                <label class="form-label">Trạng Thái</label>
                <select class="form-select" v-model="filters.trangThai">
                  <option value="">Tất cả</option>
                  <option value="true">Hoạt động</option>
                  <option value="false">Không hoạt động</option>
                </select>
              </div>
              <div class="col-md-6">
                <label class="form-label">Tìm Kiếm</label>
                <input type="text" class="form-control" v-model="filters.search" placeholder="Tên ca làm...">
              </div>
            </div>

            <!-- Bảng danh sách ca làm -->
            <div class="table-responsive">
              <table class="table table-bordered table-hover">
                <thead class="table-light">
                  <tr>
                    <th>Mã Ca Làm</th>
                    <th>Tên Ca Làm</th>
                    <th>Giờ Bắt Đầu</th>
                    <th>Giờ Kết Thúc</th>
                    <th>Mô Tả</th>
                    <th>Trạng Thái</th>
                    <th>Thao Tác</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="cl in filteredCaLams" :key="cl.id_ca_lam">
                    <td>{{ cl.id_ca_lam }}</td>
                    <td>{{ cl.ten_ca_lam }}</td>
                    <td>{{ formatTime(cl.gio_bat_dau) }}</td>
                    <td>{{ formatTime(cl.gio_ket_thuc) }}</td>
                    <td>{{ cl.mo_ta }}</td>
                    <td>
                      <span :class="cl.trang_thai ? 'badge bg-success' : 'badge bg-danger'">
                        {{ cl.trang_thai ? 'Hoạt động' : 'Không hoạt động' }}
                      </span>
                    </td>
                    <td>
                      <div class="d-flex gap-2">
                        <button class="btn btn-sm btn-warning" @click="editCaLam(cl)">
                          <i class="bx bx-edit"></i>
                        </button>
                        <button class="btn btn-sm btn-danger" @click="deleteCaLam(cl)">
                          <i class="bx bx-trash"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                  <tr v-if="filteredCaLams.length === 0">
                    <td colspan="7" class="text-center">Không có dữ liệu</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- Phân trang -->
            <div class="d-flex justify-content-between align-items-center mt-3">
              <div>
                Hiển thị {{ filteredCaLams.length }} / {{ caLams.length }} ca làm
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

    <!-- Modal Thêm/Sửa Ca Làm -->
    <div class="modal fade" id="caLamModal" tabindex="-1" aria-hidden="true" ref="caLamModal">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">{{ isEditing ? 'Cập Nhật Ca Làm' : 'Thêm Ca Làm Mới' }}</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="saveCaLam">
              <div class="mb-3">
                <label class="form-label">Tên Ca Làm</label>
                <input type="text" class="form-control" v-model="formData.ten_ca_lam" required>
              </div>
              <div class="mb-3">
                <label class="form-label">Giờ Bắt Đầu</label>
                <input type="time" class="form-control" v-model="formData.gio_bat_dau" required>
              </div>
              <div class="mb-3">
                <label class="form-label">Giờ Kết Thúc</label>
                <input type="time" class="form-control" v-model="formData.gio_ket_thuc" required>
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
          <div class="modal-body" v-if="selectedCaLam">
            <p>Bạn có chắc chắn muốn xóa ca làm <strong>{{ selectedCaLam.ten_ca_lam }}</strong>?</p>
            <p class="text-danger">Hành động này không thể hoàn tác!</p>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Hủy</button>
            <button type="button" class="btn btn-danger" @click="confirmDelete">Xóa</button>
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
  name: 'QuanLyCaLam',
  data() {
    return {
      caLams: [],
      selectedCaLam: null,
      isEditing: false,
      formData: {
        ten_ca_lam: '',
        gio_bat_dau: '',
        gio_ket_thuc: '',
        mo_ta: '',
        trang_thai: true
      },
      filters: {
        trangThai: '',
        search: ''
      },
      currentPage: 1,
      itemsPerPage: 10,
      caLamModal: null,
      deleteModal: null
    };
  },
  computed: {
    filteredCaLams() {
      let filtered = [...this.caLams];

      if (this.filters.trangThai !== '') {
        const status = this.filters.trangThai === 'true';
        filtered = filtered.filter(cl => cl.trang_thai === status);
      }

      if (this.filters.search) {
        const searchTerm = this.filters.search.toLowerCase();
        filtered = filtered.filter(cl =>
          cl.ten_ca_lam.toLowerCase().includes(searchTerm) ||
          (cl.mo_ta && cl.mo_ta.toLowerCase().includes(searchTerm))
        );
      }

      // Phân trang
      const start = (this.currentPage - 1) * this.itemsPerPage;
      const end = start + this.itemsPerPage;
      return filtered.slice(start, end);
    },
    totalPages() {
      return Math.ceil(this.caLams.length / this.itemsPerPage);
    }
  },
  mounted() {
    this.fetchData();
    this.initModals();
  },
  methods: {
    initModals() {
      this.caLamModal = new Modal(this.$refs.caLamModal);
      this.deleteModal = new Modal(this.$refs.deleteModal);
    },
    async fetchData() {
      try {
        const response = await axios.get('http://127.0.0.1:8000/api/ca-lam');
        this.caLams = response.data;
      } catch (error) {
        console.error('Error fetching shifts:', error);

        // Dữ liệu mẫu nếu API không hoạt động
        this.caLams = [
          {
            id_ca_lam: 1,
            ten_ca_lam: 'Ca sáng',
            gio_bat_dau: '08:00:00',
            gio_ket_thuc: '12:00:00',
            mo_ta: 'Ca làm việc buổi sáng',
            trang_thai: true
          },
          {
            id_ca_lam: 2,
            ten_ca_lam: 'Ca chiều',
            gio_bat_dau: '13:30:00',
            gio_ket_thuc: '17:30:00',
            mo_ta: 'Ca làm việc buổi chiều',
            trang_thai: true
          },
          {
            id_ca_lam: 3,
            ten_ca_lam: 'Ca tối',
            gio_bat_dau: '18:00:00',
            gio_ket_thuc: '22:00:00',
            mo_ta: 'Ca làm việc buổi tối',
            trang_thai: false
          }
        ];
      }
    },
    formatTime(timeString) {
      if (!timeString) return '';
      return timeString.substring(0, 5); // Lấy chỉ giờ và phút (HH:MM)
    },
    resetForm() {
      this.formData = {
        ten_ca_lam: '',
        gio_bat_dau: '',
        gio_ket_thuc: '',
        mo_ta: '',
        trang_thai: true
      };
    },
    showAddModal() {
      this.isEditing = false;
      this.resetForm();
      this.caLamModal.show();
    },
    editCaLam(caLam) {
      this.isEditing = true;
      this.selectedCaLam = caLam;
      this.formData = { ...caLam };
      this.caLamModal.show();
    },
    deleteCaLam(caLam) {
      this.selectedCaLam = caLam;
      this.deleteModal.show();
    },
    async saveCaLam() {
      try {
        if (this.isEditing) {
          // Cập nhật ca làm
          await axios.put(`http://127.0.0.1:8000/api/ca-lam/${this.selectedCaLam.id_ca_lam}`, this.formData);

          // Cập nhật dữ liệu trong mảng
          const index = this.caLams.findIndex(cl => cl.id_ca_lam === this.selectedCaLam.id_ca_lam);
          if (index !== -1) {
            this.caLams[index] = { ...this.formData, id_ca_lam: this.selectedCaLam.id_ca_lam };
          }
        } else {
          // Thêm ca làm mới
          const response = await axios.post('http://127.0.0.1:8000/api/ca-lam', this.formData);
          this.caLams.push(response.data);
        }

        this.caLamModal.hide();
        this.resetForm();
      } catch (error) {
        console.error('Error saving shift:', error);
        alert('Có lỗi xảy ra khi lưu thông tin ca làm!');
      }
    },
    async confirmDelete() {
      try {
        await axios.delete(`http://127.0.0.1:8000/api/ca-lam/${this.selectedCaLam.id_ca_lam}`);

        // Xóa ca làm khỏi mảng
        this.caLams = this.caLams.filter(cl => cl.id_ca_lam !== this.selectedCaLam.id_ca_lam);

        this.deleteModal.hide();
      } catch (error) {
        console.error('Error deleting shift:', error);
        alert('Có lỗi xảy ra khi xóa ca làm!');
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