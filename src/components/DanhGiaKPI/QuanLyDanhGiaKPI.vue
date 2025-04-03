<template>
  <div class="container-fluid">
    <div class="row">
      <div class="col-12">
        <div class="card">
          <div class="card-header d-flex justify-content-between align-items-center">
            <h5 class="mb-0">Quản Lý Đánh Giá KPI</h5>
            <button class="btn btn-primary" @click="showAddModal">
              <i class="bx bx-plus me-1"></i> Thêm Đánh Giá KPI
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
                <label class="form-label">Năm</label>
                <select class="form-select" v-model="filters.nam">
                  <option value="">Tất cả</option>
                  <option v-for="year in years" :key="year" :value="year">{{ year }}</option>
                </select>
              </div>
              <div class="col-md-3">
                <label class="form-label">Quý</label>
                <select class="form-select" v-model="filters.quy">
                  <option value="">Tất cả</option>
                  <option value="1">Quý 1</option>
                  <option value="2">Quý 2</option>
                  <option value="3">Quý 3</option>
                  <option value="4">Quý 4</option>
                </select>
              </div>
              <div class="col-md-3">
                <label class="form-label">Xếp Loại</label>
                <select class="form-select" v-model="filters.xepLoai">
                  <option value="">Tất cả</option>
                  <option value="A">A - Xuất sắc</option>
                  <option value="B">B - Tốt</option>
                  <option value="C">C - Đạt</option>
                  <option value="D">D - Cần cải thiện</option>
                </select>
              </div>
            </div>

            <!-- Bảng danh sách đánh giá KPI -->
            <div class="table-responsive">
              <table class="table table-bordered table-hover">
                <thead class="table-light">
                  <tr>
                    <th>Mã ĐG</th>
                    <th>Nhân Viên</th>
                    <th>Quý/Năm</th>
                    <th>Điểm KPI</th>
                    <th>Xếp Loại</th>
                    <th>Ngày Đánh Giá</th>
                    <th>Người Đánh Giá</th>
                    <th>Thao Tác</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="danhGia in filteredDanhGias" :key="danhGia.id_danh_gia">
                    <td>{{ danhGia.id_danh_gia }}</td>
                    <td>{{ getNhanVienName(danhGia.id_nhan_vien) }}</td>
                    <td>Q{{ danhGia.quy }}/{{ danhGia.nam }}</td>
                    <td>{{ danhGia.diem_kpi }}</td>
                    <td>
                      <span :class="getXepLoaiClass(danhGia.xep_loai)">
                        {{ getXepLoaiText(danhGia.xep_loai) }}
                      </span>
                    </td>
                    <td>{{ formatDate(danhGia.ngay_danh_gia) }}</td>
                    <td>{{ getNhanVienName(danhGia.id_nguoi_danh_gia) }}</td>
                    <td>
                      <div class="d-flex gap-2">
                        <button class="btn btn-sm btn-warning" @click="editDanhGia(danhGia)">
                          <i class="bx bx-edit"></i>
                        </button>
                        <button class="btn btn-sm btn-danger" @click="deleteDanhGia(danhGia)">
                          <i class="bx bx-trash"></i>
                        </button>
                        <button class="btn btn-sm btn-info" @click="viewDetails(danhGia)">
                          <i class="bx bx-detail"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                  <tr v-if="filteredDanhGias.length === 0">
                    <td colspan="8" class="text-center">Không có dữ liệu</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- Phân trang -->
            <div class="d-flex justify-content-between align-items-center mt-3">
              <div>
                Hiển thị {{ filteredDanhGias.length }} / {{ danhGias.length }} đánh giá KPI
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

    <!-- Modal Thêm/Sửa Đánh Giá KPI -->
    <div class="modal fade" id="danhGiaModal" tabindex="-1" aria-hidden="true" ref="danhGiaModal">
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">{{ isEditing ? 'Cập Nhật Đánh Giá KPI' : 'Thêm Đánh Giá KPI Mới' }}</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="saveDanhGia">
              <div class="row">
                <div class="col-md-6 mb-3">
                  <label class="form-label">Nhân Viên</label>
                  <select class="form-select" v-model="formData.id_nhan_vien" required @change="loadTieuChi">
                    <option v-for="nv in nhanViens" :key="nv.id_nhan_vien" :value="nv.id_nhan_vien">
                      {{ nv.ho_va_ten }}
                    </option>
                  </select>
                </div>
                <div class="col-md-6 mb-3">
                  <label class="form-label">Người Đánh Giá</label>
                  <select class="form-select" v-model="formData.id_nguoi_danh_gia" required>
                    <option v-for="nv in nhanViens" :key="nv.id_nhan_vien" :value="nv.id_nhan_vien">
                      {{ nv.ho_va_ten }}
                    </option>
                  </select>
                </div>
              </div>
              <div class="row">
                <div class="col-md-4 mb-3">
                  <label class="form-label">Năm</label>
                  <select class="form-select" v-model="formData.nam" required>
                    <option v-for="year in years" :key="year" :value="year">{{ year }}</option>
                  </select>
                </div>
                <div class="col-md-4 mb-3">
                  <label class="form-label">Quý</label>
                  <select class="form-select" v-model="formData.quy" required>
                    <option value="1">Quý 1</option>
                    <option value="2">Quý 2</option>
                    <option value="3">Quý 3</option>
                    <option value="4">Quý 4</option>
                  </select>
                </div>
                <div class="col-md-4 mb-3">
                  <label class="form-label">Ngày Đánh Giá</label>
                  <input type="date" class="form-control" v-model="formData.ngay_danh_gia" required>
                </div>
              </div>

              <!-- Danh sách tiêu chí đánh giá -->
              <div class="mb-3">
                <h6>Tiêu Chí Đánh Giá</h6>
                <div class="table-responsive">
                  <table class="table table-bordered">
                    <thead class="table-light">
                      <tr>
                        <th style="width: 40%">Tiêu Chí</th>
                        <th style="width: 15%">Trọng Số (%)</th>
                        <th style="width: 15%">Điểm (0-100)</th>
                        <th style="width: 15%">Điểm Quy Đổi</th>
                        <th style="width: 15%">Ghi Chú</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="(tieuChi, index) in formData.chi_tiet" :key="index">
                        <td>{{ tieuChi.ten_tieu_chi }}</td>
                        <td>{{ tieuChi.trong_so }}</td>
                        <td>
                          <input type="number" class="form-control" v-model="tieuChi.diem" min="0" max="100" required>
                        </td>
                        <td>{{ tinhDiemQuyDoi(tieuChi) }}</td>
                        <td>
                          <input type="text" class="form-control" v-model="tieuChi.ghi_chu">
                        </td>
                      </tr>
                      <tr v-if="formData.chi_tiet.length === 0">
                        <td colspan="5" class="text-center">Chưa có tiêu chí đánh giá</td>
                      </tr>
                    </tbody>
                    <tfoot>
                      <tr class="table-light">
                        <th>Tổng</th>
                        <th>{{ tongTrongSo }}%</th>
                        <th></th>
                        <th>{{ tongDiemQuyDoi }}</th>
                        <th></th>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>

              <div class="row">
                <div class="col-md-6 mb-3">
                  <label class="form-label">Điểm KPI Tổng</label>
                  <input type="number" class="form-control" v-model="formData.diem_kpi" readonly>
                </div>
                <div class="col-md-6 mb-3">
                  <label class="form-label">Xếp Loại</label>
                  <input type="text" class="form-control" v-model="formData.xep_loai" readonly>
                  <small class="text-muted">{{ getXepLoaiText(formData.xep_loai) }}</small>
                </div>
              </div>

              <div class="mb-3">
                <label class="form-label">Nhận Xét</label>
                <textarea class="form-control" v-model="formData.nhan_xet" rows="3"></textarea>
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
          <div class="modal-body" v-if="selectedDanhGia">
            <p>Bạn có chắc chắn muốn xóa đánh giá KPI của nhân viên <strong>{{
              getNhanVienName(selectedDanhGia.id_nhan_vien) }}</strong> quý {{ selectedDanhGia.quy }}/{{
                  selectedDanhGia.nam }}?</p>
            <p class="text-danger">Hành động này không thể hoàn tác!</p>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Hủy</button>
            <button type="button" class="btn btn-danger" @click="confirmDelete">Xóa</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal Chi Tiết Đánh Giá -->
    <div class="modal fade" id="detailsModal" tabindex="-1" aria-hidden="true" ref="detailsModal">
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" v-if="selectedDanhGia">Chi Tiết Đánh Giá KPI</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body" v-if="selectedDanhGia">
            <div class="row mb-3">
              <div class="col-md-6">
                <h6>Thông Tin Nhân Viên</h6>
                <table class="table table-bordered">
                  <tbody>
                    <tr>
                      <th style="width: 40%">Họ và Tên</th>
                      <td>{{ getNhanVienName(selectedDanhGia.id_nhan_vien) }}</td>
                    </tr>
                    <tr>
                      <th>Phòng Ban</th>
                      <td>{{ getNhanVienPhongBan(selectedDanhGia.id_nhan_vien) }}</td>
                    </tr>
                    <tr>
                      <th>Chức Danh</th>
                      <td>{{ getNhanVienChucDanh(selectedDanhGia.id_nhan_vien) }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div class="col-md-6">
                <h6>Thông Tin Đánh Giá</h6>
                <table class="table table-bordered">
                  <tbody>
                    <tr>
                      <th style="width: 40%">Thời Gian</th>
                      <td>Quý {{ selectedDanhGia.quy }}/{{ selectedDanhGia.nam }}</td>
                    </tr>
                    <tr>
                      <th>Ngày Đánh Giá</th>
                      <td>{{ formatDate(selectedDanhGia.ngay_danh_gia) }}</td>
                    </tr>
                    <tr>
                      <th>Người Đánh Giá</th>
                      <td>{{ getNhanVienName(selectedDanhGia.id_nguoi_danh_gia) }}</td>
                    </tr>
                    <tr>
                      <th>Điểm KPI</th>
                      <td>{{ selectedDanhGia.diem_kpi }}</td>
                    </tr>
                    <tr>
                      <th>Xếp Loại</th>
                      <td>
                        <span :class="getXepLoaiClass(selectedDanhGia.xep_loai)">
                          {{ getXepLoaiText(selectedDanhGia.xep_loai) }}
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
            <div class="mb-3">
              <h6>Chi Tiết Tiêu Chí Đánh Giá</h6>
              <div class="table-responsive">
                <table class="table table-bordered">
                  <thead class="table-light">
                    <tr>
                      <th style="width: 40%">Tiêu Chí</th>
                      <th style="width: 15%">Trọng Số (%)</th>
                      <th style="width: 15%">Điểm (0-100)</th>
                      <th style="width: 15%">Điểm Quy Đổi</th>
                      <th style="width: 15%">Ghi Chú</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="(tieuChi, index) in selectedDanhGia.chi_tiet" :key="index">
                      <td>{{ tieuChi.ten_tieu_chi }}</td>
                      <td>{{ tieuChi.trong_so }}</td>
                      <td>{{ tieuChi.diem }}</td>
                      <td>{{ (tieuChi.diem * tieuChi.trong_so / 100).toFixed(2) }}</td>
                      <td>{{ tieuChi.ghi_chu || 'Không có' }}</td>
                    </tr>
                  </tbody>
                  <tfoot>
                    <tr class="table-light">
                      <th>Tổng</th>
                      <th>{{ getTongTrongSo(selectedDanhGia.chi_tiet) }}%</th>
                      <th></th>
                      <th>{{ getTongDiemQuyDoi(selectedDanhGia.chi_tiet) }}</th>
                      <th></th>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
            <div class="mb-3">
              <h6>Nhận Xét</h6>
              <div class="p-3 border rounded">
                {{ selectedDanhGia.nhan_xet || 'Không có nhận xét' }}
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Đóng</button>
            <button type="button" class="btn btn-primary" @click="printDanhGia">In Đánh Giá</button>
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
  name: 'QuanLyDanhGiaKPI',
  data() {
    return {
      danhGias: [],
      nhanViens: [],
      phongBans: [],
      chucDanhs: [],
      tieuChiMau: [],
      selectedDanhGia: null,
      isEditing: false,
      formData: {
        id_nhan_vien: '',
        id_nguoi_danh_gia: '',
        nam: new Date().getFullYear(),
        quy: Math.ceil((new Date().getMonth() + 1) / 3),
        ngay_danh_gia: new Date().toISOString().split('T')[0],
        diem_kpi: 0,
        xep_loai: '',
        nhan_xet: '',
        chi_tiet: []
      },
      filters: {
        nhanVien: '',
        nam: '',
        quy: '',
        xepLoai: ''
      },
      currentPage: 1,
      itemsPerPage: 10,
      danhGiaModal: null,
      deleteModal: null,
      detailsModal: null,
      years: []
    };
  },
  computed: {
    filteredDanhGias() {
      let filtered = [...this.danhGias];

      if (this.filters.nhanVien !== '') {
        filtered = filtered.filter(dg => dg.id_nhan_vien === this.filters.nhanVien);
      }

      if (this.filters.nam !== '') {
        filtered = filtered.filter(dg => dg.nam === this.filters.nam);
      }

      if (this.filters.quy !== '') {
        filtered = filtered.filter(dg => dg.quy === this.filters.quy);
      }

      if (this.filters.xepLoai !== '') {
        filtered = filtered.filter(dg => dg.xep_loai === this.filters.xepLoai);
      }

      // Phân trang
      const start = (this.currentPage - 1) * this.itemsPerPage;
      const end = start + this.itemsPerPage;
      return filtered.slice(start, end);
    },
    totalPages() {
      return Math.max(1, Math.ceil(this.danhGias.length / this.itemsPerPage));
    },
    tongTrongSo() {
      return this.formData.chi_tiet.reduce((sum, item) => sum + Number(item.trong_so), 0);
    },
    tongDiemQuyDoi() {
      return this.formData.chi_tiet.reduce((sum, item) => {
        return sum + this.tinhDiemQuyDoi(item);
      }, 0).toFixed(2);
    }
  },
  watch: {
    'formData.chi_tiet': {
      deep: true,
      handler() {
        this.tinhDiemTong();
      }
    }
  },
  mounted() {
    this.generateYears();
    this.fetchData();
    this.$nextTick(() => {
      this.initModals();
    });
  },
  methods: {
    generateYears() {
      const currentYear = new Date().getFullYear();
      this.years = [];
      for (let i = currentYear - 5; i <= currentYear + 1; i++) {
        this.years.push(i);
      }
    },
    initModals() {
      this.danhGiaModal = new Modal(this.$refs.danhGiaModal);
      this.deleteModal = new Modal(this.$refs.deleteModal);
      this.detailsModal = new Modal(this.$refs.detailsModal);
    },
    async fetchData() {
      try {
        // Fetch đánh giá KPI
        const danhGiaResponse = await axios.get('http://127.0.0.1:8000/api/danh-gia-kpi');
        this.danhGias = danhGiaResponse.data;

        // Fetch nhân viên
        const nhanVienResponse = await axios.get('http://127.0.0.1:8000/api/nhan-vien');
        this.nhanViens = nhanVienResponse.data;

        // Fetch phòng ban
        const phongBanResponse = await axios.get('http://127.0.0.1:8000/api/phong-ban');
        this.phongBans = phongBanResponse.data;

        // Fetch chức danh
        const chucDanhResponse = await axios.get('http://127.0.0.1:8000/api/chuc-danh');
        this.chucDanhs = chucDanhResponse.data;

        // Fetch tiêu chí mẫu
        const tieuChiResponse = await axios.get('http://127.0.0.1:8000/api/tieu-chi-kpi');
        this.tieuChiMau = tieuChiResponse.data;
      } catch (error) {
        console.error('Error fetching data:', error);
        alert(`Lỗi khi tải dữ liệu: ${error.response?.data?.message || error.message}`);

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

        this.tieuChiMau = [
          { id: 1, ten_tieu_chi: 'Hiệu suất công việc', trong_so: 30 },
          { id: 2, ten_tieu_chi: 'Chất lượng công việc', trong_so: 25 },
          { id: 3, ten_tieu_chi: 'Tinh thần làm việc nhóm', trong_so: 15 },
          { id: 4, ten_tieu_chi: 'Tuân thủ quy định', trong_so: 15 },
          { id: 5, ten_tieu_chi: 'Sáng kiến cải tiến', trong_so: 15 }
        ];

        this.danhGias = [
          {
            id_danh_gia: 1,
            id_nhan_vien: 1,
            id_nguoi_danh_gia: 2,
            nam: 2023,
            quy: 1,
            ngay_danh_gia: '2023-03-30',
            diem_kpi: 85.5,
            xep_loai: 'B',
            nhan_xet: 'Hoàn thành tốt công việc, cần cải thiện về sáng kiến',
            chi_tiet: [
              { ten_tieu_chi: 'Hiệu suất công việc', trong_so: 30, diem: 90, ghi_chu: '' },
              { ten_tieu_chi: 'Chất lượng công việc', trong_so: 25, diem: 85, ghi_chu: '' },
              { ten_tieu_chi: 'Tinh thần làm việc nhóm', trong_so: 15, diem: 80, ghi_chu: '' },
              { ten_tieu_chi: 'Tuân thủ quy định', trong_so: 15, diem: 90, ghi_chu: '' },
              { ten_tieu_chi: 'Sáng kiến cải tiến', trong_so: 15, diem: 75, ghi_chu: 'Cần đề xuất thêm ý tưởng mới' }
            ]
          },
          {
            id_danh_gia: 2,
            id_nhan_vien: 2,
            id_nguoi_danh_gia: 1,
            nam: 2023,
            quy: 1,
            ngay_danh_gia: '2023-03-31',
            diem_kpi: 92.5,
            xep_loai: 'A',
            nhan_xet: 'Xuất sắc trong mọi mặt công việc',
            chi_tiet: [
              { ten_tieu_chi: 'Hiệu suất công việc', trong_so: 30, diem: 95, ghi_chu: '' },
              { ten_tieu_chi: 'Chất lượng công việc', trong_so: 25, diem: 90, ghi_chu: '' },
              { ten_tieu_chi: 'Tinh thần làm việc nhóm', trong_so: 15, diem: 95, ghi_chu: '' },
              { ten_tieu_chi: 'Tuân thủ quy định', trong_so: 15, diem: 90, ghi_chu: '' },
              { ten_tieu_chi: 'Sáng kiến cải tiến', trong_so: 15, diem: 90, ghi_chu: '' }
            ]
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
    getXepLoaiClass(xepLoai) {
      switch (xepLoai) {
        case 'A': return 'badge bg-success';
        case 'B': return 'badge bg-primary';
        case 'C': return 'badge bg-warning';
        case 'D': return 'badge bg-danger';
        default: return 'badge bg-secondary';
      }
    },
    getXepLoaiText(xepLoai) {
      switch (xepLoai) {
        case 'A': return 'A - Xuất sắc';
        case 'B': return 'B - Tốt';
        case 'C': return 'C - Đạt';
        case 'D': return 'D - Cần cải thiện';
        default: return 'Chưa xếp loại';
      }
    },
    tinhDiemQuyDoi(tieuChi) {
      return (Number(tieuChi.diem) * Number(tieuChi.trong_so) / 100).toFixed(2);
    },
    getTongTrongSo(chiTiet) {
      return chiTiet.reduce((sum, item) => sum + Number(item.trong_so), 0);
    },
    getTongDiemQuyDoi(chiTiet) {
      return chiTiet.reduce((sum, item) => {
        return sum + (Number(item.diem) * Number(item.trong_so) / 100);
      }, 0).toFixed(2);
    },
    tinhDiemTong() {
      const tongDiem = this.formData.chi_tiet.reduce((sum, item) => {
        return sum + (Number(item.diem) * Number(item.trong_so) / 100);
      }, 0);

      this.formData.diem_kpi = tongDiem.toFixed(2);

      // Xếp loại dựa trên điểm tổng
      if (tongDiem >= 90) {
        this.formData.xep_loai = 'A';
      } else if (tongDiem >= 80) {
        this.formData.xep_loai = 'B';
      } else if (tongDiem >= 65) {
        this.formData.xep_loai = 'C';
      } else {
        this.formData.xep_loai = 'D';
      }
    },
    async loadTieuChi() {
      try {
        // Trong thực tế, có thể gọi API để lấy tiêu chí KPI theo nhân viên
        // const response = await axios.get(`http://127.0.0.1:8000/api/tieu-chi-kpi/${this.formData.id_nhan_vien}`);
        // this.formData.chi_tiet = response.data;

        // Sử dụng tiêu chí mẫu
        this.formData.chi_tiet = this.tieuChiMau.map(tc => ({
          ten_tieu_chi: tc.ten_tieu_chi,
          trong_so: tc.trong_so,
          diem: 0,
          ghi_chu: ''
        }));
      } catch (error) {
        console.error('Error loading tieu chi:', error);
        alert('Lỗi khi tải tiêu chí đánh giá');
      }
    },
    resetForm() {
      this.formData = {
        id_nhan_vien: '',
        id_nguoi_danh_gia: '',
        nam: new Date().getFullYear(),
        quy: Math.ceil((new Date().getMonth() + 1) / 3),
        ngay_danh_gia: new Date().toISOString().split('T')[0],
        diem_kpi: 0,
        xep_loai: '',
        nhan_xet: '',
        chi_tiet: []
      };
    },
    showAddModal() {
      this.isEditing = false;
      this.resetForm();
      this.danhGiaModal.show();
    },
    editDanhGia(danhGia) {
      this.isEditing = true;
      this.selectedDanhGia = danhGia;
      this.formData = { ...danhGia };
      this.danhGiaModal.show();
    },
    deleteDanhGia(danhGia) {
      this.selectedDanhGia = danhGia;
      this.deleteModal.show();
    },
    viewDetails(danhGia) {
      this.selectedDanhGia = danhGia;
      this.detailsModal.show();
    },
    async saveDanhGia() {
      try {
        if (this.tongTrongSo !== 100) {
          alert('Tổng trọng số phải bằng 100%');
          return;
        }

        if (this.isEditing) {
          // Cập nhật đánh giá
          await axios.put(`http://127.0.0.1:8000/api/danh-gia-kpi/${this.selectedDanhGia.id_danh_gia}`, this.formData);

          // Cập nhật dữ liệu trong mảng
          const index = this.danhGias.findIndex(dg => dg.id_danh_gia === this.selectedDanhGia.id_danh_gia);
          if (index !== -1) {
            this.danhGias[index] = { ...this.formData, id_danh_gia: this.selectedDanhGia.id_danh_gia };
          }

          alert('Cập nhật đánh giá KPI thành công!');
        } else {
          // Thêm đánh giá mới
          const response = await axios.post('http://127.0.0.1:8000/api/danh-gia-kpi', this.formData);

          // Thêm vào mảng
          this.danhGias.push(response.data);

          alert('Thêm đánh giá KPI thành công!');
        }

        // Đóng modal và reset form
        this.danhGiaModal.hide();
        this.resetForm();
      } catch (error) {
        console.error('Error saving danh gia:', error);
        alert(`Lỗi khi lưu đánh giá: ${error.response?.data?.message || error.message}`);
      }
    },
    async confirmDelete() {
      try {
        await axios.delete(`http://127.0.0.1:8000/api/danh-gia-kpi/${this.selectedDanhGia.id_danh_gia}`);

        // Xóa khỏi mảng
        this.danhGias = this.danhGias.filter(dg => dg.id_danh_gia !== this.selectedDanhGia.id_danh_gia);

        alert('Xóa đánh giá KPI thành công!');
        this.deleteModal.hide();
      } catch (error) {
        console.error('Error deleting danh gia:', error);
        alert(`Lỗi khi xóa đánh giá: ${error.response?.data?.message || error.message}`);
      }
    },
    printDanhGia() {
      // Tạo cửa sổ in
      const printWindow = window.open('', '_blank');

      // Tạo nội dung HTML để in
      const printContent = `
        <html>
        <head>
          <title>Đánh Giá KPI - ${this.getNhanVienName(this.selectedDanhGia.id_nhan_vien)}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            h1 { text-align: center; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; }
            .header { display: flex; justify-content: space-between; margin-bottom: 20px; }
            .footer { margin-top: 50px; display: flex; justify-content: space-between; }
            .signature { width: 45%; text-align: center; }
          </style>
        </head>
        <body>
          <h1>PHIẾU ĐÁNH GIÁ KPI</h1>
          
          <div class="header">
            <div>
              <p><strong>Nhân viên:</strong> ${this.getNhanVienName(this.selectedDanhGia.id_nhan_vien)}</p>
              <p><strong>Phòng ban:</strong> ${this.getNhanVienPhongBan(this.selectedDanhGia.id_nhan_vien)}</p>
              <p><strong>Chức danh:</strong> ${this.getNhanVienChucDanh(this.selectedDanhGia.id_nhan_vien)}</p>
            </div>
            <div>
              <p><strong>Thời gian:</strong> Quý ${this.selectedDanhGia.quy}/${this.selectedDanhGia.nam}</p>
              <p><strong>Ngày đánh giá:</strong> ${this.formatDate(this.selectedDanhGia.ngay_danh_gia)}</p>
              <p><strong>Người đánh giá:</strong> ${this.getNhanVienName(this.selectedDanhGia.id_nguoi_danh_gia)}</p>
            </div>
          </div>
          
          <h3>Chi tiết đánh giá</h3>
          <table>
            <thead>
              <tr>
                <th style="width: 40%">Tiêu Chí</th>
                <th style="width: 15%">Trọng Số (%)</th>
                <th style="width: 15%">Điểm (0-100)</th>
                <th style="width: 15%">Điểm Quy Đổi</th>
                <th style="width: 15%">Ghi Chú</th>
              </tr>
            </thead>
            <tbody>
              ${this.selectedDanhGia.chi_tiet.map(tieuChi => `
                <tr>
                  <td>${tieuChi.ten_tieu_chi}</td>
                  <td>${tieuChi.trong_so}</td>
                  <td>${tieuChi.diem}</td>
                  <td>${(tieuChi.diem * tieuChi.trong_so / 100).toFixed(2)}</td>
                  <td>${tieuChi.ghi_chu || 'Không có'}</td>
                </tr>
              `).join('')}
            </tbody>
            <tfoot>
              <tr>
                <th>Tổng</th>
                <th>${this.getTongTrongSo(this.selectedDanhGia.chi_tiet)}%</th>
                <th></th>
                <th>${this.getTongDiemQuyDoi(this.selectedDanhGia.chi_tiet)}</th>
                <th></th>
              </tr>
            </tfoot>
          </table>
          
          <div>
            <h3>Kết quả đánh giá</h3>
            <p><strong>Điểm KPI tổng:</strong> ${this.selectedDanhGia.diem_kpi}</p>
            <p><strong>Xếp loại:</strong> ${this.getXepLoaiText(this.selectedDanhGia.xep_loai)}</p>
          </div>
          
          <div>
            <h3>Nhận xét</h3>
            <p>${this.selectedDanhGia.nhan_xet || 'Không có nhận xét'}</p>
          </div>
          
          <div class="footer">
            <div class="signature">
              <p>Người đánh giá</p>
              <p>(Ký và ghi rõ họ tên)</p>
              <br><br><br>
              <p>${this.getNhanVienName(this.selectedDanhGia.id_nguoi_danh_gia)}</p>
            </div>
            <div class="signature">
              <p>Người được đánh giá</p>
              <p>(Ký và ghi rõ họ tên)</p>
              <br><br><br>
              <p>${this.getNhanVienName(this.selectedDanhGia.id_nhan_vien)}</p>
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