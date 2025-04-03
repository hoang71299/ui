<template>
  <div class="container-fluid">
    <div class="row">
      <div class="col-12">
        <div class="card">
          <div class="card-header d-flex justify-content-between align-items-center">
            <h5 class="mb-0">Quản Lý Đăng Ký Vắng</h5>
            <button class="btn btn-primary" @click="showAddModal">
              <i class="bx bx-plus me-1"></i> Thêm Đăng Ký Vắng
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
                <label class="form-label">Loại Vắng</label>
                <select class="form-select" v-model="filters.loaiVang">
                  <option value="">Tất cả</option>
                  <option v-for="lv in loaiVangs" :key="lv.id_loai_vang" :value="lv.id_loai_vang">
                    {{ lv.ten_loai }}
                  </option>
                </select>
              </div>
              <div class="col-md-3">
                <label class="form-label">Trạng Thái</label>
                <select class="form-select" v-model="filters.trangThai">
                  <option value="">Tất cả</option>
                  <option value="pending">Chờ duyệt</option>
                  <option value="approved">Đã duyệt</option>
                  <option value="rejected">Đã từ chối</option>
                </select>
              </div>
              <div class="col-md-3">
                <label class="form-label">Tìm Kiếm</label>
                <input type="text" class="form-control" v-model="filters.search" placeholder="Lý do...">
              </div>
            </div>

            <!-- Bảng danh sách đăng ký vắng -->
            <div class="table-responsive">
              <table class="table table-bordered table-hover">
                <thead class="table-light">
                  <tr>
                    <th>Mã ĐKV</th>
                    <th>Nhân Viên</th>
                    <th>Loại Vắng</th>
                    <th>Từ Ngày</th>
                    <th>Đến Ngày</th>
                    <th>Số Ngày</th>
                    <th>Lý Do</th>
                    <th>Trạng Thái</th>
                    <th>Thao Tác</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="dangKy in filteredDangKys" :key="dangKy.id_dang_ky">
                    <td>{{ dangKy.id_dang_ky }}</td>
                    <td>{{ getNhanVienName(dangKy.id_nhan_vien) }}</td>
                    <td>{{ getLoaiVangName(dangKy.id_loai_vang) }}</td>
                    <td>{{ formatDate(dangKy.ngay_bat_dau) }}</td>
                    <td>{{ formatDate(dangKy.ngay_ket_thuc) }}</td>
                    <td>{{ tinhSoNgay(dangKy) }}</td>
                    <td>{{ dangKy.ly_do }}</td>
                    <td>
                      <span :class="getStatusClass(dangKy.trang_thai)">
                        {{ getStatusText(dangKy.trang_thai) }}
                      </span>
                    </td>
                    <td>
                      <div class="d-flex gap-2">
                        <button class="btn btn-sm btn-warning" @click="editDangKy(dangKy)"
                          :disabled="dangKy.trang_thai === 'approved' || dangKy.trang_thai === 'rejected'">
                          <i class="bx bx-edit"></i>
                        </button>
                        <button class="btn btn-sm btn-danger" @click="deleteDangKy(dangKy)"
                          :disabled="dangKy.trang_thai === 'approved'">
                          <i class="bx bx-trash"></i>
                        </button>
                        <button v-if="dangKy.trang_thai === 'pending'" class="btn btn-sm btn-success"
                          @click="approveDangKy(dangKy)">
                          <i class="bx bx-check"></i>
                        </button>
                        <button v-if="dangKy.trang_thai === 'pending'" class="btn btn-sm btn-danger"
                          @click="rejectDangKy(dangKy)">
                          <i class="bx bx-x"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                  <tr v-if="filteredDangKys.length === 0">
                    <td colspan="9" class="text-center">Không có dữ liệu</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- Phân trang -->
            <div class="d-flex justify-content-between align-items-center mt-3">
              <div>
                Hiển thị {{ filteredDangKys.length }} / {{ dangKys.length }} đăng ký vắng
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

    <!-- Modal Thêm/Sửa Đăng Ký Vắng -->
    <div class="modal fade" id="dangKyModal" tabindex="-1" aria-hidden="true" ref="dangKyModal">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">{{ isEditing ? 'Cập Nhật Đăng Ký Vắng' : 'Thêm Đăng Ký Vắng Mới' }}</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="saveDangKy">
              <div class="mb-3">
                <label class="form-label">Nhân Viên</label>
                <select class="form-select" v-model="formData.id_nhan_vien" required>
                  <option v-for="nv in nhanViens" :key="nv.id_nhan_vien" :value="nv.id_nhan_vien">
                    {{ nv.ho_va_ten }}
                  </option>
                </select>
              </div>
              <div class="mb-3">
                <label class="form-label">Loại Vắng</label>
                <select class="form-select" v-model="formData.id_loai_vang" required>
                  <option v-for="lv in loaiVangs" :key="lv.id_loai_vang" :value="lv.id_loai_vang">
                    {{ lv.ten_loai }}
                  </option>
                </select>
              </div>
              <div class="row">
                <div class="col-md-6 mb-3">
                  <label class="form-label">Từ Ngày</label>
                  <input type="date" class="form-control" v-model="formData.ngay_bat_dau" required>
                </div>
                <div class="col-md-6 mb-3">
                  <label class="form-label">Đến Ngày</label>
                  <input type="date" class="form-control" v-model="formData.ngay_ket_thuc" required>
                </div>
              </div>
              <div class="mb-3">
                <label class="form-label">Lý Do</label>
                <textarea class="form-control" v-model="formData.ly_do" rows="3" required></textarea>
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
          <div class="modal-body" v-if="selectedDangKy">
            <p>Bạn có chắc chắn muốn xóa đăng ký vắng của nhân viên <strong>{{
              getNhanVienName(selectedDangKy.id_nhan_vien) }}</strong> từ ngày {{
              formatDate(selectedDangKy.ngay_bat_dau) }} đến ngày {{ formatDate(selectedDangKy.ngay_ket_thuc) }}?</p>
            <p class="text-danger">Hành động này không thể hoàn tác!</p>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Hủy</button>
            <button type="button" class="btn btn-danger" @click="confirmDelete">Xóa</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal Xác Nhận Duyệt -->
    <div class="modal fade" id="approveModal" tabindex="-1" aria-hidden="true" ref="approveModal">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Xác Nhận Duyệt</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body" v-if="selectedDangKy">
            <p>Bạn có chắc chắn muốn duyệt đăng ký vắng của nhân viên <strong>{{
              getNhanVienName(selectedDangKy.id_nhan_vien) }}</strong> từ ngày {{
              formatDate(selectedDangKy.ngay_bat_dau) }} đến ngày {{ formatDate(selectedDangKy.ngay_ket_thuc) }}?</p>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Hủy</button>
            <button type="button" class="btn btn-success" @click="confirmApprove">Duyệt</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal Xác Nhận Từ Chối -->
    <div class="modal fade" id="rejectModal" tabindex="-1" aria-hidden="true" ref="rejectModal">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Xác Nhận Từ Chối</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body" v-if="selectedDangKy">
            <p>Bạn có chắc chắn muốn từ chối đăng ký vắng của nhân viên <strong>{{
              getNhanVienName(selectedDangKy.id_nhan_vien) }}</strong> từ ngày {{
              formatDate(selectedDangKy.ngay_bat_dau) }} đến ngày {{ formatDate(selectedDangKy.ngay_ket_thuc) }}?</p>
            <div class="mb-3">
              <label class="form-label">Lý Do Từ Chối</label>
              <textarea class="form-control" v-model="rejectReason" rows="3" required></textarea>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Hủy</button>
            <button type="button" class="btn btn-danger" @click="confirmReject">Từ Chối</button>
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
  name: 'QuanLyDangKyVang',
  data() {
    return {
      dangKys: [],
      nhanViens: [],
      loaiVangs: [],
      selectedDangKy: null,
      isEditing: false,
      rejectReason: '',
      formData: {
        id_nhan_vien: '',
        id_loai_vang: '',
        ngay_bat_dau: new Date().toISOString().split('T')[0],
        ngay_ket_thuc: new Date().toISOString().split('T')[0],
        ly_do: '',
        trang_thai: 'pending'
      },
      filters: {
        nhanVien: '',
        loaiVang: '',
        trangThai: '',
        search: ''
      },
      currentPage: 1,
      itemsPerPage: 10,
      dangKyModal: null,
      deleteModal: null,
      approveModal: null,
      rejectModal: null
    };
  },
  computed: {
    filteredDangKys() {
      let filtered = [...this.dangKys];

      if (this.filters.nhanVien !== '') {
        filtered = filtered.filter(dk => dk.id_nhan_vien === parseInt(this.filters.nhanVien));
      }

      if (this.filters.loaiVang !== '') {
        filtered = filtered.filter(dk => dk.id_loai_vang === parseInt(this.filters.loaiVang));
      }

      if (this.filters.trangThai !== '') {
        filtered = filtered.filter(dk => dk.trang_thai === this.filters.trangThai);
      }

      if (this.filters.search) {
        const searchTerm = this.filters.search.toLowerCase();
        filtered = filtered.filter(dk =>
          dk.ly_do.toLowerCase().includes(searchTerm)
        );
      }

      // Phân trang
      const start = (this.currentPage - 1) * this.itemsPerPage;
      const end = start + this.itemsPerPage;
      return filtered.slice(start, end);
    },
    totalPages() {
      return Math.ceil(this.dangKys.length / this.itemsPerPage);
    }
  },
  mounted() {
    this.fetchData();
    this.initModals();
  },
  methods: {
    initModals() {
      this.dangKyModal = new Modal(this.$refs.dangKyModal);
      this.deleteModal = new Modal(this.$refs.deleteModal);
      this.approveModal = new Modal(this.$refs.approveModal);
      this.rejectModal = new Modal(this.$refs.rejectModal);
    },
    async fetchData() {
      try {
        // Fetch đăng ký vắng
        const dangKyResponse = await axios.get('http://127.0.0.1:8000/api/dang-ky-vang');
        this.dangKys = dangKyResponse.data;

        // Fetch nhân viên
        const nhanVienResponse = await axios.get('http://127.0.0.1:8000/api/nhan-vien');
        this.nhanViens = nhanVienResponse.data;

        // Fetch loại vắng
        const loaiVangResponse = await axios.get('http://127.0.0.1:8000/api/loai-vang');
        this.loaiVangs = loaiVangResponse.data;
      } catch (error) {
        console.error('Error fetching data:', error);

        // Dữ liệu mẫu nếu API không hoạt động
        this.nhanViens = [
          { id_nhan_vien: 1, ho_va_ten: 'Nguyễn Văn A' },
          { id_nhan_vien: 2, ho_va_ten: 'Trần Thị B' },
          { id_nhan_vien: 3, ho_va_ten: 'Lê Văn C' }
        ];

        this.loaiVangs = [
          { id_loai_vang: 1, ten_loai: 'Nghỉ phép', so_ngay_toi_da: 12 },
          { id_loai_vang: 2, ten_loai: 'Nghỉ ốm', so_ngay_toi_da: 30 },
          { id_loai_vang: 3, ten_loai: 'Nghỉ không lương', so_ngay_toi_da: 90 }
        ];

        this.dangKys = [
          {
            id_dang_ky: 1,
            id_nhan_vien: 1,
            id_loai_vang: 1,
            ngay_bat_dau: '2023-11-20',
            ngay_ket_thuc: '2023-11-22',
            ly_do: 'Nghỉ phép cá nhân',
            trang_thai: 'approved'
          },
          {
            id_dang_ky: 2,
            id_nhan_vien: 2,
            id_loai_vang: 2,
            ngay_bat_dau: '2023-11-15',
            ngay_ket_thuc: '2023-11-18',
            ly_do: 'Nghỉ ốm',
            trang_thai: 'pending'
          },
          {
            id_dang_ky: 3,
            id_nhan_vien: 3,
            id_loai_vang: 3,
            ngay_bat_dau: '2023-12-01',
            ngay_ket_thuc: '2023-12-15',
            ly_do: 'Nghỉ không lương để giải quyết việc gia đình',
            trang_thai: 'rejected'
          }
        ];
      }
    },
    getNhanVienName(id) {
      const nhanVien = this.nhanViens.find(nv => nv.id_nhan_vien === id);
      return nhanVien ? nhanVien.ho_va_ten : 'Không xác định';
    },
    getLoaiVangName(id) {
      const loaiVang = this.loaiVangs.find(lv => lv.id_loai_vang === id);
      return loaiVang ? loaiVang.ten_loai : 'Không xác định';
    },
    formatDate(dateString) {
      if (!dateString) return 'N/A';
      const date = new Date(dateString);
      return date.toLocaleDateString('vi-VN');
    },
    tinhSoNgay(dangKy) {
      if (!dangKy.ngay_bat_dau || !dangKy.ngay_ket_thuc) return 'N/A';

      const start = new Date(dangKy.ngay_bat_dau);
      const end = new Date(dangKy.ngay_ket_thuc);

      // Tính số ngày (kể cả ngày bắt đầu và kết thúc)
      const diffTime = Math.abs(end - start);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

      return diffDays + ' ngày';
    },
    getStatusClass(status) {
      switch (status) {
        case 'approved': return 'badge bg-success';
        case 'rejected': return 'badge bg-danger';
        case 'pending': return 'badge bg-warning';
        default: return 'badge bg-secondary';
      }
    },
    getStatusText(status) {
      switch (status) {
        case 'approved': return 'Đã duyệt';
        case 'rejected': return 'Đã từ chối';
        case 'pending': return 'Chờ duyệt';
        default: return 'Không xác định';
      }
    },
    resetForm() {
      this.formData = {
        id_nhan_vien: '',
        id_loai_vang: '',
        ngay_bat_dau: new Date().toISOString().split('T')[0],
        ngay_ket_thuc: new Date().toISOString().split('T')[0],
        ly_do: '',
        trang_thai: 'pending'
      };
    },
    showAddModal() {
      this.isEditing = false;
      this.resetForm();
      this.dangKyModal.show();
    },
    editDangKy(dangKy) {
      this.isEditing = true;
      this.selectedDangKy = dangKy;
      this.formData = { ...dangKy };
      this.dangKyModal.show();
    },
    deleteDangKy(dangKy) {
      this.selectedDangKy = dangKy;
      this.deleteModal.show();
    },
    approveDangKy(dangKy) {
      this.selectedDangKy = dangKy;
      this.approveModal.show();
    },
    rejectDangKy(dangKy) {
      this.selectedDangKy = dangKy;
      this.rejectReason = '';
      this.rejectModal.show();
    },
    async saveDangKy() {
      try {
        // Kiểm tra ngày bắt đầu <= ngày kết thúc
        if (new Date(this.formData.ngay_bat_dau) > new Date(this.formData.ngay_ket_thuc)) {
          alert('Ngày bắt đầu phải trước hoặc cùng ngày với ngày kết thúc!');
          return;
        }

        if (this.isEditing) {
          // Cập nhật đăng ký vắng
          await axios.put(`http://127.0.0.1:8000/api/dang-ky-vang/${this.selectedDangKy.id_dang_ky}`, this.formData);

          // Cập nhật dữ liệu trong mảng
          const index = this.dangKys.findIndex(dk => dk.id_dang_ky === this.selectedDangKy.id_dang_ky);
          if (index !== -1) {
            this.dangKys[index] = { ...this.dangKys[index], ...this.formData };
          }
        } else {
          // Thêm đăng ký vắng mới
          const response = await axios.post('http://127.0.0.1:8000/api/dang-ky-vang', this.formData);
          this.dangKys.push(response.data);
        }

        this.dangKyModal.hide();
        this.resetForm();
      } catch (error) {
        console.error('Error saving absence registration:', error);
        alert('Có lỗi xảy ra khi lưu thông tin đăng ký vắng!');
      }
    },
    async confirmDelete() {
      try {
        await axios.delete(`http://127.0.0.1:8000/api/dang-ky-vang/${this.selectedDangKy.id_dang_ky}`);

        // Xóa đăng ký vắng khỏi mảng
        this.dangKys = this.dangKys.filter(dk => dk.id_dang_ky !== this.selectedDangKy.id_dang_ky);

        this.deleteModal.hide();
      } catch (error) {
        console.error('Error deleting absence registration:', error);
        alert('Có lỗi xảy ra khi xóa đăng ký vắng!');
      }
    },
    async confirmApprove() {
      try {
        await axios.put(`http://127.0.0.1:8000/api/dang-ky-vang/${this.selectedDangKy.id_dang_ky}/approve`);

        // Cập nhật trạng thái trong mảng
        const index = this.dangKys.findIndex(dk => dk.id_dang_ky === this.selectedDangKy.id_dang_ky);
        if (index !== -1) {
          this.dangKys[index].trang_thai = 'approved';
        }

        this.approveModal.hide();
      } catch (error) {
        console.error('Error approving absence registration:', error);
        alert('Có lỗi xảy ra khi duyệt đăng ký vắng!');
      }
    },
    async confirmReject() {
      if (!this.rejectReason.trim()) {
        alert('Vui lòng nhập lý do từ chối!');
        return;
      }

      try {
        await axios.put(`http://127.0.0.1:8000/api/dang-ky-vang/${this.selectedDangKy.id_dang_ky}/reject`, {
          ly_do_tu_choi: this.rejectReason
        });

        // Cập nhật trạng thái trong mảng
        const index = this.dangKys.findIndex(dk => dk.id_dang_ky === this.selectedDangKy.id_dang_ky);
        if (index !== -1) {
          this.dangKys[index].trang_thai = 'rejected';
        }

        this.rejectModal.hide();
      } catch (error) {
        console.error('Error rejecting absence registration:', error);
        alert('Có lỗi xảy ra khi từ chối đăng ký vắng!');
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
