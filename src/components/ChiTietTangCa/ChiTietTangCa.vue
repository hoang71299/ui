<template>
  <div class="container-fluid">
    <div class="row">
      <div class="col-12">
        <div class="card">
          <div class="card-header d-flex justify-content-between align-items-center">
            <h5 class="mb-0">Quản Lý Chi Tiết Tăng Ca</h5>
            <button class="btn btn-primary" @click="showAddModal">
              <i class="bx bx-plus me-1"></i> Thêm Chi Tiết Tăng Ca
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
                <label class="form-label">Loại Tăng Ca</label>
                <select class="form-select" v-model="filters.loaiTangCa">
                  <option value="">Tất cả</option>
                  <option v-for="ltc in loaiTangCas" :key="ltc.id_loai_tang_ca" :value="ltc.id_loai_tang_ca">
                    {{ ltc.ten_loai }}
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

            <!-- Bảng danh sách chi tiết tăng ca -->
            <div class="table-responsive">
              <table class="table table-bordered table-hover">
                <thead class="table-light">
                  <tr>
                    <th>Mã CT</th>
                    <th>Nhân Viên</th>
                    <th>Loại Tăng Ca</th>
                    <th>Ngày Tăng Ca</th>
                    <th>Giờ Bắt Đầu</th>
                    <th>Giờ Kết Thúc</th>
                    <th>Số Giờ</th>
                    <th>Lý Do</th>
                    <th>Trạng Thái</th>
                    <th>Thao Tác</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="chiTiet in filteredChiTiets" :key="chiTiet.id_chi_tiet">
                    <td>{{ chiTiet.id_chi_tiet }}</td>
                    <td>{{ getNhanVienName(chiTiet.id_nhan_vien) }}</td>
                    <td>{{ getLoaiTangCaName(chiTiet.id_loai_tang_ca) }}</td>
                    <td>{{ formatDate(chiTiet.ngay_tang_ca) }}</td>
                    <td>{{ formatTime(chiTiet.gio_bat_dau) }}</td>
                    <td>{{ formatTime(chiTiet.gio_ket_thuc) }}</td>
                    <td>{{ tinhSoGio(chiTiet) }}</td>
                    <td>{{ chiTiet.ly_do }}</td>
                    <td>
                      <span :class="getStatusClass(chiTiet.trang_thai)">
                        {{ getStatusText(chiTiet.trang_thai) }}
                      </span>
                    </td>
                    <td>
                      <div class="d-flex gap-2">
                        <button class="btn btn-sm btn-warning" @click="editChiTiet(chiTiet)"
                          :disabled="chiTiet.trang_thai === 'approved' || chiTiet.trang_thai === 'rejected'">
                          <i class="bx bx-edit"></i>
                        </button>
                        <button class="btn btn-sm btn-danger" @click="deleteChiTiet(chiTiet)"
                          :disabled="chiTiet.trang_thai === 'approved'">
                          <i class="bx bx-trash"></i>
                        </button>
                        <button v-if="chiTiet.trang_thai === 'pending'" class="btn btn-sm btn-success"
                          @click="approveChiTiet(chiTiet)">
                          <i class="bx bx-check"></i>
                        </button>
                        <button v-if="chiTiet.trang_thai === 'pending'" class="btn btn-sm btn-danger"
                          @click="rejectChiTiet(chiTiet)">
                          <i class="bx bx-x"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                  <tr v-if="filteredChiTiets.length === 0">
                    <td colspan="10" class="text-center">Không có dữ liệu</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- Phân trang -->
            <div class="d-flex justify-content-between align-items-center mt-3">
              <div>
                Hiển thị {{ filteredChiTiets.length }} / {{ chiTiets.length }} chi tiết tăng ca
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

    <!-- Modal Thêm/Sửa Chi Tiết Tăng Ca -->
    <div class="modal fade" id="chiTietModal" tabindex="-1" aria-hidden="true" ref="chiTietModal">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">{{ isEditing ? 'Cập Nhật Chi Tiết Tăng Ca' : 'Thêm Chi Tiết Tăng Ca Mới' }}</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="saveChiTiet">
              <div class="mb-3">
                <label class="form-label">Nhân Viên</label>
                <select class="form-select" v-model="formData.id_nhan_vien" required>
                  <option v-for="nv in nhanViens" :key="nv.id_nhan_vien" :value="nv.id_nhan_vien">
                    {{ nv.ho_va_ten }}
                  </option>
                </select>
              </div>
              <div class="mb-3">
                <label class="form-label">Loại Tăng Ca</label>
                <select class="form-select" v-model="formData.id_loai_tang_ca" required>
                  <option v-for="ltc in loaiTangCas" :key="ltc.id_loai_tang_ca" :value="ltc.id_loai_tang_ca">
                    {{ ltc.ten_loai }}
                  </option>
                </select>
              </div>
              <div class="mb-3">
                <label class="form-label">Ngày Tăng Ca</label>
                <input type="date" class="form-control" v-model="formData.ngay_tang_ca" required>
              </div>
              <div class="row">
                <div class="col-md-6 mb-3">
                  <label class="form-label">Giờ Bắt Đầu</label>
                  <input type="time" class="form-control" v-model="formData.gio_bat_dau" required>
                </div>
                <div class="col-md-6 mb-3">
                  <label class="form-label">Giờ Kết Thúc</label>
                  <input type="time" class="form-control" v-model="formData.gio_ket_thuc" required>
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
          <div class="modal-body" v-if="selectedChiTiet">
            <p>Bạn có chắc chắn muốn xóa chi tiết tăng ca của nhân viên <strong>{{
              getNhanVienName(selectedChiTiet.id_nhan_vien) }}</strong> ngày {{
              formatDate(selectedChiTiet.ngay_tang_ca) }}?</p>
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
          <div class="modal-body" v-if="selectedChiTiet">
            <p>Bạn có chắc chắn muốn duyệt chi tiết tăng ca của nhân viên <strong>{{
              getNhanVienName(selectedChiTiet.id_nhan_vien) }}</strong> ngày {{
              formatDate(selectedChiTiet.ngay_tang_ca) }}?</p>
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
          <div class="modal-body" v-if="selectedChiTiet">
            <p>Bạn có chắc chắn muốn từ chối chi tiết tăng ca của nhân viên <strong>{{
              getNhanVienName(selectedChiTiet.id_nhan_vien) }}</strong> ngày {{
              formatDate(selectedChiTiet.ngay_tang_ca) }}?</p>
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
  name: 'ChiTietTangCa',
  data() {
    return {
      chiTiets: [],
      nhanViens: [],
      loaiTangCas: [],
      selectedChiTiet: null,
      isEditing: false,
      rejectReason: '',
      formData: {
        id_nhan_vien: '',
        id_loai_tang_ca: '',
        ngay_tang_ca: new Date().toISOString().split('T')[0],
        gio_bat_dau: '',
        gio_ket_thuc: '',
        ly_do: '',
        trang_thai: 'pending'
      },
      filters: {
        nhanVien: '',
        loaiTangCa: '',
        tuNgay: '',
        denNgay: ''
      },
      currentPage: 1,
      itemsPerPage: 10,
      chiTietModal: null,
      deleteModal: null,
      approveModal: null,
      rejectModal: null
    };
  },
  computed: {
    filteredChiTiets() {
      let filtered = [...this.chiTiets];

      if (this.filters.nhanVien !== '') {
        filtered = filtered.filter(ct => ct.id_nhan_vien === parseInt(this.filters.nhanVien));
      }

      if (this.filters.loaiTangCa !== '') {
        filtered = filtered.filter(ct => ct.id_loai_tang_ca === parseInt(this.filters.loaiTangCa));
      }

      if (this.filters.tuNgay) {
        filtered = filtered.filter(ct => new Date(ct.ngay_tang_ca) >= new Date(this.filters.tuNgay));
      }

      if (this.filters.denNgay) {
        filtered = filtered.filter(ct => new Date(ct.ngay_tang_ca) <= new Date(this.filters.denNgay));
      }

      // Phân trang
      const start = (this.currentPage - 1) * this.itemsPerPage;
      const end = start + this.itemsPerPage;
      return filtered.slice(start, end);
    },
    totalPages() {
      return Math.ceil(this.chiTiets.length / this.itemsPerPage);
    }
  },
  mounted() {
    this.fetchData();
    this.initModals();
  },
  methods: {
    initModals() {
      this.chiTietModal = new Modal(this.$refs.chiTietModal);
      this.deleteModal = new Modal(this.$refs.deleteModal);
      this.approveModal = new Modal(this.$refs.approveModal);
      this.rejectModal = new Modal(this.$refs.rejectModal);
    },
    async fetchData() {
      try {
        // Fetch chi tiết tăng ca
        const chiTietResponse = await axios.get('http://127.0.0.1:8000/api/chi-tiet-tang-ca');
        this.chiTiets = chiTietResponse.data;

        // Fetch nhân viên
        const nhanVienResponse = await axios.get('http://127.0.0.1:8000/api/nhan-vien');
        this.nhanViens = nhanVienResponse.data;

        // Fetch loại tăng ca
        const loaiTangCaResponse = await axios.get('http://127.0.0.1:8000/api/loai-tang-ca');
        this.loaiTangCas = loaiTangCaResponse.data;
      } catch (error) {
        console.error('Error fetching data:', error);

        // Dữ liệu mẫu nếu API không hoạt động
        this.nhanViens = [
          { id_nhan_vien: 1, ho_va_ten: 'Nguyễn Văn A' },
          { id_nhan_vien: 2, ho_va_ten: 'Trần Thị B' },
          { id_nhan_vien: 3, ho_va_ten: 'Lê Văn C' }
        ];

        this.loaiTangCas = [
          { id_loai_tang_ca: 1, ten_loai: 'Tăng ca ngày thường', he_so: 1.5 },
          { id_loai_tang_ca: 2, ten_loai: 'Tăng ca cuối tuần', he_so: 2.0 },
          { id_loai_tang_ca: 3, ten_loai: 'Tăng ca ngày lễ', he_so: 3.0 }
        ];

        this.chiTiets = [
          {
            id_chi_tiet: 1,
            id_nhan_vien: 1,
            id_loai_tang_ca: 1,
            ngay_tang_ca: '2023-11-15',
            gio_bat_dau: '18:00:00',
            gio_ket_thuc: '20:00:00',
            ly_do: 'Hoàn thành dự án gấp',
            trang_thai: 'approved'
          },
          {
            id_chi_tiet: 2,
            id_nhan_vien: 2,
            id_loai_tang_ca: 2,
            ngay_tang_ca: '2023-11-18',
            gio_bat_dau: '09:00:00',
            gio_ket_thuc: '12:00:00',
            ly_do: 'Chuẩn bị tài liệu cho tuần sau',
            trang_thai: 'pending'
          },
          {
            id_chi_tiet: 3,
            id_nhan_vien: 3,
            id_loai_tang_ca: 1,
            ngay_tang_ca: '2023-11-16',
            gio_bat_dau: '18:00:00',
            gio_ket_thuc: '21:00:00',
            ly_do: 'Xử lý sự cố hệ thống',
            trang_thai: 'rejected'
          }
        ];
      }
    },
    getNhanVienName(id) {
      const nhanVien = this.nhanViens.find(nv => nv.id_nhan_vien === id);
      return nhanVien ? nhanVien.ho_va_ten : 'Không xác định';
    },
    getLoaiTangCaName(id) {
      const loaiTangCa = this.loaiTangCas.find(ltc => ltc.id_loai_tang_ca === id);
      return loaiTangCa ? loaiTangCa.ten_loai : 'Không xác định';
    },
    formatDate(dateString) {
      if (!dateString) return 'N/A';
      const date = new Date(dateString);
      return date.toLocaleDateString('vi-VN');
    },
    formatTime(timeString) {
      if (!timeString) return 'N/A';
      return timeString.substring(0, 5);
    },
    tinhSoGio(chiTiet) {
      const start = new Date(`2000-01-01T${chiTiet.gio_bat_dau}`);
      const end = new Date(`2000-01-01T${chiTiet.gio_ket_thuc}`);

      let diff = (end - start) / (1000 * 60 * 60);
      return diff.toFixed(1) + ' giờ';
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
        id_loai_tang_ca: '',
        ngay_tang_ca: new Date().toISOString().split('T')[0],
        gio_bat_dau: '',
        gio_ket_thuc: '',
        ly_do: '',
        trang_thai: 'pending'
      };
    },
    showAddModal() {
      this.isEditing = false;
      this.resetForm();
      this.chiTietModal.show();
    },
    editChiTiet(chiTiet) {
      this.isEditing = true;
      this.selectedChiTiet = chiTiet;
      this.formData = { ...chiTiet };
      this.chiTietModal.show();
    },
    deleteChiTiet(chiTiet) {
      this.selectedChiTiet = chiTiet;
      this.deleteModal.show();
    },
    approveChiTiet(chiTiet) {
      this.selectedChiTiet = chiTiet;
      this.approveModal.show();
    },
    rejectChiTiet(chiTiet) {
      this.selectedChiTiet = chiTiet;
      this.rejectReason = '';
      this.rejectModal.show();
    },
    async saveChiTiet() {
      try {
        if (this.isEditing) {
          // Cập nhật chi tiết tăng ca
          await axios.put(`http://127.0.0.1:8000/api/chi-tiet-tang-ca/${this.selectedChiTiet.id_chi_tiet}`, this.formData);

          // Cập nhật dữ liệu trong mảng
          const index = this.chiTiets.findIndex(ct => ct.id_chi_tiet === this.selectedChiTiet.id_chi_tiet);
          if (index !== -1) {
            this.chiTiets[index] = { ...this.chiTiets[index], ...this.formData };
          }
        } else {
          // Thêm chi tiết tăng ca mới
          const response = await axios.post('http://127.0.0.1:8000/api/chi-tiet-tang-ca', this.formData);
          this.chiTiets.push(response.data);
        }

        this.chiTietModal.hide();
        this.resetForm();
      } catch (error) {
        console.error('Error saving overtime detail:', error);
        alert('Có lỗi xảy ra khi lưu thông tin chi tiết tăng ca!');
      }
    },
    async confirmDelete() {
      try {
        await axios.delete(`http://127.0.0.1:8000/api/chi-tiet-tang-ca/${this.selectedChiTiet.id_chi_tiet}`);

        // Xóa chi tiết tăng ca khỏi mảng
        this.chiTiets = this.chiTiets.filter(ct => ct.id_chi_tiet !== this.selectedChiTiet.id_chi_tiet);

        this.deleteModal.hide();
      } catch (error) {
        console.error('Error deleting overtime detail:', error);
        alert('Có lỗi xảy ra khi xóa chi tiết tăng ca!');
      }
    },
    async confirmApprove() {
      try {
        await axios.put(`http://127.0.0.1:8000/api/chi-tiet-tang-ca/${this.selectedChiTiet.id_chi_tiet}/approve`);

        // Cập nhật trạng thái trong mảng
        const index = this.chiTiets.findIndex(ct => ct.id_chi_tiet === this.selectedChiTiet.id_chi_tiet);
        if (index !== -1) {
          this.chiTiets[index].trang_thai = 'approved';
        }

        this.approveModal.hide();
      } catch (error) {
        console.error('Error approving overtime detail:', error);
        alert('Có lỗi xảy ra khi duyệt chi tiết tăng ca!');
      }
    },
    async confirmReject() {
      try {
        await axios.put(`http://127.0.0.1:8000/api/chi-tiet-tang-ca/${this.selectedChiTiet.id_chi_tiet}/reject`, {
          ly_do_tu_choi: this.rejectReason
        });

        // Cập nhật trạng thái trong mảng
        const index = this.chiTiets.findIndex(ct => ct.id_chi_tiet === this.selectedChiTiet.id_chi_tiet);
        if (index !== -1) {
          this.chiTiets[index].trang_thai = 'rejected';
        }

        this.rejectModal.hide();
      } catch (error) {
        console.error('Error rejecting overtime detail:', error);
        alert('Có lỗi xảy ra khi từ chối chi tiết tăng ca!');
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