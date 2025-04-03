<template>
  <div class="container-fluid">
    <div class="row">
      <div class="col-12">
        <div class="card">
          <div class="card-header d-flex justify-content-between align-items-center">
            <h5 class="mb-0">Quản Lý Chấm Công</h5>
            <button class="btn btn-primary" @click="showAddModal">
              <i class="bx bx-plus me-1"></i> Thêm Chấm Công
            </button>
          </div>
          <div class="card-body">
            <!-- Bộ lọc -->
            <div class="row mb-3">
              <div class="col-md-3">
                <label class="form-label">Nhân Viên</label>
                <select class="form-select" v-model="filters.nhanVien">
                  <option value="">Tất cả</option>
                  <option v-for="nv in nhanViens" :key="nv.id_nhan_vien" :value="nv.id_nhan_vien">
                    {{ nv.ho_va_ten }}
                  </option>
                </select>
              </div>
              <div class="col-md-3">
                <label class="form-label">Ca Làm</label>
                <select class="form-select" v-model="filters.caLam">
                  <option value="">Tất cả</option>
                  <option v-for="cl in caLams" :key="cl.id_ca_lam" :value="cl.id_ca_lam">
                    {{ cl.ten_ca_lam }}
                  </option>
                </select>
              </div>
              <div class="col-md-3">
                <label class="form-label">Từ Ngày</label>
                <input type="date" class="form-control" v-model="filters.tuNgay">
              </div>
              <div class="col-md-3">
                <label class="form-label">Đến Ngày</label>
                <input type="date" class="form-control" v-model="filters.denNgay">
              </div>
            </div>

            <!-- Bảng danh sách chấm công -->
            <div class="table-responsive">
              <table class="table table-bordered table-hover">
                <thead class="table-light">
                  <tr>
                    <th>Mã Chấm Công</th>
                    <th>Nhân Viên</th>
                    <th>Ca Làm</th>
                    <th>Ngày Chấm Công</th>
                    <th>Giờ Vào</th>
                    <th>Giờ Ra</th>
                    <th>Trạng Thái</th>
                    <th>Thao Tác</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="cc in filteredChamCongs" :key="cc.id_cham_cong">
                    <td>{{ cc.id_cham_cong }}</td>
                    <td>{{ getNhanVienName(cc.id_nhan_vien) }}</td>
                    <td>{{ getCaLamName(cc.id_ca_lam) }}</td>
                    <td>{{ formatDate(cc.ngay_cham_cong) }}</td>
                    <td>{{ formatTime(cc.gio_vao) }}</td>
                    <td>{{ formatTime(cc.gio_ra) }}</td>
                    <td>
                      <span :class="getTrangThaiClass(cc)">
                        {{ getTrangThaiText(cc) }}
                      </span>
                    </td>
                    <td>
                      <div class="d-flex gap-2">
                        <button class="btn btn-sm btn-warning" @click="editChamCong(cc)">
                          <i class="bx bx-edit"></i>
                        </button>
                        <button class="btn btn-sm btn-danger" @click="deleteChamCong(cc)">
                          <i class="bx bx-trash"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                  <tr v-if="filteredChamCongs.length === 0">
                    <td colspan="8" class="text-center">Không có dữ liệu</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- Phân trang -->
            <div class="d-flex justify-content-between align-items-center mt-3">
              <div>
                Hiển thị {{ filteredChamCongs.length }} / {{ chamCongs.length }} bản ghi
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

    <!-- Modal Thêm/Sửa Chấm Công -->
    <div class="modal fade" id="chamCongModal" tabindex="-1" aria-hidden="true" ref="chamCongModal">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">{{ isEditing ? 'Cập Nhật Chấm Công' : 'Thêm Chấm Công Mới' }}</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="saveChamCong">
              <div class="mb-3">
                <label class="form-label">Nhân Viên</label>
                <select class="form-select" v-model="formData.id_nhan_vien" required>
                  <option v-for="nv in nhanViens" :key="nv.id_nhan_vien" :value="nv.id_nhan_vien">
                    {{ nv.ho_va_ten }}
                  </option>
                </select>
              </div>
              <div class="mb-3">
                <label class="form-label">Ca Làm</label>
                <select class="form-select" v-model="formData.id_ca_lam" required>
                  <option v-for="cl in caLams" :key="cl.id_ca_lam" :value="cl.id_ca_lam">
                    {{ cl.ten_ca_lam }}
                  </option>
                </select>
              </div>
              <div class="mb-3">
                <label class="form-label">Ngày Chấm Công</label>
                <input type="date" class="form-control" v-model="formData.ngay_cham_cong" required>
              </div>
              <div class="mb-3">
                <label class="form-label">Giờ Vào</label>
                <input type="time" class="form-control" v-model="formData.gio_vao" required>
              </div>
              <div class="mb-3">
                <label class="form-label">Giờ Ra</label>
                <input type="time" class="form-control" v-model="formData.gio_ra">
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
          <div class="modal-body" v-if="selectedChamCong">
            <p>Bạn có chắc chắn muốn xóa bản ghi chấm công này?</p>
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
  name: 'QuanLyChamCong',
  data() {
    return {
      chamCongs: [],
      nhanViens: [],
      caLams: [],
      selectedChamCong: null,
      isEditing: false,
      formData: {
        id_nhan_vien: '',
        id_ca_lam: '',
        ngay_cham_cong: '',
        gio_vao: '',
        gio_ra: ''
      },
      filters: {
        nhanVien: '',
        caLam: '',
        tuNgay: '',
        denNgay: ''
      },
      currentPage: 1,
      itemsPerPage: 10,
      chamCongModal: null,
      deleteModal: null
    };
  },
  computed: {
    filteredChamCongs() {
      let filtered = [...this.chamCongs];

      if (this.filters.nhanVien) {
        filtered = filtered.filter(cc => cc.id_nhan_vien == this.filters.nhanVien);
      }

      if (this.filters.caLam) {
        filtered = filtered.filter(cc => cc.id_ca_lam == this.filters.caLam);
      }

      if (this.filters.tuNgay) {
        const tuNgay = new Date(this.filters.tuNgay);
        filtered = filtered.filter(cc => new Date(cc.ngay_cham_cong) >= tuNgay);
      }

      if (this.filters.denNgay) {
        const denNgay = new Date(this.filters.denNgay);
        filtered = filtered.filter(cc => new Date(cc.ngay_cham_cong) <= denNgay);
      }

      // Phân trang
      const start = (this.currentPage - 1) * this.itemsPerPage;
      const end = start + this.itemsPerPage;
      return filtered.slice(start, end);
    },
    totalPages() {
      return Math.ceil(this.chamCongs.length / this.itemsPerPage);
    }
  },
  mounted() {
    this.fetchData();
    this.initModals();
  },
  methods: {
    initModals() {
      this.chamCongModal = new Modal(this.$refs.chamCongModal);
      this.deleteModal = new Modal(this.$refs.deleteModal);
    },
    async fetchData() {
      try {
        // Fetch chấm công
        const chamCongResponse = await axios.get('http://127.0.0.1:8000/api/cham-cong');
        this.chamCongs = chamCongResponse.data;

        // Fetch nhân viên
        const nhanVienResponse = await axios.get('http://127.0.0.1:8000/api/nhan-vien');
        this.nhanViens = nhanVienResponse.data;

        // Fetch ca làm
        const caLamResponse = await axios.get('http://127.0.0.1:8000/api/ca-lam');
        this.caLams = caLamResponse.data;
      } catch (error) {
        console.error('Error fetching data:', error);

        // Dữ liệu mẫu nếu API không hoạt động
        this.nhanViens = [
          { id_nhan_vien: 1, ho_va_ten: 'Nguyễn Văn A' },
          { id_nhan_vien: 2, ho_va_ten: 'Trần Thị B' }
        ];

        this.caLams = [
          { id_ca_lam: 1, ten_ca_lam: 'Ca sáng', gio_bat_dau: '08:00:00', gio_ket_thuc: '12:00:00' },
          { id_ca_lam: 2, ten_ca_lam: 'Ca chiều', gio_bat_dau: '13:30:00', gio_ket_thuc: '17:30:00' }
        ];

        this.chamCongs = [
          {
            id_cham_cong: 1,
            id_nhan_vien: 1,
            id_ca_lam: 1,
            ngay_cham_cong: '2023-10-01',
            gio_vao: '08:05:00',
            gio_ra: '12:00:00'
          },
          {
            id_cham_cong: 2,
            id_nhan_vien: 2,
            id_ca_lam: 2,
            ngay_cham_cong: '2023-10-01',
            gio_vao: '13:35:00',
            gio_ra: '17:30:00'
          }
        ];
      }
    },
    getNhanVienName(id) {
      const nhanVien = this.nhanViens.find(nv => nv.id_nhan_vien === id);
      return nhanVien ? nhanVien.ho_va_ten : 'Không xác định';
    },
    getCaLamName(id) {
      const caLam = this.caLams.find(cl => cl.id_ca_lam === id);
      return caLam ? caLam.ten_ca_lam : 'Không xác định';
    },
    formatDate(dateString) {
      if (!dateString) return '';
      const date = new Date(dateString);
      return date.toLocaleDateString('vi-VN');
    },
    formatTime(timeString) {
      if (!timeString) return '';
      return timeString.substring(0, 5); // Lấy chỉ giờ và phút (HH:MM)
    },
    getTrangThaiClass(chamCong) {
      if (!chamCong.gio_ra) return 'badge bg-warning';

      const caLam = this.caLams.find(cl => cl.id_ca_lam === chamCong.id_ca_lam);
      if (!caLam) return 'badge bg-secondary';

      const gioVao = new Date(`2000-01-01T${chamCong.gio_vao}`);
      const gioBatDau = new Date(`2000-01-01T${caLam.gio_bat_dau}`);

      // Nếu đi muộn
      if (gioVao > gioBatDau) {
        return 'badge bg-danger';
      }

      return 'badge bg-success';
    },
    getTrangThaiText(chamCong) {
      if (!chamCong.gio_ra) return 'Đang làm việc';

      const caLam = this.caLams.find(cl => cl.id_ca_lam === chamCong.id_ca_lam);
      if (!caLam) return 'Không xác định';

      const gioVao = new Date(`2000-01-01T${chamCong.gio_vao}`);
      const gioBatDau = new Date(`2000-01-01T${caLam.gio_bat_dau}`);

      // Nếu đi muộn
      if (gioVao > gioBatDau) {
        return 'Đi muộn';
      }

      return 'Đúng giờ';
    },
    resetForm() {
      this.formData = {
        id_nhan_vien: '',
        id_ca_lam: '',
        ngay_cham_cong: '',
        gio_vao: '',
        gio_ra: ''
      };
    },
    showAddModal() {
      this.isEditing = false;
      this.resetForm();
      this.chamCongModal.show();
    },
    editChamCong(chamCong) {
      this.isEditing = true;
      this.selectedChamCong = chamCong;
      this.formData = { ...chamCong };
      this.chamCongModal.show();
    },
    deleteChamCong(chamCong) {
      this.selectedChamCong = chamCong;
      this.deleteModal.show();
    },
    async saveChamCong() {
      try {
        if (this.isEditing) {
          // Cập nhật chấm công
          await axios.put(`http://127.0.0.1:8000/api/cham-cong/${this.selectedChamCong.id_cham_cong}`, this.formData);

          // Cập nhật dữ liệu trong mảng
          const index = this.chamCongs.findIndex(cc => cc.id_cham_cong === this.selectedChamCong.id_cham_cong);
          if (index !== -1) {
            this.chamCongs[index] = { ...this.formData, id_cham_cong: this.selectedChamCong.id_cham_cong };
          }
        } else {
          // Thêm chấm công mới
          const response = await axios.post('http://127.0.0.1:8000/api/cham-cong', this.formData);
          this.chamCongs.push(response.data);
        }

        this.chamCongModal.hide();
        this.resetForm();
      } catch (error) {
        console.error('Error saving attendance:', error);
        alert('Có lỗi xảy ra khi lưu thông tin chấm công!');
      }
    },
    async confirmDelete() {
      try {
        await axios.delete(`http://127.0.0.1:8000/api/cham-cong/${this.selectedChamCong.id_cham_cong}`);

        // Xóa chấm công khỏi mảng
        this.chamCongs = this.chamCongs.filter(cc => cc.id_cham_cong !== this.selectedChamCong.id_cham_cong);

        this.deleteModal.hide();
      } catch (error) {
        console.error('Error deleting attendance:', error);
        alert('Có lỗi xảy ra khi xóa chấm công!');
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