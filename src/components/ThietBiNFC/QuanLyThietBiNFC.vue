<template>
  <div class="container-fluid">
    <div class="row">
      <div class="col-12">
        <div class="card">
          <div class="card-header d-flex justify-content-between align-items-center">
            <h5 class="mb-0">Quản Lý Thiết Bị NFC</h5>
            <button class="btn btn-primary" @click="showAddModal">
              <i class="bx bx-plus me-1"></i> Thêm Thiết Bị
            </button>
          </div>
          <div class="card-body">
            <!-- Bộ lọc -->
            <div class="row mb-3">
              <div class="col-md-3">
                <label class="form-label">Trạng Thái</label>
                <select class="form-select" v-model="filters.trangThai">
                  <option value="">Tất cả</option>
                  <option value="active">Đang hoạt động</option>
                  <option value="inactive">Không hoạt động</option>
                  <option value="maintenance">Bảo trì</option>
                </select>
              </div>
              <div class="col-md-3">
                <label class="form-label">Vị Trí</label>
                <select class="form-select" v-model="filters.viTri">
                  <option value="">Tất cả</option>
                  <option v-for="viTri in viTriList" :key="viTri" :value="viTri">
                    {{ viTri }}
                  </option>
                </select>
              </div>
              <div class="col-md-6">
                <label class="form-label">Tìm Kiếm</label>
                <div class="input-group">
                  <input type="text" class="form-control" placeholder="Tìm theo tên, địa chỉ IP, MAC..."
                    v-model="filters.search">
                  <button class="btn btn-outline-primary" type="button">
                    <i class="bx bx-search"></i>
                  </button>
                </div>
              </div>
            </div>

            <!-- Bảng dữ liệu -->
            <div class="table-responsive">
              <table class="table table-bordered table-hover">
                <thead class="table-light">
                  <tr>
                    <th>ID</th>
                    <th>Tên Thiết Bị</th>
                    <th>Vị Trí Đặt</th>
                    <th>Địa Chỉ IP</th>
                    <th>Địa Chỉ MAC</th>
                    <th>Trạng Thái</th>
                    <th>Ngày Lắp Đặt</th>
                    <th>Đồng Bộ Cuối</th>
                    <th>Thao Tác</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="thietBi in filteredThietBis" :key="thietBi.id_thiet_bi">
                    <td>{{ thietBi.id_thiet_bi }}</td>
                    <td>{{ thietBi.ten_thiet_bi }}</td>
                    <td>{{ thietBi.vi_tri_dat }}</td>
                    <td>{{ thietBi.dia_chi_ip }}</td>
                    <td>{{ thietBi.dia_chi_mac }}</td>
                    <td>
                      <span :class="getTrangThaiClass(thietBi.trang_thai)">
                        {{ getTrangThaiText(thietBi.trang_thai) }}
                      </span>
                    </td>
                    <td>{{ formatDate(thietBi.ngay_lap_dat) }}</td>
                    <td>{{ formatDateTime(thietBi.thoi_gian_dong_bo_cuoi) }}</td>
                    <td>
                      <div class="d-flex gap-2">
                        <button class="btn btn-sm btn-warning" @click="editThietBi(thietBi)">
                          <i class="bx bx-edit"></i>
                        </button>
                        <button class="btn btn-sm btn-danger" @click="deleteThietBi(thietBi)">
                          <i class="bx bx-trash"></i>
                        </button>
                        <button class="btn btn-sm btn-info" @click="syncThietBi(thietBi)">
                          <i class="bx bx-sync"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                  <tr v-if="filteredThietBis.length === 0">
                    <td colspan="9" class="text-center">Không có dữ liệu</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- Phân trang -->
            <div class="d-flex justify-content-between align-items-center mt-3">
              <div>
                Hiển thị {{ filteredThietBis.length }} / {{ thietBis.length }} thiết bị
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

    <!-- Modal Thêm/Sửa Thiết Bị -->
    <div class="modal fade" id="thietBiModal" tabindex="-1" aria-hidden="true" ref="thietBiModal">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">{{ isEditing ? 'Cập Nhật Thiết Bị' : 'Thêm Thiết Bị Mới' }}</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="saveThietBi">
              <div class="mb-3">
                <label class="form-label">Tên Thiết Bị</label>
                <input type="text" class="form-control" v-model="formData.ten_thiet_bi" required>
              </div>
              <div class="mb-3">
                <label class="form-label">Vị Trí Đặt</label>
                <input type="text" class="form-control" v-model="formData.vi_tri_dat" required>
              </div>
              <div class="row">
                <div class="col-md-6 mb-3">
                  <label class="form-label">Địa Chỉ IP</label>
                  <input type="text" class="form-control" v-model="formData.dia_chi_ip"
                    pattern="^((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$"
                    title="Nhập địa chỉ IP hợp lệ (vd: 192.168.1.1)" required>
                </div>
                <div class="col-md-6 mb-3">
                  <label class="form-label">Địa Chỉ MAC</label>
                  <input type="text" class="form-control" v-model="formData.dia_chi_mac"
                    pattern="^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$"
                    title="Nhập địa chỉ MAC hợp lệ (vd: 00:1A:2B:3C:4D:5E)" required>
                </div>
              </div>
              <div class="row">
                <div class="col-md-6 mb-3">
                  <label class="form-label">Trạng Thái</label>
                  <select class="form-select" v-model="formData.trang_thai" required>
                    <option value="active">Đang hoạt động</option>
                    <option value="inactive">Không hoạt động</option>
                    <option value="maintenance">Bảo trì</option>
                  </select>
                </div>
                <div class="col-md-6 mb-3">
                  <label class="form-label">Ngày Lắp Đặt</label>
                  <input type="date" class="form-control" v-model="formData.ngay_lap_dat" required>
                </div>
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
          <div class="modal-body" v-if="selectedThietBi">
            <p>Bạn có chắc chắn muốn xóa thiết bị <strong>{{ selectedThietBi.ten_thiet_bi }}</strong>?</p>
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
  name: 'QuanLyThietBiNFC',
  data() {
    return {
      thietBis: [],
      selectedThietBi: null,
      isEditing: false,
      formData: {
        ten_thiet_bi: '',
        vi_tri_dat: '',
        dia_chi_ip: '',
        dia_chi_mac: '',
        trang_thai: 'active',
        ngay_lap_dat: new Date().toISOString().split('T')[0],
        thoi_gian_dong_bo_cuoi: null
      },
      filters: {
        trangThai: '',
        viTri: '',
        search: ''
      },
      currentPage: 1,
      itemsPerPage: 10,
      thietBiModal: null,
      deleteModal: null
    };
  },
  computed: {
    viTriList() {
      // Lấy danh sách vị trí duy nhất
      const viTriSet = new Set();
      this.thietBis.forEach(tb => {
        if (tb.vi_tri_dat) {
          viTriSet.add(tb.vi_tri_dat);
        }
      });
      return Array.from(viTriSet).sort();
    },
    filteredThietBis() {
      let filtered = [...this.thietBis];

      if (this.filters.trangThai !== '') {
        filtered = filtered.filter(tb => tb.trang_thai === this.filters.trangThai);
      }

      if (this.filters.viTri !== '') {
        filtered = filtered.filter(tb => tb.vi_tri_dat === this.filters.viTri);
      }

      if (this.filters.search) {
        const searchTerm = this.filters.search.toLowerCase();
        filtered = filtered.filter(tb =>
          tb.ten_thiet_bi.toLowerCase().includes(searchTerm) ||
          tb.dia_chi_ip.toLowerCase().includes(searchTerm) ||
          tb.dia_chi_mac.toLowerCase().includes(searchTerm) ||
          tb.vi_tri_dat.toLowerCase().includes(searchTerm)
        );
      }

      // Phân trang
      const start = (this.currentPage - 1) * this.itemsPerPage;
      const end = start + this.itemsPerPage;
      return filtered.slice(start, end);
    },
    totalPages() {
      return Math.ceil(this.thietBis.length / this.itemsPerPage);
    }
  },
  mounted() {
    this.fetchData();
    this.$nextTick(() => {
      this.initModals();
    });
  },
  methods: {
    initModals() {
      this.thietBiModal = new Modal(this.$refs.thietBiModal);
      this.deleteModal = new Modal(this.$refs.deleteModal);
    },
    async fetchData() {
      try {
        const response = await axios.get('http://127.0.0.1:8000/api/thiet-bi-nfc');
        this.thietBis = response.data;
      } catch (error) {
        console.error('Error fetching data:', error);

        // Dữ liệu mẫu nếu API không hoạt động
        this.thietBis = [
          {
            id_thiet_bi: 1,
            ten_thiet_bi: 'NFC Reader 001',
            vi_tri_dat: 'Cổng chính',
            dia_chi_ip: '192.168.1.101',
            dia_chi_mac: '00:1A:2B:3C:4D:5E',
            trang_thai: 'active',
            thoi_gian_dong_bo_cuoi: '2023-05-15T08:30:00',
            ngay_lap_dat: '2023-01-10'
          },
          {
            id_thiet_bi: 2,
            ten_thiet_bi: 'NFC Reader 002',
            vi_tri_dat: 'Cổng phụ',
            dia_chi_ip: '192.168.1.102',
            dia_chi_mac: '00:1A:2B:3C:4D:5F',
            trang_thai: 'active',
            thoi_gian_dong_bo_cuoi: '2023-05-15T08:35:00',
            ngay_lap_dat: '2023-01-10'
          },
          {
            id_thiet_bi: 3,
            ten_thiet_bi: 'NFC Reader 003',
            vi_tri_dat: 'Phòng họp',
            dia_chi_ip: '192.168.1.103',
            dia_chi_mac: '00:1A:2B:3C:4D:60',
            trang_thai: 'maintenance',
            thoi_gian_dong_bo_cuoi: '2023-05-14T10:15:00',
            ngay_lap_dat: '2023-01-15'
          }
        ];
      }
    },
    formatDate(dateString) {
      if (!dateString) return 'N/A';
      const date = new Date(dateString);
      return date.toLocaleDateString('vi-VN');
    },
    formatDateTime(dateTimeString) {
      if (!dateTimeString) return 'Chưa đồng bộ';
      const date = new Date(dateTimeString);
      return date.toLocaleString('vi-VN');
    },
    getTrangThaiText(trangThai) {
      switch (trangThai) {
        case 'active': return 'Đang hoạt động';
        case 'inactive': return 'Không hoạt động';
        case 'maintenance': return 'Đang bảo trì';
        default: return 'Không xác định';
      }
    },
    getTrangThaiClass(trangThai) {
      switch (trangThai) {
        case 'active': return 'badge bg-success';
        case 'inactive': return 'badge bg-danger';
        case 'maintenance': return 'badge bg-warning';
        default: return 'badge bg-secondary';
      }
    },
    resetForm() {
      this.formData = {
        ten_thiet_bi: '',
        vi_tri_dat: '',
        dia_chi_ip: '',
        dia_chi_mac: '',
        trang_thai: 'active',
        ngay_lap_dat: new Date().toISOString().split('T')[0],
        thoi_gian_dong_bo_cuoi: null
      };
    },
    showAddModal() {
      this.isEditing = false;
      this.resetForm();
      this.thietBiModal.show();
    },
    editThietBi(thietBi) {
      this.isEditing = true;
      this.selectedThietBi = thietBi;
      this.formData = { ...thietBi };
      this.thietBiModal.show();
    },
    deleteThietBi(thietBi) {
      this.selectedThietBi = thietBi;
      this.deleteModal.show();
    },
    async saveThietBi() {
      try {
        if (this.isEditing) {
          // Cập nhật thiết bị
          await axios.put(`http://127.0.0.1:8000/api/thiet-bi-nfc/${this.selectedThietBi.id_thiet_bi}`, this.formData);

          // Cập nhật dữ liệu trong mảng
          const index = this.thietBis.findIndex(tb => tb.id_thiet_bi === this.selectedThietBi.id_thiet_bi);
          if (index !== -1) {
            this.thietBis[index] = { ...this.thietBis[index], ...this.formData };
          }

          alert('Cập nhật thiết bị thành công!');
        } else {
          // Thêm thiết bị mới
          const response = await axios.post('http://127.0.0.1:8000/api/thiet-bi-nfc', this.formData);
          this.thietBis.push(response.data);

          alert('Thêm thiết bị thành công!');
        }

        this.thietBiModal.hide();
        this.resetForm();
      } catch (error) {
        console.error('Error saving device:', error);
        alert(`Lỗi khi lưu thiết bị: ${error.response?.data?.message || error.message}`);
      }
    },
    async confirmDelete() {
      try {
        await axios.delete(`http://127.0.0.1:8000/api/thiet-bi-nfc/${this.selectedThietBi.id_thiet_bi}`);

        // Xóa thiết bị khỏi mảng
        this.thietBis = this.thietBis.filter(tb => tb.id_thiet_bi !== this.selectedThietBi.id_thiet_bi);

        alert('Xóa thiết bị thành công!');
        this.deleteModal.hide();
      } catch (error) {
        console.error('Error deleting device:', error);
        alert(`Lỗi khi xóa thiết bị: ${error.response?.data?.message || error.message}`);
      }
    },
    async syncThietBi(thietBi) {
      try {
        // Gọi API đồng bộ thiết bị
        await axios.post(`http://127.0.0.1:8000/api/thiet-bi-nfc/${thietBi.id_thiet_bi}/sync`);

        // Cập nhật thời gian đồng bộ
        const index = this.thietBis.findIndex(tb => tb.id_thiet_bi === thietBi.id_thiet_bi);
        if (index !== -1) {
          this.thietBis[index].thoi_gian_dong_bo_cuoi = new Date().toISOString();
        }

        alert('Đồng bộ thiết bị thành công!');
      } catch (error) {
        console.error('Error syncing device:', error);
        alert(`Lỗi khi đồng bộ thiết bị: ${error.response?.data?.message || error.message}`);
      }
    }
  }
};
</script>

<style scoped>
.badge {
  font-size: 0.85rem;
  padding: 0.35em 0.65em;
}

.table th {
  white-space: nowrap;
}
</style>