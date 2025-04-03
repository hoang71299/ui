<template>
  <div class="container-fluid">
    <div class="row">
      <div class="col-12">
        <div class="card">
          <div class="card-header d-flex justify-content-between align-items-center">
            <h5 class="mb-0">Quản Lý Bảng Lương</h5>
            <button class="btn btn-primary" @click="showAddModal">
              <i class="bx bx-plus me-1"></i> Thêm Bảng Lương
            </button>
          </div>
          <div class="card-body">
            <!-- Bộ lọc -->
            <div class="row mb-3">
              <div class="col-md-3">
                <label class="form-label">Năm</label>
                <select class="form-select" v-model="filters.nam">
                  <option value="">Tất cả</option>
                  <option v-for="year in years" :key="year" :value="year">{{ year }}</option>
                </select>
              </div>
              <div class="col-md-3">
                <label class="form-label">Tháng</label>
                <select class="form-select" v-model="filters.thang">
                  <option value="">Tất cả</option>
                  <option v-for="month in 12" :key="month" :value="month">{{ month }}</option>
                </select>
              </div>
              <div class="col-md-6">
                <label class="form-label">Tìm Kiếm</label>
                <input type="text" class="form-control" v-model="filters.search" placeholder="Tên nhân viên...">
              </div>
            </div>

            <!-- Bảng danh sách bảng lương -->
            <div class="table-responsive">
              <table class="table table-bordered table-hover">
                <thead class="table-light">
                  <tr>
                    <th>Mã BL</th>
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
                  <tr v-for="bangLuong in filteredBangLuongs" :key="bangLuong.id_bang_luong">
                    <td>{{ bangLuong.id_bang_luong }}</td>
                    <td>{{ getNhanVienName(bangLuong.id_nhan_vien) }}</td>
                    <td>{{ bangLuong.thang }}/{{ bangLuong.nam }}</td>
                    <td>{{ formatCurrency(bangLuong.luong_co_ban) }}</td>
                    <td>{{ formatCurrency(bangLuong.phu_cap) }}</td>
                    <td>{{ formatCurrency(bangLuong.thuong) }}</td>
                    <td>{{ formatCurrency(bangLuong.khau_tru) }}</td>
                    <td class="fw-bold">{{ formatCurrency(tinhTongLuong(bangLuong)) }}</td>
                    <td>
                      <span :class="bangLuong.da_thanh_toan ? 'badge bg-success' : 'badge bg-warning'">
                        {{ bangLuong.da_thanh_toan ? 'Đã thanh toán' : 'Chưa thanh toán' }}
                      </span>
                    </td>
                    <td>
                      <div class="d-flex gap-2">
                        <button class="btn btn-sm btn-warning" @click="editBangLuong(bangLuong)">
                          <i class="bx bx-edit"></i>
                        </button>
                        <button class="btn btn-sm btn-danger" @click="deleteBangLuong(bangLuong)">
                          <i class="bx bx-trash"></i>
                        </button>
                        <button v-if="!bangLuong.da_thanh_toan" class="btn btn-sm btn-success"
                          @click="thanhToanLuong(bangLuong)">
                          <i class="bx bx-check"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                  <tr v-if="filteredBangLuongs.length === 0">
                    <td colspan="10" class="text-center">Không có dữ liệu</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- Phân trang -->
            <div class="d-flex justify-content-between align-items-center mt-3">
              <div>
                Hiển thị {{ filteredBangLuongs.length }} / {{ bangLuongs.length }} bảng lương
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

    <!-- Modal Thêm/Sửa Bảng Lương -->
    <div class="modal fade" id="bangLuongModal" tabindex="-1" aria-hidden="true" ref="bangLuongModal">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">{{ isEditing ? 'Cập Nhật Bảng Lương' : 'Thêm Bảng Lương Mới' }}</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="saveBangLuong">
              <div class="mb-3">
                <label class="form-label">Nhân Viên</label>
                <select class="form-select" v-model="formData.id_nhan_vien" required>
                  <option v-for="nv in nhanViens" :key="nv.id_nhan_vien" :value="nv.id_nhan_vien">
                    {{ nv.ho_va_ten }}
                  </option>
                </select>
              </div>
              <div class="row">
                <div class="col-md-6 mb-3">
                  <label class="form-label">Tháng</label>
                  <select class="form-select" v-model="formData.thang" required>
                    <option v-for="month in 12" :key="month" :value="month">{{ month }}</option>
                  </select>
                </div>
                <div class="col-md-6 mb-3">
                  <label class="form-label">Năm</label>
                  <select class="form-select" v-model="formData.nam" required>
                    <option v-for="year in years" :key="year" :value="year">{{ year }}</option>
                  </select>
                </div>
              </div>
              <div class="mb-3">
                <label class="form-label">Lương Cơ Bản</label>
                <input type="number" class="form-control" v-model="formData.luong_co_ban" required>
              </div>
              <div class="mb-3">
                <label class="form-label">Phụ Cấp</label>
                <input type="number" class="form-control" v-model="formData.phu_cap">
              </div>
              <div class="mb-3">
                <label class="form-label">Thưởng</label>
                <input type="number" class="form-control" v-model="formData.thuong">
              </div>
              <div class="mb-3">
                <label class="form-label">Khấu Trừ</label>
                <input type="number" class="form-control" v-model="formData.khau_tru">
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
          <div class="modal-body" v-if="selectedBangLuong">
            <p>Bạn có chắc chắn muốn xóa bảng lương của nhân viên <strong>{{
              getNhanVienName(selectedBangLuong.id_nhan_vien) }}</strong> tháng {{ selectedBangLuong.thang }}/{{
              selectedBangLuong.nam }}?</p>
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
    <div class="modal fade" id="paymentModal" tabindex="-1" aria-hidden="true" ref="paymentModal">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Xác Nhận Thanh Toán</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body" v-if="selectedBangLuong">
            <p>Bạn có chắc chắn muốn thanh toán lương cho nhân viên <strong>{{
              getNhanVienName(selectedBangLuong.id_nhan_vien) }}</strong> tháng {{ selectedBangLuong.thang }}/{{
              selectedBangLuong.nam }}?</p>
            <p>Tổng số tiền: <strong>{{ formatCurrency(tinhTongLuong(selectedBangLuong)) }}</strong></p>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Hủy</button>
            <button type="button" class="btn btn-success" @click="confirmPayment">Thanh Toán</button>
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
  name: 'QuanLyBangLuong',
  data() {
    return {
      bangLuongs: [],
      nhanViens: [],
      selectedBangLuong: null,
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
        thang: '',
        nam: '',
        search: ''
      },
      currentPage: 1,
      itemsPerPage: 10,
      bangLuongModal: null,
      deleteModal: null,
      paymentModal: null
    };
  },
  computed: {
    years() {
      const currentYear = new Date().getFullYear();
      return Array.from({ length: 5 }, (_, i) => currentYear - 2 + i);
    },
    filteredBangLuongs() {
      let filtered = [...this.bangLuongs];

      if (this.filters.thang !== '') {
        filtered = filtered.filter(bl => bl.thang === parseInt(this.filters.thang));
      }

      if (this.filters.nam !== '') {
        filtered = filtered.filter(bl => bl.nam === parseInt(this.filters.nam));
      }

      if (this.filters.search) {
        const searchTerm = this.filters.search.toLowerCase();
        filtered = filtered.filter(bl => {
          const nhanVien = this.nhanViens.find(nv => nv.id_nhan_vien === bl.id_nhan_vien);
          return nhanVien && nhanVien.ho_va_ten.toLowerCase().includes(searchTerm);
        });
      }

      // Phân trang
      const start = (this.currentPage - 1) * this.itemsPerPage;
      const end = start + this.itemsPerPage;
      return filtered.slice(start, end);
    },
    totalPages() {
      return Math.ceil(this.bangLuongs.length / this.itemsPerPage);
    }
  },
  mounted() {
    this.fetchData();
    this.initModals();
  },
  methods: {
    initModals() {
      this.bangLuongModal = new Modal(this.$refs.bangLuongModal);
      this.deleteModal = new Modal(this.$refs.deleteModal);
      this.paymentModal = new Modal(this.$refs.paymentModal);
    },
    async fetchData() {
      try {
        // Fetch bảng lương
        const bangLuongResponse = await axios.get('http://127.0.0.1:8000/api/bang-luong');
        this.bangLuongs = bangLuongResponse.data;

        // Fetch nhân viên
        const nhanVienResponse = await axios.get('http://127.0.0.1:8000/api/nhan-vien');
        this.nhanViens = nhanVienResponse.data;
      } catch (error) {
        console.error('Error fetching data:', error);

        // Dữ liệu mẫu nếu API không hoạt động
        this.nhanViens = [
          { id_nhan_vien: 1, ho_va_ten: 'Nguyễn Văn A' },
          { id_nhan_vien: 2, ho_va_ten: 'Trần Thị B' },
          { id_nhan_vien: 3, ho_va_ten: 'Lê Văn C' }
        ];

        this.bangLuongs = [
          {
            id_bang_luong: 1,
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
            id_bang_luong: 2,
            id_nhan_vien: 2,
            thang: 10,
            nam: 2023,
            luong_co_ban: 8000000,
            phu_cap: 800000,
            thuong: 300000,
            khau_tru: 150000,
            ghi_chu: 'Lương tháng 10/2023',
            da_thanh_toan: false
          },
          {
            id_bang_luong: 3,
            id_nhan_vien: 3,
            thang: 10,
            nam: 2023,
            luong_co_ban: 9000000,
            phu_cap: 900000,
            thuong: 400000,
            khau_tru: 180000,
            ghi_chu: 'Lương tháng 10/2023',
            da_thanh_toan: true
          },
          {
            id_bang_luong: 4,
            id_nhan_vien: 1,
            thang: 11,
            nam: 2023,
            luong_co_ban: 10000000,
            phu_cap: 1000000,
            thuong: 600000,
            khau_tru: 200000,
            ghi_chu: 'Lương tháng 11/2023',
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
    tinhTongLuong(bangLuong) {
      return bangLuong.luong_co_ban + bangLuong.phu_cap + bangLuong.thuong - bangLuong.khau_tru;
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
      this.bangLuongModal.show();
    },
    editBangLuong(bangLuong) {
      this.isEditing = true;
      this.selectedBangLuong = bangLuong;
      this.formData = { ...bangLuong };
      this.bangLuongModal.show();
    },
    deleteBangLuong(bangLuong) {
      this.selectedBangLuong = bangLuong;
      this.deleteModal.show();
    },
    thanhToanLuong(bangLuong) {
      this.selectedBangLuong = bangLuong;
      this.paymentModal.show();
    },
    async saveBangLuong() {
      try {
        if (this.isEditing) {
          // Cập nhật bảng lương
          await axios.put(`http://127.0.0.1:8000/api/bang-luong/${this.selectedBangLuong.id_bang_luong}`, this.formData);

          // Cập nhật dữ liệu trong mảng
          const index = this.bangLuongs.findIndex(bl => bl.id_bang_luong === this.selectedBangLuong.id_bang_luong);
          if (index !== -1) {
            this.bangLuongs[index] = { ...this.bangLuongs[index], ...this.formData };
          }
        } else {
          // Thêm bảng lương mới
          const response = await axios.post('http://127.0.0.1:8000/api/bang-luong', this.formData);
          this.bangLuongs.push(response.data);
        }

        this.bangLuongModal.hide();
        this.resetForm();
      } catch (error) {
        console.error('Error saving salary:', error);
        alert('Có lỗi xảy ra khi lưu thông tin bảng lương!');
      }
    },
    async confirmDelete() {
      try {
        await axios.delete(`http://127.0.0.1:8000/api/bang-luong/${this.selectedBangLuong.id_bang_luong}`);

        // Xóa bảng lương khỏi mảng
        this.bangLuongs = this.bangLuongs.filter(bl => bl.id_bang_luong !== this.selectedBangLuong.id_bang_luong);

        this.deleteModal.hide();
      } catch (error) {
        console.error('Error deleting salary:', error);
        alert('Có lỗi xảy ra khi xóa bảng lương!');
      }
    },
    async confirmPayment() {
      try {
        await axios.put(`http://127.0.0.1:8000/api/bang-luong/${this.selectedBangLuong.id_bang_luong}/thanh-toan`);

        // Cập nhật trạng thái thanh toán trong mảng
        const index = this.bangLuongs.findIndex(bl => bl.id_bang_luong === this.selectedBangLuong.id_bang_luong);
        if (index !== -1) {
          this.bangLuongs[index].da_thanh_toan = true;
        }

        this.paymentModal.hide();
      } catch (error) {
        console.error('Error processing payment:', error);
        alert('Có lỗi xảy ra khi thanh toán lương!');
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