<template>
  <div class="container-fluid">
    <div class="row">
      <div class="col-12">
        <div class="card">
          <div class="card-header d-flex justify-content-between align-items-center">
            <h5 class="mb-0">Quản Lý Bảo Hiểm</h5>
            <button class="btn btn-primary" @click="showAddModal">
              <i class="bx bx-plus me-1"></i> Thêm Bảo Hiểm
            </button>
          </div>
          <div class="card-body">
            <!-- Bộ lọc -->
            <div class="row mb-3">
              <div class="col-md-3">
                <label class="form-label">Loại Bảo Hiểm</label>
                <select class="form-select" v-model="filters.loaiBaoHiem">
                  <option value="">Tất cả</option>
                  <option value="BHYT">Bảo hiểm y tế</option>
                  <option value="BHXH">Bảo hiểm xã hội</option>
                  <option value="BHTN">Bảo hiểm thất nghiệp</option>
                </select>
              </div>
              <div class="col-md-3">
                <label class="form-label">Trạng Thái</label>
                <select class="form-select" v-model="filters.trangThai">
                  <option value="">Tất cả</option>
                  <option value="true">Còn hiệu lực</option>
                  <option value="false">Hết hiệu lực</option>
                </select>
              </div>
              <div class="col-md-6">
                <label class="form-label">Tìm Kiếm</label>
                <input type="text" class="form-control" v-model="filters.search"
                  placeholder="Tên nhân viên, mã bảo hiểm...">
              </div>
            </div>

            <!-- Bảng danh sách bảo hiểm -->
            <div class="table-responsive">
              <table class="table table-bordered table-hover">
                <thead class="table-light">
                  <tr>
                    <th>Mã BH</th>
                    <th>Nhân Viên</th>
                    <th>Loại Bảo Hiểm</th>
                    <th>Mã Số</th>
                    <th>Ngày Cấp</th>
                    <th>Ngày Hết Hạn</th>
                    <th>Nơi Cấp</th>
                    <th>Trạng Thái</th>
                    <th>Thao Tác</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="baoHiem in filteredBaoHiems" :key="baoHiem.id_bao_hiem">
                    <td>{{ baoHiem.id_bao_hiem }}</td>
                    <td>{{ getNhanVienName(baoHiem.id_nhan_vien) }}</td>
                    <td>{{ baoHiem.loai_bao_hiem }}</td>
                    <td>{{ baoHiem.ma_so }}</td>
                    <td>{{ formatDate(baoHiem.ngay_cap) }}</td>
                    <td>{{ formatDate(baoHiem.ngay_het_han) }}</td>
                    <td>{{ baoHiem.noi_cap }}</td>
                    <td>
                      <span :class="isActive(baoHiem) ? 'badge bg-success' : 'badge bg-danger'">
                        {{ isActive(baoHiem) ? 'Còn hiệu lực' : 'Hết hiệu lực' }}
                      </span>
                    </td>
                    <td>
                      <div class="d-flex gap-2">
                        <button class="btn btn-sm btn-warning" @click="editBaoHiem(baoHiem)">
                          <i class="bx bx-edit"></i>
                        </button>
                        <button class="btn btn-sm btn-danger" @click="deleteBaoHiem(baoHiem)">
                          <i class="bx bx-trash"></i>
                        </button>
                        <button class="btn btn-sm btn-info" @click="viewDetails(baoHiem)">
                          <i class="bx bx-detail"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                  <tr v-if="filteredBaoHiems.length === 0">
                    <td colspan="9" class="text-center">Không có dữ liệu</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- Phân trang -->
            <div class="d-flex justify-content-between align-items-center mt-3">
              <div>
                Hiển thị {{ filteredBaoHiems.length }} / {{ baoHiems.length }} bảo hiểm
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

    <!-- Modal Thêm/Sửa Bảo Hiểm -->
    <div class="modal fade" id="baoHiemModal" tabindex="-1" aria-hidden="true" ref="baoHiemModal">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">{{ isEditing ? 'Cập Nhật Bảo Hiểm' : 'Thêm Bảo Hiểm Mới' }}</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="saveBaoHiem">
              <div class="mb-3">
                <label class="form-label">Nhân Viên</label>
                <select class="form-select" v-model="formData.id_nhan_vien" required>
                  <option v-for="nv in nhanViens" :key="nv.id_nhan_vien" :value="nv.id_nhan_vien">
                    {{ nv.ho_va_ten }}
                  </option>
                </select>
              </div>
              <div class="mb-3">
                <label class="form-label">Loại Bảo Hiểm</label>
                <select class="form-select" v-model="formData.loai_bao_hiem" required>
                  <option value="BHYT">Bảo hiểm y tế</option>
                  <option value="BHXH">Bảo hiểm xã hội</option>
                  <option value="BHTN">Bảo hiểm thất nghiệp</option>
                </select>
              </div>
              <div class="mb-3">
                <label class="form-label">Mã Số Bảo Hiểm</label>
                <input type="text" class="form-control" v-model="formData.ma_so" required>
              </div>
              <div class="row">
                <div class="col-md-6 mb-3">
                  <label class="form-label">Ngày Cấp</label>
                  <input type="date" class="form-control" v-model="formData.ngay_cap" required>
                </div>
                <div class="col-md-6 mb-3">
                  <label class="form-label">Ngày Hết Hạn</label>
                  <input type="date" class="form-control" v-model="formData.ngay_het_han">
                  <small class="text-muted">Để trống nếu không có ngày hết hạn</small>
                </div>
              </div>
              <div class="mb-3">
                <label class="form-label">Nơi Cấp</label>
                <input type="text" class="form-control" v-model="formData.noi_cap" required>
              </div>
              <div class="mb-3">
                <label class="form-label">Ghi Chú</label>
                <textarea class="form-control" v-model="formData.ghi_chu" rows="3"></textarea>
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
          <div class="modal-body" v-if="selectedBaoHiem">
            <p>Bạn có chắc chắn muốn xóa bảo hiểm {{ selectedBaoHiem.loai_bao_hiem }} của nhân viên <strong>{{
              getNhanVienName(selectedBaoHiem.id_nhan_vien) }}</strong>?</p>
            <p class="text-danger">Hành động này không thể hoàn tác!</p>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Hủy</button>
            <button type="button" class="btn btn-danger" @click="confirmDelete">Xóa</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal Chi Tiết Bảo Hiểm -->
    <div class="modal fade" id="detailsModal" tabindex="-1" aria-hidden="true" ref="detailsModal">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" v-if="selectedBaoHiem">Chi Tiết Bảo Hiểm</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body" v-if="selectedBaoHiem">
            <div class="mb-3">
              <h6>Thông Tin Nhân Viên</h6>
              <table class="table table-bordered">
                <tbody>
                  <tr>
                    <th style="width: 40%">Họ và Tên</th>
                    <td>{{ getNhanVienName(selectedBaoHiem.id_nhan_vien) }}</td>
                  </tr>
                  <tr>
                    <th>Phòng Ban</th>
                    <td>{{ getNhanVienPhongBan(selectedBaoHiem.id_nhan_vien) }}</td>
                  </tr>
                  <tr>
                    <th>Chức Danh</th>
                    <td>{{ getNhanVienChucDanh(selectedBaoHiem.id_nhan_vien) }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div class="mb-3">
              <h6>Thông Tin Bảo Hiểm</h6>
              <table class="table table-bordered">
                <tbody>
                  <tr>
                    <th style="width: 40%">Loại Bảo Hiểm</th>
                    <td>{{ getLoaiBaoHiemText(selectedBaoHiem.loai_bao_hiem) }}</td>
                  </tr>
                  <tr>
                    <th>Mã Số</th>
                    <td>{{ selectedBaoHiem.ma_so }}</td>
                  </tr>
                  <tr>
                    <th>Ngày Cấp</th>
                    <td>{{ formatDate(selectedBaoHiem.ngay_cap) }}</td>
                  </tr>
                  <tr>
                    <th>Ngày Hết Hạn</th>
                    <td>{{ selectedBaoHiem.ngay_het_han ? formatDate(selectedBaoHiem.ngay_het_han) : 'Không có' }}</td>
                  </tr>
                  <tr>
                    <th>Nơi Cấp</th>
                    <td>{{ selectedBaoHiem.noi_cap }}</td>
                  </tr>
                  <tr>
                    <th>Trạng Thái</th>
                    <td>
                      <span :class="isActive(selectedBaoHiem) ? 'badge bg-success' : 'badge bg-danger'">
                        {{ isActive(selectedBaoHiem) ? 'Còn hiệu lực' : 'Hết hiệu lực' }}
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <th>Ghi Chú</th>
                    <td>{{ selectedBaoHiem.ghi_chu || 'Không có ghi chú' }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Đóng</button>
            <button type="button" class="btn btn-primary" @click="printBaoHiem">In Thông Tin</button>
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
  name: 'QuanLyBaoHiem',
  data() {
    return {
      baoHiems: [],
      nhanViens: [],
      phongBans: [],
      chucDanhs: [],
      selectedBaoHiem: null,
      isEditing: false,
      formData: {
        id_nhan_vien: '',
        loai_bao_hiem: 'BHYT',
        ma_so: '',
        ngay_cap: new Date().toISOString().split('T')[0],
        ngay_het_han: '',
        noi_cap: '',
        ghi_chu: ''
      },
      filters: {
        loaiBaoHiem: '',
        trangThai: '',
        search: ''
      },
      currentPage: 1,
      itemsPerPage: 10,
      baoHiemModal: null,
      deleteModal: null,
      detailsModal: null
    };
  },
  computed: {
    filteredBaoHiems() {
      let filtered = [...this.baoHiems];

      if (this.filters.loaiBaoHiem !== '') {
        filtered = filtered.filter(bh => bh.loai_bao_hiem === this.filters.loaiBaoHiem);
      }

      if (this.filters.trangThai !== '') {
        const isActive = this.filters.trangThai === 'true';
        filtered = filtered.filter(bh => this.isActive(bh) === isActive);
      }

      if (this.filters.search) {
        const searchTerm = this.filters.search.toLowerCase();
        filtered = filtered.filter(bh => {
          const nhanVien = this.nhanViens.find(nv => nv.id_nhan_vien === bh.id_nhan_vien);
          return (
            (nhanVien && nhanVien.ho_va_ten.toLowerCase().includes(searchTerm)) ||
            bh.ma_so.toLowerCase().includes(searchTerm) ||
            bh.noi_cap.toLowerCase().includes(searchTerm)
          );
        });
      }

      // Phân trang
      const start = (this.currentPage - 1) * this.itemsPerPage;
      const end = start + this.itemsPerPage;
      return filtered.slice(start, end);
    },
    totalPages() {
      return Math.ceil(this.baoHiems.length / this.itemsPerPage);
    }
  },
  mounted() {
    this.fetchData();
    this.initModals();
  },
  methods: {
    initModals() {
      this.baoHiemModal = new Modal(this.$refs.baoHiemModal);
      this.deleteModal = new Modal(this.$refs.deleteModal);
      this.detailsModal = new Modal(this.$refs.detailsModal);
    },
    async fetchData() {
      try {
        // Fetch bảo hiểm
        const baoHiemResponse = await axios.get('http://127.0.0.1:8000/api/bao-hiem');
        this.baoHiems = baoHiemResponse.data;

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
          {
            id_nhan_vien: 1,
            ho_va_ten: 'Nguyễn Văn A',
            id_phong_ban: 1,
            id_chuc_danh: 1
          },
          {
            id_nhan_vien: 2,
            ho_va_ten: 'Trần Thị B',
            id_phong_ban: 2,
            id_chuc_danh: 2
          },
          {
            id_nhan_vien: 3,
            ho_va_ten: 'Lê Văn C',
            id_phong_ban: 3,
            id_chuc_danh: 3
          }
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

        this.baoHiems = [
          {
            id_bao_hiem: 1,
            id_nhan_vien: 1,
            loai_bao_hiem: 'BHYT',
            ma_so: 'YT0123456789',
            ngay_cap: '2022-01-15',
            ngay_het_han: '2023-12-31',
            noi_cap: 'Bảo hiểm xã hội TP.HCM',
            ghi_chu: 'Bảo hiểm y tế hàng năm'
          },
          {
            id_bao_hiem: 2,
            id_nhan_vien: 1,
            loai_bao_hiem: 'BHXH',
            ma_so: 'XH0123456789',
            ngay_cap: '2022-01-15',
            ngay_het_han: null,
            noi_cap: 'Bảo hiểm xã hội TP.HCM',
            ghi_chu: 'Bảo hiểm xã hội dài hạn'
          },
          {
            id_bao_hiem: 3,
            id_nhan_vien: 2,
            loai_bao_hiem: 'BHYT',
            ma_so: 'YT9876543210',
            ngay_cap: '2022-02-20',
            ngay_het_han: '2023-12-31',
            noi_cap: 'Bảo hiểm xã hội TP.HCM',
            ghi_chu: ''
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
    getLoaiBaoHiemText(loai) {
      switch (loai) {
        case 'BHYT': return 'Bảo hiểm y tế';
        case 'BHXH': return 'Bảo hiểm xã hội';
        case 'BHTN': return 'Bảo hiểm thất nghiệp';
        default: return loai;
      }
    },
    formatDate(dateString) {
      if (!dateString) return 'N/A';
      const date = new Date(dateString);
      return date.toLocaleDateString('vi-VN');
    },
    isActive(baoHiem) {
      if (!baoHiem.ngay_het_han) return true;

      const today = new Date();
      const expiryDate = new Date(baoHiem.ngay_het_han);
      return expiryDate >= today;
    },
    resetForm() {
      this.formData = {
        id_nhan_vien: '',
        loai_bao_hiem: 'BHYT',
        ma_so: '',
        ngay_cap: new Date().toISOString().split('T')[0],
        ngay_het_han: '',
        noi_cap: '',
        ghi_chu: ''
      };
    },
    showAddModal() {
      this.isEditing = false;
      this.resetForm();
      this.baoHiemModal.show();
    },
    editBaoHiem(baoHiem) {
      this.isEditing = true;
      this.selectedBaoHiem = baoHiem;
      this.formData = { ...baoHiem };
      this.baoHiemModal.show();
    },
    deleteBaoHiem(baoHiem) {
      this.selectedBaoHiem = baoHiem;
      this.deleteModal.show();
    },
    viewDetails(baoHiem) {
      this.selectedBaoHiem = baoHiem;
      this.detailsModal.show();
    },
    async saveBaoHiem() {
      try {
        // Kiểm tra ngày cấp <= ngày hết hạn
        if (this.formData.ngay_het_han && new Date(this.formData.ngay_cap) > new Date(this.formData.ngay_het_han)) {
          alert('Ngày cấp phải trước hoặc cùng ngày với ngày hết hạn!');
          return;
        }

        if (this.isEditing) {
          // Cập nhật bảo hiểm
          await axios.put(`http://127.0.0.1:8000/api/bao-hiem/${this.selectedBaoHiem.id_bao_hiem}`, this.formData);

          // Cập nhật dữ liệu trong mảng
          const index = this.baoHiems.findIndex(bh => bh.id_bao_hiem === this.selectedBaoHiem.id_bao_hiem);
          if (index !== -1) {
            this.baoHiems[index] = { ...this.baoHiems[index], ...this.formData };
          }
        } else {
          // Thêm bảo hiểm mới
          const response = await axios.post('http://127.0.0.1:8000/api/bao-hiem', this.formData);
          this.baoHiems.push(response.data);
        }

        this.baoHiemModal.hide();
        this.resetForm();
      } catch (error) {
        console.error('Error saving insurance:', error);
        alert('Có lỗi xảy ra khi lưu thông tin bảo hiểm!');
      }
    },
    async confirmDelete() {
      try {
        await axios.delete(`http://127.0.0.1:8000/api/bao-hiem/${this.selectedBaoHiem.id_bao_hiem}`);

        // Xóa bảo hiểm khỏi mảng
        this.baoHiems = this.baoHiems.filter(bh => bh.id_bao_hiem !== this.selectedBaoHiem.id_bao_hiem);

        this.deleteModal.hide();
      } catch (error) {
        console.error('Error deleting insurance:', error);
        alert('Có lỗi xảy ra khi xóa bảo hiểm!');
      }
    },
    printBaoHiem() {
      // Tạo cửa sổ in mới
      const printWindow = window.open('', '_blank');

      // Tạo nội dung HTML để in
      const printContent = `
        <html>
        <head>
          <title>Thông Tin Bảo Hiểm - ${this.getNhanVienName(this.selectedBaoHiem.id_nhan_vien)}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            h1 { text-align: center; font-size: 18px; margin-bottom: 20px; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; width: 40%; }
            .header { text-align: center; margin-bottom: 30px; }
            .footer { margin-top: 50px; text-align: right; }
            .footer p { margin-top: 50px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>THÔNG TIN BẢO HIỂM</h1>
            <p>Loại bảo hiểm: ${this.getLoaiBaoHiemText(this.selectedBaoHiem.loai_bao_hiem)}</p>
          </div>
          
          <h2>Thông Tin Nhân Viên</h2>
          <table>
            <tbody>
              <tr>
                <th>Họ và Tên</th>
                <td>${this.getNhanVienName(this.selectedBaoHiem.id_nhan_vien)}</td>
              </tr>
              <tr>
                <th>Phòng Ban</th>
                <td>${this.getNhanVienPhongBan(this.selectedBaoHiem.id_nhan_vien)}</td>
              </tr>
              <tr>
                <th>Chức Danh</th>
                <td>${this.getNhanVienChucDanh(this.selectedBaoHiem.id_nhan_vien)}</td>
              </tr>
            </tbody>
          </table>
          
          <h2>Thông Tin Bảo Hiểm</h2>
          <table>
            <tbody>
              <tr>
                <th>Mã Số</th>
                <td>${this.selectedBaoHiem.ma_so}</td>
              </tr>
              <tr>
                <th>Ngày Cấp</th>
                <td>${this.formatDate(this.selectedBaoHiem.ngay_cap)}</td>
              </tr>
              <tr>
                <th>Ngày Hết Hạn</th>
                <td>${this.selectedBaoHiem.ngay_het_han ? this.formatDate(this.selectedBaoHiem.ngay_het_han) : 'Không có'}</td>
              </tr>
              <tr>
                <th>Nơi Cấp</th>
                <td>${this.selectedBaoHiem.noi_cap}</td>
              </tr>
              <tr>
                <th>Trạng Thái</th>
                <td>${this.isActive(this.selectedBaoHiem) ? 'Còn hiệu lực' : 'Hết hiệu lực'}</td>
              </tr>
              <tr>
                <th>Ghi Chú</th>
                <td>${this.selectedBaoHiem.ghi_chu || 'Không có ghi chú'}</td>
              </tr>
            </tbody>
          </table>
          
          <div class="footer">
            <p>Ngày in: ${new Date().toLocaleDateString('vi-VN')}</p>
            <p>Người in: ________________________</p>
          </div>
        </body>
        </html>
      `;

      printWindow.document.open();
      printWindow.document.write(printContent);
      printWindow.document.close();

      // Đợi trang tải xong và in
      printWindow.onload = function () {
        printWindow.print();
      };
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
