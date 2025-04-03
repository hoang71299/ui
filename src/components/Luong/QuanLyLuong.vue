<template>
  <div class="container-fluid">
    <div class="row">
      <div class="col-12">
        <div class="card">
          <div class="card-header d-flex justify-content-between align-items-center">
            <h5 class="mb-0">Quản Lý Lương</h5>
            <button class="btn btn-primary" @click="showAddModal">
              <i class="bx bx-plus me-1"></i> Thêm Bảng Lương
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
                <label class="form-label">Tháng</label>
                <select class="form-select" v-model="filters.thang">
                  <option value="">Tất cả</option>
                  <option v-for="i in 12" :key="i" :value="i">Tháng {{ i }}</option>
                </select>
              </div>
              <div class="col-md-3">
                <label class="form-label">Năm</label>
                <select class="form-select" v-model="filters.nam">
                  <option value="">Tất cả</option>
                  <option v-for="nam in namOptions" :key="nam" :value="nam">{{ nam }}</option>
                </select>
              </div>
              <div class="col-md-3">
                <label class="form-label">Trạng Thái</label>
                <select class="form-select" v-model="filters.trangThai">
                  <option value="">Tất cả</option>
                  <option value="1">Đã thanh toán</option>
                  <option value="0">Chưa thanh toán</option>
                </select>
              </div>
            </div>

            <!-- Bảng danh sách lương -->
            <div class="table-responsive">
              <table class="table table-bordered table-hover">
                <thead class="table-light">
                  <tr>
                    <th>Mã Lương</th>
                    <th>Nhân Viên</th>
                    <th>Tháng/Năm</th>
                    <th>Lương Cơ Bản</th>
                    <th>Phụ Cấp</th>
                    <th>Thưởng</th>
                    <th>Khấu Trừ</th>
                    <th>Tổng Lương</th>
                    <th>Trạng Thái</th>
                    <th>Thao Tác</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="luong in filteredLuongs" :key="luong.id_luong">
                    <td>{{ luong.id_luong }}</td>
                    <td>{{ getNhanVienName(luong.id_nhan_vien) }}</td>
                    <td>{{ luong.thang }}/{{ luong.nam }}</td>
                    <td>{{ formatCurrency(luong.luong_co_ban) }}</td>
                    <td>{{ formatCurrency(luong.phu_cap) }}</td>
                    <td>{{ formatCurrency(luong.thuong) }}</td>
                    <td>{{ formatCurrency(luong.khau_tru) }}</td>
                    <td class="fw-bold">{{ formatCurrency(tinhTongLuong(luong)) }}</td>
                    <td>
                      <span :class="luong.da_thanh_toan ? 'badge bg-success' : 'badge bg-warning'">
                        {{ luong.da_thanh_toan ? 'Đã thanh toán' : 'Chưa thanh toán' }}
                      </span>
                    </td>
                    <td>
                      <div class="d-flex gap-2">
                        <button class="btn btn-sm btn-warning" @click="editLuong(luong)">
                          <i class="bx bx-edit"></i>
                        </button>
                        <button class="btn btn-sm btn-danger" @click="deleteLuong(luong)">
                          <i class="bx bx-trash"></i>
                        </button>
                        <button v-if="!luong.da_thanh_toan" class="btn btn-sm btn-success"
                          @click="thanhToanLuong(luong)">
                          <i class="bx bx-check"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                  <tr v-if="filteredLuongs.length === 0">
                    <td colspan="10" class="text-center">Không có dữ liệu</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- Phân trang -->
            <div class="d-flex justify-content-between align-items-center mt-3">
              <div>
                Hiển thị {{ filteredLuongs.length }} / {{ luongs.length }} bản ghi
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

    <!-- Modal Thêm/Sửa Lương -->
    <div class="modal fade" id="luongModal" tabindex="-1" aria-hidden="true" ref="luongModal">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">{{ isEditing ? 'Cập Nhật Bảng Lương' : 'Thêm Bảng Lương Mới' }}</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="saveLuong">
              <div class="mb-3">
                <label class="form-label">Nhân Viên</label>
                <select class="form-select" v-model="formData.id_nhan_vien" required>
                  <option v-for="nv in nhanViens" :key="nv.id_nhan_vien" :value="nv.id_nhan_vien">
                    {{ nv.ho_va_ten }}
                  </option>
                </select>
              </div>
              <div class="row mb-3">
                <div class="col-md-6">
                  <label class="form-label">Tháng</label>
                  <select class="form-select" v-model="formData.thang" required>
                    <option v-for="i in 12" :key="i" :value="i">Tháng {{ i }}</option>
                  </select>
                </div>
                <div class="col-md-6">
                  <label class="form-label">Năm</label>
                  <select class="form-select" v-model="formData.nam" required>
                    <option v-for="nam in namOptions" :key="nam" :value="nam">{{ nam }}</option>
                  </select>
                </div>
              </div>
              <div class="mb-3">
                <label class="form-label">Lương Cơ Bản</label>
                <input type="number" class="form-control" v-model="formData.luong_co_ban" required min="0">
              </div>
              <div class="mb-3">
                <label class="form-label">Phụ Cấp</label>
                <input type="number" class="form-control" v-model="formData.phu_cap" required min="0">
              </div>
              <div class="mb-3">
                <label class="form-label">Thưởng</label>
                <input type="number" class="form-control" v-model="formData.thuong" required min="0">
              </div>
              <div class="mb-3">
                <label class="form-label">Khấu Trừ</label>
                <input type="number" class="form-control" v-model="formData.khau_tru" required min="0">
              </div>
              <div class="mb-3">
                <label class="form-label">Ghi Chú</label>
                <textarea class="form-control" v-model="formData.ghi_chu" rows="3"></textarea>
              </div>
              <div class="form-check form-switch mb-3">
                <input class="form-check-input" type="checkbox" id="daThanhToan" v-model="formData.da_thanh_toan">
                <label class="form-check-label" for="daThanhToan">
                  {{ formData.da_thanh_toan ? 'Đã thanh toán' : 'Chưa thanh toán' }}
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
          <div class="modal-body" v-if="selectedLuong">
            <p>Bạn có chắc chắn muốn xóa bảng lương của nhân viên <strong>{{ getNhanVienName(selectedLuong.id_nhan_vien)
                }}</strong> tháng {{ selectedLuong.thang }}/{{ selectedLuong.nam }}?</p>
            <p class="text-danger">Hành động này không thể hoàn tác!</p>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Hủy</button>
            <button type="button" class="btn btn-danger" @click="confirmDelete">Xóa</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal Xác Nhận Thanh Toán -->
    <div class="modal fade" id="thanhToanModal" tabindex="-1" aria-hidden="true" ref="thanhToanModal">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Xác Nhận Thanh Toán</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body" v-if="selectedLuong">
            <p>Bạn có chắc chắn muốn thanh toán lương cho nhân viên <strong>{{
              getNhanVienName(selectedLuong.id_nhan_vien) }}</strong> tháng {{ selectedLuong.thang }}/{{
              selectedLuong.nam }}?</p>
            <p>Tổng lương: <strong>{{ formatCurrency(tinhTongLuong(selectedLuong)) }}</strong></p>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Hủy</button>
            <button type="button" class="btn btn-success" @click="confirmThanhToan">Xác Nhận Thanh Toán</button>
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
  name: 'QuanLyLuong',
  data() {
    return {
      luongs: [],
      nhanViens: [],
      selectedLuong: null,
      isEditing: false,
      formData: {
        id_nhan_vien: '',
        thang: new Date().getMonth() + 1,
        nam: new Date().getFullYear(),
        luong_co_ban: 0,
        phu_cap: 0,
        thuong: 0,
        khau_tru: 0,
        ghi_chu: '',
        da_thanh_toan: false
      },
      filters: {
        nhanVien: '',
        thang: '',
        nam: '',
        trangThai: ''
      },
      currentPage: 1,
      itemsPerPage: 10,
      luongModal: null,
      deleteModal: null,
      thanhToanModal: null
    };
  },
  computed: {
    namOptions() {
      const currentYear = new Date().getFullYear();
      // Tạo mảng các năm từ năm hiện tại trở về 5 năm trước
      return Array.from({ length: 6 }, (_, i) => currentYear - i);
    },
    filteredLuongs() {
      let filtered = [...this.luongs];

      if (this.filters.nhanVien) {
        filtered = filtered.filter(l => l.id_nhan_vien == this.filters.nhanVien);
      }

      if (this.filters.thang) {
        filtered = filtered.filter(l => l.thang == this.filters.thang);
      }

      if (this.filters.nam) {
        filtered = filtered.filter(l => l.nam == this.filters.nam);
      }

      if (this.filters.trangThai !== '') {
        const status = this.filters.trangThai === '1';
        filtered = filtered.filter(l => l.da_thanh_toan === status);
      }

      // Phân trang
      const start = (this.currentPage - 1) * this.itemsPerPage;
      const end = start + this.itemsPerPage;
      return filtered.slice(start, end);
    },
    totalPages() {
      return Math.ceil(this.luongs.length / this.itemsPerPage);
    }
  },
  mounted() {
    this.fetchData();
    this.initModals();
  },
  methods: {
    initModals() {
      this.luongModal = new Modal(this.$refs.luongModal);
      this.deleteModal = new Modal(this.$refs.deleteModal);
      this.thanhToanModal = new Modal(this.$refs.thanhToanModal);
    },
    async fetchData() {
      try {
        // Fetch lương
        const luongResponse = await axios.get('http://127.0.0.1:8000/api/luong');
        this.luongs = luongResponse.data;

        // Fetch nhân viên
        const nhanVienResponse = await axios.get('http://127.0.0.1:8000/api/nhan-vien');
        this.nhanViens = nhanVienResponse.data;
      } catch (error) {
        console.error('Error fetching data:', error);

        // Dữ liệu mẫu nếu API không hoạt động
        this.nhanViens = [
          { id_nhan_vien: 1, ho_va_ten: 'Nguyễn Văn A' },
          { id_nhan_vien: 2, ho_va_ten: 'Trần Thị B' }
        ];

        this.luongs = [
          {
            id_luong: 1,
            id_nhan_vien: 1,
            thang: 10,
            nam: 2023,
            luong_co_ban: 10000000,
            phu_cap: 1000000,
            thuong: 500000,
            khau_tru: 200000,
            ghi_chu: 'Lương tháng 10/2023',
            da_thanh_toan: true
          },
          {
            id_luong: 2,
            id_nhan_vien: 2,
            thang: 10,
            nam: 2023,
            luong_co_ban: 8000000,
            phu_cap: 800000,
            thuong: 300000,
            khau_tru: 150000,
            ghi_chu: 'Lương tháng 10/2023',
            da_thanh_toan: false
          }
        ];
      }
    },
    getNhanVienName(id) {
      const nhanVien = this.nhanViens.find(nv => nv.id_nhan_vien === id);
      return nhanVien ? nhanVien.ho_va_ten : 'Không xác định';
    },
    formatCurrency(value) {
      return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
    },
    tinhTongLuong(luong) {
      return luong.luong_co_ban + luong.phu_cap + luong.thuong - luong.khau_tru;
    },
    resetForm() {
      this.formData = {
        id_nhan_vien: '',
        thang: new Date().getMonth() + 1,
        nam: new Date().getFullYear(),
        luong_co_ban: 0,
        phu_cap: 0,
        thuong: 0,
        khau_tru: 0,
        ghi_chu: '',
        da_thanh_toan: false
      };
    },
    showAddModal() {
      this.isEditing = false;
      this.resetForm();
      this.luongModal.show();
    },
    editLuong(luong) {
      this.isEditing = true;
      this.selectedLuong = luong;
      this.formData = { ...luong };
      this.luongModal.show();
    },
    deleteLuong(luong) {
      this.selectedLuong = luong;
      this.deleteModal.show();
    },
    thanhToanLuong(luong) {
      this.selectedLuong = luong;
      this.thanhToanModal.show();
    },
    async saveLuong() {
      try {
        if (this.isEditing) {
          // Cập nhật lương
          await axios.put(`http://127.0.0.1:8000/api/luong/${this.selectedLuong.id_luong}`, this.formData);

          // Cập nhật dữ liệu trong mảng
          const index = this.luongs.findIndex(l => l.id_luong === this.selectedLuong.id_luong);
          if (index !== -1) {
            this.luongs[index] = { ...this.formData, id_luong: this.selectedLuong.id_luong };
          }
        } else {
          // Thêm lương mới
          const response = await axios.post('http://127.0.0.1:8000/api/luong', this.formData);
          this.luongs.push(response.data);
        }

        this.luongModal.hide();
        this.resetForm();
      } catch (error) {
        console.error('Error saving salary:', error);
        alert('Có lỗi xảy ra khi lưu thông tin lương!');
      }
    },
    async confirmDelete() {
      try {
        await axios.delete(`http://127.0.0.1:8000/api/luong/${this.selectedLuong.id_luong}`);

        // Xóa lương khỏi mảng
        this.luongs = this.luongs.filter(l => l.id_luong !== this.selectedLuong.id_luong);

        this.deleteModal.hide();
      } catch (error) {
        console.error('Error deleting salary:', error);
        alert('Có lỗi xảy ra khi xóa lương!');
      }
    },
    async confirmThanhToan() {
      try {
        // Cập nhật trạng thái thanh toán
        const updatedLuong = { ...this.selectedLuong, da_thanh_toan: true };
        await axios.put(`http://127.0.0.1:8000/api/luong/${this.selectedLuong.id_luong}`, updatedLuong);

        // Cập nhật dữ liệu trong mảng
        const index = this.luongs.findIndex(l => l.id_luong === this.selectedLuong.id_luong);
        if (index !== -1) {
          this.luongs[index] = { ...updatedLuong };
        }

        this.thanhToanModal.hide();
      } catch (error) {
        console.error('Error updating payment status:', error);
        alert('Có lỗi xảy ra khi cập nhật trạng thái thanh toán!');
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