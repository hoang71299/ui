<template>
  <div class="container-fluid">
    <div class="row">
      <div class="col-12">
        <div class="card">
          <div class="card-header d-flex justify-content-between align-items-center">
            <h5 class="mb-0">Quản Lý Hợp Đồng</h5>
            <button class="btn btn-primary" @click="showAddModal">
              <i class="bx bx-plus me-1"></i> Thêm Hợp Đồng
            </button>
          </div>
          <div class="card-body">
            <!-- Bộ lọc -->
            <div class="row mb-3">
              <div class="col-md-3">
                <label class="form-label">Loại Hợp Đồng</label>
                <select class="form-select" v-model="filters.loaiHopDong">
                  <option value="">Tất cả</option>
                  <option value="Thử việc">Thử việc</option>
                  <option value="Xác định thời hạn">Xác định thời hạn</option>
                  <option value="Không xác định thời hạn">Không xác định thời hạn</option>
                </select>
              </div>
              <div class="col-md-3">
                <label class="form-label">Trạng Thái</label>
                <select class="form-select" v-model="filters.trangThai">
                  <option value="">Tất cả</option>
                  <option value="active">Đang hiệu lực</option>
                  <option value="expired">Hết hiệu lực</option>
                  <option value="terminated">Đã chấm dứt</option>
                </select>
              </div>
              <div class="col-md-6">
                <label class="form-label">Tìm Kiếm</label>
                <input type="text" class="form-control" v-model="filters.search"
                  placeholder="Tên nhân viên, mã hợp đồng...">
              </div>
            </div>

            <!-- Bảng danh sách hợp đồng -->
            <div class="table-responsive">
              <table class="table table-bordered table-hover">
                <thead class="table-light">
                  <tr>
                    <th>Mã HĐ</th>
                    <th>Nhân Viên</th>
                    <th>Loại Hợp Đồng</th>
                    <th>Ngày Ký</th>
                    <th>Ngày Bắt Đầu</th>
                    <th>Ngày Kết Thúc</th>
                    <th>Lương Cơ Bản</th>
                    <th>Trạng Thái</th>
                    <th>Thao Tác</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="hopDong in filteredHopDongs" :key="hopDong.id_hop_dong">
                    <td>{{ hopDong.id_hop_dong }}</td>
                    <td>{{ getNhanVienName(hopDong.id_nhan_vien) }}</td>
                    <td>{{ hopDong.loai_hop_dong }}</td>
                    <td>{{ formatDate(hopDong.ngay_ky) }}</td>
                    <td>{{ formatDate(hopDong.ngay_bat_dau) }}</td>
                    <td>{{ hopDong.ngay_ket_thuc ? formatDate(hopDong.ngay_ket_thuc) : 'Không có' }}</td>
                    <td>{{ formatCurrency(hopDong.luong_co_ban) }}</td>
                    <td>
                      <span :class="getTrangThaiClass(hopDong)">
                        {{ getTrangThaiText(hopDong) }}
                      </span>
                    </td>
                    <td>
                      <div class="d-flex gap-2">
                        <button class="btn btn-sm btn-warning" @click="editHopDong(hopDong)">
                          <i class="bx bx-edit"></i>
                        </button>
                        <button class="btn btn-sm btn-danger" @click="deleteHopDong(hopDong)">
                          <i class="bx bx-trash"></i>
                        </button>
                        <button class="btn btn-sm btn-info" @click="viewDetails(hopDong)">
                          <i class="bx bx-detail"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                  <tr v-if="filteredHopDongs.length === 0">
                    <td colspan="9" class="text-center">Không có dữ liệu</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- Phân trang -->
            <div class="d-flex justify-content-between align-items-center mt-3">
              <div>
                Hiển thị {{ filteredHopDongs.length }} / {{ hopDongs.length }} hợp đồng
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
  </div>

  <!-- Modal Thêm/Sửa Hợp Đồng -->
  <div class="modal fade" id="hopDongModal" tabindex="-1" aria-hidden="true" ref="hopDongModal">
    <div class="modal-dialog modal-lg">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">{{ isEditing ? 'Cập Nhật Hợp Đồng' : 'Thêm Hợp Đồng Mới' }}</h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>
        <div class="modal-body">
          <form @submit.prevent="saveHopDong">
            <div class="row">
              <div class="col-md-6 mb-3">
                <label class="form-label">Nhân Viên</label>
                <select class="form-select" v-model="formData.id_nhan_vien" required>
                  <option v-for="nv in nhanViens" :key="nv.id_nhan_vien" :value="nv.id_nhan_vien">
                    {{ nv.ho_va_ten }}
                  </option>
                </select>
              </div>
              <div class="col-md-6 mb-3">
                <label class="form-label">Loại Hợp Đồng</label>
                <select class="form-select" v-model="formData.loai_hop_dong" required>
                  <option value="Thử việc">Thử việc</option>
                  <option value="Xác định thời hạn">Xác định thời hạn</option>
                  <option value="Không xác định thời hạn">Không xác định thời hạn</option>
                </select>
              </div>
            </div>

            <div class="row">
              <div class="col-md-4 mb-3">
                <label class="form-label">Ngày Ký</label>
                <input type="date" class="form-control" v-model="formData.ngay_ky" required>
              </div>
              <div class="col-md-4 mb-3">
                <label class="form-label">Ngày Bắt Đầu</label>
                <input type="date" class="form-control" v-model="formData.ngay_bat_dau" required>
              </div>
              <div class="col-md-4 mb-3">
                <label class="form-label">Ngày Kết Thúc</label>
                <input type="date" class="form-control" v-model="formData.ngay_ket_thuc">
                <small class="text-muted">Để trống nếu là hợp đồng không xác định thời hạn</small>
              </div>
            </div>

            <div class="row">
              <div class="col-md-6 mb-3">
                <label class="form-label">Lương Cơ Bản</label>
                <div class="input-group">
                  <input type="number" class="form-control" v-model="formData.luong_co_ban" min="0" required>
                  <span class="input-group-text">VNĐ</span>
                </div>
              </div>
              <div class="col-md-6 mb-3">
                <label class="form-label">Hệ Số Lương</label>
                <input type="number" class="form-control" v-model="formData.he_so_luong" min="0" step="0.1" required>
              </div>
            </div>

            <div class="mb-3">
              <label class="form-label">Nội Dung Hợp Đồng</label>
              <textarea class="form-control" v-model="formData.noi_dung" rows="3"></textarea>
            </div>

            <div class="mb-3">
              <label class="form-label">Ghi Chú</label>
              <textarea class="form-control" v-model="formData.ghi_chu" rows="2"></textarea>
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
        <div class="modal-body" v-if="selectedHopDong">
          <p>Bạn có chắc chắn muốn xóa hợp đồng của nhân viên <strong>{{ getNhanVienName(selectedHopDong.id_nhan_vien)
          }}</strong>?</p>
          <p class="text-danger">Hành động này không thể hoàn tác!</p>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Hủy</button>
          <button type="button" class="btn btn-danger" @click="confirmDelete">Xóa</button>
        </div>
      </div>
    </div>
  </div>

  <!-- Modal Chi Tiết Hợp Đồng -->
  <div class="modal fade" id="detailsModal" tabindex="-1" aria-hidden="true" ref="detailsModal">
    <div class="modal-dialog modal-lg">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title" v-if="selectedHopDong">Chi Tiết Hợp Đồng</h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>
        <div class="modal-body" v-if="selectedHopDong">
          <div class="row mb-3">
            <div class="col-md-6">
              <h6>Thông Tin Nhân Viên</h6>
              <table class="table table-bordered">
                <tbody>
                  <tr>
                    <th style="width: 40%">Họ và Tên</th>
                    <td>{{ getNhanVienName(selectedHopDong.id_nhan_vien) }}</td>
                  </tr>
                  <tr>
                    <th>Phòng Ban</th>
                    <td>{{ getNhanVienPhongBan(selectedHopDong.id_nhan_vien) }}</td>
                  </tr>
                  <tr>
                    <th>Chức Danh</th>
                    <td>{{ getNhanVienChucDanh(selectedHopDong.id_nhan_vien) }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div class="col-md-6">
              <h6>Thông Tin Hợp Đồng</h6>
              <table class="table table-bordered">
                <tbody>
                  <tr>
                    <th style="width: 40%">Loại Hợp Đồng</th>
                    <td>{{ selectedHopDong.loai_hop_dong }}</td>
                  </tr>
                  <tr>
                    <th>Ngày Ký</th>
                    <td>{{ formatDate(selectedHopDong.ngay_ky) }}</td>
                  </tr>
                  <tr>
                    <th>Ngày Bắt Đầu</th>
                    <td>{{ formatDate(selectedHopDong.ngay_bat_dau) }}</td>
                  </tr>
                  <tr>
                    <th>Ngày Kết Thúc</th>
                    <td>{{ selectedHopDong.ngay_ket_thuc ? formatDate(selectedHopDong.ngay_ket_thuc) : 'Không có' }}
                    </td>
                  </tr>
                  <tr>
                    <th>Trạng Thái</th>
                    <td>
                      <span :class="getTrangThaiClass(selectedHopDong)">
                        {{ getTrangThaiText(selectedHopDong) }}
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          <div class="row mb-3">
            <div class="col-md-6">
              <h6>Thông Tin Lương</h6>
              <table class="table table-bordered">
                <tbody>
                  <tr>
                    <th style="width: 40%">Lương Cơ Bản</th>
                    <td>{{ formatCurrency(selectedHopDong.luong_co_ban) }}</td>
                  </tr>
                  <tr>
                    <th>Hệ Số Lương</th>
                    <td>{{ selectedHopDong.he_so_luong }}</td>
                  </tr>
                  <tr>
                    <th>Tổng Lương</th>
                    <td>{{ formatCurrency(selectedHopDong.luong_co_ban * selectedHopDong.he_so_luong) }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          <div class="mb-3">
            <h6>Nội Dung Hợp Đồng</h6>
            <div class="p-3 border rounded">
              {{ selectedHopDong.noi_dung || 'Không có nội dung chi tiết' }}
            </div>
          </div>
          <div class="mb-3">
            <h6>Ghi Chú</h6>
            <div class="p-3 border rounded">
              {{ selectedHopDong.ghi_chu || 'Không có ghi chú' }}
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Đóng</button>
          <button type="button" class="btn btn-primary" @click="printHopDong">In Hợp Đồng</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
import { Modal } from 'bootstrap';

export default {
  name: 'QuanLyHopDong',
  data() {
    return {
      hopDongs: [],
      nhanViens: [],
      phongBans: [],
      chucDanhs: [],
      selectedHopDong: null,
      isEditing: false,
      formData: {
        id_nhan_vien: '',
        loai_hop_dong: 'Xác định thời hạn',
        ngay_ky: new Date().toISOString().split('T')[0],
        ngay_bat_dau: new Date().toISOString().split('T')[0],
        ngay_ket_thuc: '',
        luong_co_ban: 0,
        he_so_luong: 1,
        noi_dung: '',
        ghi_chu: ''
      },
      filters: {
        loaiHopDong: '',
        trangThai: '',
        search: ''
      },
      currentPage: 1,
      itemsPerPage: 10,
      hopDongModal: null,
      deleteModal: null,
      detailsModal: null
    };
  },
  computed: {
    filteredHopDongs() {
      let filtered = [...this.hopDongs];

      if (this.filters.loaiHopDong !== '') {
        filtered = filtered.filter(hd => hd.loai_hop_dong === this.filters.loaiHopDong);
      }

      if (this.filters.trangThai !== '') {
        filtered = filtered.filter(hd => this.getTrangThai(hd) === this.filters.trangThai);
      }

      if (this.filters.search) {
        const searchTerm = this.filters.search.toLowerCase();
        filtered = filtered.filter(hd => {
          const nhanVien = this.nhanViens.find(nv => nv.id_nhan_vien === hd.id_nhan_vien);
          return (
            (nhanVien && nhanVien.ho_va_ten.toLowerCase().includes(searchTerm)) ||
            hd.id_hop_dong.toString().includes(searchTerm) ||
            hd.loai_hop_dong.toLowerCase().includes(searchTerm)
          );
        });
      }

      // Phân trang
      const start = (this.currentPage - 1) * this.itemsPerPage;
      const end = start + this.itemsPerPage;
      return filtered.slice(start, end);
    },
    totalPages() {
      return Math.max(1, Math.ceil(this.hopDongs.length / this.itemsPerPage));
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
      this.hopDongModal = new Modal(this.$refs.hopDongModal);
      this.deleteModal = new Modal(this.$refs.deleteModal);
      this.detailsModal = new Modal(this.$refs.detailsModal);
    },
    async fetchData() {
      try {
        // Fetch hợp đồng
        const hopDongResponse = await axios.get('http://127.0.0.1:8000/api/hop-dong');
        this.hopDongs = hopDongResponse.data;

        // Fetch nhân viên
        const nhanVienResponse = await axios.get('http://127.0.0.1:8000/api/nhan-vien');
        this.nhanViens = nhanVienResponse.data;

        // Fetch phòng ban
        const phongBanResponse = await axios.get('http://127.0.0.1:8000/api/phong-ban');
        this.phongBans = phongBanResponse.data;

        // Fetch chức danh
        const chucDanhResponse = await axios.get('http://127.0.0.1:8000/api/chuc-danh');
        this.chucDanhs = chucDanhResponse.data;
      } catch (error) {
        console.error('Error fetching data:', error);

        // Dữ liệu mẫu nếu API không hoạt động
        this.nhanViens = [
          { id_nhan_vien: 1, ho_va_ten: 'Nguyễn Văn A', id_phong_ban: 1, id_chuc_danh: 1 },
          { id_nhan_vien: 2, ho_va_ten: 'Trần Thị B', id_phong_ban: 2, id_chuc_danh: 2 },
          { id_nhan_vien: 3, ho_va_ten: 'Lê Văn C', id_phong_ban: 3, id_chuc_danh: 3 }
        ];

        this.phongBans = [
          { id_phong_ban: 1, ten_phong_ban: 'Phòng Nhân sự' },
          { id_phong_ban: 2, ten_phong_ban: 'Phòng Kế toán' },
          { id_phong_ban: 3, ten_phong_ban: 'Phòng IT' }
        ];

        this.chucDanhs = [
          { id_chuc_danh: 1, ten_chuc_danh: 'Giám đốc' },
          { id_chuc_danh: 2, ten_chuc_danh: 'Trưởng phòng' },
          { id_chuc_danh: 3, ten_chuc_danh: 'Nhân viên' }
        ];

        this.hopDongs = [
          {
            id_hop_dong: 1,
            id_nhan_vien: 1,
            loai_hop_dong: 'Không xác định thời hạn',
            ngay_ky: '2022-01-15',
            ngay_bat_dau: '2022-02-01',
            ngay_ket_thuc: null,
            luong_co_ban: 15000000,
            he_so_luong: 1.5,
            noi_dung: 'Hợp đồng lao động không xác định thời hạn',
            ghi_chu: ''
          },
          {
            id_hop_dong: 2,
            id_nhan_vien: 2,
            loai_hop_dong: 'Xác định thời hạn',
            ngay_ky: '2022-03-10',
            ngay_bat_dau: '2022-03-15',
            ngay_ket_thuc: '2024-03-14',
            luong_co_ban: 12000000,
            he_so_luong: 1.2,
            noi_dung: 'Hợp đồng lao động có thời hạn 2 năm',
            ghi_chu: ''
          },
          {
            id_hop_dong: 3,
            id_nhan_vien: 3,
            loai_hop_dong: 'Thử việc',
            ngay_ky: '2023-01-05',
            ngay_bat_dau: '2023-01-10',
            ngay_ket_thuc: '2023-04-09',
            luong_co_ban: 8000000,
            he_so_luong: 0.85,
            noi_dung: 'Hợp đồng thử việc 3 tháng',
            ghi_chu: 'Đánh giá sau 2 tháng'
          }
        ];
      }
    },
    getNhanVienName(id) {
      const nhanVien = this.nhanViens.find(nv => nv.id_nhan_vien === id);
      return nhanVien ? nhanVien.ho_va_ten : 'Không xác định';
    },
    getNhanVienPhongBan(id) {
      const nhanVien = this.nhanViens.find(nv => nv.id_nhan_vien === id);
      if (!nhanVien) return 'Không xác định';

      const phongBan = this.phongBans.find(pb => pb.id_phong_ban === nhanVien.id_phong_ban);
      return phongBan ? phongBan.ten_phong_ban : 'Không xác định';
    },
    getNhanVienChucDanh(id) {
      const nhanVien = this.nhanViens.find(nv => nv.id_nhan_vien === id);
      if (!nhanVien) return 'Không xác định';

      const chucDanh = this.chucDanhs.find(cd => cd.id_chuc_danh === nhanVien.id_chuc_danh);
      return chucDanh ? chucDanh.ten_chuc_danh : 'Không xác định';
    },
    formatDate(dateString) {
      if (!dateString) return 'N/A';
      const date = new Date(dateString);
      return date.toLocaleDateString('vi-VN');
    },
    formatCurrency(value) {
      return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
    },
    getTrangThai(hopDong) {
      const today = new Date();
      const startDate = new Date(hopDong.ngay_bat_dau);

      // Nếu chưa đến ngày bắt đầu
      if (startDate > today) {
        return 'pending';
      }

      // Nếu không có ngày kết thúc (hợp đồng không xác định thời hạn)
      if (!hopDong.ngay_ket_thuc) {
        return 'active';
      }

      const endDate = new Date(hopDong.ngay_ket_thuc);

      // Nếu đã hết hạn
      if (endDate < today) {
        return 'expired';
      }

      // Đang hiệu lực
      return 'active';
    },
    getTrangThaiText(hopDong) {
      const trangThai = this.getTrangThai(hopDong);
      switch (trangThai) {
        case 'pending': return 'Chưa hiệu lực';
        case 'active': return 'Đang hiệu lực';
        case 'expired': return 'Hết hiệu lực';
        case 'terminated': return 'Đã chấm dứt';
        default: return 'Không xác định';
      }
    },
    getTrangThaiClass(hopDong) {
      const trangThai = this.getTrangThai(hopDong);
      switch (trangThai) {
        case 'pending': return 'badge bg-info';
        case 'active': return 'badge bg-success';
        case 'expired': return 'badge bg-warning';
        case 'terminated': return 'badge bg-danger';
        default: return 'badge bg-secondary';
      }
    },
    resetForm() {
      this.formData = {
        id_nhan_vien: '',
        loai_hop_dong: 'Xác định thời hạn',
        ngay_ky: new Date().toISOString().split('T')[0],
        ngay_bat_dau: new Date().toISOString().split('T')[0],
        ngay_ket_thuc: '',
        luong_co_ban: 0,
        he_so_luong: 1,
        noi_dung: '',
        ghi_chu: ''
      };
    },
    showAddModal() {
      this.isEditing = false;
      this.resetForm();
      this.hopDongModal.show();
    },
    editHopDong(hopDong) {
      this.isEditing = true;
      this.selectedHopDong = hopDong;
      this.formData = { ...hopDong };
      this.hopDongModal.show();
    },
    deleteHopDong(hopDong) {
      this.selectedHopDong = hopDong;
      this.deleteModal.show();
    },
    viewDetails(hopDong) {
      this.selectedHopDong = hopDong;
      this.detailsModal.show();
    },
    async saveHopDong() {
      try {
        // Kiểm tra ngày ký <= ngày bắt đầu
        if (new Date(this.formData.ngay_ky) > new Date(this.formData.ngay_bat_dau)) {
          alert('Ngày ký phải trước hoặc cùng ngày với ngày bắt đầu!');
          return;
        }

        // Kiểm tra ngày bắt đầu < ngày kết thúc (nếu có)
        if (this.formData.ngay_ket_thuc && new Date(this.formData.ngay_bat_dau) >= new Date(this.formData.ngay_ket_thuc)) {
          alert('Ngày bắt đầu phải trước ngày kết thúc!');
          return;
        }

        // Nếu là hợp đồng không xác định thời hạn, xóa ngày kết thúc
        if (this.formData.loai_hop_dong === 'Không xác định thời hạn') {
          this.formData.ngay_ket_thuc = null;
        }

        if (this.isEditing) {
          // Cập nhật hợp đồng
          await axios.put(`http://127.0.0.1:8000/api/hop-dong/${this.selectedHopDong.id_hop_dong}`, this.formData);

          // Cập nhật dữ liệu trong mảng
          const index = this.hopDongs.findIndex(hd => hd.id_hop_dong === this.selectedHopDong.id_hop_dong);
          if (index !== -1) {
            this.hopDongs[index] = { ...this.hopDongs[index], ...this.formData };
          }

          alert('Cập nhật hợp đồng thành công!');
        } else {
          // Thêm hợp đồng mới
          const response = await axios.post('http://127.0.0.1:8000/api/hop-dong', this.formData);
          this.hopDongs.push(response.data);

          alert('Thêm hợp đồng thành công!');
        }

        this.hopDongModal.hide();
        this.resetForm();
      } catch (error) {
        console.error('Error saving contract:', error);
        alert(`Lỗi khi lưu hợp đồng: ${error.response?.data?.message || error.message}`);
      }
    },
    async confirmDelete() {
      try {
        await axios.delete(`http://127.0.0.1:8000/api/hop-dong/${this.selectedHopDong.id_hop_dong}`);

        // Xóa hợp đồng khỏi mảng
        this.hopDongs = this.hopDongs.filter(hd => hd.id_hop_dong !== this.selectedHopDong.id_hop_dong);

        alert('Xóa hợp đồng thành công!');
        this.deleteModal.hide();
      } catch (error) {
        console.error('Error deleting contract:', error);
        alert(`Lỗi khi xóa hợp đồng: ${error.response?.data?.message || error.message}`);
      }
    },
    printHopDong() {
      // Tạo cửa sổ in
      const printWindow = window.open('', '_blank');
      // Tạo nội dung HTML để in
      const printContent = `
        <html>
        <head>
          <title>Hợp Đồng Lao Động - ${this.getNhanVienName(this.selectedHopDong.id_nhan_vien)}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            h1, h2 { text-align: center; }
            .header { text-align: center; margin-bottom: 20px; }
            .company-name { font-weight: bold; font-size: 18px; }
            .contract-title { font-weight: bold; font-size: 24px; margin: 20px 0; text-transform: uppercase; }
            .section { margin-bottom: 15px; }
            .section-title { font-weight: bold; text-transform: uppercase; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; }
            .footer { margin-top: 50px; display: flex; justify-content: space-between; }
            .signature { width: 45%; text-align: center; }
            .contract-info { margin-bottom: 20px; }
            .contract-info p { margin: 5px 0; }
            .bold { font-weight: bold; }
          </style>
        </head>
        <body>
          <div class="header">
            <p class="company-name">CÔNG TY TNHH CÔNG NGHỆ NFC</p>
            <p>Địa chỉ: 123 Đường ABC, Quận XYZ, TP. Hồ Chí Minh</p>
            <p>Điện thoại: (028) 1234 5678 - Email: info@nfc-tech.com</p>
          </div>
          
          <h1 class="contract-title">Hợp Đồng Lao Động</h1>
          
          <div class="contract-info">
            <p>Số hợp đồng: <span class="bold">HD${this.selectedHopDong.id_hop_dong.toString().padStart(4, '0')}</span></p>
            <p>Loại hợp đồng: <span class="bold">${this.selectedHopDong.loai_hop_dong}</span></p>
            <p>Ngày ký: <span class="bold">${this.formatDate(this.selectedHopDong.ngay_ky)}</span></p>
          </div>
          
          <div class="section">
            <p class="section-title">I. Bên A (Bên sử dụng lao động):</p>
            <p>Tên công ty: <span class="bold">Công ty TNHH Công Nghệ NFC</span></p>
            <p>Địa chỉ: 123 Đường ABC, Quận XYZ, TP. Hồ Chí Minh</p>
            <p>Người đại diện: Nguyễn Văn X</p>
            <p>Chức vụ: Giám đốc</p>
          </div>
          
          <div class="section">
            <p class="section-title">II. Bên B (Người lao động):</p>
            <p>Họ và tên: <span class="bold">${this.getNhanVienName(this.selectedHopDong.id_nhan_vien)}</span></p>
            <p>Phòng ban: ${this.getNhanVienPhongBan(this.selectedHopDong.id_nhan_vien)}</p>
            <p>Chức danh: ${this.getNhanVienChucDanh(this.selectedHopDong.id_nhan_vien)}</p>
          </div>
          
          <div class="section">
            <p class="section-title">III. Thời hạn hợp đồng:</p>
            <p>Thời gian bắt đầu: <span class="bold">${this.formatDate(this.selectedHopDong.ngay_bat_dau)}</span></p>
            <p>Thời gian kết thúc: <span class="bold">${this.selectedHopDong.ngay_ket_thuc ? this.formatDate(this.selectedHopDong.ngay_ket_thuc) : 'Không xác định thời hạn'}</span></p>
          </div>
          
          <div class="section">
            <p class="section-title">IV. Chế độ lương và phúc lợi:</p>
            <p>Lương cơ bản: <span class="bold">${this.formatCurrency(this.selectedHopDong.luong_co_ban)}</span></p>
            <p>Hệ số lương: <span class="bold">${this.selectedHopDong.he_so_luong}</span></p>
            <p>Tổng lương: <span class="bold">${this.formatCurrency(this.selectedHopDong.luong_co_ban * this.selectedHopDong.he_so_luong)}</span></p>
            <p>Hình thức trả lương: Chuyển khoản</p>
            <p>Thời gian trả lương: Ngày 10 hàng tháng</p>
          </div>
          
          <div class="section">
            <p class="section-title">V. Nội dung công việc:</p>
            <p>${this.selectedHopDong.noi_dung || 'Thực hiện các công việc theo mô tả công việc và sự phân công của người quản lý trực tiếp.'}</p>
          </div>
          
          <div class="section">
            <p class="section-title">VI. Ghi chú:</p>
            <p>${this.selectedHopDong.ghi_chu || 'Không có ghi chú.'}</p>
          </div>
          
          <div class="footer">
            <div class="signature">
              <p>Đại diện bên A</p>
              <p>(Ký và ghi rõ họ tên)</p>
              <br><br><br>
              <p>Nguyễn Văn X</p>
              <p>Giám đốc</p>
            </div>
            <div class="signature">
              <p>Người lao động (Bên B)</p>
              <p>(Ký và ghi rõ họ tên)</p>
              <br><br><br>
              <p>${this.getNhanVienName(this.selectedHopDong.id_nhan_vien)}</p>
            </div>
          </div>
        </body>
        </html>
      `;

      // Ghi nội dung vào cửa sổ in
      printWindow.document.open();
      printWindow.document.write(printContent);
      printWindow.document.close();

      // Chờ tài nguyên tải xong và in
      printWindow.onload = function () {
        printWindow.print();
      };
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
